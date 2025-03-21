import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as db from '../utils/db';
import schema, { AppSchema } from "../../instant.schema";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";

type InstantInventory = InstaQLEntity<AppSchema, "inventory">;
type TabType = "sqlite" | "instantdb";

const instantDb = init({ appId: APP_ID, schema });

export default function InventoryApp() {
  const [sqliteInventory, setSqliteInventory] = useState<db.Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("sqlite");
  const [slideAnimation] = useState(new Animated.Value(0));

  // Query data from InstantDB
  const { data: instantData, error: instantError } = instantDb.useQuery({ inventory: {} });
  const instantInventory = instantData?.inventory || [];

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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
                <Text style={styles.dataSourceLabel}>Data Source: Local SQLite</Text>
                {sqliteInventory.map((item) => (
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
                  </TouchableOpacity>
                ))}
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
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.sku && (
                      <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                    )}
                    <Text style={styles.itemQty}>Qty: {item.qty}</Text>
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  }
});