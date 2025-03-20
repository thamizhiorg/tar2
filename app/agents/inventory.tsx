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
import schema, { AppSchema } from "../../instant.schema";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";

type Inventory = InstaQLEntity<AppSchema, "inventory">;

const db = init({ appId: APP_ID, schema });

function App() {
  const { isLoading, error, data } = db.useQuery({ inventory: {} });

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
  const inventoryItems = data?.inventory || [];

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <InventoryForm />
        <InventoryList inventoryItems={inventoryItems} />
      </View>
    </View>
  );
}

function addInventoryItem(name: string, sku: string = "", qty: number = 0) {
  const inventoryId = id();
  db.transact(
    db.tx.inventory[inventoryId].update({
      name,
      sku,
      qty,
      available: qty,
      committed: 0,
      unavailable: 0,
      stock: qty,
      createdAt: Date.now(),
      userId: "",
      vname: name.toLowerCase(),
      id: inventoryId,
    })
  );
}

function deleteInventoryItem(item: Inventory) {
  db.transact(db.tx.inventory[item.id].delete());
}

function InventoryForm() {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("");

  const handleSubmit = () => {
    if (name) {
      addInventoryItem(name, sku, Number(qty) || 0);
      setName("");
      setSku("");
      setQty("");

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
          placeholder="Item Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="SKU"
          value={sku}
          onChangeText={setSku}
        />
        <TextInput
          style={styles.input}
          placeholder="Quantity"
          value={qty}
          onChangeText={setQty}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
          <Ionicons name="add" size={24} color="#4a86e8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InventoryList({ inventoryItems }: { inventoryItems: Inventory[] }) {
  return (
    <ScrollView style={styles.list}>
      {inventoryItems.map((item) => {
        return (
          <View key={item.id} style={styles.listItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.sku && (
              <Text style={styles.itemSku}>SKU: {item.sku}</Text>
            )}
            <Text style={styles.itemQty}>Qty: {item.qty || 0}</Text>
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
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 14,
    color: "#666",
  },
  itemQty: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});

export default App;