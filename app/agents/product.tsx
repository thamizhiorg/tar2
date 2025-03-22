import { init, id, i, InstaQLEntity } from "@instantdb/react-native";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import schema, { AppSchema } from "../../instant.schema";
import ProductCard from "../components/ProductCard";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";

type OnDevice = InstaQLEntity<AppSchema, "ondevice">;
type Product = InstaQLEntity<AppSchema, "products">;

const db = init({ appId: APP_ID, schema });

function App() {
  const { isLoading, error, data } = db.useQuery({ 
    ondevice: {},
    products: {} // We still need products for the card view
  });

  if (isLoading) return <View style={styles.container}><Text>Loading...</Text></View>;
  if (error) return <View style={styles.container}><Text>Error: {error.message}</Text></View>;

  const ondeviceItems = data?.ondevice || [];
  const products = data?.products || [];

  // Create a map of products by their id
  const productMap = products.reduce((acc, product) => {
    acc[product.id] = product;
    return acc;
  }, {} as Record<string, any>);

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ProductForm />
        <ProductList ondeviceItems={ondeviceItems} productMap={productMap} />
      </View>
    </View>
  );
}

function addOnDevice(title: string, userId: string) {
  const deviceId = id();
  db.transact(
    db.tx.ondevice[deviceId].update({
      title,
      pageid: deviceId,
      agent: 'products'
    })
  );
}

function deleteProduct(product: Product) {
  db.transact(db.tx.products[product.id].delete());
}

function ProductForm() {
  const { user } = db.useAuth();
  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Device Title"
        onSubmitEditing={(e) => {
          const title = e.nativeEvent.text;
          if (title && user) {
            addOnDevice(title, user.id);
            e.nativeEvent.text = "";
          }
        }}
      />
    </View>
  );
}

function ProductList({ ondeviceItems, productMap }: { ondeviceItems: OnDevice[], productMap: Record<string, any> }) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleProductPress = (ondeviceItem: OnDevice) => {
    const product = productMap[ondeviceItem.pageid];
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 1 }]}>Title</Text>
        </View>
        {ondeviceItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.tableRow}
            onPress={() => handleProductPress(item)}
          >
            <Text style={[styles.cell, { flex: 1 }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {modalVisible && selectedProduct && (
        <View style={styles.modalContainer}>
          <ProductCard
            product={selectedProduct}
            onClose={handleCloseModal}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  form: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  table: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerCell: {
    fontSize: 14,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    padding: 16,
    alignItems: "center",
  },
  cell: {
    paddingHorizontal: 4,
  },
  qty: {
    marginHorizontal: 8,
    minWidth: 30,
    textAlign: "center",
    fontSize: 16,
  },
  qtyButton: {
    fontSize: 18,
    color: "#666",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
});

export default App;