import React, { useState, useRef } from 'react';
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
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import attributeStyles from '../../styles/attributeStyles';
import { init, id, i, InstaQLEntity } from "@instantdb/react-native";
import schema, { AppSchema } from "../../../instant.schema";

// Initialize InstantDB with the same APP_ID as in product.tsx
const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";
const db = init({ appId: APP_ID, schema });

// Define Category type from schema
type Category = InstaQLEntity<AppSchema, "category">;

const CategoriesScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Add category drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const drawerAnimation = useRef(new Animated.Value(0)).current;
  
  const screenHeight = Dimensions.get('window').height;
  const drawerHeight = 250; // Height of the drawer

  // Fetch categories from InstantDB
  const { isLoading, error, data } = db.useQuery({ 
    category: {}
  });

  // Animation functions for the drawer
  const showDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(drawerAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const hideDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  const handleAddCategory = () => {
    showDrawer();
  };

  const submitNewCategory = () => {
    if (!newCategoryTitle.trim()) {
      Alert.alert("Error", "Category title is required");
      return;
    }

    const categoryId = id();
    db.transact(
      db.tx.category[categoryId].update({
        title: newCategoryTitle.trim(),
        image: newCategoryImage.trim() || 'https://placehold.co/60x60/FBBC05/fff?text=C',
        parentid: ''
      })
    );

    // Reset form and close drawer
    setNewCategoryTitle('');
    setNewCategoryImage('');
    hideDrawer();
  };

  // Filter categories based on search query
  const filteredCategories = data?.category 
    ? data.category.filter(category => 
        category.title && category.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const renderCategoryItem = ({ item }: { item: Category }) => {
    return (
      <View style={attributeStyles.categoryItem}>
        <View style={attributeStyles.categoryMain}>
          <Image 
            source={{ uri: item.image || 'https://placehold.co/60x60/FBBC05/fff?text=C' }} 
            style={attributeStyles.categoryImage}
          />
          <View style={attributeStyles.categoryInfo}>
            <Text style={attributeStyles.itemName}>{item.title || 'Unnamed Category'}</Text>
            {/* No product count in the schema, could be implemented with a query of linked items */}
          </View>
          <View style={attributeStyles.actionButtons}>
            {/* Status, edit and delete buttons removed */}
          </View>
        </View>
      </View>
    );
  };

  // Show loading state
  if (isLoading) return (
    <SafeAreaView style={attributeStyles.container}>
      <Text>Loading categories...</Text>
    </SafeAreaView>
  );

  // Show error state
  if (error) return (
    <SafeAreaView style={attributeStyles.container}>
      <Text>Error loading categories: {error.message}</Text>
    </SafeAreaView>
  );

  // Calculate drawer position based on animation value
  const drawerTranslateY = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, screenHeight - drawerHeight],
  });

  return (
    <SafeAreaView style={attributeStyles.container}>
      <View style={attributeStyles.header}>
        <TouchableOpacity 
          style={attributeStyles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={attributeStyles.headerTitle}>Categories</Text>
        <TouchableOpacity 
          style={attributeStyles.addButton}
          onPress={handleAddCategory}
        >
          {/* Changed color to light gray */}
          <Ionicons name="add" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={attributeStyles.searchContainer}>
        <View style={attributeStyles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={attributeStyles.searchIcon} />
          <TextInput
            style={attributeStyles.searchInput}
            placeholder="Search categories"
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
        data={filteredCategories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        style={attributeStyles.listContainer}
        contentContainerStyle={attributeStyles.listContent}
      />

      {/* Edit Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={attributeStyles.modalOverlay}>
          <View style={attributeStyles.modalContent}>
            <View style={attributeStyles.modalHeader}>
              <Text style={attributeStyles.modalTitle}>Edit {selectedCategory?.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={attributeStyles.modalDescription}>
              This is where you would edit the category details.
            </Text>
            <TouchableOpacity 
              style={[attributeStyles.modalButton, attributeStyles.themeColorCategory]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={attributeStyles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Category Bottom Drawer - minimal design with no border radius or elevation */}
      {drawerVisible && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.2)',
        }}>
          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={hideDrawer}
          />
          <Animated.View style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: drawerHeight,
            backgroundColor: 'white',
            transform: [{ translateY: drawerTranslateY }],
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: '#eee',
            zIndex: 1000, // Ensure drawer is on top
          }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Add New Category</Text>
              {/* Close icon removed */}
            </View>

            {/* Removed field headings */}
            <TextInput
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: '#eee',
                marginBottom: 15,
                backgroundColor: '#f9f9f9',
              }}
              placeholder="Category title"
              value={newCategoryTitle}
              onChangeText={setNewCategoryTitle}
            />

            <TextInput
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: '#eee',
                marginBottom: 20,
                backgroundColor: '#f9f9f9',
              }}
              placeholder="Image URL (optional)"
              value={newCategoryImage}
              onChangeText={setNewCategoryImage}
            />

            <TouchableOpacity 
              style={{
                backgroundColor: '#f2f2f2', // Changed to light gray
                padding: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#e0e0e0',
              }}
              onPress={submitNewCategory}
            >
              <Text style={{ color: '#333', fontWeight: 'bold' }}>Add Category</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

    </SafeAreaView>
  );
};

export default CategoriesScreen;