import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "./styles/onboarding-styles";

const BG_COLOR = "#925bd2";
const router = useRouter();
const handleGetStarted = () => router.push("/sign-up");
const handleSignIn = () => router.push("/sign-in");
const handleTest = () => router.push("/test");

const InitialScreen: React.FC = () => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG_COLOR }]}>
      <View style={styles.innerContainer}>
        {/* Image fills available space */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/images/full.jpg")}
            style={styles.image}
            accessibilityLabel="Echozi mascot on a purple background"
          />
        </View>

        {/* Buttons anchored at bottom */}
        <View style={styles.buttonsContainer}>
          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={handleSignIn}
            activeOpacity={0.7}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={handleTest}
            activeOpacity={0.7}
          >
            <Text style={styles.getStartedText}>Google Auth Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default InitialScreen;
