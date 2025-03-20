import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import ProductsComponent from '../agents/products';
import { useAgent } from '../../context/AgentContext';

export default function WorkspacePage() {
  // Use the AgentContext to get the selected agent
  const { selectedAgent } = useAgent();
  
  // Render the Products component if the selected agent is "📦 Products"
  if (selectedAgent === "📦 Products") {
    return <ProductsComponent />;
  }

  // Otherwise render the default workspace screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Workspace</Text>
        <Text style={styles.subtitle}>Manage your workspace here</Text>
        {selectedAgent && selectedAgent !== "None" && (
          <Text style={styles.agentInfo}>Selected agent: {selectedAgent}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  agentInfo: {
    fontSize: 14,
    color: '#888888',
    marginTop: 10,
  },
});
