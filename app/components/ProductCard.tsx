import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { InstaQLEntity } from "@instantdb/react-native";
import { AppSchema } from "../../instant.schema";

type Product = InstaQLEntity<AppSchema, "products">;

interface ProductCardProps {
  product: {
    id: string;
    title?: string;
    category?: string;
    // ... other product properties
  };
  onClose: () => void;
}

const ProductCard = ({ product, onClose }: ProductCardProps) => {
  const [activeTab, setActiveTab] = useState('basic');

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
            <InfoRow label="Title" value={product.title} />
            <InfoRow label="Category" value={product.category} />
            <InfoRow label="Vendor" value={product.vendor} />
            <InfoRow label="Type" value={product.type} />
            <InfoRow label="Unit" value={product.unit} />
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{product.title}</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>×</Text>
        </TouchableOpacity>
      </View>

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
  );
};

const InfoRow = ({ label, value }: { label: string, value?: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    padding: 8,
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
});

export default ProductCard;
