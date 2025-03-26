# InstantDB Guide for TarApp

## Setup and Initialization

InstantDB is initialized with a unique App ID and schema:

```typescript
import { init, id, i, InstaQLEntity } from "@instantdb/react-native";
import schema, { AppSchema } from "../instant.schema";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";
const db = init({ appId: APP_ID, schema });
```

## Data Operations

### Querying Data

Fetch data using the `useQuery` hook:

```typescript
const { isLoading, error, data } = db.useQuery({ 
  category: {} // Fetch all categories
});

// With filters
const { data } = db.useQuery({
  products: {
    where: {
      title: { contains: "burger" }
    }
  }
});
```

### Creating Records

Create a new record using the `transact` method:

```typescript
const newId = id(); // Generate a unique ID
db.transact(
  db.tx.category[newId].update({
    title: "New Category",
    image: "https://example.com/image.jpg",
    parentid: ""
  })
);
```

### Updating Records

Update an existing record:

```typescript
db.transact(
  db.tx.category[existingId].update({
    title: "Updated Title"
  })
);
```

### Deleting Records

Delete a record:

```typescript
db.transact(
  db.tx.category[categoryId].delete()
);
```

## Type Definitions

Define types for your entities to get TypeScript support:

```typescript
type Category = InstaQLEntity<AppSchema, "category">;
type Product = InstaQLEntity<AppSchema, "products">;
```

## Schema Structure

Our app uses the following key entities:

### Categories
```typescript
category: i.entity({
  image: i.string(),
  parentid: i.string(),
  title: i.string(),
})
```

### Products
```typescript
products: i.entity({
  attributes: i.string(),
  category: i.string(),
  collection: i.string(),
  title: i.string(),
  // ... other fields
})
```

### Inventory
```typescript
inventory: i.entity({
  available: i.number(),
  cost: i.number(),
  name: i.string(),
  sellprice: i.number(),
  // ... other fields
})
```

## Entity Relationships

InstantDB defines relationships between entities. Our schema has these key relationships:

- Products to Inventory (`inventoryProduct`)
- Categories to Inventory (`categoryInventory`)
- Products to Stores (`productsStore`)

Example of accessing related data:

```typescript
// Get all products with their inventory items
const { data } = db.useQuery({
  products: {
    inventory: {}
  }
});
```

## Loading and Error States

Always handle loading and error states:

```typescript
if (isLoading) return <Text>Loading...</Text>;
if (error) return <Text>Error: {error.message}</Text>;
```

## Best Practices

1. Generate IDs using the `id()` function, not manually
2. Use transactions for data modifications (`db.transact()`)
3. Define types for entities to get better TypeScript support
4. Filter data on the client side for simple queries
5. Use the schema relationships to access related data efficiently
