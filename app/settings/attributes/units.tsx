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
        style={attributeStyles.unitItem}
        onPress={() => handleEditUnit(item)}
      >
        <View style={attributeStyles.unitHeader}>
          <View style={attributeStyles.unitNameContainer}>
            <Text style={attributeStyles.itemName}>{item.name}</Text>
            <Text style={attributeStyles.unitAbbreviation}>({item.abbreviation})</Text>
          </View>
          <Switch
            trackColor={{ false: '#E0E0E0', true: '#C2E7FF' }}
            thumbColor={item.active ? '#34A853' : '#BBBBBB'}
            ios_backgroundColor="#E0E0E0"
            onValueChange={() => toggleUnitActive(item.id)}
            value={item.active}
          />
        </View>
        
        <View style={attributeStyles.unitInfo}>
          {item.isBase ? (
            <View style={attributeStyles.baseUnitTag}>
              <Text style={attributeStyles.baseUnitText}>Base Unit</Text>
            </View>
          ) : (
            <Text style={attributeStyles.conversionText}>
              1 {item.abbreviation} = {item.conversionFactor} {units.find(u => u.name === item.baseUnit)?.abbreviation || ''}
            </Text>
          )}
        </View>
        
        <View style={attributeStyles.unitFooter}>
          <View style={attributeStyles.actionButtons}>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleEditUnit(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
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
    <SafeAreaView style={attributeStyles.container}>
      <View style={attributeStyles.header}>
        <TouchableOpacity 
          style={attributeStyles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={attributeStyles.headerTitle}>Units</Text>
        <TouchableOpacity 
          style={attributeStyles.addButton}
          onPress={handleAddUnit}
        >
          <Ionicons name="add" size={24} color="#34A853" />
        </TouchableOpacity>
      </View>

      <View style={attributeStyles.searchContainer}>
        <View style={attributeStyles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={attributeStyles.searchIcon} />
          <TextInput
            style={attributeStyles.searchInput}
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
        style={attributeStyles.listContainer}
        contentContainerStyle={attributeStyles.listContent}
      />

      {/* Edit Unit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={attributeStyles.modalOverlay}>
          <View style={attributeStyles.modalContent}>
            <View style={attributeStyles.modalHeader}>
              <Text style={attributeStyles.modalTitle}>Edit {selectedUnit?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={attributeStyles.modalDescription}>
              This is where you would edit the unit details.
            </Text>
            <TouchableOpacity 
              style={[attributeStyles.modalButton, attributeStyles.themeColorUnit]}
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

export default UnitsScreen;