import React, { useState, useEffect, useRef } from "react";
import { init, id, i, InstaQLEntity } from "@instantdb/react-native";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as db from '../utils/db';
import schema, { AppSchema } from "../../instant.schema";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";

type InstantInventory = InstaQLEntity<AppSchema, "inventory">;
type TabType = "sqlite" | "instantdb";

const instantDb = init({ appId: APP_ID, schema });

// CRDT implementation for sync
interface CRDTTimestamp {
  time: number;
  node: string;
}

interface CRDTValue<T> {
  value: T;
  timestamp: CRDTTimestamp;
}

// Generate a unique node ID for this device
const NODE_ID = Math.random().toString(36).substring(2, 10);

// CRDT Functions
const createTimestamp = (): CRDTTimestamp => ({
  time: Date.now(),
  node: NODE_ID,
});

const compareTimestamps = (a: CRDTTimestamp, b: CRDTTimestamp): number => {
  if (a.time !== b.time) {
    return a.time - b.time;
  }
  // If timestamps are equal, compare lexicographically by node ID
  return a.node.localeCompare(b.node);
};

export default function InventoryApp() {
  const [sqliteInventory, setSqliteInventory] = useState<db.Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("sqlite");
  const [slideAnimation] = useState(new Animated.Value(0));
  const syncButtonAnimation = useRef(new Animated.Value(1)).current;
  const [editingItem, setEditingItem] = useState<InstantInventory | null>(null);
  const [editQty, setEditQty] = useState("");

  // Query data from InstantDB
  const { data: instantData, error: instantError } = instantDb.useQuery({ inventory: {} });
  const instantInventory = instantData?.inventory || [];

  // Handle sync animation
  const animateSyncButton = () => {
    Animated.sequence([
      Animated.timing(syncButtonAnimation, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(syncButtonAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    // Initialize the database and load inventory items
    const initApp = async () => {
      try {
        await db.initDatabase();
        loadSqliteInventory();
      } catch (error) {
        console.error("Error initializing database:", error);
        Alert.alert("Error", "Failed to initialize database");
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // Animate tab switch
  useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: activeTab === 'sqlite' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const loadSqliteInventory = async () => {
    try {
      const items = await db.getInventoryItems();
      setSqliteInventory(items);
    } catch (error) {
      console.error("Error loading inventory:", error);
      Alert.alert("Error", "Failed to load inventory items");
    }
  };

  const handleAddSqliteItem = async () => {
    if (!name) {
      Alert.alert("Error", "Item name is required");
      return;
    }

    try {
      await db.addInventoryItem({
        name,
        sku: sku || '',
        qty: Number(qty) || 0,
        available: Number(qty) || 0,
        committed: 0,
        unavailable: 0,
        stock: Number(qty) || 0,
        created_at: Date.now(),
        user_id: '',
        product_id: ''
      });
      
      // Clear form and reload inventory
      setName("");
      setSku("");
      setQty("");
      loadSqliteInventory();

      // Blur the input field after submission to remove focus
      if (TextInput.State) {
        TextInput.State.blurTextInput(TextInput.State.currentlyFocusedInput());
      }
    } catch (error) {
      console.error("Error adding inventory item:", error);
      Alert.alert("Error", "Failed to add inventory item");
    }
  };

  const handleAddInstantDbItem = () => {
    if (!name) {
      Alert.alert("Error", "Item name is required");
      return;
    }

    const inventoryId = id();
    instantDb.transact(
      instantDb.tx.inventory[inventoryId].update({
        name,
        sku: sku || '',
        qty: Number(qty) || 0,
        available: Number(qty) || 0,
        committed: 0,
        unavailable: 0,
        stock: Number(qty) || 0,
        createdAt: Date.now(),
        userId: '',
        vname: name.toLowerCase(),
      })
    );
    
    setName("");
    setSku("");
    setQty("");

    // Blur the input field after submission
    if (TextInput.State) {
      TextInput.State.blurTextInput(TextInput.State.currentlyFocusedInput());
    }
  };

  const handleAddItem = () => {
    if (activeTab === 'sqlite') {
      handleAddSqliteItem();
    } else {
      handleAddInstantDbItem();
    }
  };

  const handleDeleteSqliteItem = async (id: number) => {
    try {
      await db.deleteInventoryItem(id);
      loadSqliteInventory();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      Alert.alert("Error", "Failed to delete inventory item");
    }
  };

  const handleDeleteInstantDbItem = (item: InstantInventory) => {
    instantDb.transact(instantDb.tx.inventory[item.id].delete());
  };

  const handleUpdateInstantDbQuantity = (item: InstantInventory, newQty: number) => {
    if (newQty < 0) return; // Prevent negative quantities
    
    // Calculate new available (keeping the same ratio as before)
    const newAvailable = item.available !== undefined && item.qty !== undefined && item.qty > 0
      ? Math.round((item.available / item.qty) * newQty)
      : newQty;

    instantDb.transact(
      instantDb.tx.inventory[item.id].update({
        qty: newQty,
        available: newAvailable,
        stock: newQty
      })
    );
  };

  const showEditQuantityModal = (item: InstantInventory) => {
    setEditingItem(item);
    setEditQty(item.qty?.toString() || "0");
  };

  const saveEditedQuantity = () => {
    if (!editingItem) return;
    
    const newQty = parseInt(editQty, 10) || 0;
    handleUpdateInstantDbQuantity(editingItem, newQty);
    setEditingItem(null);
  };

  // Function to sync InstantDB data to SQLite with improved CRDT approach
  const syncInstantToSqlite = async () => {
    if (!instantInventory || instantInventory.length === 0) {
      Alert.alert("Sync", "No InstantDB items to sync");
      return;
    }

    try {
      setIsSyncing(true);
      animateSyncButton();
      
      // Get current SQLite inventory to compare
      const currentSqliteItems = await db.getInventoryItems();
      
      // Create maps for easier comparison
      const sqliteItemMap = new Map();
      const sqliteSkuMap = new Map();
      
      currentSqliteItems.forEach(item => {
        // Store by ID and by SKU for different lookup needs
        if (item.product_id) {
          sqliteItemMap.set(item.product_id, item);
        }
        
        if (item.sku) {
          sqliteSkuMap.set(item.sku.toLowerCase().trim(), item);
        }
      });
      
      console.log(`Found ${currentSqliteItems.length} SQLite items and ${instantInventory.length} InstantDB items`);
      
      let syncCount = 0;
      let updateCount = 0;
      
      // Process each InstantDB item
      for (const item of instantInventory) {
        // Generate CRDT timestamp for this sync operation
        const syncTimestamp = createTimestamp();
        
        // Check if this item exists in SQLite by product_id (which holds InstantDB ID)
        const existingSqlItem = sqliteItemMap.get(item.id);
        
        // Also check by SKU as fallback
        const normalizedSku = item.sku ? item.sku.toLowerCase().trim() : null;
        const existingBySku = normalizedSku ? sqliteSkuMap.get(normalizedSku) : null;
        
        // To ensure changes are always synced, we'll always update if the InstantDB item exists
        if (existingSqlItem) {
          // Update the SQLite item with InstantDB data
          try {
            // Force update with the InstantDB data
            await db.updateInventoryItem({
              ...existingSqlItem,
              name: item.name || existingSqlItem.name,
              sku: item.sku || existingSqlItem.sku,
              qty: (typeof item.qty === 'number') ? item.qty : existingSqlItem.qty,
              available: (typeof item.available === 'number') ? item.available : existingSqlItem.available,
              committed: (typeof item.committed === 'number') ? item.committed : existingSqlItem.committed,
              unavailable: (typeof item.unavailable === 'number') ? item.unavailable : existingSqlItem.unavailable,
              stock: (typeof item.stock === 'number') ? item.stock : existingSqlItem.stock,
              modified_at: Date.now(),
              sync_timestamp: JSON.stringify(syncTimestamp)
            });
            updateCount++;
            console.log(`Updated SQLite item: ${item.name}`);
          } catch (error) {
            console.error(`Error updating item ${item.name} in SQLite:`, error);
          }
        } else if (existingBySku) {
          // Item exists by SKU but not by ID, update the product_id to link them
          try {
            await db.updateInventoryItem({
              ...existingBySku,
              name: item.name || existingBySku.name,
              qty: (typeof item.qty === 'number') ? item.qty : existingBySku.qty,
              available: (typeof item.available === 'number') ? item.available : existingBySku.available,
              committed: (typeof item.committed === 'number') ? item.committed : existingBySku.committed,
              unavailable: (typeof item.unavailable === 'number') ? item.unavailable : existingBySku.unavailable,
              stock: (typeof item.stock === 'number') ? item.stock : existingBySku.stock,
              product_id: item.id,
              modified_at: Date.now(),
              sync_timestamp: JSON.stringify(syncTimestamp)
            });
            updateCount++;
            console.log(`Linked and updated existing SQLite item by SKU: ${item.name}`);
          } catch (error) {
            console.error(`Error linking item ${item.name} in SQLite:`, error);
          }
        } else {
          // Item doesn't exist, add it
          try {
            await db.addInventoryItem({
              name: item.name || '',
              sku: item.sku || '',
              qty: (typeof item.qty === 'number') ? item.qty : 0,
              available: (typeof item.available === 'number') ? item.available : 0,
              committed: (typeof item.committed === 'number') ? item.committed : 0,
              unavailable: (typeof item.unavailable === 'number') ? item.unavailable : 0,
              stock: (typeof item.stock === 'number') ? item.stock : 0,
              created_at: item.createdAt || Date.now(),
              modified_at: Date.now(),
              user_id: item.userId || '',
              product_id: item.id || '',
              sync_timestamp: JSON.stringify(syncTimestamp)
            });
            
            syncCount++;
            console.log(`Added item to SQLite: ${item.name}`);
          } catch (error) {
            console.error(`Error adding item ${item.name} to SQLite:`, error);
          }
        }
      }
      
      // Reload SQLite inventory to show the updated data
      await loadSqliteInventory();
      
      Alert.alert(
        "Sync Complete", 
        `Successfully synced ${syncCount} new items and updated ${updateCount} existing items`
      );
    } catch (error) {
      console.error("Error syncing inventory:", error);
      Alert.alert("Sync Error", "Failed to sync inventory items");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sqlite' && styles.activeTab]}
            onPress={() => setActiveTab('sqlite')}
          >
            <Text style={[styles.tabText, activeTab === 'sqlite' && styles.activeTabText]}>
              SQLite
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'instantdb' && styles.activeTab]}
            onPress={() => setActiveTab('instantdb')}
          >
            <Text style={[styles.tabText, activeTab === 'instantdb' && styles.activeTabText]}>
              InstantDB
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Sync Button */}
        <Animated.View style={[styles.syncButtonContainer, { transform: [{ scale: syncButtonAnimation }] }]}>
          <TouchableOpacity 
            style={styles.syncButton} 
            onPress={syncInstantToSqlite}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="sync" size={18} color="#ffffff" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.mainContainer}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="SKU"
              value={sku}
              onChangeText={setSku}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.createButton} onPress={handleAddItem}>
              <Ionicons name="add" size={24} color="#4a86e8" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* SQLite Inventory List */}
        {activeTab === 'sqlite' && (
          <Animated.View 
            style={[
              styles.tabContent, 
              { 
                transform: [{ 
                  translateX: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -100]
                  }) 
                }]
              }
            ]}
          >
            {sqliteInventory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No SQLite inventory items found</Text>
                <Text style={styles.emptyStateSubText}>Add items using the form above</Text>
              </View>
            ) : (
              <ScrollView style={styles.list}>
                <View style={styles.dataSourceHeader}>
                  <Text style={styles.dataSourceLabel}>Data Source: Local SQLite</Text>
                  <TouchableOpacity 
                    style={styles.deleteAllButton}
                    onPress={() => {
                      Alert.alert(
                        "Delete All Items",
                        "Are you sure you want to delete all SQLite inventory items?",
                        [
                          { text: "Cancel", style: "cancel" },
                          { 
                            text: "Delete All", 
                            style: "destructive", 
                            onPress: async () => {
                              try {
                                await db.deleteAllInventoryItems();
                                loadSqliteInventory();
                                Alert.alert("Success", "All items have been deleted");
                              } catch (error) {
                                console.error("Error deleting all items:", error);
                                Alert.alert("Error", "Failed to delete all items");
                              }
                            } 
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#dc3545" />
                  </TouchableOpacity>
                </View>
                {sqliteInventory.map((item) => {
                  // Find matching InstantDB item by ID
                  const matchingInstantItem = instantInventory.find(
                    instantItem => instantItem.id === item.product_id
                  );
                  
                  return (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.listItem}
                      onLongPress={() => {
                        Alert.alert(
                          "Delete Item",
                          `Are you sure you want to delete "${item.name}"?`,
                          [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", style: "destructive", onPress: () => handleDeleteSqliteItem(item.id) }
                          ]
                        );
                      }}
                    >
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.sku && (
                        <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                      )}
                      <Text style={styles.itemQty}>Qty: {item.qty}</Text>
                      {item.available !== item.qty && (
                        <Text style={styles.itemAvailable}>Available: {item.available}</Text>
                      )}
                      {matchingInstantItem && (
                        <View style={styles.instantStockContainer}>
                          <Text style={styles.instantStockLabel}>InstantDB Stock: </Text>
                          <Text style={styles.instantStockValue}>{matchingInstantItem.stock || 0}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </Animated.View>
        )}

        {/* InstantDB Inventory List */}
        {activeTab === 'instantdb' && (
          <Animated.View 
            style={[
              styles.tabContent, 
              { 
                transform: [{ 
                  translateX: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0]
                  }) 
                }]
              }
            ]}
          >
            {instantError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {instantError.message}</Text>
              </View>
            )}
            
            {instantInventory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No InstantDB inventory items found</Text>
                <Text style={styles.emptyStateSubText}>Add items using the form above</Text>
              </View>
            ) : (
              <ScrollView style={styles.list}>
                <Text style={styles.dataSourceLabel}>Data Source: Cloud InstantDB</Text>
                {instantInventory.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.listItem}
                    onLongPress={() => {
                      Alert.alert(
                        "Delete Item",
                        `Are you sure you want to delete "${item.name}"?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => handleDeleteInstantDbItem(item) }
                        ]
                      );
                    }}
                  >
                    <View style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.sku && (
                          <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                        )}
                      </View>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => {
                            const newQty = (item.qty || 0) - 1;
                            if (newQty >= 0) {
                              handleUpdateInstantDbQuantity(item, newQty);
                            }
                          }}
                        >
                          <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.quantityValue}
                          onPress={() => showEditQuantityModal(item)}
                        >
                          <Text style={styles.itemQty}>{item.qty || 0}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => handleUpdateInstantDbQuantity(item, (item.qty || 0) + 1)}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {item.available !== item.qty && (
                      <Text style={styles.itemAvailable}>Available: {item.available}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Animated.View>
        )}
      </View>

      {/* Quantity Edit Modal */}
      <Modal
        visible={editingItem !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Quantity</Text>
            {editingItem && (
              <Text style={styles.modalSubtitle}>{editingItem.name}</Text>
            )}
            
            <TextInput
              style={styles.modalInput}
              value={editQty}
              onChangeText={setEditQty}
              keyboardType="numeric"
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setEditingItem(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={saveEditedQuantity}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  syncButtonContainer: {
    padding: 8,
    marginRight: 10,
  },
  syncButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  tabContent: {
    flex: 1,
  },
  dataSourceLabel: {
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#f8f8f8',
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  form: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    margin: 16,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    padding: 14,
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  createButton: {
    padding: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#e0e0e0",
  },
  list: {
    flex: 1,
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    minHeight: 60,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 14,
    color: "#666",
  },
  itemQty: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  itemAvailable: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 15,
    margin: 10,
    backgroundColor: '#ffeeee',
    borderRadius: 8,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemInfo: {
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
  },
  quantityValue: {
    paddingHorizontal: 12,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  instantStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  instantStockLabel: {
    fontSize: 14,
    color: '#666',
  },
  instantStockValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  dataSourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f8f8f8',
  },
  deleteAllButton: {
    padding: 5,
  },
});