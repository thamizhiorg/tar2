import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { Colors, Typography, Layout } from '../../styles/globalStyles';

export default function SpaceAgent() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[Typography.title, styles.welcome]}>Agent Space</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Agents</Text>
          <View style={styles.agentList}>
            <View style={styles.agentItem}>
              <Text style={styles.agentIcon}>📦</Text>
              <View>
                <Text style={styles.agentName}>Products</Text>
                <Text style={styles.agentDesc}>Manage your product catalog</Text>
              </View>
            </View>
            <View style={styles.agentItem}>
              <Text style={styles.agentIcon}>🀫</Text>
              <View>
                <Text style={styles.agentName}>Inventory</Text>
                <Text style={styles.agentDesc}>Track stock and availability</Text>
              </View>
            </View>
            <View style={styles.agentItem}>
              <Text style={styles.agentIcon}>🎈</Text>
              <View>
                <Text style={styles.agentName}>Sales</Text>
                <Text style={styles.agentDesc}>Monitor sales performance</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcome: {
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: Colors.text.primary,
  },
  agentList: {
    gap: 15,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  agentIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  agentDesc: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
