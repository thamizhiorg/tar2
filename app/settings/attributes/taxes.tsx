import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
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
      <View style={styles.taxCard}>
        <View style={styles.taxHeader}>
          <View>
            <Text style={styles.taxName}>{item.name}</Text>
            <Text style={styles.taxRegion}>{item.region}</Text>
          </View>
          <Switch
            trackColor={{ false: '#E0E0E0', true: '#C5E1FA' }}
            thumbColor={item.active ? '#46BDC6' : '#BBBBBB'}
            ios_backgroundColor="#E0E0E0"
            onValueChange={() => toggleTaxActive(item.id)}
            value={item.active}
          />
        </View>
        
        <View style={styles.taxInfo}>
          <View style={styles.taxRate}>
            <Text style={styles.rateValue}>{item.rate}%</Text>
          </View>
          
          {item.isDefault && (
            <View style={styles.defaultTag}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
          
          <Text style={styles.applicableProducts}>
            Applied to: {item.applicableProducts === 'all' ? 'All Products' : 
                        item.applicableProducts === 'categories' ? 'Selected Categories' : 
                        'Selected Products'}
          </Text>
        </View>
        
        <View style={styles.taxFooter}>
          {!item.isDefault && (
            <TouchableOpacity 
              style={[styles.defaultButton, !item.active && styles.disabledButton]}
              onPress={() => setAsDefault(item.id)}
              disabled={!item.active}
            >
              <Text style={[styles.defaultButtonText, !item.active && styles.disabledButtonText]}>
                Set as Default
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditTax(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, item.isDefault && styles.disabledAction]}
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Taxes</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTax}
        >
          <Ionicons name="add" size={24} color="#46BDC6" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
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
        style={styles.taxesList}
        contentContainerStyle={styles.taxesListContent}
      />

      {/* Edit Tax Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {selectedTax?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>
              This is where you would edit the tax rate details.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
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
    color: '#333',
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
    color: '#333',
  },
  taxesList: {
    flex: 1,
  },
  taxesListContent: {
    padding: 16,
  },
  taxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taxName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  taxRegion: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  taxInfo: {
    marginBottom: 12,
  },
  taxRate: {
    marginBottom: 8,
  },
  rateValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#46BDC6',
  },
  defaultTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F7F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#46BDC6',
  },
  applicableProducts: {
    fontSize: 13,
    color: '#666',
  },
  taxFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  defaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E0F7F9',
    borderRadius: 4,
  },
  defaultButtonText: {
    fontSize: 13,
    color: '#46BDC6',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
  },
  disabledButtonText: {
    color: '#AAAAAA',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  disabledAction: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    color: '#333',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#46BDC6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TaxesScreen;