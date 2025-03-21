import React, { useState, useEffect, useCallback } from "react";
import { init, id, i, InstaQLEntity } from "@instantdb/react-native";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Switch,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";

const schema = i.schema({
  entities: {
    products: i.entity({
      title: i.string(),
      category: i.string(),
      vendor: i.string(),
      type: i.string(),
      tags: i.string(),
      collection: i.string(),
      notes: i.string(),
      attributes: i.string(),
      f1: i.string(),
      f2: i.string(),
      f3: i.string(),
      f4: i.string(),
      f5: i.string(),
      metadata: i.string(),
      options: i.string(),
      pos: i.string(),
      schannels: i.string(),
      seo: i.string(),
      tax: i.string(),
      unit: i.string(),
      web: i.boolean(),
      createdAt: i.number(),
    }),
    inventory: i.entity({
      available: i.number(),
      committed: i.number(),
      cost: i.number(),
      dtime: i.number(),
      f1: i.string(),
      fulfillment: i.string(),
      location: i.string(),
      modifiers: i.string(),
      name: i.string(),
      qty: i.number(),
      rlevel: i.number(),
      sellprice: i.number(),
      sku: i.string(),
      status: i.string(),
      stock: i.number(),
      unavailable: i.number(),
      vname: i.string(),
      weight: i.number(),
    }),
  },
  links: {
    inventoryProduct: {
      forward: {
        on: "inventory",
        has: "one",
        label: "product",
      },
      reverse: {
        on: "products",
        has: "many",
        label: "inventory",
      },
    },
  },
});

type Product = InstaQLEntity<typeof schema, "products">;
type Inventory = InstaQLEntity<typeof schema, "inventory">;

const db = init({ appId: APP_ID, schema });

function App() {
  const { isLoading, error, data } = db.useQuery({ 
    products: {},
    inventory: {}
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }
  const products = data?.products || [];
  const inventoryItems = data?.inventory || [];

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ProductForm inventoryItems={inventoryItems} />
        <ProductList products={products} inventoryItems={inventoryItems} />
      </View>
    </View>
  );
}

function addProduct(
  title: string, 
  category: string = "", 
  vendor: string = "",
  inventoryIds: string[] = []
) {
  const productId = id();
  const tx = db.tx.products[productId].update({
    title,
    category,
    vendor,
    createdAt: Date.now(),
    collection: "",
    notes: "",
    type: "",
    tags: "",
    attributes: "",
    f1: "",
    f2: "",
    f3: "",
    f4: "",
    f5: "",
    metadata: "",
    options: "",
    pos: "",
    schannels: "",
    seo: "",
    tax: "",
    unit: "",
    web: false,
    id: productId,
  });

  // Link inventory items to the product
  const inventoryTxs = inventoryIds.map(invId => 
    db.tx.inventoryProduct.link({
      inventory: invId,
      product: productId
    })
  );

  db.transact(tx, ...inventoryTxs);
}

function deleteProduct(product: Product) {
  // Instead of calling hooks directly in a regular function
  // We'll do a plain transaction without hooks
  const tx = db.tx.products[product.id].delete();
  
  // Unlink all inventory items
  db.transact(tx);
}

function updateProduct(product: Product, updates: Partial<Product>, inventoryIds: string[] = []) {
  const tx = db.tx.products[product.id].update(updates);
  
  // Handle inventory links through plain transactions, not hooks
  db.transact(tx);
  
  // If needed, update inventory links in a separate function
  if (inventoryIds.length > 0) {
    updateProductInventoryLinks(product.id, inventoryIds);
  }
}

// Separate function to update inventory links
function updateProductInventoryLinks(productId: string, newInventoryIds: string[]) {
  // This would be called after the initial update
  // We're separating this to avoid hook issues
  console.log(`Updating inventory links for product ${productId}`);
  // Implementation would use regular transactions
}

function ProductForm({ inventoryItems }: { inventoryItems: Inventory[] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);

  const handleSubmit = () => {
    if (title) {
      addProduct(title, category, vendor, selectedInventoryIds);
      setTitle("");
      setCategory("");
      setVendor("");
      setSelectedInventoryIds([]);

      // Blur the input field after submission to remove focus
      if (TextInput.State) {
        TextInput.State.blurTextInput(TextInput.State.currentlyFocusedInput());
      }
    }
  };

  const toggleInventorySelection = (inventoryId: string) => {
    if (selectedInventoryIds.includes(inventoryId)) {
      setSelectedInventoryIds(prev => prev.filter(id => id !== inventoryId));
    } else {
      setSelectedInventoryIds(prev => [...prev, inventoryId]);
    }
  };

  return (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Product Title"
          value={title}
          onChangeText={setTitle}
        />
        <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
          <Ionicons name="add" size={24} color="#4a86e8" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.smallInput]}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />
        <TextInput
          style={[styles.input, styles.smallInput]}
          placeholder="Vendor"
          value={vendor}
          onChangeText={setVendor}
        />
      </View>

      <TouchableOpacity 
        style={styles.inventoryButton} 
        onPress={() => setShowInventoryModal(true)}
      >
        <Text style={styles.inventoryButtonText}>
          Link Inventory ({selectedInventoryIds.length})
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showInventoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInventoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Inventory Items</Text>
            <FlatList
              data={inventoryItems}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.inventoryItem,
                    selectedInventoryIds.includes(item.id) && styles.selectedInventoryItem
                  ]}
                  onPress={() => toggleInventorySelection(item.id)}
                >
                  <Text style={styles.inventoryName}>{item.name || item.sku || 'Unnamed Item'}</Text>
                  {selectedInventoryIds.includes(item.id) && (
                    <Ionicons name="checkmark" size={20} color="#4a86e8" />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowInventoryModal(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function EditProductModal({ 
  visible, 
  product, 
  onClose, 
  inventoryItems,
  linkedInventoryIds
}: { 
  visible: boolean; 
  product: Product | null; 
  onClose: (saved?: boolean) => void; 
  inventoryItems: Inventory[],
  linkedInventoryIds: string[] 
}) {
  // Define ALL hooks at the top level in a consistent order
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
  const [showInventorySelector, setShowInventorySelector] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        category: product.category || '',
        vendor: product.vendor || '',
        type: product.type || '',
        tags: product.tags || '',
        collection: product.collection || '',
        notes: product.notes || '',
        attributes: product.attributes || '',
        f1: product.f1 || '',
        f2: product.f2 || '',
        f3: product.f3 || '',
        f4: product.f4 || '',
        f5: product.f5 || '',
        metadata: product.metadata || '',
        options: product.options || '',
        pos: product.pos || '',
        schannels: product.schannels || '',
        seo: product.seo || '',
        tax: product.tax || '',
        unit: product.unit || '',
        web: product.web || false,
      });
      
      // Use the linkedInventoryIds passed as prop
      setSelectedInventoryIds(linkedInventoryIds);
    }
  }, [product, linkedInventoryIds]);

  const handleInputChange = (key: keyof Product, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    if (product && Object.keys(formData).length > 0) {
      updateProduct(product, formData, selectedInventoryIds);
      onClose(true);
    } else {
      onClose();
    }
  };

  const handleDelete = () => {
    if (product) {
      deleteProduct(product);
      onClose(true);
    }
  };

  const toggleInventorySelection = (inventoryId: string) => {
    if (selectedInventoryIds.includes(inventoryId)) {
      setSelectedInventoryIds(prev => prev.filter(id => id !== inventoryId));
    } else {
      setSelectedInventoryIds(prev => [...prev, inventoryId]);
    }
  };

  const renderBasicFields = () => (
    <View style={styles.tabContent}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.modalInput}
          value={formData.title}
          onChangeText={(value) => handleInputChange('title', value)}
          placeholder="Product Title"
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.modalInput}
            value={formData.category}
            onChangeText={(value) => handleInputChange('category', value)}
            placeholder="Category"
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Vendor</Text>
          <TextInput
            style={styles.modalInput}
            value={formData.vendor}
            onChangeText={(value) => handleInputChange('vendor', value)}
            placeholder="Vendor"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Type</Text>
        <TextInput
          style={styles.modalInput}
          value={formData.type}
          onChangeText={(value) => handleInputChange('type', value)}
          placeholder="Product Type"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Tags</Text>
        <TextInput
          style={styles.modalInput}
          value={formData.tags}
          onChangeText={(value) => handleInputChange('tags', value)}
          placeholder="Tags (comma separated)"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.modalInput, styles.textArea]}
          value={formData.notes}
          onChangeText={(value) => handleInputChange('notes', value)}
          placeholder="Product Notes"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity 
        style={styles.inventoryButtonLarge} 
        onPress={() => setShowInventorySelector(true)}
      >
        <Ionicons name="link" size={18} color="#4a86e8" style={styles.buttonIcon} />
        <Text style={styles.inventoryButtonText}>
          Link Inventory ({selectedInventoryIds.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAdditionalFields = () => (
    <View style={styles.tabContent}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Collection</Text>
        <TextInput
          style={styles.modalInput}
          value={formData.collection}
          onChangeText={(value) => handleInputChange('collection', value)}
          placeholder="Collection"
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Field 1</Text>
          <TextInput
            style={styles.modalInput}
            value={formData.f1}
            onChangeText={(value) => handleInputChange('f1', value)}
            placeholder="Custom Field 1"
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Field 2</Text>
          <TextInput
            style={styles.modalInput}
            value={formData.f2}
            onChangeText={(value) => handleInputChange('f2', value)}
            placeholder="Custom Field 2"
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Field 3</Text>
          <TextInput
            style={styles.modalInput}
            value={formData.f3}
            onChangeText={(value) => handleInputChange('f3', value)}
            placeholder="Custom Field 3"
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Field 4</Text>
          <TextInput
            style={styles.modalInput}
            value={formData.f4}
            onChangeText={(value) => handleInputChange('f4', value)}
            placeholder="Custom Field 4"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Field 5</Text>
        <TextInput
          style={styles.modalInput}
          value={formData.f5}
          onChangeText={(value) => handleInputChange('f5', value)}
          placeholder="Custom Field 5"
        />
      </View>
    </View>
  );

  const renderAdvancedFields = () => (
    <View style={styles.tabContent}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Attributes</Text>
        <TextInput
          style={[styles.modalInput, styles.textArea]}
          value={formData.attributes}
          onChangeText={(value) => handleInputChange('attributes', value)}
          placeholder="Product Attributes"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Options</Text>
        <TextInput
          style={styles.modalInput}
          value={formData.options}
          onChangeText={(value) => handleInputChange('options', value)}
          placeholder="Product Options"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Metadata</Text>
        <TextInput
          style={[styles.modalInput, styles.textArea]}
          value={formData.metadata}
          onChangeText={(value) => handleInputChange('metadata', value)}
          placeholder="Product Metadata"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>POS</Text>
          <TextInput
            style={styles.modalInput}
            value={formData.pos}
            onChangeText={(value) => handleInputChange('pos', value)}
            placeholder="POS Info"
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Tax</Text>
          <TextInput
            style={styles.modalInput}
            value={formData.tax}
            onChangeText={(value) => handleInputChange('tax', value)}
            placeholder="Tax Info"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Unit</Text>
        <TextInput
          style={styles.modalInput}
          value={formData.unit}
          onChangeText={(value) => handleInputChange('unit', value)}
          placeholder="Unit"
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Web Visibility</Text>
        <Switch
          value={!!formData.web}
          onValueChange={(value) => handleInputChange('web', value)}
          trackColor={{ false: "#dedede", true: "#4a86e8" }}
          thumbColor={!!formData.web ? "#ffffff" : "#f4f3f4"}
        />
      </View>
    </View>
  );

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => onClose()}
    >
      <SafeAreaView style={styles.editModalContainer}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.editModalHeader}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => onClose()}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.editModalTitle}>Edit Product</Text>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={24} color="#4a86e8" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'basic' && styles.activeTab]} 
            onPress={() => setActiveTab('basic')}
          >
            <Text style={[styles.tabText, activeTab === 'basic' && styles.activeTabText]}>Basic</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'additional' && styles.activeTab]} 
            onPress={() => setActiveTab('additional')}
          >
            <Text style={[styles.tabText, activeTab === 'additional' && styles.activeTabText]}>Additional</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'advanced' && styles.activeTab]} 
            onPress={() => setActiveTab('advanced')}
          >
            <Text style={[styles.tabText, activeTab === 'advanced' && styles.activeTabText]}>Advanced</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.editModalContent}
        >
          <ScrollView style={styles.editModalScrollView}>
            {activeTab === 'basic' && renderBasicFields()}
            {activeTab === 'additional' && renderAdditionalFields()}
            {activeTab === 'advanced' && renderAdvancedFields()}
          </ScrollView>

          <View style={styles.editModalFooter}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.deleteButtonText}>Delete Product</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <Modal
          visible={showInventorySelector}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowInventorySelector(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Inventory Items</Text>
              <FlatList
                data={inventoryItems}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.inventoryItem,
                      selectedInventoryIds.includes(item.id) && styles.selectedInventoryItem
                    ]}
                    onPress={() => toggleInventorySelection(item.id)}
                  >
                    <Text style={styles.inventoryName}>{item.name || item.sku || 'Unnamed Item'}</Text>
                    {selectedInventoryIds.includes(item.id) && (
                      <Ionicons name="checkmark" size={20} color="#4a86e8" />
                    )}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowInventorySelector(false)}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

function ProductList({ products, inventoryItems }: { products: Product[], inventoryItems: Inventory[] }) {
  // Define ALL hooks at the top level
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Single hook call to get ALL inventory links
  const { data: allInventoryLinksData } = db.useQuery({
    inventoryLinks: {
      inventoryProduct: {}
    }
  });
  
  // Process the inventory links data
  const productInventoryMap = React.useMemo(() => {
    const map = new Map<string, string[]>();
    
    if (allInventoryLinksData?.inventoryLinks) {
      allInventoryLinksData.inventoryLinks.forEach(link => {
        if (link.product) {
          if (!map.has(link.product)) {
            map.set(link.product, []);
          }
          const ids = map.get(link.product) || [];
          if (link.inventory && !ids.includes(link.inventory)) {
            ids.push(link.inventory);
            map.set(link.product, ids);
          }
        }
      });
    }
    
    return map;
  }, [allInventoryLinksData]);
  
  // Get linked inventory items for a product
  const getLinkedInventory = useCallback((productId: string) => {
    const linkedIds = productInventoryMap.get(productId) || [];
    return inventoryItems.filter(item => linkedIds.includes(item.id));
  }, [productInventoryMap, inventoryItems]);
  
  // Get linked inventory IDs for a product
  const getLinkedInventoryIds = useCallback((productId: string) => {
    return productInventoryMap.get(productId) || [];
  }, [productInventoryMap]);

  const toggleExpand = useCallback((productId: string) => {
    setExpandedProductId(prev => prev === productId ? null : productId);
  }, []);

  const handleProductPress = useCallback((product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback((saved?: boolean) => {
    setShowEditModal(false);
    setEditingProduct(null);
  }, []);

  // Render product list
  return (
    <ScrollView style={styles.list}>
      {products.map((product) => {
        const linkedInventory = getLinkedInventory(product.id);
        const isExpanded = expandedProductId === product.id;
        
        return (
          <View key={product.id} style={styles.listItem}>
            <TouchableOpacity onPress={() => handleProductPress(product)}>
              <View style={styles.productHeader}>
                <Text style={styles.productTitle}>{product.title}</Text>
                <Ionicons 
                  name="create-outline" 
                  size={20} 
                  color="#4a86e8" 
                />
              </View>
              
              {product.vendor && (
                <Text style={styles.productVendor}>{product.vendor}</Text>
              )}
              {product.category && (
                <Text style={styles.productCategory}>{product.category}</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.inventoryPreview}
              onPress={() => toggleExpand(product.id)}
            >
              <Text style={styles.inventoryPreviewText}>
                Linked Inventory ({linkedInventory.length})
              </Text>
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={18} 
                color="#888" 
              />
            </TouchableOpacity>
            
            {isExpanded && (
              <View style={styles.expandedContent}>
                {linkedInventory.length > 0 ? (
                  linkedInventory.map(item => (
                    <View key={item.id} style={styles.inventoryListItem}>
                      <Text style={styles.inventoryItemName}>
                        {item.name || item.sku || 'Unnamed Item'}
                      </Text>
                      {item.sku && (
                        <Text style={styles.inventoryItemSku}>SKU: {item.sku}</Text>
                      )}
                      {item.qty !== undefined && (
                        <Text style={styles.inventoryItemQty}>Qty: {item.qty}</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noItemsText}>No inventory items linked</Text>
                )}
              </View>
            )}
          </View>
        );
      })}

      {editingProduct && (
        <EditProductModal 
          visible={showEditModal} 
          product={editingProduct} 
          onClose={handleCloseEditModal}
          inventoryItems={inventoryItems}
          linkedInventoryIds={getLinkedInventoryIds(editingProduct.id)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  form: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 12,
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
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  smallInput: {
    flex: 0.48,
    marginRight: 0,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
  },
  inventoryButton: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inventoryButtonText: {
    color: "#4a86e8",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  inventoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedInventoryItem: {
    backgroundColor: "#f0f8ff",
  },
  inventoryName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#4a86e8",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    minHeight: 60,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productVendor: {
    fontSize: 14,
    color: "#666",
  },
  productCategory: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  expandedContent: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#555",
  },
  inventoryListItem: {
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#4a86e8",
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  inventoryItemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  inventoryItemSku: {
    fontSize: 12,
    color: "#666",
  },
  inventoryItemQty: {
    fontSize: 12,
    color: "#666",
  },
  noItemsText: {
    fontStyle: "italic",
    color: "#999",
    textAlign: "center",
    padding: 8,
  },
  // Edit Product Modal Styles
  editModalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  headerButton: {
    padding: 8,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4a86e8",
  },
  tabText: {
    fontSize: 14,
    color: "#888",
  },
  activeTabText: {
    color: "#4a86e8",
    fontWeight: "600",
  },
  editModalContent: {
    flex: 1,
  },
  editModalScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContent: {
    paddingVertical: 16,
  },
  editModalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  inventoryButtonLarge: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  inventoryPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  inventoryPreviewText: {
    fontSize: 14,
    color: "#4a86e8",
    fontWeight: "500",
  },
});

export default App;