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
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import attributeStyles from '../../styles/attributeStyles';

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
      applicableTo: 'all',
      minimumPurchase: 0
    },
    { 
      id: '2', 
      name: 'First Order', 
      type: 'fixed',
      value: 10,
      active: true,
      applicableTo: 'first_purchase',
      minimumPurchase: 50
    },
    { 
      id: '3', 
      name: 'Bulk Discount', 
      type: 'percentage',
      value: 15,
      active: true,
      applicableTo: 'quantity',
      minimumPurchase: 100
    },
    { 
      id: '4', 
      name: 'Holiday Special', 
      type: 'percentage',
      value: 25,
      startDate: '2025-12-20',
      endDate: '2025-12-26',
      active: false,
      applicableTo: 'categories',
      minimumPurchase: 0
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

  const getApplicableToText = (applicableTo) => {
    switch (applicableTo) {
      case 'all':
        return 'All Products';
      case 'categories':
        return 'Selected Categories';
      case 'first_purchase':
        return 'First Purchase Only';
      case 'quantity':
        return 'Bulk Orders';
      default:
        return 'Custom Rules';
    }
  };

  const renderDiscountItem = ({ item }) => {
    const isExpired = item.endDate && new Date(item.endDate) < new Date();
    const hasStarted = !item.startDate || new Date(item.startDate) <= new Date();
    
    return (
      <View style={attributeStyles.discountItem}>
        <View style={attributeStyles.discountHeader}>
          <View>
            <Text style={attributeStyles.itemName}>{item.name}</Text>
            <Text style={attributeStyles.discountValue}>
              {item.type === 'percentage' ? `${item.value}% off` : `$${item.value} off`}
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#E0E0E0', true: '#FFE6E6' }}
            thumbColor={item.active ? '#FF6B6B' : '#BBBBBB'}
            ios_backgroundColor="#E0E0E0"
            onValueChange={() => toggleDiscountActive(item.id)}
            value={item.active}
          />
        </View>

        <View style={attributeStyles.discountInfo}>
          {item.startDate && item.endDate && (
            <View style={attributeStyles.dateRange}>
              <Text style={attributeStyles.dateText}>
                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          
          <View style={attributeStyles.discountTags}>
            {isExpired && (
              <View style={[attributeStyles.statusTag, attributeStyles.expiredTag]}>
                <Text style={attributeStyles.expiredText}>Expired</Text>
              </View>
            )}
            {!hasStarted && (
              <View style={[attributeStyles.statusTag, attributeStyles.scheduledTag]}>
                <Text style={attributeStyles.scheduledText}>Scheduled</Text>
              </View>
            )}
            {item.minimumPurchase > 0 && (
              <View style={[attributeStyles.statusTag, attributeStyles.minimumTag]}>
                <Text style={attributeStyles.minimumText}>
                  Min. ${item.minimumPurchase}
                </Text>
              </View>
            )}
          </View>

          <Text style={attributeStyles.discountApplicable}>
            Applies to: {getApplicableToText(item.applicableTo)}
          </Text>
        </View>

        <View style={attributeStyles.actionFooter}>
          <View style={attributeStyles.actionButtons}>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleEditDiscount(item)}
            >
              <Ionicons name="create-outline" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={attributeStyles.actionButton}
              onPress={() => handleDeleteDiscount(item.id)}
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
        <Text style={attributeStyles.headerTitle}>Discounts</Text>
        <TouchableOpacity 
          style={attributeStyles.addButton}
          onPress={handleAddDiscount}
        >
          <Ionicons name="add" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={attributeStyles.searchContainer}>
        <View style={attributeStyles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={attributeStyles.searchIcon} />
          <TextInput
            style={attributeStyles.searchInput}
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
        style={attributeStyles.listContainer}
        contentContainerStyle={attributeStyles.listContent}
      />

      {/* Edit Discount Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={attributeStyles.modalOverlay}>
          <View style={attributeStyles.modalContent}>
            <View style={attributeStyles.modalHeader}>
              <Text style={attributeStyles.modalTitle}>Edit {selectedDiscount?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={attributeStyles.modalDescription}>
              This is where you would edit the discount details.
            </Text>
            <TouchableOpacity 
              style={[attributeStyles.modalButton, attributeStyles.themeColorDiscount]}
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

export default DiscountsScreen;