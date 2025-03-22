import React, { useState, useEffect, useRef } from "react";
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Animated, BackHandler } from "react-native";
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const user = await db.getAuth();
        if (user && user.email) {
          // User is authenticated, redirect to the AI screen
          router.replace("/tar/workspace");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // Check if we're in the authentication flow
        if (sentEmail) {
          setSentEmail("");
          return true; // Prevent default behavior
        }
        return false; // Let the default behavior happen
      }
    );

    return () => backHandler.remove();
  }, [sentEmail]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      alert("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await db.auth.sendMagicCode({ email });
      onSendEmail(email);
    } catch (err) {
      alert("Error sending verification code: " + (err.body?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
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
        editable={!isSubmitting}
      />
      <TouchableOpacity 
        style={[styles.button, isSubmitting && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>{isSubmitting ? "Sending..." : "Send Code"}</Text>
      </TouchableOpacity>
    </View>
  );
}

function CodeStep({ sentEmail }: { sentEmail: string }) {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!code) {
      alert("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
      // Navigate to AI screen on successful verification
      router.replace("/tar/workspace");
    } catch (err) {
      setCode("");
      alert("Verification failed: " + (err.body?.message || "Invalid code"));
    } finally {
      setIsVerifying(false);
    }
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
        editable={!isVerifying}
      />
      <TouchableOpacity 
        style={[styles.button, isVerifying && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={isVerifying}
      >
        <Text style={styles.buttonText}>{isVerifying ? "Verifying..." : "Verify"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  disabledButton: {
    backgroundColor: "#e0e0e0",
    opacity: 0.7,
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