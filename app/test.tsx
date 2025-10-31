import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Button,
  ScrollView,
} from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const Index = () => {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "876185167765-b7l8fkukoak3085aq3i0k3bfho4v2clt.apps.googleusercontent.com",
      iosClientId:
        "876185167765-89q5sf896jlcnen85uafhj6nsfo6dcl6.apps.googleusercontent.com",
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const response = await GoogleSignin.signIn();
      setUserInfo(response.data);
      console.log("✅ User Info:", response.data);
    } catch (error) {
      console.log("❌ Google Sign-In Error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("Cancelled", "User cancelled the sign-in process.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("Wait", "Sign-In already in progress.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Play Services not available or outdated.");
      } else {
        Alert.alert("Error", "Something went wrong during sign-in.");
      }
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUserInfo(null);
      Alert.alert("Signed out", "You have been signed out successfully.");
    } catch (error) {
      console.error("Google Sign-Out Error:", error);
      Alert.alert("Error", error?.message || "Failed to sign out");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Google Sign-In Debug</Text>

      {!userInfo ? (
        <GoogleSigninButton
          style={styles.signInButton}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleSignIn}
        />
      ) : (
        <View style={styles.debugBox}>
          <Text style={styles.sectionTitle}>User Info</Text>
          <Text style={styles.codeBlock}>
            {JSON.stringify(userInfo, null, 2)}
          </Text>
          <Button title="Sign Out" onPress={handleGoogleSignOut} />
        </View>
      )}
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  signInButton: {
    width: 220,
    height: 48,
  },
  debugBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  codeBlock: {
    fontFamily: "monospace",
    fontSize: 13,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    color: "#111",
  },
});
