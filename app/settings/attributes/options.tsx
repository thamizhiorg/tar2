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
        style={styles.optionCard}
        onPress={() => handleEditOption(item)}
      >
        <View style={styles.optionHeader}>
          <Text style={styles.optionName}>{item.name}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditOption(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteOption(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4949" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.optionValues}>
          {item.values.map((value, index) => (
            <View key={index} style={styles.valueChip}>
              <Text style={styles.valueText}>{value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.optionFooter}>
          <Text style={styles.optionType}>Type: {item.type.replace('_', ' ')}</Text>
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
        <Text style={styles.headerTitle}>Options</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddOption}
        >
          <Ionicons name="add" size={24} color="#4285F4" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
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
        style={styles.optionsList}
        contentContainerStyle={styles.optionsListContent}
      />

      {/* Edit Option Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {selectedOption?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>
              This is where you would edit the option details.
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
  optionsList: {
    flex: 1,
  },
  optionsListContent: {
    padding: 16,
  },
  optionCard: {
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
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionName: {
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
  optionValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  valueChip: {
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  valueText: {
    fontSize: 14,
    color: '#4285F4',
  },
  optionFooter: {
    marginTop: 4,
  },
  optionType: {
    fontSize: 13,
    color: '#777',
    textTransform: 'capitalize',
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
    backgroundColor: '#4285F4',
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

export default OptionsScreen;