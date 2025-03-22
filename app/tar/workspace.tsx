import * as React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import ProductsComponent from '../agents/products';
import InventoryComponent from '../agents/inventory';
import ProductComponent from '../agents/product';
import { useAgent } from '../../context/AgentContext';
import GlobalStyles, { Layout, Typography } from '../../styles/globalStyles';

export default function WorkspacePage() {
  // Use the AgentContext to get the selected agent
  const { selectedAgent } = useAgent();
  
  // Render the appropriate component based on the selected agent
  if (selectedAgent === "📦 Products") {
    return <ProductsComponent />;
  } else if (selectedAgent === "🀫 Inventory") {
    return <InventoryComponent />;
  } else if (selectedAgent === "🎈 Sales") {
    return <ProductComponent />;
  }

  // Otherwise render the default workspace screen
  return (
    <SafeAreaView style={Layout.container}>
      <View style={[Layout.centered, Layout.padding]}>
        <Text style={Typography.title}>Workspace</Text>
        <Text style={Typography.caption}>Manage your workspace here</Text>
        {selectedAgent && selectedAgent !== "None" && (
          <Text style={Typography.small}>Selected agent: {selectedAgent}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
