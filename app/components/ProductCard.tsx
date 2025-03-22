import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Dimensions, BackHandler, Image } from 'react-native';
import { InstaQLEntity, init } from "@instantdb/react-native";
import { AppSchema } from "../../instant.schema";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";
const db = init({ appId: APP_ID });

type Product = InstaQLEntity<AppSchema, "products">;

interface ProductCardProps {
  product: Product;
  onClose: () => void;
}

const ProductCard = ({ product: initialProduct, onClose }: ProductCardProps) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Sample product images (replace with actual product images)
  const productImages = [
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150/0000FF',
    'https://via.placeholder.com/150/FF0000',
    'https://via.placeholder.com/150/00FF00',
    'https://via.placeholder.com/150/FFFF00',
  ];
  
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
  
  // Add real-time subscription to product updates
  const { data } = db.useQuery({
    products: {
      $: { where: { id: initialProduct.id } },
    },
  });

  // Merge real-time data with initial product data
  const product = data?.products?.[0] || initialProduct;

  const handleInputChange = (field: string, value: string) => {
    db.transact(db.tx.products[product.id].update({ [field]: value }));
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Details' },
    { id: 'sales', label: 'Sales' },
    { id: 'metadata', label: 'Metadata' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.basicInfoHeader}>
                <TouchableOpacity 
                  style={styles.imageThumbnail}
                  onPress={() => setCurrentImageIndex((currentImageIndex + 1) % productImages.length)}
                >
                  <Image 
                    source={{ uri: productImages[currentImageIndex] }} 
                    style={styles.productImage} 
                  />
                  <View style={styles.imageIndicators}>
                    {productImages.map((_, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={[
                          styles.indicator, 
                          currentImageIndex === index && styles.activeIndicator
                        ]}
                        onPress={() => handleImageChange(index)}
                      >
                        <Text style={styles.indicatorText}>{index + 1}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
                
                <View style={styles.productTitleContainer}>
                  <TextInput
                    style={styles.productTitle}
                    value={product.title}
                    onChangeText={(value) => handleInputChange('title', value)}
                  />
                  <TextInput
                    style={styles.productCategory}
                    value={product.category}
                    onChangeText={(value) => handleInputChange('category', value)}
                    placeholder="Category"
                  />
                </View>
              </View>
              
              <View style={styles.bottomInfoContainer}>
                <View style={styles.leftBottomContainer}>
                  <TextInput
                    style={styles.bottomInput}
                    value={product.type}
                    onChangeText={(value) => handleInputChange('type', value)}
                    placeholder="Type"
                  />
                  <Text style={styles.separator}>•</Text>
                  <TextInput
                    style={styles.bottomInput}
                    value={product.vendor}
                    onChangeText={(value) => handleInputChange('vendor', value)}
                    placeholder="Vendor"
                  />
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
          </View>
        );
      case 'details':
        return (
          <View style={styles.tabContent}>
            <InfoRow label="Collection" value={product.collection} />
            <InfoRow label="Tags" value={product.tags} />
            <InfoRow label="Notes" value={product.notes} />
            <InfoRow label="Options" value={product.options} />
          </View>
        );
      case 'sales':
        return (
          <View style={styles.tabContent}>
            <InfoRow label="POS" value={product.pos} />
            <InfoRow label="Sales Channels" value={product.schannels} />
            <InfoRow label="Tax" value={product.tax} />
            <InfoRow label="Web Enabled" value={product.web ? 'Yes' : 'No'} />
          </View>
        );
      case 'metadata':
        return (
          <View style={styles.tabContent}>
            <InfoRow label="SEO" value={product.seo} />
            <InfoRow label="Metadata" value={product.metadata} />
            <InfoRow label="F1" value={product.f1} />
            <InfoRow label="F2" value={product.f2} />
            <InfoRow label="F3" value={product.f3} />
            <InfoRow label="F4" value={product.f4} />
            <InfoRow label="F5" value={product.f5} />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.tabs}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
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
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '500',
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
});

export default ProductCard;
