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

const CustomScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustom, setSelectedCustom] = useState(null);

  const [customs, setCustoms] = useState([
    { 
      id: '1', 
      name: 'Warranty Period', 
      type: 'text',
      required: true
    },
    { 
      id: '2', 
      name: 'Manufacturing Date', 
      type: 'date',
      required: false
    },
    { 
      id: '3', 
      name: 'Product Rating', 
      type: 'number',
      required: false
    }
  ]);

  const filteredCustoms = customs.filter(custom => 
    custom.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustom = () => {
    Alert.alert("Add Custom Attribute", "This would open a form to create a new custom attribute");
  };

  const handleEditCustom = (custom) => {
    setSelectedCustom(custom);
    setModalVisible(true);
  };

  const handleDeleteCustom = (customId) => {
    Alert.alert(
      "Delete Custom Attribute",
      "Are you sure you want to delete this custom attribute?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => setCustoms(customs.filter(custom => custom.id !== customId)),
          style: "destructive"
        }
      ]
    );
  };

  const renderCustomItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={attributeStyles.optionItem}
        onPress={() => handleEditCustom(item)}
      >
        <View style={attributeStyles.itemHeader}>
          <Text style={attributeStyles.itemName}>{item.name}</Text>
          <View style={attributeStyles.actionButtons}>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleEditCustom(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleDeleteCustom(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4949" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={attributeStyles.itemFooter}>
          <Text style={attributeStyles.optionType}>Type: {item.type}</Text>
          <Text style={attributeStyles.optionRequired}>
            {item.required ? 'Required' : 'Optional'}
          </Text>
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
        <Text style={attributeStyles.headerTitle}>Custom Attributes</Text>
        <TouchableOpacity 
          style={attributeStyles.addButton}
          onPress={handleAddCustom}
        >
          <Ionicons name="add" size={24} color="#4285F4" />
        </TouchableOpacity>
      </View>

      <View style={attributeStyles.searchContainer}>
        <View style={attributeStyles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={attributeStyles.searchIcon} />
          <TextInput
            style={attributeStyles.searchInput}
            placeholder="Search custom attributes"
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
        data={filteredCustoms}
        renderItem={renderCustomItem}
        keyExtractor={item => item.id}
        style={attributeStyles.listContainer}
        contentContainerStyle={attributeStyles.listContent}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={attributeStyles.modalOverlay}>
          <View style={attributeStyles.modalContent}>
            <View style={attributeStyles.modalHeader}>
              <Text style={attributeStyles.modalTitle}>Edit {selectedCustom?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={attributeStyles.modalDescription}>
              This is where you would edit the custom attribute details.
            </Text>
            <TouchableOpacity 
              style={[attributeStyles.modalButton, attributeStyles.themeColorOption]}
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

export default CustomScreen;
