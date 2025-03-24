import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AttributesScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [activeAttributeType, setActiveAttributeType] = useState(null);

  const attributeCategories = [
    { id: 'all', label: 'All' },
    { id: 'options', label: 'Options' },
    { id: 'modifiers', label: 'Modifiers' },
    { id: 'categories', label: 'Categories' },
    { id: 'units', label: 'Units' },
    { id: 'discounts', label: 'Discounts' },
    { id: 'taxes', label: 'Taxes' },
    { id: 'collections', label: 'Collections' }
  ];

  // Sample attribute data
  const attributes = [
    { id: '1', name: 'Size', type: 'options', values: ['Small', 'Medium', 'Large'] },
    { id: '2', name: 'Color', type: 'options', values: ['Red', 'Blue', 'Green'] },
    { id: '3', name: 'Extra Cheese', type: 'modifiers', price: 1.50 },
    { id: '4', name: 'Beverages', type: 'categories' },
    { id: '5', name: 'Kg', type: 'units' },
    { id: '6', name: 'Happy Hour', type: 'discounts', value: '15%' },
    { id: '7', name: 'Sales Tax', type: 'taxes', rate: '8.25%' },
    { id: '8', name: 'Summer Collection', type: 'collections' }
  ];

  // Filter attributes based on search and selected category
  const filteredAttributes = attributes.filter(attr => {
    const matchesSearch = attr.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || attr.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openAttributeModal = (type) => {
    setActiveAttributeType(type);
    setModalVisible(true);
  };

  const renderAttributeItem = ({ item }) => {
    let details = '';
    let iconName = 'list-outline';

    switch(item.type) {
      case 'options':
        details = `${item.values.length} values`;
        iconName = 'options-outline';
        break;
      case 'modifiers':
        details = item.price ? `$${item.price.toFixed(2)}` : '';
        iconName = 'add-circle-outline';
        break;
      case 'categories':
        iconName = 'folder-outline';
        break;
      case 'units':
        iconName = 'resize-outline';
        break;
      case 'discounts':
        details = item.value || '';
        iconName = 'pricetag-outline';
        break;
      case 'taxes':
        details = item.rate || '';
        iconName = 'cash-outline';
        break;
      case 'collections':
        iconName = 'albums-outline';
        break;
    }

    return (
      <TouchableOpacity 
        style={styles.attributeItem}
        onPress={() => {}}
      >
        <View style={styles.attributeIcon}>
          <Ionicons name={iconName} size={20} color="#007AFF" />
        </View>
        <View style={styles.attributeContent}>
          <Text style={styles.attributeName}>{item.name}</Text>
          <Text style={styles.attributeType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
        </View>
        {details ? <Text style={styles.attributeDetails}>{details}</Text> : null}
        <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attributes</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search attributes"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {attributeCategories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.selectedCategoryButtonText
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredAttributes}
        renderItem={renderAttributeItem}
        keyExtractor={item => item.id}
        style={styles.attributesList}
        contentContainerStyle={styles.attributesListContent}
      />

      <View style={styles.attributeTypesContainer}>
        <Text style={styles.attributeTypesTitle}>Attribute Types</Text>
        <View style={styles.attributeTypesGrid}>
          {attributeCategories.filter(cat => cat.id !== 'all').map(type => (
            <TouchableOpacity
              key={type.id}
              style={styles.attributeTypeCard}
              onPress={() => openAttributeModal(type.id)}
            >
              <View style={[styles.attributeTypeIcon, { backgroundColor: getColorForType(type.id) }]}>
                <Ionicons name={getIconForType(type.id)} size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.attributeTypeText}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeAttributeType && activeAttributeType.charAt(0).toUpperCase() + activeAttributeType.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Manage your {activeAttributeType} here. You can create, edit, or delete attributes.
              </Text>
              {/* Attribute management interface would go here */}
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Helper function to get color based on attribute type
const getColorForType = (type) => {
  const colors = {
    options: '#4285F4',
    modifiers: '#EA4335',
    categories: '#FBBC05',
    units: '#34A853',
    discounts: '#FF6D01',
    taxes: '#46BDC6',
    collections: '#8F57EB'
  };
  return colors[type] || '#007AFF';
};

// Helper function to get icon based on attribute type
const getIconForType = (type) => {
  const icons = {
    options: 'options-outline',
    modifiers: 'add-circle-outline',
    categories: 'folder-outline',
    units: 'resize-outline',
    discounts: 'pricetag-outline',
    taxes: 'cash-outline',
    collections: 'albums-outline'
  };
  return icons[type] || 'list-outline';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#333333',
  },
  categoriesContainer: {
    maxHeight: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  attributesList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  attributesListContent: {
    padding: 16,
  },
  attributeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  attributeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attributeContent: {
    flex: 1,
  },
  attributeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  attributeType: {
    fontSize: 13,
    color: '#999999',
    marginTop: 2,
  },
  attributeDetails: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  attributeTypesContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attributeTypesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  attributeTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  attributeTypeCard: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  attributeTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  attributeTypeText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalBody: {
    flex: 1,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AttributesScreen;
