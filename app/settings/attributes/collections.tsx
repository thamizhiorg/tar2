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
  Image,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import attributeStyles from '../../styles/attributeStyles';

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
      <View style={[attributeStyles.collectionItem, { padding: 16, marginBottom: 12 }]}>
        <View style={[attributeStyles.collectionHeader, { marginBottom: 12 }]}>
          <Image 
            source={{ uri: item.image }} 
            style={attributeStyles.collectionImage} 
          />
          <View style={attributeStyles.collectionInfo}>
            <Text style={attributeStyles.itemName}>{item.name}</Text>
            <Text style={attributeStyles.collectionDescription}>{item.description}</Text>
            <View style={attributeStyles.metaItem}>
              <Ionicons name="pricetag-outline" size={14} color="#777" />
              <Text style={attributeStyles.metaText}>{item.productCount} Products</Text>
              <Ionicons name="arrow-up" size={14} color="#777" />
              <Text style={attributeStyles.metaText}>Priority: {item.priority}</Text>
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
        
        <View style={attributeStyles.collectionFooter}>
          <TouchableOpacity 
            style={attributeStyles.manageButton}
            onPress={() => handleManageProducts(item)}
          >
            <Text style={attributeStyles.manageButtonText}>Manage Products</Text>
          </TouchableOpacity>
          <View style={attributeStyles.actionButtons}>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleEditCollection(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
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
    <SafeAreaView style={attributeStyles.container}>
      <View style={attributeStyles.header}>
        <TouchableOpacity 
          style={attributeStyles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={attributeStyles.headerTitle}>Collections</Text>
        <TouchableOpacity 
          style={attributeStyles.addButton}
          onPress={handleAddCollection}
        >
          <Ionicons name="add" size={24} color="#8F57EB" />
        </TouchableOpacity>
      </View>

      <View style={attributeStyles.searchContainer}>
        <View style={attributeStyles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={attributeStyles.searchIcon} />
          <TextInput
            style={attributeStyles.searchInput}
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
        style={attributeStyles.listContainer}
        contentContainerStyle={attributeStyles.listContent}
      />

      {/* Edit Collection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={attributeStyles.modalOverlay}>
          <View style={attributeStyles.modalContent}>
            <View style={attributeStyles.modalHeader}>
              <Text style={attributeStyles.modalTitle}>Edit {selectedCollection?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={attributeStyles.modalDescription}>
              This is where you would edit the collection details.
            </Text>
            <TouchableOpacity 
              style={[attributeStyles.modalButton, attributeStyles.themeColorCollection]}
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

export default CollectionsScreen;