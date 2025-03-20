import React, { useState, useEffect, useRef } from "react";
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Stack, useRouter } from "expo-router";
import { init } from "@instantdb/react-native";

const APP_ID = "84f087af-f6a5-4a5f-acbc-bc4008e3a725";
const db = init({ appId: APP_ID });

function AnimatedSubtext() {
  const words = ["stores", "bookings", "commerce", "posts", "pages", "AI agents"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(20);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500, // faster fade in
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500, // faster slide
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500, // faster fade out
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 500, // faster slide
            useNativeDriver: true,
          }),
        ]).start();
      }, 1500); // show text for shorter time
    };

    animate();
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
      animate();
    }, 2500); // shorter total cycle

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.Text
      style={[
        styles.animatedText,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {words[currentIndex]}
    </Animated.Text>
  );
}

export default function App() {
  const [sentEmail, setSentEmail] = useState("");

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topContainer}>
        <View style={styles.iconContainer}>
          <View style={styles.iconSquare}>
            <AnimatedSubtext />
          </View>
          <View style={styles.iconRow}>
            <View style={styles.iconTriangle} />
            <View style={styles.iconCircle} />
          </View>
        </View>
        <Text style={styles.logoText}>tar.</Text>
      </View>
      <View style={styles.bottomContainer}>
        {!sentEmail ? (
          <EmailStep onSendEmail={setSentEmail} />
        ) : (
          <CodeStep sentEmail={sentEmail} />
        )}
      </View>
    </View>
  );
}

function EmailStep({ onSendEmail }: { onSendEmail: (email: string) => void }) {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    onSendEmail(email);
    db.auth.sendMagicCode({ email }).catch((err) => {
      alert("Uh oh :" + err.body?.message);
      onSendEmail("");
    });
  };

  return (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Send Code</Text>
      </TouchableOpacity>
    </View>
  );
}

function CodeStep({ sentEmail }: { sentEmail: string }) {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    db.auth.signInWithMagicCode({ email: sentEmail, code })
      .then(() => {
        // Navigate to AI screen on successful verification
        router.push("/tar/ai");
      })
      .catch((err) => {
        setCode("");
        alert("Uh oh :" + err.body?.message);
      });
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Verify</Text>
      <Text style={styles.description}>
        Code sent to <Text style={styles.bold}>{sentEmail}</Text>
      </Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="123456..."
        keyboardType="number-pad"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: 32,
    justifyContent: "flex-end",
    alignItems: "center",  // Add this to center horizontally
  },
  formContainer: {
    width: "100%",
    maxWidth: 320,
    gap: 16,
    alignItems: "center",  // Add this to center contents
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    color: "#666",
    marginBottom: 16,
    textAlign: "center",  // Add this to center text
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,  // Changed from 4 to 10
    marginBottom: 16,
    width: "100%",  // Add this to maintain full width
  },
  button: {
    backgroundColor: "#f5f5f5",  // Changed from #2563eb to light grey
    padding: 12,
    borderRadius: 10,  // Changed from 4 to 10
    alignItems: "center",
    width: "100%",  // Add this to maintain full width
  },
  buttonText: {
    color: "#666",  // Changed from white to grey
    fontWeight: "bold",
  },
  errorText: {
    color: "#ef4444",
  },
  bold: {
    fontWeight: "bold",
  },
  animatedText: {
    fontSize: 10, // matching size
    fontWeight: "200",
    fontFamily: "monospace",
    color: '#fff',
    letterSpacing: 2,
    textAlign: "center", // Center text horizontally
  },
  logoText: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 0, // Changed from 32 to 0
    fontFamily: "PressStart2P", // Changed from monospace to pixel font
    letterSpacing: 0,
    textTransform: "lowercase",
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: "#ccc",
    borderRadius: 10, // Added rounded border
    padding: 8, // Added padding for better appearance
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 80,
    marginTop: 8,
  },
  iconSquare: {
    width: 80, // Adjusted width to fit the animated text
    height: 50, // Adjusted height to fit the animated text
    backgroundColor: "blue",
    borderRadius: 5,  // Added corner radius
    justifyContent: "center",
    alignItems: "center",
  },
  iconTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 24,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "orange",
    transform: [{ rotate: '90deg' }],

  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "red",
  },
});