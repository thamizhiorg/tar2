import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList,
  TextInput,
  Alert,
  Modal,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import attributeStyles from '../../styles/attributeStyles';

const TaxesScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);

  // Sample taxes data
  const [taxes, setTaxes] = useState([
    { 
      id: '1', 
      name: 'Standard Sales Tax', 
      rate: 8.5,
      region: 'National',
      active: true,
      isDefault: true,
      applicableProducts: 'all'
    },
    { 
      id: '2', 
      name: 'Food Sales Tax', 
      rate: 5.0,
      region: 'National',
      active: true,
      isDefault: false,
      applicableProducts: 'categories'
    },
    { 
      id: '3', 
      name: 'California Sales Tax', 
      rate: 7.25,
      region: 'California',
      active: true,
      isDefault: false,
      applicableProducts: 'all'
    },
    { 
      id: '4', 
      name: 'Texas Sales Tax', 
      rate: 6.25,
      region: 'Texas',
      active: true,
      isDefault: false,
      applicableProducts: 'all'
    },
    { 
      id: '5', 
      name: 'NYC City Tax', 
      rate: 4.5,
      region: 'New York City',
      active: true,
      isDefault: false,
      applicableProducts: 'all'
    },
    { 
      id: '6', 
      name: 'Restaurant Service Tax', 
      rate: 3.0,
      region: 'National',
      active: false,
      isDefault: false,
      applicableProducts: 'specific'
    }
  ]);

  const filteredTaxes = taxes.filter(tax => 
    tax.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tax.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTax = () => {
    Alert.alert("Add Tax", "This would open a form to create a new tax rate");
  };

  const handleEditTax = (tax) => {
    setSelectedTax(tax);
    setModalVisible(true);
  };

  const handleDeleteTax = (taxId) => {
    // Check if it's the default tax
    const taxToDelete = taxes.find(tax => tax.id === taxId);
    if (taxToDelete && taxToDelete.isDefault) {
      Alert.alert(
        "Cannot Delete Default Tax",
        "You cannot delete the default tax rate. Please set another tax as default first."
      );
      return;
    }

    Alert.alert(
      "Delete Tax",
      "Are you sure you want to delete this tax rate?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => setTaxes(taxes.filter(tax => tax.id !== taxId)),
          style: "destructive"
        }
      ]
    );
  };

  const toggleTaxActive = (taxId) => {
    setTaxes(
      taxes.map(tax => 
        tax.id === taxId 
          ? {...tax, active: !tax.active} 
          : tax
      )
    );
  };

  const setAsDefault = (taxId) => {
    if (taxes.find(tax => tax.id === taxId)?.active === false) {
      Alert.alert(
        "Cannot Set as Default",
        "You cannot set an inactive tax as default. Please activate it first."
      );
      return;
    }

    setTaxes(
      taxes.map(tax => ({
        ...tax,
        isDefault: tax.id === taxId
      }))
    );
  };

  const renderTaxItem = ({ item }) => {
    return (
      <View style={attributeStyles.taxItem}>
        <View style={attributeStyles.taxHeader}>
          <View>
            <Text style={attributeStyles.itemName}>{item.name}</Text>
            <Text style={attributeStyles.taxRegion}>{item.region}</Text>
          </View>
          <Switch
            trackColor={{ false: '#E0E0E0', true: '#C5E1FA' }}
            thumbColor={item.active ? '#46BDC6' : '#BBBBBB'}
            ios_backgroundColor="#E0E0E0"
            onValueChange={() => toggleTaxActive(item.id)}
            value={item.active}
          />
        </View>
        
        <View style={attributeStyles.taxInfo}>
          <View style={attributeStyles.taxRate}>
            <Text style={attributeStyles.rateValue}>{item.rate}%</Text>
          </View>
          
          {item.isDefault && (
            <View style={attributeStyles.defaultTag}>
              <Text style={attributeStyles.defaultTagText}>Default</Text>
            </View>
          )}
          
          <Text style={attributeStyles.taxApplicable}>
            Applied to: {item.applicableProducts === 'all' ? 'All Products' : 
                        item.applicableProducts === 'categories' ? 'Selected Categories' : 
                        'Selected Products'}
          </Text>
        </View>
        
        <View style={attributeStyles.taxFooter}>
          {!item.isDefault && (
            <TouchableOpacity 
              style={[attributeStyles.defaultButton, !item.active && attributeStyles.disabledButton]}
              onPress={() => setAsDefault(item.id)}
              disabled={!item.active}
            >
              <Text style={attributeStyles.defaultButtonText}>Set as Default</Text>
            </TouchableOpacity>
          )}
          <View style={attributeStyles.actionButtons}>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleEditTax(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[attributeStyles.actionButton, item.isDefault && attributeStyles.disabledAction]}
              onPress={() => handleDeleteTax(item.id)}
              disabled={item.isDefault}
            >
              <Ionicons name="trash-outline" size={20} color={item.isDefault ? "#CCCCCC" : "#FF4949"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={attributeStyles.container}>
      <View style={attributeStyles.header}>
        <TouchableOpacity 
          style={attributeStyles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={attributeStyles.headerTitle}>Taxes</Text>
        <TouchableOpacity 
          style={attributeStyles.addButton}
          onPress={handleAddTax}
        >
          <Ionicons name="add" size={24} color="#46BDC6" />
        </TouchableOpacity>
      </View>

      <View style={attributeStyles.searchContainer}>
        <View style={attributeStyles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={attributeStyles.searchIcon} />
          <TextInput
            style={attributeStyles.searchInput}
            placeholder="Search taxes"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredTaxes}
        renderItem={renderTaxItem}
        keyExtractor={item => item.id}
        style={attributeStyles.listContainer}
        contentContainerStyle={attributeStyles.listContent}
      />

      {/* Edit Tax Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={attributeStyles.modalOverlay}>
          <View style={attributeStyles.modalContent}>
            <View style={attributeStyles.modalHeader}>
              <Text style={attributeStyles.modalTitle}>Edit {selectedTax?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={attributeStyles.modalDescription}>
              This is where you would edit the tax rate details.
            </Text>
            <TouchableOpacity 
              style={[attributeStyles.modalButton, attributeStyles.themeColorTax]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={attributeStyles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TaxesScreen;