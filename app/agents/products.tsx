import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, StatusBar, SafeAreaView } from 'react-native';
import GlobalStyles, { Layout, Typography, Colors, Cards, Forms, Components } from "../../styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";

// Define the Product type to match the updated Turso database schema
interface Product {
  id: string | number | null;
  storeid?: string;
  name: string;
  type?: string;
  category?: string;
  collection?: string;
  unit?: string;
  price?: number;
  vendor?: string;
  brand?: string;
  options?: any;
  inventory?: number;
  modifiers?: any;
  metafields?: any;
  channels?: any;
  // Add a unique identifier to ensure we can always distinguish products
  _uniqueId?: string;
}

const ProductsComponent = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [apiResponse, setApiResponse] = React.useState<any>(null);
  // Add state for editing functionality
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editStoreid, setEditStoreid] = React.useState('');
  const [editType, setEditType] = React.useState('');
  const [editCategory, setEditCategory] = React.useState('');
  const [editCollection, setEditCollection] = React.useState('');
  const [editUnit, setEditUnit] = React.useState('');
  const [editPrice, setEditPrice] = React.useState('');
  const [editVendor, setEditVendor] = React.useState('');
  const [editBrand, setEditBrand] = React.useState('');
  const [updating, setUpdating] = React.useState(false);
  const [updateError, setUpdateError] = React.useState<string | null>(null);

  // Add state for search functionality
  const [searchQuery, setSearchQuery] = React.useState('');

  // Function to handle search input changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Optionally, filter products based on the query
    // setProducts(filteredProducts);
  };

  // Fetch products from the Turso database
  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://tar-tarframework.aws-eu-west-1.turso.io/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDM1MDY1OTIsImlkIjoiYjI1ODNhYTctNTQwOS00OTAyLWIxMWUtMzBkZjk5N2Q0NjIzIiwicmlkIjoiZmEwOWEwOWUtMTk3YS00M2M0LThmMDUtOTlmZTk0ZDhiZThkIn0.sKQEQR4b34LIs6pVW791zI7havvVEoKk9jHk1AvrOvr6OntKqyLGv85ZjRdeX4naSChv_ggGIbHNJgzMYxcxAA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              type: 'execute',
              stmt: {
                sql: 'SELECT * FROM products'
              }
            },
            {
              type: 'close'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Save the full API response for debugging
      setApiResponse(data);
      console.log('API Response:', JSON.stringify(data, null, 2));
      
      let extractedProducts: Product[] = [];

      // Parse the specific Turso API response format
      if (data && 
          data.results && 
          Array.isArray(data.results) && 
          data.results.length > 0 && 
          data.results[0].type === "ok" && 
          data.results[0].response && 
          data.results[0].response.result && 
          data.results[0].response.result.rows) {
        
        const cols = data.results[0].response.result.cols.map((col: any) => col.name);
        const rows = data.results[0].response.result.rows;
        
        extractedProducts = rows.map((row: any[], index: number) => {
          // Create a product with a guaranteed unique ID for React keys
          const product: Product = {
            id: null,
            name: "",
            _uniqueId: `product-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          };
          
          // Map each column to its respective value
          cols.forEach((colName: string, colIndex: number) => {
            const cell = row[colIndex];
            if (cell && 'value' in cell) {
              // Handle JSON fields
              if (colName === 'options' || colName === 'modifiers' || colName === 'metafields' || colName === 'channels') {
                try {
                  if (cell.value && typeof cell.value === 'string') {
                    product[colName as keyof Product] = JSON.parse(cell.value);
                  } else {
                    product[colName as keyof Product] = cell.value;
                  }
                } catch (e) {
                  console.error(`Failed to parse JSON for ${colName}`, e);
                  product[colName as keyof Product] = cell.value;
                }
              } else {
                product[colName as keyof Product] = cell.value;
              }
            } else if (cell && cell.type !== 'null') {
              product[colName as keyof Product] = cell;
            } else {
              product[colName as keyof Product] = null;
            }
          });
          
          return product;
        });
      }
      
      console.log('Final extracted products:', extractedProducts);
      setProducts(extractedProducts);
      setLoading(false);
      
      if (extractedProducts.length === 0) {
        setError('No products found in the API response. The database might be empty.');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(`Failed to load products: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Function to handle opening the edit modal
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditName(product.name || '');
    setEditStoreid(product.storeid || '');
    setEditType(product.type || '');
    setEditCategory(product.category || '');
    setEditCollection(product.collection || '');
    setEditUnit(product.unit || '');
    setEditPrice(product.price?.toString() || '');
    setEditVendor(product.vendor || '');
    setEditBrand(product.brand || '');
    setIsEditing(true);
    setUpdateError(null);
  };

  // Function to handle canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setUpdateError(null);
  };

  // Function to update product in the database
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setUpdating(true);
      setUpdateError(null);
      
      // Escape single quotes for SQL safety
      const escapedName = editName.replace(/'/g, "''");
      const escapedStoreid = editStoreid.replace(/'/g, "''");
      const escapedType = editType.replace(/'/g, "''");
      const escapedCategory = editCategory.replace(/'/g, "''");
      const escapedCollection = editCollection.replace(/'/g, "''");
      const escapedUnit = editUnit.replace(/'/g, "''");
      const escapedVendor = editVendor.replace(/'/g, "''");
      const escapedBrand = editBrand.replace(/'/g, "''");
      
      // Prepare the update SQL statement
      const updateSql = selectedProduct.id 
        ? `UPDATE products SET name = '${escapedName}', storeid = '${escapedStoreid}', type = '${escapedType}', 
           category = '${escapedCategory}', collection = '${escapedCollection}', unit = '${escapedUnit}', 
           price = ${editPrice || 'NULL'}, vendor = '${escapedVendor}', brand = '${escapedBrand}' 
           WHERE id = ${selectedProduct.id}`
        : `UPDATE products SET name = '${escapedName}', storeid = '${escapedStoreid}', type = '${escapedType}', 
           category = '${escapedCategory}', collection = '${escapedCollection}', unit = '${escapedUnit}', 
           price = ${editPrice || 'NULL'}, vendor = '${escapedVendor}', brand = '${escapedBrand}' 
           WHERE name = '${selectedProduct.name.replace(/'/g, "''")}'`;
      
      const response = await fetch('https://tar-tarframework.aws-eu-west-1.turso.io/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDM1MDY1OTIsImlkIjoiYjI1ODNhYTctNTQwOS00OTAyLWIxMWUtMzBkZjk5N2Q0NjIzIiwicmlkIjoiZmEwOWEwOWUtMTk3YS00M2M0LThmMDUtOTlmZTk0ZDhiZThkIn0.sKQEQR4b34LIs6pVW791zI7havvVEoKk9jHk1AvrOvr6OntKqyLGv85ZjRdeX4naSChv_ggGIbHNJgzMYxcxAA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              type: 'execute',
              stmt: {
                sql: updateSql
              }
            },
            {
              type: 'close'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      // Update the product in the local state
      const updatedProducts = products.map(product => {
        if ((selectedProduct.id && product.id === selectedProduct.id) || 
            (!selectedProduct.id && product.name === selectedProduct.name)) {
          return {
            ...product,
            name: editName,
            storeid: editStoreid,
            type: editType,
            category: editCategory,
            collection: editCollection,
            unit: editUnit,
            price: editPrice ? parseFloat(editPrice) : undefined,
            vendor: editVendor,
            brand: editBrand
          };
        }
        return product;
      });
      
      setProducts(updatedProducts);
      setIsEditing(false);
      setSelectedProduct(null);
      
      // Optional: Show success message or notification
      console.log('Product updated successfully');
    } catch (err) {
      console.error('Error updating product:', err);
      setUpdateError(`Failed to update product: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  // Function to create a new product
  const handleCreateProduct = async () => {
    if (!editName) {
      setUpdateError("Name is required");
      return;
    }
    
    try {
      setUpdating(true);
      setUpdateError(null);
      
      // Escape single quotes for SQL safety
      const escapedName = editName.replace(/'/g, "''");
      const escapedStoreid = editStoreid.replace(/'/g, "''");
      const escapedType = editType.replace(/'/g, "''");
      const escapedCategory = editCategory.replace(/'/g, "''");
      const escapedCollection = editCollection.replace(/'/g, "''");
      const escapedUnit = editUnit.replace(/'/g, "''");
      const escapedVendor = editVendor.replace(/'/g, "''");
      const escapedBrand = editBrand.replace(/'/g, "''");
      
      // Prepare the insert SQL statement
      const insertSql = `INSERT INTO products (name, storeid, type, category, collection, unit, price, vendor, brand) 
                         VALUES ('${escapedName}', '${escapedStoreid}', '${escapedType}', '${escapedCategory}', 
                         '${escapedCollection}', '${escapedUnit}', ${editPrice || 'NULL'}, '${escapedVendor}', '${escapedBrand}')`;
      
      const response = await fetch('https://tar-tarframework.aws-eu-west-1.turso.io/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDM1MDY1OTIsImlkIjoiYjI1ODNhYTctNTQwOS00OTAyLWIxMWUtMzBkZjk5N2Q0NjIzIiwicmlkIjoiZmEwOWEwOWUtMTk3YS00M2M0LThmMDUtOTlmZTk0ZDhiZThkIn0.sKQEQR4b34LIs6pVW791zI7havvVEoKk9jHk1AvrOvr6OntKqyLGv85ZjRdeX4naSChv_ggGIbHNJgzMYxcxAA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              type: 'execute',
              stmt: {
                sql: insertSql
              }
            },
            {
              type: 'close'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      // Refresh products after creation
      fetchProducts();
      setIsEditing(false);
      
      // Reset form fields
      setEditName('');
      setEditStoreid('');
      setEditType('');
      setEditCategory('');
      setEditCollection('');
      setEditUnit('');
      setEditPrice('');
      setEditVendor('');
      setEditBrand('');
      
      console.log('Product created successfully');
    } catch (err) {
      console.error('Error creating product:', err);
      setUpdateError(`Failed to create product: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  // Function to delete a product
  const handleDeleteProduct = async () => {
    if (!selectedProduct || !selectedProduct.id) {
      setUpdateError("Cannot delete product without ID");
      return;
    }
    
    try {
      setUpdating(true);
      setUpdateError(null);
      
      // Prepare the delete SQL statement
      const deleteSql = `DELETE FROM products WHERE id = ${selectedProduct.id}`;
      
      const response = await fetch('https://tar-tarframework.aws-eu-west-1.turso.io/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDM1MDY1OTIsImlkIjoiYjI1ODNhYTctNTQwOS00OTAyLWIxMWUtMzBkZjk5N2Q0NjIzIiwicmlkIjoiZmEwOWEwOWUtMTk3YS00M2M0LThmMDUtOTlmZTk0ZDhiZThkIn0.sKQEQR4b34LIs6pVW791zI7havvVEoKk9jHk1AvrOvr6OntKqyLGv85ZjRdeX4naSChv_ggGIbHNJgzMYxcxAA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              type: 'execute',
              stmt: {
                sql: deleteSql
              }
            },
            {
              type: 'close'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      // Remove the product from local state
      setProducts(products.filter(product => product.id !== selectedProduct.id));
      setIsEditing(false);
      setSelectedProduct(null);
      
      console.log('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      setUpdateError(`Failed to delete product: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  // Function to open modal for creating a new product
  const handleAddNewProduct = () => {
    setSelectedProduct(null);
    setEditName('');
    setEditStoreid('');
    setEditType('');
    setEditCategory('');
    setEditCollection('');
    setEditUnit('');
    setEditPrice('');
    setEditVendor('');
    setEditBrand('');
    setIsEditing(true);
    setUpdateError(null);
  };

  // Render individual product item with styling consistent with app design
  const renderProductItem = ({ item, index, separators }: { item: Product, index: number, separators: any }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => handleEditProduct(item)}
    >
      <View style={styles.productContent}>
        <Text style={styles.productTitle}>{item.name || 'Untitled Product'}</Text>
        <View style={styles.productDetails}>
          {item.category && (
            <Text style={styles.productCategory}>{item.category}</Text>
          )}
          {item.vendor && (
            <Text style={styles.productVendor}>Vendor: {item.vendor}</Text>
          )}
          {item.price !== undefined && (
            <Text style={styles.productPrice}>${parseFloat(item.price.toString()).toFixed(2)}</Text>
          )}
          {item.brand && (
            <Text style={styles.productBrand}>Brand: {item.brand}</Text>
          )}
          {item.type && (
            <Text style={styles.productType}>Type: {item.type}</Text>
          )}
        </View>
      </View>
      <Text style={styles.editIcon}>›</Text>
      {index < products.length - 1 && <View style={styles.divider} />}
    </TouchableOpacity>
  );

  // Render edit modal component
  const renderEditModal = () => (
    <Modal
      visible={isEditing}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCancelEdit}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedProduct ? 'Edit Product' : 'New Product'}
          </Text>
          <TouchableOpacity onPress={handleCancelEdit}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        </View>
        
        {updateError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{updateError}</Text>
          </View>
        )}
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView style={styles.formScrollContainer}>
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Name*</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Product name"
                placeholderTextColor={Colors.text.tertiary}
              />
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Store ID</Text>
                  <TextInput
                    style={styles.input}
                    value={editStoreid}
                    onChangeText={setEditStoreid}
                    placeholder="Store ID"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Vendor</Text>
                  <TextInput
                    style={styles.input}
                    value={editVendor}
                    onChangeText={setEditVendor}
                    placeholder="Vendor"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    style={styles.input}
                    value={editCategory}
                    onChangeText={setEditCategory}
                    placeholder="Category"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Collection</Text>
                  <TextInput
                    style={styles.input}
                    value={editCollection}
                    onChangeText={setEditCollection}
                    placeholder="Collection"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Type</Text>
                  <TextInput
                    style={styles.input}
                    value={editType}
                    onChangeText={setEditType}
                    placeholder="Product type"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Brand</Text>
                  <TextInput
                    style={styles.input}
                    value={editBrand}
                    onChangeText={setEditBrand}
                    placeholder="Brand"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Price</Text>
                  <TextInput
                    style={styles.input}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    placeholder="0.00"
                    placeholderTextColor={Colors.text.tertiary}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <TextInput
                    style={styles.input}
                    value={editUnit}
                    onChangeText={setEditUnit}
                    placeholder="ea, kg, etc."
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.updateButton, (updating || !editName) ? styles.updateButtonDisabled : null]}
                onPress={selectedProduct ? handleUpdateProduct : handleCreateProduct}
                disabled={updating || !editName}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={Colors.background} />
                ) : (
                  <Text style={styles.updateButtonText}>
                    {selectedProduct ? 'Update Product' : 'Create Product'}
                  </Text>
                )}
              </TouchableOpacity>
              
              {selectedProduct && selectedProduct.id && (
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={handleDeleteProduct}
                  disabled={updating}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.background} style={styles.buttonIcon} />
                  <Text style={styles.deleteButtonText}>Delete Product</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Redesigned header with search bar and add icon */}
      <View style={styles.header}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color={Colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search products..."
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>
        <TouchableOpacity 
          style={styles.addIconContainer}
          onPress={handleAddNewProduct}
        >
          <Ionicons name="add" size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {apiResponse && (
            <View style={styles.apiResponseContainer}>
              <Text style={styles.apiResponseTitle}>API Response Structure:</Text>
              <ScrollView style={styles.apiResponseScroll}>
                <Text style={styles.apiResponseText}>
                  {apiResponse && typeof apiResponse === 'object' 
                    ? `Has 'results': ${!!apiResponse.results}\n` +
                      `Results is array: ${Array.isArray(apiResponse.results)}\n` +
                      `Results length: ${apiResponse.results ? apiResponse.results.length : 'N/A'}\n` +
                      (apiResponse.results && apiResponse.results.length > 0 
                        ? `First result has 'rows': ${!!apiResponse.results[0].rows}\n` +
                          `First result rows is array: ${Array.isArray(apiResponse.results[0].rows)}\n` +
                          `First result rows length: ${apiResponse.results[0].rows ? apiResponse.results[0].rows.length : 'N/A'}` 
                        : 'Results array is empty')
                    : 'API response is not an object'
                  }
                </Text>
              </ScrollView>
            </View>
          )}
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchProducts}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => item._uniqueId || `product-${index}-${Math.random().toString(36).substring(2, 9)}`}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.invisibleSeparator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={Typography.noItemsText}>No products found in the database. Try adding some products.</Text>
              <TouchableOpacity 
                style={[styles.retryButton, { marginTop: 16 }]} 
                onPress={fetchProducts}
              >
                <Text style={styles.retryButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      {/* Render the edit/create modal */}
      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.padding.padding,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.lightest,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  addIconContainer: {
    marginLeft: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    paddingBottom: 20,
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
    ...Typography.body,
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  apiResponseContainer: {
    width: '100%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  apiResponseTitle: {
    ...Typography.subtitle,
    marginBottom: 8,
  },
  apiResponseScroll: {
    maxHeight: 150,
  },
  apiResponseText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.padding.padding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.lightest,
  },
  modalTitle: {
    ...Typography.title,
    fontSize: 20,
  },
  cancelButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  formScrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: Layout.padding.padding,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...Typography.subtitle,
    marginBottom: 8,
    color: Colors.text.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
  },
  contentInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: Colors.border.light,
  },
  updateButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.error,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  errorBanner: {
    backgroundColor: Colors.error,
    padding: 12,
    margin: Layout.padding.padding,
    borderRadius: 8,
  },
  productItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  productContent: {
    flex: 1,
    paddingRight: 24, // Space for chevron
  },
  productDetails: {
    flexDirection: 'column',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  productVendor: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  productType: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  editIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.tertiary,
    transform: [{ translateY: -12 }],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.lightest,
    position: 'absolute',
    left: 16,
    right: 0,
    bottom: 0,
  },
  invisibleSeparator: {
    height: 0,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default ProductsComponent;