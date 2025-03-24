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
      route: 'settings/attributes'  // Removed the leading slash
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Manage user permissions and roles',
      route: 'Users'
    },
    {
      id: 'store',
      title: 'Store Settings',
      description: 'Configure your store preferences',
      route: 'StoreSettings'
    },
    {
      id: 'integration',
      title: 'Integrations',
      description: 'Connect with other platforms and services',
      route: 'Integrations'
    }
  ];

  const navigateTo = (route) => {
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.optionsContainer}>
          {settingsOptions.map((option, index) => (
            <React.Fragment key={option.id}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => navigateTo(option.route)}
              >
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
