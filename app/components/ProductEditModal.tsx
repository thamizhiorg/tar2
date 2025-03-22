import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { AppSchema, InstaQLEntity } from '@instantdb/react-native';
import { init } from "@instantdb/react-native";
import schema from "../../instant.schema";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";
const db = init({ appId: APP_ID, schema });

type Product = InstaQLEntity<AppSchema, "products">;

interface ProductEditModalProps {
  product: Product | null;
  isVisible: boolean;
  onClose: () => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isVisible,
  onClose,
}) => {
  // If product is null, we don't render anything
  if (!product) return null;
  
  // Store initial product data to prevent UI flashing
  const [initialProduct, setInitialProduct] = useState<Product | null>(null);
  
  // Update initialProduct when the product prop changes or becomes visible
  useEffect(() => {
    if (product && isVisible) {
      setInitialProduct(product);
    }
  }, [product?.id, isVisible]);
  
  // Use query to get real-time updates for this product
  const { isLoading, error, data } = db.useQuery({
    products: {
      $: { where: { id: product.id } }
    }
  });
  
  // Use the queried product data, fall back to initialProduct to prevent flashing
  const currentProduct = data?.products?.[0] || initialProduct || product;
  
  const handleChange = (field: keyof Product, value: any) => {
    // Update the product in real-time
    db.transact(db.tx.products[product.id].update({
      [field]: value
    }));
  };

  // Don't render the form until we have initialProduct set
  // This prevents the flash of old data
  const shouldRenderForm = !!initialProduct;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Edit Product</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {!shouldRenderForm || isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a90e2" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error.message}</Text>
          </View>
        ) : (
          <ScrollView style={styles.formContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={currentProduct.title || ''}
              onChangeText={(text) => handleChange('title', text)}
              placeholder="Product Title"
            />
            
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={currentProduct.category || ''}
              onChangeText={(text) => handleChange('category', text)}
              placeholder="Category"
            />
            
            <Text style={styles.label}>Vendor</Text>
            <TextInput
              style={styles.input}
              value={currentProduct.vendor || ''}
              onChangeText={(text) => handleChange('vendor', text)}
              placeholder="Vendor"
            />
            
            <Text style={styles.label}>Type</Text>
            <TextInput
              style={styles.input}
              value={currentProduct.type || ''}
              onChangeText={(text) => handleChange('type', text)}
              placeholder="Product Type"
            />
            
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              value={currentProduct.tags || ''}
              onChangeText={(text) => handleChange('tags', text)}
              placeholder="Tags (comma separated)"
            />
            
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={currentProduct.notes || ''}
              onChangeText={(text) => handleChange('notes', text)}
              placeholder="Notes"
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Web Enabled</Text>
              <Switch
                value={currentProduct.web || false}
                onValueChange={(value) => handleChange('web', value)}
              />
            </View>
            
            <Text style={styles.label}>Collection</Text>
            <TextInput
              style={styles.input}
              value={currentProduct.collection || ''}
              onChangeText={(text) => handleChange('collection', text)}
              placeholder="Collection"
            />
            
            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.input}
              value={currentProduct.unit || ''}
              onChangeText={(text) => handleChange('unit', text)}
              placeholder="Unit"
            />
            
            <Text style={styles.label}>Attributes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={currentProduct.attributes || ''}
              onChangeText={(text) => handleChange('attributes', text)}
              placeholder="Attributes (JSON format)"
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.label}>Options</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={currentProduct.options || ''}
              onChangeText={(text) => handleChange('options', text)}
              placeholder="Options (JSON format)"
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.label}>SEO</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={currentProduct.seo || ''}
              onChangeText={(text) => handleChange('seo', text)}
              placeholder="SEO Information"
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.label}>Tax</Text>
            <TextInput
              style={styles.input}
              value={currentProduct.tax || ''}
              onChangeText={(text) => handleChange('tax', text)}
              placeholder="Tax Information"
            />
            
            <Text style={styles.label}>POS</Text>
            <TextInput
              style={styles.input}
              value={currentProduct.pos || ''}
              onChangeText={(text) => handleChange('pos', text)}
              placeholder="POS Information"
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#555',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  doneButton: {
    backgroundColor: '#4a90e2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  }
});

export default ProductEditModal;
