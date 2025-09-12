import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { BASE_URL } from "../api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

const FeedbackScreen = () => {
  const [cannyUrl, setCannyUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const auth_token = await AsyncStorage.getItem("auth_token");
        if (!auth_token) return console.error("Auth token not found");

        const response = await fetch(`${BASE_URL}/feedback/token`, {
          method: "GET",
          headers: { Authorization: `Bearer ${auth_token}` },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const ssoToken = data.sso_token;

        const url = `https://webview.canny.io?boardToken=f34431d8-57ac-e426-c709-9985d5f0c646&ssoToken=${ssoToken}`;
        console.log("Loading Canny mobile widget:", url);
        setCannyUrl(url);
      } catch (err) {
        console.error("Failed to get SSO token:", err);
      }
    };

    fetchToken();
  }, []);

  if (!cannyUrl) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <WebView
        source={{ uri: cannyUrl }}
        style={{ flex: 1 }}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        originWhitelist={["*"]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
        onError={(e) => console.error("WebView error:", e.nativeEvent)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FeedbackScreen;
