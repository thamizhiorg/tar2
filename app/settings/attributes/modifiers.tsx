import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import attributeStyles from '../../styles/attributeStyles';

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
        style={attributeStyles.modifierItem}
        onPress={() => handleEditModifier(item)}
      >
        <View style={attributeStyles.itemHeader}>
          <Text style={attributeStyles.itemName}>{item.name}</Text>
          <View style={attributeStyles.actionButtons}>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleEditModifier(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleDeleteModifier(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4949" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={attributeStyles.modifierItems}>
          {item.items.slice(0, 3).map((modItem, index) => (
            <View key={index} style={attributeStyles.modifierItemRow}>
              <Text style={attributeStyles.itemName}>{modItem.name}</Text>
              <Text style={attributeStyles.itemDescription}>${modItem.price.toFixed(2)}</Text>
            </View>
          ))}
          {item.items.length > 3 && (
            <Text style={attributeStyles.moreItems}>+{item.items.length - 3} more</Text>
          )}
        </View>
        
        <View style={attributeStyles.itemFooter}>
          <View style={attributeStyles.selectionRule}>
            <Text style={attributeStyles.selectionRuleText}>
              Select {item.minSelections === 0 ? 'up to' : 'from'} {item.minSelections === 0 ? '' : item.minSelections + '-'}{item.maxSelections}
            </Text>
          </View>
          <Text style={attributeStyles.itemCount}>{item.items.length} items</Text>
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
        <Text style={attributeStyles.headerTitle}>Modifiers</Text>
        <TouchableOpacity 
          style={attributeStyles.addButton}
          onPress={handleAddModifier}
        >
          <Ionicons name="add" size={24} color="#EA4335" />
        </TouchableOpacity>
      </View>

      <View style={attributeStyles.searchContainer}>
        <View style={attributeStyles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={attributeStyles.searchIcon} />
          <TextInput
            style={attributeStyles.searchInput}
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
        style={attributeStyles.listContainer}
        contentContainerStyle={attributeStyles.listContent}
      />

      {/* Edit Modifier Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={attributeStyles.modalOverlay}>
          <View style={attributeStyles.modalContent}>
            <View style={attributeStyles.modalHeader}>
              <Text style={attributeStyles.modalTitle}>Edit {selectedModifier?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={attributeStyles.modalDescription}>
              This is where you would edit the modifier group details and its items.
            </Text>
            <TouchableOpacity 
              style={[attributeStyles.modalButton, attributeStyles.themeColorModifier]}
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

export default ModifiersScreen;