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

const UnitsScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Sample units data
  const [units, setUnits] = useState([
    { 
      id: '1', 
      name: 'Kilogram', 
      abbreviation: 'kg',
      isBase: true,
      active: true
    },
    { 
      id: '2', 
      name: 'Gram', 
      abbreviation: 'g',
      isBase: false,
      conversionFactor: 0.001,
      baseUnit: 'Kilogram',
      active: true
    },
    { 
      id: '3', 
      name: 'Liter', 
      abbreviation: 'L',
      isBase: true,
      active: true
    },
    { 
      id: '4', 
      name: 'Milliliter', 
      abbreviation: 'mL',
      isBase: false,
      conversionFactor: 0.001,
      baseUnit: 'Liter',
      active: true
    },
    { 
      id: '5', 
      name: 'Piece', 
      abbreviation: 'pc',
      isBase: true,
      active: true
    },
    { 
      id: '6', 
      name: 'Dozen', 
      abbreviation: 'dz',
      isBase: false,
      conversionFactor: 12,
      baseUnit: 'Piece',
      active: true
    },
    { 
      id: '7', 
      name: 'Pound', 
      abbreviation: 'lb',
      isBase: false,
      conversionFactor: 0.453592,
      baseUnit: 'Kilogram',
      active: false
    }
  ]);

  const filteredUnits = units.filter(unit => 
    unit.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    unit.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUnit = () => {
    Alert.alert("Add Unit", "This would open a form to create a new measurement unit");
  };

  const handleEditUnit = (unit) => {
    setSelectedUnit(unit);
    setModalVisible(true);
  };

  const handleDeleteUnit = (unitId) => {
    Alert.alert(
      "Delete Unit",
      "Are you sure you want to delete this unit?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => setUnits(units.filter(unit => unit.id !== unitId)),
          style: "destructive"
        }
      ]
    );
  };

  const toggleUnitActive = (unitId) => {
    setUnits(
      units.map(unit => 
        unit.id === unitId 
          ? {...unit, active: !unit.active} 
          : unit
      )
    );
  };

  const renderUnitItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.unitCard}
        onPress={() => handleEditUnit(item)}
      >
        <View style={styles.unitHeader}>
          <View style={styles.unitNameContainer}>
            <Text style={styles.unitName}>{item.name}</Text>
            <Text style={styles.unitAbbreviation}>({item.abbreviation})</Text>
          </View>
          <Switch
            trackColor={{ false: '#E0E0E0', true: '#C2E7FF' }}
            thumbColor={item.active ? '#34A853' : '#BBBBBB'}
            ios_backgroundColor="#E0E0E0"
            onValueChange={() => toggleUnitActive(item.id)}
            value={item.active}
          />
        </View>
        
        <View style={styles.unitInfo}>
          {item.isBase ? (
            <View style={styles.baseUnitTag}>
              <Text style={styles.baseUnitText}>Base Unit</Text>
            </View>
          ) : (
            <Text style={styles.conversionText}>
              1 {item.abbreviation} = {item.conversionFactor} {units.find(u => u.name === item.baseUnit)?.abbreviation || ''}
            </Text>
          )}
        </View>
        
        <View style={styles.unitFooter}>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditUnit(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteUnit(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4949" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Units</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddUnit}
        >
          <Ionicons name="add" size={24} color="#34A853" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search units"
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
        data={filteredUnits}
        renderItem={renderUnitItem}
        keyExtractor={item => item.id}
        style={styles.unitsList}
        contentContainerStyle={styles.unitsListContent}
      />

      {/* Edit Unit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {selectedUnit?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>
              This is where you would edit the unit details.
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
  unitsList: {
    flex: 1,
  },
  unitsListContent: {
    padding: 16,
  },
  unitCard: {
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
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  unitAbbreviation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  unitInfo: {
    marginBottom: 12,
  },
  baseUnitTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4EA',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  baseUnitText: {
    fontSize: 12,
    color: '#34A853',
    fontWeight: '500',
  },
  conversionText: {
    fontSize: 14,
    color: '#666',
  },
  unitFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
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
    backgroundColor: '#34A853',
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

export default UnitsScreen;