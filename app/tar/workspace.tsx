import * as React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import ProductsComponent from '../agents/products';
import InventoryComponent from '../agents/inventory';
import ProductComponent from '../agents/product';
import SpaceComponent from '../agents/space';
import SettingsComponent from '../agents/settings';
import { useAgent } from '../../context/AgentContext';
import GlobalStyles, { Layout, Typography } from '../../styles/globalStyles';

export default function WorkspacePage() {
  const { selectedAgent } = useAgent();
  
  // Render components based on selected agent
  switch(selectedAgent) {
    case "📦 Products":
      return <ProductsComponent />;
    case "🀫 Inventory":
      return <InventoryComponent />;
    case "🎈 Sales":
      return <ProductComponent />;
    case "🌌 Space":
      return <SpaceComponent />;
    case "🎮 Settings":
      return <SettingsComponent />;
    default:
      // If no agent is selected or "Space" is selected, show Space agent
      return <SpaceComponent />;
  }
}
