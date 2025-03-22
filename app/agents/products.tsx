import React, { useState, useEffect, useCallback } from "react";
import { init, id, i, InstaQLEntity } from "@instantdb/react-native";
import {
  View,
  Text,
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
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlobalStyles, { 
  Colors, 
  Typography, 
  Layout, 
  Forms, 
  Cards, 
  Components 
} from "../../styles/globalStyles";
import * as ImagePicker from 'expo-image-picker';
import { getPresignedUploadUrl, uploadFileWithPresignedUrl, getPublicUrl, generateUniqueFilename } from "../../utils/s3";

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
      <View style={Layout.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={Layout.container}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }
  const products = data?.products || [];
  const inventoryItems = data?.inventory || [];

  return (
    <View style={Layout.container}>
      <View style={Layout.mainContainer}>
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
    <View style={Components.form}>
      <View style={Forms.inputContainer}>
        <TextInput
          style={Forms.input}
          placeholder="Product Title"
          value={title}
          onChangeText={setTitle}
        />
        <TouchableOpacity style={Forms.createButton} onPress={handleSubmit}>
          <Ionicons name="add" size={24} color={Colors.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={Layout.formRow}>
        <TextInput
          style={[Forms.input, Forms.smallInput]}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />
        <TextInput
          style={[Forms.input, Forms.smallInput]}
          placeholder="Vendor"
          value={vendor}
          onChangeText={setVendor}
        />
      </View>

      <TouchableOpacity 
        style={Forms.inventoryButton} 
        onPress={() => setShowInventoryModal(true)}
      >
        <Text style={Forms.inventoryButtonText}>
          Link Inventory ({selectedInventoryIds.length})
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showInventoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInventoryModal(false)}
      >
        <View style={Components.modalContainer}>
          <View style={Components.modalContent}>
            <Text style={Typography.modalTitle}>Select Inventory Items</Text>
            <FlatList
              data={inventoryItems}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    Cards.inventoryItem,
                    selectedInventoryIds.includes(item.id) && Cards.selectedInventoryItem
                  ]}
                  onPress={() => toggleInventorySelection(item.id)}
                >
                  <Text style={Typography.body}>{item.name || item.sku || 'Unnamed Item'}</Text>
                  {selectedInventoryIds.includes(item.id) && (
                    <Ionicons name="checkmark" size={20} color={Colors.secondary} />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={Forms.closeButton}
              onPress={() => setShowInventoryModal(false)}
            >
              <Text style={Forms.closeButtonText}>Done</Text>
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
  const [activeTab, setActiveTab] = useState('core');
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({});
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
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

  // New image upload function
  const pickAndUploadImage = async (fieldKey: keyof Product) => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }
      
      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (result.canceled) {
        return;
      }
      
      const pickedAsset = result.assets?.[0];
      if (!pickedAsset?.uri) {
        Alert.alert('Error', 'Failed to pick image');
        return;
      }
      
      // Start uploading process
      setUploading({...uploading, [fieldKey]: true});
      setUploadProgress({...uploadProgress, [fieldKey]: 0});
      
      // Generate a unique filename for the image
      const fileName = generateUniqueFilename(pickedAsset.uri.split('/').pop() || 'image.jpg');
      
      // Get content type based on the file extension
      const contentType = pickedAsset.uri.toLowerCase().endsWith('.png') 
        ? 'image/png' 
        : 'image/jpeg';
      
      // Get presigned URL for upload
      const presignedUrl = await getPresignedUploadUrl(fileName, contentType);
      
      // Upload the file
      const success = await uploadFileWithPresignedUrl(pickedAsset.uri, presignedUrl, contentType);
      
      if (success) {
        // Get the public URL
        const publicUrl = getPublicUrl(fileName);
        
        // Update form data with the new image URL
        handleInputChange(fieldKey, publicUrl);
        
        // Upload complete
        setUploadProgress({...uploadProgress, [fieldKey]: 100});
      } else {
        Alert.alert('Upload Failed', 'Failed to upload image to storage.');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Upload Error', 'An error occurred during upload.');
    } finally {
      setUploading({...uploading, [fieldKey]: false});
    }
  };
  
  // Image component to render
  const renderImageComponent = (fieldKey: keyof Product, index: number) => {
    const imageUrl = formData[fieldKey] as string;
    const isUploading = uploading[fieldKey];
    
    return (
      <View style={Components.mediaRow}>
        <View style={Components.mediaThumbnailContainer}>
          {isUploading ? (
            <View style={Components.mediaThumbnail}>
              <ActivityIndicator size="small" color={Colors.secondary} />
            </View>
          ) : imageUrl ? (
            <View style={Components.mediaThumbnail}>
              <Image 
                source={{ uri: imageUrl }} 
                style={{ width: '100%', height: '100%', borderRadius: 4 }} 
                resizeMode="cover"
              />
            </View>
          ) : (
            <TouchableOpacity 
              style={Components.emptyMediaThumbnail}
              onPress={() => pickAndUploadImage(fieldKey)}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <View style={Components.mediaInputContainer}>
          <Text style={Components.mediaLabel}>Media {index}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[Components.mediaInput, { flex: 1 }]}
              value={imageUrl}
              onChangeText={(value) => handleInputChange(fieldKey, value)}
              placeholder="Image URL"
            />
            <TouchableOpacity 
              style={Components.uploadButton}
              onPress={() => pickAndUploadImage(fieldKey)}
              disabled={isUploading}
            >
              <Ionicons name="cloud-upload" size={20} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderCoreFields = () => (
    <View style={Layout.tabContent}>
      <View style={Layout.formGroup}>
        <Text style={Forms.label}>Title</Text>
        <TextInput
          style={Forms.modalInput}
          value={formData.title}
          onChangeText={(value) => handleInputChange('title', value)}
          placeholder="Product Title"
        />
      </View>

      <View style={Layout.formRow}>
        <View style={[Layout.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={Forms.label}>Category</Text>
          <TextInput
            style={Forms.modalInput}
            value={formData.category}
            onChangeText={(value) => handleInputChange('category', value)}
            placeholder="Category"
          />
        </View>
        <View style={[Layout.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={Forms.label}>Vendor</Text>
          <TextInput
            style={Forms.modalInput}
            value={formData.vendor}
            onChangeText={(value) => handleInputChange('vendor', value)}
            placeholder="Vendor"
          />
        </View>
      </View>

      <View style={Layout.formGroup}>
        <Text style={Forms.label}>Type</Text>
        <TextInput
          style={Forms.modalInput}
          value={formData.type}
          onChangeText={(value) => handleInputChange('type', value)}
          placeholder="Product Type"
        />
      </View>
    </View>
  );

  const renderMediaFields = () => (
    <View style={Layout.tabContent}>
      <Text style={Components.sectionHeader}>Product Media</Text>
      
      {/* Media fields using renderImageComponent */}
      {renderImageComponent('f1', 1)}
      {renderImageComponent('f2', 2)}
      {renderImageComponent('f3', 3)}
      {renderImageComponent('f4', 4)}
      {renderImageComponent('f5', 5)}
    </View>
  );

  const renderOptionFields = () => (
    <View style={Layout.tabContent}>
      <View style={Layout.formGroup}>
        <Text style={Forms.label}>Product Options</Text>
        <TextInput
          style={[Forms.modalInput, Forms.textArea]}
          value={formData.options}
          onChangeText={(value) => handleInputChange('options', value)}
          placeholder="Product Options"
          multiline
          numberOfLines={5}
        />
      </View>
    </View>
  );

  const renderInventoryFields = () => (
    <View style={Layout.tabContent}>
      <View style={Layout.formGroup}>
        <Text style={Forms.label}>Linked Inventory Items</Text>
        
        {selectedInventoryIds.length > 0 ? (
          <View style={Cards.linkedInventoryList}>
            {selectedInventoryIds.map((invId) => {
              const item = inventoryItems.find(inv => inv.id === invId);
              return (
                <View key={invId} style={Cards.linkedInventoryItem}>
                  <View style={Cards.inventoryItemDetails}>
                    <Text style={Cards.linkedInventoryName}>
                      {item?.name || item?.sku || 'Unnamed Item'}
                    </Text>
                    {item?.sku && (
                      <Text style={Cards.linkedInventorySku}>SKU: {item.sku}</Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={Cards.unlinkButton}
                    onPress={() => toggleInventorySelection(invId)}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={Cards.noInventoryPlaceholder}>
            <Text style={Typography.placeholderText}>No inventory items linked to this product</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={Forms.inventoryButtonLarge} 
          onPress={() => setShowInventorySelector(true)}
        >
          <Ionicons name="link" size={18} color={Colors.secondary} style={Forms.buttonIcon} />
          <Text style={Forms.inventoryButtonText}>
            {selectedInventoryIds.length > 0 ? 'Manage Inventory Links' : 'Link Inventory Items'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAttributeFields = () => (
    <View style={Layout.tabContent}>
      <View style={Layout.formGroup}>
        <Text style={Forms.label}>Attributes</Text>
        <TextInput
          style={[Forms.modalInput, Forms.textArea]}
          value={formData.attributes}
          onChangeText={(value) => handleInputChange('attributes', value)}
          placeholder="Product Attributes"
          multiline
          numberOfLines={6}
        />
      </View>
    </View>
  );

  const renderNotesFields = () => (
    <View style={Layout.tabContent}>
      <View style={Layout.formGroup}>
        <Text style={Forms.label}>Notes</Text>
        <TextInput
          style={[Forms.modalInput, Forms.textArea]}
          value={formData.notes}
          onChangeText={(value) => handleInputChange('notes', value)}
          placeholder="Product Notes"
          multiline
          numberOfLines={6}
        />
      </View>
    </View>
  );

  const renderPublishFields = () => (
    <View style={Layout.tabContent}>
      <View style={Layout.formGroup}>
        <Text style={Forms.label}>Tags</Text>
        <TextInput
          style={Forms.modalInput}
          value={formData.tags}
          onChangeText={(value) => handleInputChange('tags', value)}
          placeholder="Tags (comma separated)"
        />
      </View>
      
      <View style={Layout.formGroup}>
        <Text style={Forms.label}>Collection</Text>
        <TextInput
          style={Forms.modalInput}
          value={formData.collection}
          onChangeText={(value) => handleInputChange('collection', value)}
          placeholder="Collection"
        />
      </View>
      
      <View style={Layout.formGroup}>
        <Text style={Forms.label}>Metadata</Text>
        <TextInput
          style={[Forms.modalInput, Forms.textArea]}
          value={formData.metadata}
          onChangeText={(value) => handleInputChange('metadata', value)}
          placeholder="Product Metadata"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={Layout.formRow}>
        <View style={[Layout.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={Forms.label}>POS</Text>
          <TextInput
            style={Forms.modalInput}
            value={formData.pos}
            onChangeText={(value) => handleInputChange('pos', value)}
            placeholder="POS Info"
          />
        </View>
        <View style={[Layout.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={Forms.label}>Tax</Text>
          <TextInput
            style={Forms.modalInput}
            value={formData.tax}
            onChangeText={(value) => handleInputChange('tax', value)}
            placeholder="Tax Info"
          />
        </View>
      </View>

      <View style={Layout.switchContainer}>
        <Text style={Forms.label}>Web Visibility</Text>
        <Switch
          value={!!formData.web}
          onValueChange={(value) => handleInputChange('web', value)}
          trackColor={{ false: "#dedede", true: Colors.secondary }}
          thumbColor={!!formData.web ? Colors.background : "#f4f3f4"}
        />
      </View>
      
      {/* Delete button in Publish tab */}
      <TouchableOpacity
        style={Forms.deleteButton}
        onPress={handleDelete}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.background} style={Forms.buttonIcon} />
        <Text style={Forms.deleteButtonText}>Delete Product</Text>
      </TouchableOpacity>
    </View>
  );

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => onClose()}
    >
      <SafeAreaView style={Components.editModalContainer}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={Components.editModalHeader}>
          <TouchableOpacity 
            style={Forms.headerButton} 
            onPress={() => onClose()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={Components.editModalProductTitle} numberOfLines={1} ellipsizeMode="tail">
            {product.title}
          </Text>
          <TouchableOpacity 
            style={Forms.headerButton} 
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={24} color={Colors.secondary} />
          </TouchableOpacity>
        </View>

        <View style={Components.editModalContentContainer}>
          {/* Primary section (top half) */}
          <View style={Components.editModalPrimary}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{flex: 1}}
            >
              <ScrollView style={Components.editModalScrollView}>
                {activeTab === 'core' && renderCoreFields()}
                {activeTab === 'media' && renderMediaFields()}
                {activeTab === 'option' && renderOptionFields()}
                {activeTab === 'inventory' && renderInventoryFields()}
                {activeTab === 'attributes' && renderAttributeFields()}
                {activeTab === 'notes' && renderNotesFields()}
                {activeTab === 'publish' && renderPublishFields()}
              </ScrollView>
            </KeyboardAvoidingView>
          </View>

          {/* Tab navigation (center) - Updated tab icons */}
          <View style={Components.tabsContainerWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={Components.tabsContainer}>
              <TouchableOpacity 
                style={[Components.squareTab, activeTab === 'core' && Components.activeSquareTab]} 
                onPress={() => setActiveTab('core')}
              >
                <Text style={[Components.tabLetter, activeTab === 'core' && Components.activeTabLetter]}>C</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[Components.squareTab, activeTab === 'media' && Components.activeSquareTab]} 
                onPress={() => setActiveTab('media')}
              >
                <Text style={[Components.tabLetter, activeTab === 'media' && Components.activeTabLetter]}>M</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[Components.squareTab, activeTab === 'option' && Components.activeSquareTab]} 
                onPress={() => setActiveTab('option')}
              >
                <Text style={[Components.tabLetter, activeTab === 'option' && Components.activeTabLetter]}>O</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[Components.squareTab, activeTab === 'inventory' && Components.activeSquareTab]} 
                onPress={() => setActiveTab('inventory')}
              >
                <Text style={[Components.tabLetter, activeTab === 'inventory' && Components.activeTabLetter]}>I</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[Components.squareTab, activeTab === 'attributes' && Components.activeSquareTab]} 
                onPress={() => setActiveTab('attributes')}
              >
                <Text style={[Components.tabLetter, activeTab === 'attributes' && Components.activeTabLetter]}>A</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[Components.squareTab, activeTab === 'notes' && Components.activeSquareTab]} 
                onPress={() => setActiveTab('notes')}
              >
                <Text style={[Components.tabLetter, activeTab === 'notes' && Components.activeTabLetter]}>N</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[Components.squareTab, activeTab === 'publish' && Components.activeSquareTab]} 
                onPress={() => setActiveTab('publish')}
              >
                <Ionicons 
                  name="paper-plane-outline" 
                  size={24} 
                  color={activeTab === 'publish' ? Colors.secondary : "#888"} 
                />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Secondary section (bottom half) - Removed delete button from here */}
          <View style={Components.editModalSecondary}>
            {/* Empty now since delete button was moved */}
          </View>
        </View>

        <Modal
          visible={showInventorySelector}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowInventorySelector(false)}
        >
          <View style={Components.modalContainer}>
            <View style={Components.modalContent}>
              <Text style={Typography.modalTitle}>Select Inventory Items</Text>
              <FlatList
                data={inventoryItems}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      Cards.inventoryItem,
                      selectedInventoryIds.includes(item.id) && Cards.selectedInventoryItem
                    ]}
                    onPress={() => toggleInventorySelection(item.id)}
                  >
                    <Text style={Typography.body}>{item.name || item.sku || 'Unnamed Item'}</Text>
                    {selectedInventoryIds.includes(item.id) && (
                      <Ionicons name="checkmark" size={20} color={Colors.secondary} />
                    )}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity 
                style={Forms.closeButton}
                onPress={() => setShowInventorySelector(false)}
              >
                <Text style={Forms.closeButtonText}>Done</Text>
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
    <ScrollView style={Layout.fullWidth}>
      {products.map((product) => {
        const linkedInventory = getLinkedInventory(product.id);
        const isExpanded = expandedProductId === product.id;
        
        return (
          <View key={product.id} style={Cards.productListItem}>
            <TouchableOpacity onPress={() => handleProductPress(product)}>
              <View style={Cards.productHeader}>
                <Text style={Typography.productTitle}>{product.title}</Text>
                <Ionicons 
                  name="create-outline" 
                  size={20} 
                  color={Colors.secondary} 
                />
              </View>
              
              {product.vendor && (
                <Text style={Typography.productVendor}>{product.vendor}</Text>
              )}
              {product.category && (
                <Text style={Typography.productCategory}>{product.category}</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={Cards.inventoryPreview}
              onPress={() => toggleExpand(product.id)}
            >
              <Text style={Cards.inventoryPreviewText}>
                Linked Inventory ({linkedInventory.length})
              </Text>
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={18} 
                color={Colors.text.tertiary} 
              />
            </TouchableOpacity>
            
            {isExpanded && (
              <View style={Layout.expandedContent}>
                {linkedInventory.length > 0 ? (
                  linkedInventory.map(item => (
                    <View key={item.id} style={Cards.inventoryListItem}>
                      <Text style={Cards.inventoryItemName}>
                        {item.name || item.sku || 'Unnamed Item'}
                      </Text>
                      {item.sku && (
                        <Text style={Cards.inventoryItemSku}>SKU: {item.sku}</Text>
                      )}
                      {item.qty !== undefined && (
                        <Text style={Cards.inventoryItemQty}>Qty: {item.qty}</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={Typography.noItemsText}>No inventory items linked</Text>
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

export default App;