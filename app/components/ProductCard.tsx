import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Dimensions, BackHandler, Image, Alert, ActivityIndicator } from 'react-native';
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
  const [activeTab, setActiveTab] = useState('core'); // Changed from 'basic' to 'core'
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
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
        // Use the getPublicUrl helper to generate the proper URL with the Sevalla domain
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
                        <View style={styles.inventoryItemNameContainer}>
                          <Text style={styles.inventoryItemName}>{item.name || 'Unnamed Item'}</Text>
                          {item.sku && <Text style={styles.inventoryItemSku}>SKU: {item.sku}</Text>}
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
  basicInfoHeader: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
  },
  imageThumbnail: {
    width: 100,
    height: 100,
    marginRight: 15,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 0, // Square instead of round
    backgroundColor: '#fff',
    marginHorizontal: 0, // No spacing between indicators
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  indicatorText: {
    fontSize: 12, // Larger text
    fontWeight: '500',
    color: '#333',
  },
  productTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2, // Reduced space between title and category
    color: '#333',
  },
  productCategory: {
    fontSize: 14,
    color: '#999', // Light grey
    fontWeight: 'bold', // Bold instead of italic
    fontStyle: 'normal', // Remove italic
    marginBottom: 5,
  },
  productUnit: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  bottomInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
  },
  leftBottomContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightBottomContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottomInput: {
    fontSize: 14,
    color: '#333',
    padding: 2,
    fontWeight: 'bold',
  },
  separator: {
    marginHorizontal: 8,
    color: '#999',
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    marginRight: 4,
  },
  quantityUnit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
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
  inventoryItemNameContainer: {
    flex: 1,
  },
  inventoryItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  inventoryItemSku: {
    fontSize: 12,
    color: '#666',
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
});

export default ProductCard;
