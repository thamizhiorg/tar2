import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context shape
type AgentContextType = {
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
};

// Create context with default values
const AgentContext = createContext<AgentContextType>({
  selectedAgent: "None",
  setSelectedAgent: () => {},
});

// Provider component that will wrap the app
export function AgentProvider({ children }: { children: ReactNode }) {
  const [selectedAgent, setSelectedAgent] = useState("None");

  return (
    <AgentContext.Provider value={{ selectedAgent, setSelectedAgent }}>
      {children}
    </AgentContext.Provider>
  );
}

// Hook to use the agent context
export function useAgent() {
  return useContext(AgentContext);
}