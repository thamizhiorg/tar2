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
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const AttributesScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [activeAttributeType, setActiveAttributeType] = useState(null);
  const [attributeDetailsModal, setAttributeDetailsModal] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [newOptionValue, setNewOptionValue] = useState('');
  const [addAttributeModal, setAddAttributeModal] = useState(false);
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    type: 'options',
    values: [],
    price: 0,
    rate: '',
    value: ''
  });
  const [tempOptionValue, setTempOptionValue] = useState('');

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

  // Check if attribute type has detailed values
  const hasDetailedValues = (type) => {
    return ['options', 'modifiers', 'discounts', 'taxes'].includes(type);
  };

  const openAttributeDetails = (attribute) => {
    // Only open the drawer for attribute types with detailed values
    if (hasDetailedValues(attribute.type)) {
      setSelectedAttribute(attribute);
      setAttributeDetailsModal(true);
    }
  };

  const openAddAttributeModal = () => {
    setNewAttribute({
      name: '',
      type: 'options',
      values: [],
      price: 0,
      rate: '',
      value: ''
    });
    setAddAttributeModal(true);
  };

  const handleAddAttribute = () => {
    if (newAttribute.name.trim() === '') return;
    
    const newId = (attributes.length + 1).toString();
    const attributeToAdd = {
      id: newId,
      name: newAttribute.name,
      type: newAttribute.type,
      values: newAttribute.type === 'options' ? [...newAttribute.values] : [],
      price: newAttribute.type === 'modifiers' ? parseFloat(newAttribute.price) : undefined,
      rate: newAttribute.type === 'taxes' ? newAttribute.rate : undefined,
      value: newAttribute.type === 'discounts' ? newAttribute.value : undefined
    };
    
    attributes.push(attributeToAdd);
    setAddAttributeModal(false);
  };

  const handleAddTempOption = () => {
    if (tempOptionValue.trim() === '') return;
    
    setNewAttribute({
      ...newAttribute,
      values: [...newAttribute.values, tempOptionValue.trim()]
    });
    setTempOptionValue('');
  };

  const handleRemoveOption = (index) => {
    const updatedValues = [...newAttribute.values];
    updatedValues.splice(index, 1);
    setNewAttribute({
      ...newAttribute,
      values: updatedValues
    });
  };

  const renderAttributeItem = ({ item }) => {
    let details = '';

    switch(item.type) {
      case 'options':
        details = `${item.values.length} values`;
        break;
      case 'modifiers':
        details = item.price ? `$${item.price.toFixed(2)}` : '';
        break;
      case 'discounts':
        details = item.value || '';
        break;
      case 'taxes':
        details = item.rate || '';
        break;
    }

    return (
      <TouchableOpacity 
        style={styles.attributeItem}
        onPress={() => openAttributeDetails(item)}
      >
        <View style={styles.attributeContent}>
          <Text style={styles.attributeName}>{item.name}</Text>
          <Text style={styles.attributeType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
        </View>
        {details ? <Text style={styles.attributeDetails}>{details}</Text> : null}
        {hasDetailedValues(item.type) && (
          <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
        )}
      </TouchableOpacity>
    );
  };

  const renderAttributeValues = () => {
    if (!selectedAttribute) return null;

    switch(selectedAttribute.type) {
      case 'options':
        return (
          <View style={styles.valuesList}>
            <Text style={styles.valuesHeader}>Available Options</Text>
            {selectedAttribute.values.map((value, index) => (
              <View key={index} style={styles.valueItem}>
                <Text style={styles.valueText}>{value}</Text>
                <TouchableOpacity>
                  <Ionicons name="close-outline" size={22} color="#999999" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addOptionContainer}>
              <TextInput
                style={styles.addOptionInput}
                placeholder="Add new option"
                value={newOptionValue}
                onChangeText={setNewOptionValue}
              />
              <TouchableOpacity 
                style={styles.addOptionButton}
                onPress={() => {
                  if (newOptionValue.trim()) {
                    selectedAttribute.values.push(newOptionValue.trim());
                    setNewOptionValue('');
                    // Force a re-render by creating a new reference
                    setSelectedAttribute({...selectedAttribute});
                  }
                }}
              >
                <Ionicons name="add-outline" size={22} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'modifiers':
        return (
          <View style={styles.valuesList}>
            <View style={styles.modifierDetail}>
              <Text style={styles.modifierLabel}>Price:</Text>
              <Text style={styles.modifierValue}>${selectedAttribute.price?.toFixed(2) || '0.00'}</Text>
            </View>
            <TouchableOpacity style={styles.editDetailButton}>
              <Text style={styles.editDetailText}>Edit Modifier</Text>
            </TouchableOpacity>
          </View>
        );
      case 'discounts':
        return (
          <View style={styles.valuesList}>
            <View style={styles.modifierDetail}>
              <Text style={styles.modifierLabel}>Discount Rate:</Text>
              <Text style={styles.modifierValue}>{selectedAttribute.value}</Text>
            </View>
            <TouchableOpacity style={styles.editDetailButton}>
              <Text style={styles.editDetailText}>Edit Discount</Text>
            </TouchableOpacity>
          </View>
        );
      case 'taxes':
        return (
          <View style={styles.valuesList}>
            <View style={styles.modifierDetail}>
              <Text style={styles.modifierLabel}>Tax Rate:</Text>
              <Text style={styles.modifierValue}>{selectedAttribute.rate}</Text>
            </View>
            <TouchableOpacity style={styles.editDetailButton}>
              <Text style={styles.editDetailText}>Edit Tax Rate</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View style={styles.valuesList}>
            <Text style={styles.noValuesText}>No detailed values available for this attribute type.</Text>
          </View>
        );
    }
  };

  const renderNewAttributeForm = () => {
    return (
      <View style={styles.formContainer}>
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Attribute Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter attribute name"
            value={newAttribute.name}
            onChangeText={(text) => setNewAttribute({...newAttribute, name: text})}
          />
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Attribute Type</Text>
          <View style={styles.typeGrid}>
            {attributeCategories.filter(cat => cat.id !== 'all').map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.simpleTypeCard,
                  newAttribute.type === type.id && styles.selectedSimpleTypeCard
                ]}
                onPress={() => setNewAttribute({...newAttribute, type: type.id})}
              >
                <Text style={[
                  styles.simpleTypeLabel,
                  newAttribute.type === type.id && styles.selectedSimpleTypeLabel
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {newAttribute.type === 'options' && (
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Options</Text>
            {newAttribute.values.map((value, index) => (
              <View key={index} style={styles.valueItem}>
                <Text style={styles.valueText}>{value}</Text>
                <TouchableOpacity onPress={() => handleRemoveOption(index)}>
                  <Ionicons name="close-outline" size={22} color="#999999" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addOptionContainer}>
              <TextInput
                style={styles.addOptionInput}
                placeholder="Add option"
                value={tempOptionValue}
                onChangeText={setTempOptionValue}
                onSubmitEditing={handleAddTempOption}
              />
              <TouchableOpacity 
                style={styles.addOptionButton}
                onPress={handleAddTempOption}
              >
                <Ionicons name="add-outline" size={22} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {newAttribute.type === 'modifiers' && (
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Price</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0.00"
              keyboardType="numeric"
              value={newAttribute.price.toString()}
              onChangeText={(text) => setNewAttribute({...newAttribute, price: text})}
            />
          </View>
        )}
        
        {newAttribute.type === 'taxes' && (
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Tax Rate</Text>
            <TextInput
              style={styles.textInput}
              placeholder="8.25%"
              value={newAttribute.rate}
              onChangeText={(text) => setNewAttribute({...newAttribute, rate: text})}
            />
          </View>
        )}
        
        {newAttribute.type === 'discounts' && (
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Discount Value</Text>
            <TextInput
              style={styles.textInput}
              placeholder="15%"
              value={newAttribute.value}
              onChangeText={(text) => setNewAttribute({...newAttribute, value: text})}
            />
          </View>
        )}
      </View>
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
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAddAttributeModal}
        >
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

      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {attributeCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tabButton,
                selectedCategory === category.id && styles.selectedTabButton
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.tabButtonText,
                selectedCategory === category.id && styles.selectedTabButtonText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredAttributes}
        renderItem={renderAttributeItem}
        keyExtractor={item => item.id}
        style={styles.attributesList}
        contentContainerStyle={styles.attributesListContent}
      />

      {/* Attribute Details Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={attributeDetailsModal}
        onRequestClose={() => setAttributeDetailsModal(false)}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.modernModalContent}>
            <View style={styles.modernModalHeader}>
              <Text style={styles.modernModalTitle}>
                {selectedAttribute ? selectedAttribute.name : 'Attribute Details'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setAttributeDetailsModal(false)}
              >
                <Ionicons name="close-outline" size={28} color="#333333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modernModalBody}>
              {selectedAttribute && (
                <View style={styles.attributeDetailsContainer}>
                  {renderAttributeValues()}
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.modernModalButton}
              onPress={() => setAttributeDetailsModal(false)}
            >
              <Text style={styles.modernModalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Original modal for attribute types */}
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

      {/* Add Attribute Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={addAttributeModal}
        onRequestClose={() => setAddAttributeModal(false)}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.modernModalContent}>
            <View style={styles.modernModalHeader}>
              <Text style={styles.modernModalTitle}>New Attribute</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setAddAttributeModal(false)}
              >
                <Ionicons name="close-outline" size={28} color="#333333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modernModalBody}>
              {renderNewAttributeForm()}
            </ScrollView>
            
            <View style={styles.modalActionButtons}>
              <TouchableOpacity 
                style={[styles.modernModalButton, styles.cancelButton]}
                onPress={() => setAddAttributeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modernModalButton, styles.saveButton, !newAttribute.name.trim() && styles.disabledButton]}
                onPress={handleAddAttribute}
                disabled={!newAttribute.name.trim()}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
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
  tabsContainer: {
    maxHeight: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedTabButton: {
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedTabButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  tabIndicator: {
    height: 2,
    backgroundColor: '#007AFF',
    marginTop: 4,
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  attributeDetailsContainer: {
    flex: 1,
  },
  valuesList: {
    marginTop: 0,
  },
  valuesHeader: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 16,
    color: '#333333',
  },
  valueItem: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  valueText: {
    fontSize: 16,
    color: '#333333',
  },
  addOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  addOptionInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  addOptionButton: {
    padding: 14,
  },
  modifierDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  modifierLabel: {
    fontSize: 16,
    color: '#555555',
  },
  modifierValue: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333333',
  },
  editDetailButton: {
    backgroundColor: '#F8F8F8',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  editDetailText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  noValuesText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  modernModalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  modernModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modernModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  modernModalBody: {
    flex: 1,
    paddingVertical: 20,
  },
  modernModalButton: {
    backgroundColor: '#F8F8F8',
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modernModalButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    padding: 4,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  selectedTypeButton: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  miniTypeIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  typeButtonText: {
    fontSize: 14,
    color: '#555555',
  },
  selectedTypeButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  cancelButtonText: {
    color: '#555555',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  simpleTypeCard: {
    margin: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: '30%',
  },
  selectedSimpleTypeCard: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  simpleTypeLabel: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  selectedSimpleTypeLabel: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default AttributesScreen;
