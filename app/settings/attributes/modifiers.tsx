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
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ModifiersScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedModifier, setSelectedModifier] = useState(null);

  // Sample modifiers data
  const [modifiers, setModifiers] = useState([
    { 
      id: '1', 
      name: 'Toppings', 
      items: [
        { name: 'Cheese', price: 1.5 },
        { name: 'Bacon', price: 2.0 },
        { name: 'Mushrooms', price: 1.0 },
        { name: 'Onions', price: 0.5 }
      ],
      maxSelections: 4,
      minSelections: 0
    },
    { 
      id: '2', 
      name: 'Sauces', 
      items: [
        { name: 'Ketchup', price: 0 },
        { name: 'Mustard', price: 0 },
        { name: 'Mayo', price: 0 },
        { name: 'BBQ', price: 0.5 }
      ],
      maxSelections: 2,
      minSelections: 1
    },
    { 
      id: '3', 
      name: 'Sides', 
      items: [
        { name: 'Fries', price: 3.0 },
        { name: 'Onion Rings', price: 3.5 },
        { name: 'Salad', price: 4.0 },
        { name: 'Coleslaw', price: 2.5 }
      ],
      maxSelections: 1,
      minSelections: 0
    },
    { 
      id: '4', 
      name: 'Add-ons', 
      items: [
        { name: 'Extra patty', price: 3.0 },
        { name: 'Avocado', price: 2.0 },
        { name: 'Egg', price: 1.5 }
      ],
      maxSelections: 3,
      minSelections: 0
    }
  ]);

  const filteredModifiers = modifiers.filter(modifier => 
    modifier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddModifier = () => {
    Alert.alert("Add Modifier", "This would open a form to create a new modifier");
  };

  const handleEditModifier = (modifier) => {
    setSelectedModifier(modifier);
    setModalVisible(true);
  };

  const handleDeleteModifier = (modifierId) => {
    Alert.alert(
      "Delete Modifier",
      "Are you sure you want to delete this modifier?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => setModifiers(modifiers.filter(modifier => modifier.id !== modifierId)),
          style: "destructive"
        }
      ]
    );
  };

  const renderModifierItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.modifierCard}
        onPress={() => handleEditModifier(item)}
      >
        <View style={styles.modifierHeader}>
          <Text style={styles.modifierName}>{item.name}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditModifier(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteModifier(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4949" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.modifierItems}>
          {item.items.slice(0, 3).map((modItem, index) => (
            <View key={index} style={styles.modifierItem}>
              <Text style={styles.modifierItemName}>{modItem.name}</Text>
              <Text style={styles.modifierItemPrice}>${modItem.price.toFixed(2)}</Text>
            </View>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItems}>+{item.items.length - 3} more</Text>
          )}
        </View>
        
        <View style={styles.modifierFooter}>
          <View style={styles.selectionRule}>
            <Text style={styles.selectionRuleText}>
              Select {item.minSelections === 0 ? 'up to' : 'from'} {item.minSelections === 0 ? '' : item.minSelections + '-'}{item.maxSelections}
            </Text>
          </View>
          <Text style={styles.itemCount}>{item.items.length} items</Text>
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
        <Text style={styles.headerTitle}>Modifiers</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddModifier}
        >
          <Ionicons name="add" size={24} color="#EA4335" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search modifiers"
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
        data={filteredModifiers}
        renderItem={renderModifierItem}
        keyExtractor={item => item.id}
        style={styles.modifiersList}
        contentContainerStyle={styles.modifiersListContent}
      />

      {/* Edit Modifier Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {selectedModifier?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>
              This is where you would edit the modifier group details and its items.
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
  modifiersList: {
    flex: 1,
  },
  modifiersListContent: {
    padding: 16,
  },
  modifierCard: {
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
  modifierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modifierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  modifierItems: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modifierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modifierItemName: {
    fontSize: 14,
    color: '#333',
  },
  modifierItemPrice: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  moreItems: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modifierFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionRule: {
    backgroundColor: '#FFF4F4',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectionRuleText: {
    fontSize: 12,
    color: '#EA4335',
  },
  itemCount: {
    fontSize: 13,
    color: '#777',
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
    backgroundColor: '#EA4335',
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

export default ModifiersScreen;