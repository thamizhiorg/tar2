// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.any(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    inventory: i.entity({
      available: i.number(),
      committed: i.number(),
      cost: i.number(),
      dtime: i.number(),
      f1: i.string(),
      fulfillment: i.string(),
      location: i.string(),
      modifiers: i.string(),
      name: i.string(),
      qty: i.number(),
      rlevel: i.number(),
      sellprice: i.number(),
      sku: i.string(),
      status: i.string(),
      stock: i.number(),
      unavailable: i.number(),
      vname: i.string(),
      weight: i.number(),
    }),
    messages: i.entity({
      createdAt: i.string(),
      text: i.string(),
    }),
    ondevice: i.entity({
      ids: i.string(),
      title: i.string(),
    }),
    products: i.entity({
      attributes: i.string(),
      category: i.string(),
      collection: i.string(),
      f1: i.string(),
      f2: i.string(),
      f3: i.string(),
      f4: i.string(),
      f5: i.string(),
      metadata: i.string(),
      notes: i.string(),
      options: i.string(),
      pos: i.string(),
      schannels: i.string(),
      seo: i.string(),
      tags: i.string(),
      tax: i.string(),
      title: i.string(),
      type: i.string(),
      unit: i.string(),
      vendor: i.string(),
      web: i.boolean(),
    }),
    stores: i.entity({
      name: i.string(),
    }),
    todos: i.entity({
      createdAt: i.number(),
      done: i.boolean(),
      text: i.string(),
    }),
  },
  links: {
    inventoryProduct: {
      forward: {
        on: "inventory",
        has: "one",
        label: "product",
      },
      reverse: {
        on: "products",
        has: "many",
        label: "inventory",
      },
    },
    inventoryStore: {
      forward: {
        on: "inventory",
        has: "many",
        label: "store",
      },
      reverse: {
        on: "stores",
        has: "many",
        label: "inventory",
      },
    },
    ondevice$users: {
      forward: {
        on: "ondevice",
        has: "many",
        label: "$users",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "ondevice",
      },
    },
    productsStore: {
      forward: {
        on: "products",
        has: "many",
        label: "store",
      },
      reverse: {
        on: "stores",
        has: "many",
        label: "products",
      },
    },
    stores$users: {
      forward: {
        on: "stores",
        has: "many",
        label: "$users",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "stores",
      },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
