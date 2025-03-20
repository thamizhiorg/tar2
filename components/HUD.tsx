import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

interface HUDProps {
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
  showAgentList: boolean;
  setShowAgentList: (show: boolean) => void;
}

const agentOptions = [
  '🌌 Space',
  '🎈 Sales',
  '📦 Products',
  '🀫 Inventory',
  '🥁 Posts',
  '🔗 Pages',
  '〰️ Path',
  '🎯 Analytics',
  '🎮 Settings',
  '🕹️ AI agent',
];

export default function HUD({ selectedAgent, setSelectedAgent, showAgentList, setShowAgentList }: HUDProps) {
  const router = useRouter();

  const handleAgentTap = () => {
    setShowAgentList(!showAgentList);
  };

  const selectAgent = (agent: string) => {
    setSelectedAgent(agent);
    setShowAgentList(false);
  };

  const renderAgentOption = (agent: string) => {
    const emoji = agent.split(' ')[0];
    const name = agent.substring(emoji.length + 1);
    
    return (
      <View style={styles.agentOptionInner}>
        <Text style={styles.agentEmoji}>{emoji}</Text>
        <Text style={styles.agentName}>{name}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.hudContainer}>
        <TouchableOpacity 
          style={styles.agentContainer}
          onPress={handleAgentTap}
        >
          <Text style={styles.agentText}>{selectedAgent}</Text>
        </TouchableOpacity>
      </View>
      
      {showAgentList && (
        <View style={styles.fullScreenOverlay}>
          <View style={styles.overlayHeader}>
            <Text style={styles.overlayTitle}>Select Agent</Text>
            <TouchableOpacity onPress={() => setShowAgentList(false)}>
              <Text style={styles.backButton}>⟵</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.agentListContent}>
            {agentOptions.map((agent, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.agentOption}
                onPress={() => selectAgent(agent)}
                activeOpacity={0.7}
              >
                {renderAgentOption(agent)}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
    zIndex: 1000,
  },
  hudContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  agentContainer: {
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  agentText: {
    fontSize: 14,
    color: '#333',
  },
  agentList: {
    flex: 1,
  },
  agentListContent: {
    paddingVertical: 0,
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'white',
    zIndex: 9999,
    elevation: 10,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#999999',
    padding: 5,
  },
  agentOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: 'white',
  },
  agentOptionInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentEmoji: {
    fontSize: 22,
    marginRight: 16,
    width: 30,
  },
  agentName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  agentOptionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});
