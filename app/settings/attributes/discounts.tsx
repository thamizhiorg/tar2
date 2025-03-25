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
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DiscountsScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  // Sample discounts data
  const [discounts, setDiscounts] = useState([
    { 
      id: '1', 
      name: 'Summer Sale', 
      type: 'percentage',
      value: 20,
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      active: true,
      applicableProducts: 'all'
    },
    { 
      id: '2', 
      name: 'New Customer', 
      type: 'percentage',
      value: 15,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      active: true,
      applicableProducts: 'all'
    },
    { 
      id: '3', 
      name: 'Clearance', 
      type: 'percentage',
      value: 50,
      startDate: '2025-03-15',
      endDate: '2025-04-15',
      active: false,
      applicableProducts: 'specific'
    },
    { 
      id: '4', 
      name: '$5 Off', 
      type: 'fixed',
      value: 5,
      minPurchase: 25,
      startDate: '2025-04-01',
      endDate: '2025-05-31',
      active: true,
      applicableProducts: 'all'
    },
    { 
      id: '5', 
      name: 'Holiday Special', 
      type: 'percentage',
      value: 30,
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      active: false,
      applicableProducts: 'categories'
    }
  ]);

  const filteredDiscounts = discounts.filter(discount => 
    discount.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDiscount = () => {
    Alert.alert("Add Discount", "This would open a form to create a new discount");
  };

  const handleEditDiscount = (discount) => {
    setSelectedDiscount(discount);
    setModalVisible(true);
  };

  const handleDeleteDiscount = (discountId) => {
    Alert.alert(
      "Delete Discount",
      "Are you sure you want to delete this discount?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => setDiscounts(discounts.filter(discount => discount.id !== discountId)),
          style: "destructive"
        }
      ]
    );
  };

  const toggleDiscountActive = (discountId) => {
    setDiscounts(
      discounts.map(discount => 
        discount.id === discountId 
          ? {...discount, active: !discount.active} 
          : discount
      )
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderDiscountItem = ({ item }) => {
    const isCurrentlyActive = item.active && 
      new Date(item.startDate) <= new Date() && 
      new Date(item.endDate) >= new Date();

    return (
      <TouchableOpacity 
        style={styles.discountCard}
        onPress={() => handleEditDiscount(item)}
      >
        <View style={styles.discountHeader}>
          <Text style={styles.discountName}>{item.name}</Text>
          <View style={styles.actionButtons}>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#FFE8E6' }}
              thumbColor={item.active ? '#FF6D01' : '#BBBBBB'}
              ios_backgroundColor="#E0E0E0"
              onValueChange={() => toggleDiscountActive(item.id)}
              value={item.active}
            />
          </View>
        </View>
        
        <View style={styles.discountInfo}>
          <View style={styles.discountValue}>
            <Text style={styles.valueText}>
              {item.type === 'percentage' ? `${item.value}%` : `$${item.value.toFixed(2)}`} {item.type === 'fixed' && item.minPurchase ? `(min $${item.minPurchase})` : ''} 
            </Text>
          </View>
          <View style={styles.dateRange}>
            <Ionicons name="calendar-outline" size={14} color="#777" />
            <Text style={styles.dateText}>
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>
          <View style={[styles.statusTag, isCurrentlyActive ? styles.activeTag : styles.inactiveTag]}>
            <Text style={[styles.statusText, isCurrentlyActive ? styles.activeText : styles.inactiveText]}>
              {isCurrentlyActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.applicableTo}>
          <Text style={styles.applicableLabel}>Applicable to: </Text>
          <Text style={styles.applicableValue}>
            {item.applicableProducts === 'all' ? 'All Products' : 
             item.applicableProducts === 'categories' ? 'Selected Categories' : 
             'Selected Products'}
          </Text>
        </View>
        
        <View style={styles.discountFooter}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditDiscount(item)}
          >
            <Ionicons name="create-outline" size={20} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteDiscount(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4949" />
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Discounts</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddDiscount}
        >
          <Ionicons name="add" size={24} color="#FF6D01" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discounts"
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
        data={filteredDiscounts}
        renderItem={renderDiscountItem}
        keyExtractor={item => item.id}
        style={styles.discountsList}
        contentContainerStyle={styles.discountsListContent}
      />

      {/* Edit Discount Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {selectedDiscount?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>
              This is where you would edit the discount details.
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
  discountsList: {
    flex: 1,
  },
  discountsListContent: {
    padding: 16,
  },
  discountCard: {
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
  discountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  discountValue: {
    marginRight: 16,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6D01',
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  dateText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 4,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeTag: {
    backgroundColor: '#FFF4EC',
  },
  inactiveTag: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#FF6D01',
  },
  inactiveText: {
    color: '#999',
  },
  applicableTo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicableLabel: {
    fontSize: 13,
    color: '#666',
  },
  applicableValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  discountFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    backgroundColor: '#FF6D01',
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

export default DiscountsScreen;