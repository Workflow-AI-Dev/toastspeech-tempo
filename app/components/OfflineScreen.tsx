import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { styles } from "../styles/offline-screen-styles";

const OfflineScreen = () => {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState(
    "It seems we're disconnected. Please check your internet connection.",
  );

  const handleRetry = async () => {
    setChecking(true);
    setMessage("Checking the connection...");

    const state = await NetInfo.fetch();
    setTimeout(() => {
      if (state.isConnected && state.isInternetReachable !== false) {
        setMessage("Great news! You're back online!");
      } else {
        setMessage(
          "Still offline. Let's try again in a moment or check your Wi-Fi.",
        );
      }
      setChecking(false);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Lost!</Text>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRetry}
        disabled={checking}
      >
        {checking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Retry</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default OfflineScreen;
