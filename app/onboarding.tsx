import React from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from "expo-router";

const BG_COLOR = '#925bd2';
const router = useRouter();
const handleGetStarted = () => router.push("/sign-up");
const handleSignIn = () => router.push("/sign-in");

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
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  innerContainer: {
    flex: 1,
  },
  imageContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonsContainer: {
    padding: 20,
    width: '100%',
  },
  getStartedBtn: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 50,
    marginBottom: 12,
  },
  getStartedText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: 'black',
  },
  signInBtn: {
    borderWidth: 2,
    borderColor: 'white',
    padding: 16,
    borderRadius: 50,
  },
  signInText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
  },
});

export default InitialScreen;
