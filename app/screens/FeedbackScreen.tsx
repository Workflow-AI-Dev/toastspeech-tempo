import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { BASE_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FeedbackScreen = () => {
  const [cannyUrl, setCannyUrl] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const auth_token = await AsyncStorage.getItem("auth_token");

        if (!auth_token) {
          console.error("❌ Auth token not found.");
          return;
        }

        const response = await fetch(`${BASE_URL}/feedback/token`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const sso_token = await response.text();
        
        const canny_url = `https://webview.canny.io?boardToken=f34431d8-57ac-e426-c709-9985d5f0c646&ssoToken=${sso_token}`;
        setCannyUrl(canny_url);
      } catch (err) {
        console.error("❌ Failed to get token:", err);
      }
    };
    fetchToken();
  }, []);

  // Use a single return statement to handle both platforms
  if (Platform.OS === 'web') {
    return (
        <View style={styles.container}>
            <Text>Redirecting to Canny...</Text>
            {/* The useEffect will handle the URL and this component will not be used in APK */}
            <a href="https://echozi.canny.io/feature-requests" target="_blank" rel="noopener noreferrer" style={{color: 'blue'}}>
                Click here to go to the feedback board
            </a>
        </View>
    );
  }

  // This code block is for iOS/Android only
  return (
    <View style={styles.container}>
      {cannyUrl ? (
        <WebView
          source={{ uri: cannyUrl }}
          style={{ flex: 1 }}
          startInLoadingState
        />
      ) : (
        <Text>Loading Canny...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default FeedbackScreen;