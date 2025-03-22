import { Text, View, TextInput, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import GlobalStyles, { Layout, Typography, Colors, Forms } from "../../styles/globalStyles";

export default function AIScreen() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Hello! How can I help you today?", isAI: true },
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, { id: Date.now(), text: message, isAI: false }]);
      setMessage("");
      // Add AI response logic here
    }
  };

  return (
    <View style={Layout.container}>
      <ScrollView style={styles.chatContainer}>
        {chatHistory.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.isAI ? styles.aiMessage : styles.userMessage,
            ]}
          >
            <Text style={[Typography.body, msg.isAI ? null : styles.userMessageText]}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor={Colors.text.tertiary}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Mixed approach: use global styles for common elements and local styles for specific components
const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  aiMessage: {
    backgroundColor: Colors.surface,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border.lighter,
  },
  userMessage: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  userMessageText: {
    color: Colors.background,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border.lighter,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 24,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});