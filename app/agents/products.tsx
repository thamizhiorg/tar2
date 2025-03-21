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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
        {selectedProduct ? (
          <ProductEdit 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        ) : (
          <>
            <ProductForm />
            <ProductList 
              products={products} 
              onProductPress={setSelectedProduct} 
            />
          </>
        )}
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

function updateProduct(product: Product, updates: Partial<Product>) {
  db.transact(
    db.tx.products[product.id].update(updates)
  );
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

function ProductList({ products, onProductPress }: { 
  products: Product[], 
  onProductPress: (product: Product) => void 
}) {
  return (
    <ScrollView style={styles.list}>
      {products.map((product) => {
        return (
          <TouchableOpacity 
            key={product.id} 
            style={styles.listItem}
            onPress={() => onProductPress(product)}
          >
            <Text style={styles.productTitle}>{product.title}</Text>
            {product.vendor && (
              <Text style={styles.productVendor}>{product.vendor}</Text>
            )}
            {product.category && (
              <Text style={styles.productCategory}>{product.category}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function ProductEdit({ product, onClose }: { 
  product: Product, 
  onClose: () => void 
}) {
  const [title, setTitle] = useState(product.title || "");
  const [vendor, setVendor] = useState(product.vendor || "");
  const [category, setCategory] = useState(product.category || "");
  const [collection, setCollection] = useState(product.collection || "");
  const [type, setType] = useState(product.type || "");
  const [tags, setTags] = useState(product.tags || "");
  const [notes, setNotes] = useState(product.notes || "");

  const handleSave = () => {
    updateProduct(product, {
      title,
      vendor,
      category,
      collection,
      type,
      tags,
      notes,
    });
    onClose();
  };

  return (
    <View style={styles.editContainer}>
      <View style={styles.editHeader}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4a86e8" />
        </TouchableOpacity>
        <Text style={styles.editTitle}>Edit Product</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.editForm}>
        <Text style={styles.inputLabel}>Title</Text>
        <TextInput
          style={styles.editInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Product Title"
        />
        
        <Text style={styles.inputLabel}>Vendor</Text>
        <TextInput
          style={styles.editInput}
          value={vendor}
          onChangeText={setVendor}
          placeholder="Vendor"
        />
        
        <Text style={styles.inputLabel}>Category</Text>
        <TextInput
          style={styles.editInput}
          value={category}
          onChangeText={setCategory}
          placeholder="Category"
        />
        
        <Text style={styles.inputLabel}>Collection</Text>
        <TextInput
          style={styles.editInput}
          value={collection}
          onChangeText={setCollection}
          placeholder="Collection"
        />
        
        <Text style={styles.inputLabel}>Type</Text>
        <TextInput
          style={styles.editInput}
          value={type}
          onChangeText={setType}
          placeholder="Type"
        />
        
        <Text style={styles.inputLabel}>Tags</Text>
        <TextInput
          style={styles.editInput}
          value={tags}
          onChangeText={setTags}
          placeholder="Tags (comma separated)"
        />
        
        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={[styles.editInput, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes"
          multiline
          numberOfLines={4}
        />
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => {
            deleteProduct(product);
            onClose();
          }}
        >
          <Text style={styles.deleteButtonText}>Delete Product</Text>
        </TouchableOpacity>
      </ScrollView>
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
  editContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: "#4a86e8",
    fontWeight: "600",
  },
  editForm: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#555",
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top",
  },
  deleteButton: {
    backgroundColor: "#ff6b6b",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 30,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default App;