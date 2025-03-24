import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SettingsComponent = () => {
  const navigation = useNavigation();

  const settingsOptions = [
    {
      id: 'attributes',
      title: 'Attributes',
      description: 'Manage options, modifiers, categories, and more',
      icon: 'list-outline',
      route: 'Attributes'
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Manage user permissions and roles',
      icon: 'people-outline',
      route: 'Users'
    },
    {
      id: 'store',
      title: 'Store Settings',
      description: 'Configure your store preferences',
      icon: 'storefront-outline',
      route: 'StoreSettings'
    },
    {
      id: 'integration',
      title: 'Integrations',
      description: 'Connect with other platforms and services',
      icon: 'git-network-outline',
      route: 'Integrations'
    }
  ];

  const navigateTo = (route) => {
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Configure your workspace</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.optionsContainer}>
          {settingsOptions.map((option, index) => (
            <React.Fragment key={option.id}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => navigateTo(option.route)}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name={option.icon} size={22} color="#007AFF" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
              </TouchableOpacity>
              {index < settingsOptions.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  optionsContainer: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    width: '100%',
  },
});

export default SettingsComponent;
