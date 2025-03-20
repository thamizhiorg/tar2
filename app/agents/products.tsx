import React, { useState } from "react";
import { init, id, i, InstaQLEntity } from "@instantdb/react-native";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";

const schema = i.schema({
  entities: {
    products: i.entity({
      category: i.string(),
      collection: i.string(),
      createdAt: i.number(),
      notes: i.string(),
      title: i.string(),
      vendor: i.string(),
      type: i.string(),
      tags: i.string(),
    }),
  },
});

type Product = InstaQLEntity<typeof schema, "products">;

const db = init({ appId: APP_ID, schema });

function App() {
  const { isLoading, error, data } = db.useQuery({ products: {} });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }
  const products = data?.products || [];

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ProductForm />
        <ProductList products={products} />
      </View>
    </View>
  );
}

function addProduct(title: string, category: string = "", vendor: string = "") {
  const productId = id();
  db.transact(
    db.tx.products[productId].update({
      title,
      category,
      vendor,
      createdAt: Date.now(),
      collection: "",
      notes: "",
      type: "",
      tags: "",
      id: productId,
    })
  );
}

function deleteProduct(product: Product) {
  db.transact(db.tx.products[product.id].delete());
}

function ProductForm() {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title) {
      addProduct(title);
      setTitle("");

      // Blur the input field after submission to remove focus
      if (TextInput.State) {
        TextInput.State.blurTextInput(TextInput.State.currentlyFocusedInput());
      }
    }
  };

  return (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Product Title"
          value={title}
          onChangeText={setTitle}
        />
        <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
          <Ionicons name="add" size={24} color="#4a86e8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProductList({ products }: { products: Product[] }) {
  return (
    <ScrollView style={styles.list}>
      {products.map((product) => {
        return (
          <View key={product.id} style={styles.listItem}>
            <Text style={styles.productTitle}>{product.title}</Text>
            {product.vendor && (
              <Text style={styles.productVendor}>{product.vendor}</Text>
            )}
            {product.category && (
              <Text style={styles.productCategory}>{product.category}</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
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
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    margin: 16,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    padding: 14,
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  createButton: {
    padding: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#e0e0e0",
  },
  list: {
    flex: 1,
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    minHeight: 60,
    justifyContent: "center",
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productVendor: {
    fontSize: 14,
    color: "#666",
  },
  productCategory: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});

export default App;