import { init, id, i, InstaQLEntity } from "@instantdb/react-native";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from "react-native";
import schema, { AppSchema } from "../../instant.schema";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";

type Product = InstaQLEntity<AppSchema, "products">;

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

function addProduct(title: string, userId: string) {
  const productId = id();
  db.transact(
    db.tx.products[productId].update({
      title,
      id: productId,
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
        placeholder="Product Title"
        onSubmitEditing={(e) => {
          const title = e.nativeEvent.text;
          if (title && user) {
            addProduct(title, user.id);
            e.nativeEvent.text = "";
          }
        }}
      />
    </View>
  );
}

function ProductList({ products }: { products: Product[] }) {
  return (
    <ScrollView style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 1 }]}>Title</Text>
      </View>
      {products.map((product) => {
        return (
          <View key={product.id} style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 1 }]}>{product.title}</Text>
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
});

export default App;