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

const OptionsScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Sample options data
  const [options, setOptions] = useState([
    { 
      id: '1', 
      name: 'Size', 
      values: ['Small', 'Medium', 'Large', 'X-Large'],
      type: 'multiple_choice'
    },
    { 
      id: '2', 
      name: 'Color', 
      values: ['Red', 'Blue', 'Green', 'Black', 'White'],
      type: 'multiple_choice'
    },
    { 
      id: '3', 
      name: 'Material', 
      values: ['Cotton', 'Polyester', 'Wool', 'Silk'],
      type: 'multiple_choice'
    },
    { 
      id: '4', 
      name: 'Style', 
      values: ['Casual', 'Formal', 'Sport', 'Vintage'],
      type: 'multiple_choice'
    }
  ]);

  const filteredOptions = options.filter(option => 
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddOption = () => {
    // Logic to add a new option would go here
    Alert.alert("Add Option", "This would open a form to create a new option");
  };

  const handleEditOption = (option) => {
    setSelectedOption(option);
    setModalVisible(true);
  };

  const handleDeleteOption = (optionId) => {
    Alert.alert(
      "Delete Option",
      "Are you sure you want to delete this option?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => setOptions(options.filter(option => option.id !== optionId)),
          style: "destructive"
        }
      ]
    );
  };

  const renderOptionItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={attributeStyles.optionItem}
        onPress={() => handleEditOption(item)}
      >
        <View style={attributeStyles.itemHeader}>
          <Text style={attributeStyles.itemName}>{item.name}</Text>
          <View style={attributeStyles.actionButtons}>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleEditOption(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleDeleteOption(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4949" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={attributeStyles.optionValues}>
          {item.values.map((value, index) => (
            <View key={index} style={attributeStyles.valueChip}>
              <Text style={attributeStyles.valueText}>{value}</Text>
            </View>
          ))}
        </View>
        <View style={attributeStyles.itemFooter}>
          <Text style={attributeStyles.optionType}>Type: {item.type.replace('_', ' ')}</Text>
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
        <Text style={attributeStyles.headerTitle}>Options</Text>
        <TouchableOpacity 
          style={attributeStyles.addButton}
          onPress={handleAddOption}
        >
          <Ionicons name="add" size={24} color="#4285F4" />
        </TouchableOpacity>
      </View>

      <View style={attributeStyles.searchContainer}>
        <View style={attributeStyles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={attributeStyles.searchIcon} />
          <TextInput
            style={attributeStyles.searchInput}
            placeholder="Search options"
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
        data={filteredOptions}
        renderItem={renderOptionItem}
        keyExtractor={item => item.id}
        style={attributeStyles.listContainer}
        contentContainerStyle={attributeStyles.listContent}
      />

      {/* Edit Option Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={attributeStyles.modalOverlay}>
          <View style={attributeStyles.modalContent}>
            <View style={attributeStyles.modalHeader}>
              <Text style={attributeStyles.modalTitle}>Edit {selectedOption?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={attributeStyles.modalDescription}>
              This is where you would edit the option details.
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

export default OptionsScreen;