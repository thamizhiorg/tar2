import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Dimensions, BackHandler } from 'react-native';
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
              <EditableInfoRow 
                label="Title" 
                value={product.title} 
                onChange={(value) => handleInputChange('title', value)} 
              />
              <EditableInfoRow 
                label="Category" 
                value={product.category} 
                onChange={(value) => handleInputChange('category', value)} 
              />
              <EditableInfoRow 
                label="Vendor" 
                value={product.vendor} 
                onChange={(value) => handleInputChange('vendor', value)} 
              />
              <EditableInfoRow 
                label="Type" 
                value={product.type} 
                onChange={(value) => handleInputChange('type', value)} 
              />
              <EditableInfoRow 
                label="Unit" 
                value={product.unit} 
                onChange={(value) => handleInputChange('unit', value)} 
              />
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
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
});

export default ProductCard;
