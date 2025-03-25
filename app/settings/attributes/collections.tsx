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
  Image,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CollectionsScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Sample collections data
  const [collections, setCollections] = useState([
    { 
      id: '1', 
      name: 'Featured Products', 
      image: 'https://placehold.co/80x80/8F57EB/fff?text=F',
      productCount: 8,
      active: true,
      priority: 1,
      description: 'Highlighted products for our customers'
    },
    { 
      id: '2', 
      name: 'New Arrivals', 
      image: 'https://placehold.co/80x80/8F57EB/fff?text=N',
      productCount: 12,
      active: true,
      priority: 2,
      description: 'Latest products added to our store'
    },
    { 
      id: '3', 
      name: 'Best Sellers', 
      image: 'https://placehold.co/80x80/8F57EB/fff?text=B',
      productCount: 10,
      active: true,
      priority: 3,
      description: 'Our most popular products'
    },
    { 
      id: '4', 
      name: 'Summer Collection', 
      image: 'https://placehold.co/80x80/8F57EB/fff?text=S',
      productCount: 15,
      active: true,
      priority: 4,
      description: 'Hot items for the summer season'
    },
    { 
      id: '5', 
      name: 'Clearance', 
      image: 'https://placehold.co/80x80/8F57EB/fff?text=C',
      productCount: 7,
      active: false,
      priority: 5,
      description: 'Discounted items on clearance'
    }
  ]);

  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCollection = () => {
    Alert.alert("Add Collection", "This would open a form to create a new collection");
  };

  const handleEditCollection = (collection) => {
    setSelectedCollection(collection);
    setModalVisible(true);
  };

  const handleDeleteCollection = (collectionId) => {
    Alert.alert(
      "Delete Collection",
      "Are you sure you want to delete this collection?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => setCollections(collections.filter(collection => collection.id !== collectionId)),
          style: "destructive"
        }
      ]
    );
  };

  const toggleCollectionActive = (collectionId) => {
    setCollections(
      collections.map(collection => 
        collection.id === collectionId 
          ? {...collection, active: !collection.active} 
          : collection
      )
    );
  };

  const handleManageProducts = (collection) => {
    Alert.alert(
      "Manage Products",
      `You would be redirected to manage products in the "${collection.name}" collection.`
    );
  };

  const renderCollectionItem = ({ item }) => {
    return (
      <View style={styles.collectionCard}>
        <View style={styles.collectionHeader}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.collectionImage} 
          />
          <View style={styles.collectionInfo}>
            <Text style={styles.collectionName}>{item.name}</Text>
            <Text style={styles.collectionDescription}>{item.description}</Text>
            <View style={styles.collectionMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={14} color="#777" />
                <Text style={styles.metaText}>{item.productCount} Products</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="arrow-up" size={14} color="#777" />
                <Text style={styles.metaText}>Priority: {item.priority}</Text>
              </View>
            </View>
          </View>
          <Switch
            trackColor={{ false: '#E0E0E0', true: '#E8E2F7' }}
            thumbColor={item.active ? '#8F57EB' : '#BBBBBB'}
            ios_backgroundColor="#E0E0E0"
            onValueChange={() => toggleCollectionActive(item.id)}
            value={item.active}
          />
        </View>
        
        <View style={styles.collectionFooter}>
          <TouchableOpacity 
            style={styles.manageButton}
            onPress={() => handleManageProducts(item)}
          >
            <Text style={styles.manageButtonText}>Manage Products</Text>
          </TouchableOpacity>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditCollection(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteCollection(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4949" />
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
        <Text style={styles.headerTitle}>Collections</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddCollection}
        >
          <Ionicons name="add" size={24} color="#8F57EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search collections"
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
        data={filteredCollections}
        renderItem={renderCollectionItem}
        keyExtractor={item => item.id}
        style={styles.collectionsList}
        contentContainerStyle={styles.collectionsListContent}
      />

      {/* Edit Collection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {selectedCollection?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>
              This is where you would edit the collection details.
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
  collectionsList: {
    flex: 1,
  },
  collectionsListContent: {
    padding: 16,
  },
  collectionCard: {
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
  collectionHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  collectionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  collectionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  collectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  collectionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
  },
  collectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F2EDFB',
    borderRadius: 4,
  },
  manageButtonText: {
    fontSize: 13,
    color: '#8F57EB',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#8F57EB',
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

export default CollectionsScreen;