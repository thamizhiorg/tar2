import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Dimensions, BackHandler, Image, Alert, ActivityIndicator, Animated, TouchableWithoutFeedback } from 'react-native';
import { InstaQLEntity, init } from "@instantdb/react-native";
import { AppSchema } from "../../instant.schema";
import * as ImagePicker from 'expo-image-picker';
import { uploadFileWithPresignedUrl, getPresignedUploadUrl, generateUniqueFilename, getPublicUrl } from '../../utils/s3';

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";
const db = init({ appId: APP_ID });

type Product = InstaQLEntity<AppSchema, "products">;
type Inventory = InstaQLEntity<AppSchema, "inventory">;

interface ProductCardProps {
  product: Product;
  onClose: () => void;
}

const ProductCard = ({ product: initialProduct, onClose }: ProductCardProps) => {
  const [activeTab, setActiveTab] = useState('core');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingInventoryId, setUploadingInventoryId] = useState<string | null>(null);
  const [productOptions, setProductOptions] = useState<{[key: string]: {[key: string]: string}}>({});
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [currentOptionType, setCurrentOptionType] = useState<string | null>(null);
  const [editingOptions, setEditingOptions] = useState(false);
  const [newOptionKey, setNewOptionKey] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');
  const [bottomSheetAnimation] = useState(new Animated.Value(0));
  
  // Add hardware back button handler
  useEffect(() => {
    const backAction = () => {
      onClose();
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // Clean up on unmount
  }, [onClose]);
  
  // Use the correct association query syntax based on the InstantDB documentation
  const { data, error } = db.useQuery({
    products: {
      $: { where: { id: initialProduct.id } },
      inventory: {},  // This fetches the associated inventory items through the relation
    }
  });

  // Log any query errors
  useEffect(() => {
    if (error) {
      console.error("Query error:", error);
    }
  }, [error]);

  // Get the product with its associated inventory items
  const product = data?.products?.[0] || initialProduct;
  const inventoryItems = product?.inventory || [];
  
  // Add logging to debug inventory data
  useEffect(() => {
    console.log("Product ID:", initialProduct.id);
    console.log("Product data:", product);
    console.log("Inventory items:", inventoryItems);
  }, [initialProduct.id, product, inventoryItems]);

  // Parse options from product if it exists
  useEffect(() => {
    if (product.options) {
      try {
        const parsedOptions = JSON.parse(product.options as string);
        setProductOptions(parsedOptions);
      } catch (e) {
        console.error("Failed to parse product options:", e);
        setProductOptions({});
      }
    }
  }, [product.options]);

  // Save options back to product
  const saveOptions = (updatedOptions: {[key: string]: {[key: string]: string}}) => {
    setProductOptions(updatedOptions);
    handleInputChange('options', JSON.stringify(updatedOptions));
  };

  // Add a new option key-value pair
  const addOption = () => {
    if (!currentOptionType || !newOptionKey || !newOptionValue) return;
    
    const updatedOptions = {...productOptions};
    if (!updatedOptions[currentOptionType]) {
      updatedOptions[currentOptionType] = {};
    }
    updatedOptions[currentOptionType][newOptionKey] = newOptionValue;
    
    saveOptions(updatedOptions);
    setNewOptionKey('');
    setNewOptionValue('');
    closeOptionModal();
  };

  // Remove an option
  const removeOption = (optionType: string, optionKey: string) => {
    const updatedOptions = {...productOptions};
    if (updatedOptions[optionType] && updatedOptions[optionType][optionKey]) {
      delete updatedOptions[optionType][optionKey];
      
      // Remove the option type if it's empty
      if (Object.keys(updatedOptions[optionType]).length === 0) {
        delete updatedOptions[optionType];
      }
      
      saveOptions(updatedOptions);
    }
  };

  // Open modal for adding a new option
  const openOptionModal = (optionType: string) => {
    setCurrentOptionType(optionType);
    setNewOptionKey('');
    setNewOptionValue('');
    setOptionModalVisible(true);
    
    // Animate the bottom sheet up
    Animated.timing(bottomSheetAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  // Close the modal with animation
  const closeOptionModal = () => {
    Animated.timing(bottomSheetAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setOptionModalVisible(false);
    });
  };

  // Get image URLs from product's f1-f5 fields
  const productImages = [
    product.f1 || 'https://via.placeholder.com/150?text=Tap+to+Upload',
    product.f2 || 'https://via.placeholder.com/150?text=Tap+to+Upload',
    product.f3 || 'https://via.placeholder.com/150?text=Tap+to+Upload',
    product.f4 || 'https://via.placeholder.com/150?text=Tap+to+Upload',
    product.f5 || 'https://via.placeholder.com/150?text=Tap+to+Upload',
  ];

  const handleInputChange = (field: string, value: string) => {
    db.transact(db.tx.products[product.id].update({ [field]: value }));
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleImageUpload = async (index: number) => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant access to your photos to upload images.');
        return;
      }

      // Pick image
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (pickerResult.canceled) return;

      // Start upload process
      setIsUploading(true);
      
      const imageUri = pickerResult.assets[0].uri;
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const uniqueFilename = generateUniqueFilename(filename);
      
      // Get presigned URL for S3 upload
      const contentType = 'image/jpeg';
      const presignedUrl = await getPresignedUploadUrl(uniqueFilename, contentType);
      
      // Upload file to S3
      const uploadSuccess = await uploadFileWithPresignedUrl(imageUri, presignedUrl, contentType);
      
      if (uploadSuccess) {
        // Use the getPublicUrl helper to generate the proper URL
        const publicUrl = getPublicUrl(uniqueFilename);
        const fieldName = `f${index + 1}` as keyof Product;
        
        db.transact(db.tx.products[product.id].update({
          [fieldName]: publicUrl
        }));
        
        // Set the current image index to the uploaded image
        setCurrentImageIndex(index);
      } else {
        Alert.alert('Upload Failed', 'There was a problem uploading your image.');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'An error occurred while uploading the image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInventoryImageUpload = async (inventoryId: string) => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant access to your photos to upload images.');
        return;
      }

      // Pick image
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (pickerResult.canceled) return;

      // Start upload process
      setIsUploading(true);
      setUploadingInventoryId(inventoryId);
      
      const imageUri = pickerResult.assets[0].uri;
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const uniqueFilename = generateUniqueFilename(filename);
      
      // Get presigned URL for S3 upload
      const contentType = 'image/jpeg';
      const presignedUrl = await getPresignedUploadUrl(uniqueFilename, contentType);
      
      // Upload file to S3
      const uploadSuccess = await uploadFileWithPresignedUrl(imageUri, presignedUrl, contentType);
      
      if (uploadSuccess) {
        // Use the getPublicUrl helper to generate the proper URL
        const publicUrl = getPublicUrl(uniqueFilename);
        
        // Update the inventory item's f1 field with the image URL
        db.transact(db.tx.inventory[inventoryId].update({
          f1: publicUrl
        }));
      } else {
        Alert.alert('Upload Failed', 'There was a problem uploading your image.');
      }
    } catch (error) {
      console.error('Inventory image upload error:', error);
      Alert.alert('Error', 'An error occurred while uploading the image.');
    } finally {
      setIsUploading(false);
      setUploadingInventoryId(null);
    }
  };

  // Update tab names and IDs
  const tabs = [
    { id: 'core', label: 'C' },
    { id: 'attributes', label: 'A' },
    { id: 'publish', label: 'P' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'core':
        return (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              {/* Product Options Section */}
              <View style={styles.optionsContainer}>
                <View style={styles.optionsSectionHeader}>
                  <View style={styles.optionsSectionHeaderSpacer} />
                  <TouchableOpacity 
                    style={styles.editOptionsButton}
                    onPress={() => setEditingOptions(!editingOptions)}
                  >
                    <Text style={styles.editOptionsButtonText}>
                      {editingOptions ? 'Done' : 'Edit'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Color Options */}
                <View style={styles.optionRow}>
                  <Text style={styles.optionType}>Color</Text>
                  {editingOptions && (
                    <TouchableOpacity 
                      style={styles.addOptionButton}
                      onPress={() => openOptionModal('color')}
                    >
                      <Text style={styles.addOptionButtonText}>+</Text>
                    </TouchableOpacity>
                  )}
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionValuesScroll}>
                    {productOptions.color && Object.keys(productOptions.color).length > 0 ? (
                      Object.entries(productOptions.color).map(([key, value]) => (
                        <View key={key} style={styles.colorOptionItem}>
                          <View style={styles.colorSwatchContainer}>
                            <View style={[styles.colorSwatch, { backgroundColor: value }]} />
                            {editingOptions && (
                              <TouchableOpacity 
                                style={styles.removeOptionButton}
                                onPress={() => removeOption('color', key)}
                              >
                                <Text style={styles.removeOptionButtonText}>×</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <TouchableOpacity 
                        style={styles.emptyOptionsContainer}
                        onPress={() => openOptionModal('color')}
                      >
                        <Text style={styles.emptyOptionsText}>Add color options</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
                
                {/* Size Options */}
                <View style={styles.optionRow}>
                  <Text style={styles.optionType}>Size</Text>
                  {editingOptions && (
                    <TouchableOpacity 
                      style={styles.addOptionButton}
                      onPress={() => openOptionModal('size')}
                    >
                      <Text style={styles.addOptionButtonText}>+</Text>
                    </TouchableOpacity>
                  )}
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionValuesScroll}>
                    {productOptions.size && Object.keys(productOptions.size).length > 0 ? (
                      Object.entries(productOptions.size).map(([key, value]) => (
                        <View key={key} style={styles.sizeOptionItem}>
                          <View style={styles.sizeSwatchContainer}>
                            <View style={styles.sizeSwatch}>
                              <Text style={styles.sizeSwatchText}>{value}</Text>
                            </View>
                            {editingOptions && (
                              <TouchableOpacity 
                                style={styles.removeOptionButton}
                                onPress={() => removeOption('size', key)}
                              >
                                <Text style={styles.removeOptionButtonText}>×</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <TouchableOpacity 
                        style={styles.emptyOptionsContainer}
                        onPress={() => openOptionModal('size')}
                      >
                        <Text style={styles.emptyOptionsText}>Add size options</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
                
                {/* Material Options */}
                <View style={styles.optionRow}>
                  <Text style={styles.optionType}>Material</Text>
                  {editingOptions && (
                    <TouchableOpacity 
                      style={styles.addOptionButton}
                      onPress={() => openOptionModal('material')}
                    >
                      <Text style={styles.addOptionButtonText}>+</Text>
                    </TouchableOpacity>
                  )}
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionValuesScroll}>
                    {productOptions.material && Object.keys(productOptions.material).length > 0 ? (
                      Object.entries(productOptions.material).map(([key, value]) => (
                        <View key={key} style={styles.materialOptionItem}>
                          <View style={styles.materialSwatchContainer}>
                            <Image 
                              source={{ uri: value.startsWith('http') ? value : 'https://via.placeholder.com/44' }} 
                              style={styles.materialSwatch} 
                            />
                            {editingOptions && (
                              <TouchableOpacity 
                                style={styles.removeOptionButton}
                                onPress={() => removeOption('material', key)}
                              >
                                <Text style={styles.removeOptionButtonText}>×</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <TouchableOpacity 
                        style={styles.emptyOptionsContainer}
                        onPress={() => openOptionModal('material')}
                      >
                        <Text style={styles.emptyOptionsText}>Add material options</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.bottomInfoContainer}>
                <View style={styles.leftBottomContainer}>
                  {/* Type and Vendor fields removed */}
                </View>
                
                <View style={styles.rightBottomContainer}>
                  <Text style={styles.quantityValue}>10</Text>
                  <TextInput
                    style={styles.quantityUnit}
                    value={product.unit}
                    onChangeText={(value) => handleInputChange('unit', value)}
                    placeholder="Unit"
                  />
                </View>
              </View>
            </View>
            
            {/* Inventory Items List */}
            <View style={styles.inventorySection}>
              {inventoryItems.length === 0 ? (
                <Text style={styles.noInventoryText}>No inventory items associated with this product</Text>
              ) : (
                <ScrollView style={styles.inventoryList}>
                  {inventoryItems.map((item) => (
                    <View key={item.id} style={styles.inventoryItem}>
                      <View style={styles.inventoryItemHeader}>
                        <View style={styles.inventoryItemImageAndDetails}>
                          <TouchableOpacity 
                            style={styles.inventoryItemImage}
                            onPress={() => handleInventoryImageUpload(item.id)}
                            disabled={isUploading && uploadingInventoryId === item.id}
                          >
                            <Image 
                              source={{ uri: item.f1 || 'https://via.placeholder.com/60?text=Inv' }} 
                              style={styles.inventoryThumbnail}
                            />
                            {isUploading && uploadingInventoryId === item.id && (
                              <View style={styles.inventoryUploadingOverlay}>
                                <ActivityIndicator size="small" color="#007AFF" />
                              </View>
                            )}
                          </TouchableOpacity>
                          <View style={styles.inventoryItemNameContainer}>
                            <Text style={styles.inventoryItemName}>{item.name || 'Unnamed Item'}</Text>
                            {item.sku && <Text style={styles.inventoryItemSku}>SKU: {item.sku}</Text>}
                          </View>
                        </View>
                        <Text style={styles.inventoryItemAvailable}>{item.available || 0}</Text>
                      </View>
                      {item.location && (
                        <View style={styles.inventoryItemDetail}>
                          <Text style={styles.inventoryItemDetailLabel}>Location:</Text>
                          <Text style={styles.inventoryItemDetailValue}>{item.location}</Text>
                        </View>
                      )}
                    </View>
                  ))}

                </ScrollView>
              )}
            </View>
          </View>
        );
      case 'attributes':
        return (
          <View style={styles.tabContent}>
            <View style={styles.imagesContainer}>
              <Text style={styles.imagesSectionTitle}>Product Images</Text>
              <View style={styles.imagesGrid}>
                {[1, 2, 3, 4, 5].map((num) => {
                  const fieldName = `f${num}` as keyof Product;
                  const imageUrl = product[fieldName] as string;
                  return (
                    <TouchableOpacity 
                      key={num}
                      style={styles.metadataImageContainer}
                      onPress={() => handleImageUpload(num - 1)}
                      disabled={isUploading}
                    >
                      <Image 
                        source={{ uri: imageUrl || `https://via.placeholder.com/150?text=Image+${num}` }} 
                        style={styles.metadataImage}
                      />
                      <Text style={styles.metadataImageLabel}>Image {num}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <InfoRow label="Collection" value={product.collection} />
            <InfoRow label="Tags" value={product.tags} />
            <InfoRow label="Notes" value={product.notes} />
            <InfoRow label="Options" value={product.options} />
            <InfoRow label="Type" value={product.type} />
            <InfoRow label="Vendor" value={product.vendor} />
            <InfoRow label="POS" value={product.pos} />
            <InfoRow label="Sales Channels" value={product.schannels} />
            <InfoRow label="Tax" value={product.tax} />
            <InfoRow label="Web Enabled" value={product.web ? 'Yes' : 'No'} />
          </View>
        );
      case 'publish':
        return (
          <View style={styles.tabContent}>
            <InfoRow label="SEO" value={product.seo} />
            <InfoRow label="Metadata" value={product.metadata} />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.tabs}>
          <Text style={styles.productNameInTabs} numberOfLines={1} ellipsizeMode="tail">
            {product.title || 'Untitled Product'}
          </Text>
          <View style={styles.tabSpacer}></View>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab, 
                activeTab === tab.id && styles.activeTab,
                index === tabs.length - 1 && styles.lastTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content}>
          {renderTabContent()}
        </ScrollView>
      </View>

      {/* Bottom Drawer Option Modal */}
      {optionModalVisible && (
        <>
          <TouchableWithoutFeedback onPress={closeOptionModal}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          
          <Animated.View 
            style={[
              styles.bottomDrawer,
              {
                transform: [
                  {
                    translateY: bottomSheetAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.bottomDrawerHandle}>
              <View style={styles.bottomDrawerHandleBar} />
            </View>
            
            <Text style={styles.bottomDrawerTitle}>
              Add {currentOptionType === 'color' ? 'Color' : 
                  currentOptionType === 'size' ? 'Size' : 'Material'} Option
            </Text>
            
            <View style={styles.bottomDrawerContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.bottomDrawerInput}
                  value={newOptionKey}
                  onChangeText={setNewOptionKey}
                  placeholder={
                    currentOptionType === 'color' ? "e.g. Red" : 
                    currentOptionType === 'size' ? "e.g. Small" : "e.g. Cotton"
                  }
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Value</Text>
                <TextInput
                  style={styles.bottomDrawerInput}
                  value={newOptionValue}
                  onChangeText={setNewOptionValue}
                  placeholder={
                    currentOptionType === 'color' ? "e.g. #FF0000" : 
                    currentOptionType === 'size' ? "e.g. S" : "URL to image"
                  }
                />
                
                {currentOptionType === 'color' && newOptionValue ? (
                  <View style={[styles.colorPreview, { backgroundColor: newOptionValue }]} />
                ) : null}
              </View>
              
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addOption}
              >
                <Text style={styles.addButtonText}>Add Option</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
};

const EditableInfoRow = ({ label, value, onChange }: { label: string, value?: string, onChange: (value: string) => void }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <TextInput
      style={styles.valueInput}
      value={value}
      onChangeText={onChange}
    />
  </View>
);

const InfoRow = ({ label, value }: { label: string, value?: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    height: Dimensions.get('window').height,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'flex-end', // Align tabs to the right
    alignItems: 'center', // Center items vertically
    paddingLeft: 10, // Add some padding on the left for the product name
  },
  tabSpacer: {
    flex: 1, // Takes up space on the left, pushing tabs to the right
  },
  tab: {
    padding: 0, // Remove padding
    alignItems: 'center',
    justifyContent: 'center',
    width: 40, // Fixed width for square shape
    height: 40, // Fixed height for square shape
    marginLeft: 5, // Add small spacing between tabs
    marginVertical: 8, // Add spacing above and below
    borderWidth: 1, // Add light border
    borderColor: '#ddd', // Light border color
  },
  activeTab: {
    borderColor: '#007AFF', // Highlight active tab with blue border
    backgroundColor: 'rgba(0, 122, 255, 0.05)', // Very light blue background
  },
  tabText: {
    color: '#666',
    fontWeight: '500', // Make text slightly bolder
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  lastTab: {
    marginRight: 15, // Add extra spacing after the last tab (P box)
  },
  productNameInTabs: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 5,
    maxWidth: '40%', // Limit width to prevent overflow
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fafafa', // Lighter background
    borderRadius: 8,
    padding: 16,
    // Remove shadow/elevation
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  label: {
    width: 120,
    fontWeight: '500',
    color: '#666',
  },
  value: {
    flex: 1,
    color: '#333',
  },
  valueInput: {
    flex: 1,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 4,
  },
  optionsContainer: {
    marginBottom: 15,
  },
  optionsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionsSectionHeaderSpacer: {
    flex: 1,
  },
  editOptionsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  editOptionsButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    fontSize: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionType: {
    width: 70,
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  addOptionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addOptionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 24,
    marginTop: -2,
  },
  removeOptionButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  removeOptionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 20,
    marginTop: -2,
  },
  emptyOptionsContainer: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    borderStyle: 'dashed',
    backgroundColor: '#f9f9f9',
  },
  emptyOptionsText: {
    color: '#999',
    fontSize: 12,
  },
  inventoryItemNameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inventoryItemName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  inventoryItemSku: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  uploadingContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  uploadingText: {
    marginTop: 5,
    color: '#007AFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 5,
  },
  indicatorTextUploaded: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  imagesContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  imagesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metadataImageContainer: {
    width: '18%',
    marginBottom: 15,
  },
  metadataImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  metadataImageLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  inventorySection: {
    marginTop: 16,
    marginBottom: 16,
  },
  inventorySectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  inventoryList: {
    // Remove border and border radius
  },
  inventoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  inventoryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  inventoryItemImageAndDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inventoryItemImage: {
    marginRight: 10,
    position: 'relative',
  },
  inventoryThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inventoryUploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  inventoryItemAvailable: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  inventoryItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inventoryItemDetail: {
    flexDirection: 'row',
  },
  inventoryItemDetailLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  inventoryItemDetailValue: {
    fontSize: 14,
    color: '#333',
  },
  noInventoryText: {
    padding: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  
  // Bottom drawer modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  bottomDrawerHandle: {
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomDrawerHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
  },
  bottomDrawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  bottomDrawerContent: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    fontWeight: '500',
  },
  bottomDrawerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  colorPreview: {
    position: 'absolute',
    right: 15,
    top: 38,
    width: 25,
    height: 25,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorOptionItem: {
    alignItems: 'center',
    marginRight: 16,
    marginVertical: 8,
    width: 50,
  },
  colorSwatchContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorOptionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 2,
  },
  sizeOptionItem: {
    alignItems: 'center',
    marginRight: 16,
    marginVertical: 8,
    width: 50,
  },
  sizeSwatchContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  sizeSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeSwatchText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  materialOptionItem: {
    alignItems: 'center',
    marginRight: 16,
    marginVertical: 8,
    width: 50,
  },
  materialSwatchContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  materialSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionValuesScroll: {
    flexDirection: 'row',
    paddingVertical: 6,
    flexWrap: 'wrap', // Allow wrapping for multiple values
  },
}); 

export default ProductCard;
