import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAgent } from '../context/AgentContext';
import { init } from "@instantdb/react-native";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";
const db = init({ appId: APP_ID });

interface HUDProps {
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
  showAgentList: boolean;
  setShowAgentList: (show: boolean) => void;
}

const agentOptions = [
  '🌌 Space',
  '📦 Products',
  '🀫 Inventory', 
  '🎈 Sales',
  '🥁 Posts',
  '🔗 Pages',
  '〰️ Path',
  '🎯 Analytics',
  '🎮 Settings',
  '🕹️ AI agent',
];

export default function HUD({ selectedAgent, setSelectedAgent, showAgentList, setShowAgentList }: HUDProps) {
  const router = useRouter();
  const agentContext = useAgent();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Initialize with Space agent
  useEffect(() => {
    if (!selectedAgent || selectedAgent === 'None') {
      const defaultAgent = '� Space';
      setSelectedAgent(defaultAgent);
      agentContext.setSelectedAgent(defaultAgent);
    }
  }, []);

  useEffect(() => {
    // Get the authenticated user's email
    const getUser = async () => {
      try {
        const user = await db.getAuth();
        if (user && user.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error("Error getting authenticated user:", error);
      }
    };
    
    getUser();
  }, []);

  const handleAgentTap = () => {
    setShowAgentList(!showAgentList);
  };

  const selectAgent = (agent: string) => {
    setSelectedAgent(agent);
    agentContext.setSelectedAgent(agent); // Update context
    setShowAgentList(false);
  };

  const handleLogout = async () => {
    try {
      await db.auth.signOut();
      router.replace("/"); // Navigate back to login screen
    } catch (error) {
      console.error("Error signing out:", error);
    }
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
            
            {/* Logout option */}
            <TouchableOpacity 
              style={[styles.agentOption, styles.logoutOption]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.agentOptionInner}>
                <Text style={styles.agentEmoji}>🚪</Text>
                <View>
                  <Text style={styles.agentName}>Logout</Text>
                  {userEmail && (
                    <Text style={styles.userEmail}>{userEmail}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
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
  logoutOption: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  userEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
