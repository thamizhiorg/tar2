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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import attributeStyles from '../../styles/attributeStyles';

const CategoriesScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Sample categories data
  const [categories, setCategories] = useState([
    { 
      id: '1', 
      name: 'Burgers', 
      image: 'https://placehold.co/60x60/FBBC05/fff?text=B',
      productCount: 12,
      active: true 
    },
    { 
      id: '2', 
      name: 'Pizza', 
      image: 'https://placehold.co/60x60/FBBC05/fff?text=P',
      productCount: 8,
      active: true
    },
    { 
      id: '3', 
      name: 'Salads', 
      image: 'https://placehold.co/60x60/FBBC05/fff?text=S',
      productCount: 5,
      active: true
    },
    { 
      id: '4', 
      name: 'Desserts', 
      image: 'https://placehold.co/60x60/FBBC05/fff?text=D',
      productCount: 7,
      active: true
    },
    { 
      id: '5', 
      name: 'Beverages', 
      image: 'https://placehold.co/60x60/FBBC05/fff?text=B',
      productCount: 15,
      active: true
    },
    { 
      id: '6', 
      name: 'Seasonal Items', 
      image: 'https://placehold.co/60x60/FBBC05/fff?text=S',
      productCount: 3,
      active: false
    }
  ]);

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = () => {
    Alert.alert("Add Category", "This would open a form to create a new category");
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const handleDeleteCategory = (categoryId) => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => setCategories(categories.filter(category => category.id !== categoryId)),
          style: "destructive"
        }
      ]
    );
  };

  const toggleCategoryActive = (categoryId) => {
    setCategories(
      categories.map(category => 
        category.id === categoryId 
          ? {...category, active: !category.active} 
          : category
      )
    );
  };

  const renderCategoryItem = ({ item }) => {
    return (
      <View style={attributeStyles.categoryItem}>
        <View style={attributeStyles.categoryMain}>
          <Image 
            source={{ uri: item.image }} 
            style={attributeStyles.categoryImage}
          />
          <View style={attributeStyles.categoryInfo}>
            <Text style={attributeStyles.itemName}>{item.name}</Text>
            <Text style={attributeStyles.itemCount}>{item.productCount} products</Text>
          </View>
          <View style={attributeStyles.actionButtons}>
            <TouchableOpacity 
              style={[attributeStyles.statusTag, item.active ? attributeStyles.activeTag : attributeStyles.inactiveTag]}
              onPress={() => toggleCategoryActive(item.id)}
            >
              <Text style={attributeStyles.statusText}>
                {item.active ? 'Active' : 'Inactive'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleEditCategory(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleDeleteCategory(item.id)}
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
        <Text style={attributeStyles.headerTitle}>Categories</Text>
        <TouchableOpacity 
          style={attributeStyles.addButton}
          onPress={handleAddCategory}
        >
          <Ionicons name="add" size={24} color="#FBBC05" />
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
              <Text style={attributeStyles.modalTitle}>Edit {selectedCategory?.name}</Text>
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
    </SafeAreaView>
  );
};

export default CategoriesScreen;