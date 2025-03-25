import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';

const AttributesScreen = () => {
  const router = useRouter();

  const attributeCategories = [
    { id: 'options', label: 'Options' },
    { id: 'modifiers', label: 'Modifiers' },
    { id: 'categories', label: 'Categories' },
    { id: 'units', label: 'Units' },
    { id: 'discounts', label: 'Discounts' },
    { id: 'taxes', label: 'Taxes' },
    { id: 'collections', label: 'Collections' },
    { id: 'custom', label: 'Custom' }
  ];

  const navigateToAttributeType = (attributeType) => {
    router.push(`/settings/attributes/${attributeType}`);
  };

  const renderAttributeCategory = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => navigateToAttributeType(item.id)}
      >
        <Text style={styles.categoryName}>{item.label}</Text>
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
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attributes</Text>
      </View>

      <FlatList
        data={attributeCategories}
        renderItem={renderAttributeCategory}
        keyExtractor={item => item.id}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesListContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Core layout styles
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'left',
    marginLeft: 8,
  },
  
  // Categories list styles
  categoriesList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  categoriesListContent: {
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  categoryName: {
    fontSize: 16,
    color: '#333333',
  },
});

export default AttributesScreen;
