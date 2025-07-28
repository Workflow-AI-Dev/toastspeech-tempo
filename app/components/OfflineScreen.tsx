import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const OfflineScreen = () => {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("It seems we're disconnected. Please check your internet connection.");

  const handleRetry = async () => {
    setChecking(true);
    setMessage("Checking the connection...");

    const state = await NetInfo.fetch();
    setTimeout(() => {
      if (state.isConnected && state.isInternetReachable !== false) {
        setMessage("Great news! You're back online!");
      } else {
        setMessage("Still offline. Let's try again in a moment or check your Wi-Fi.");
      }
      setChecking(false);
    }, 1200);
  };
  

  return (
    <View style={styles.container}>
      {/* Optional: Add an illustration related to 'offline' or 'connection issues' */}
      {/* <Image source={require('../../assets/images/offline.gif')} style={styles.image} /> */}

      <Text style={styles.title}>Network Lost!</Text>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity style={styles.button} onPress={handleRetry} disabled={checking}>
        {checking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Retry</Text>
        )}
      </TouchableOpacity>
{/* 
      <Text style={styles.hintText}>
        <Text style={{ fontWeight: 'bold' }}>Tip:</Text> Ensure Wi-Fi or mobile data is enabled.
      </Text> */}
    </View>
  );
};

export default OfflineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF', // Light purple-ish, soft background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 30,
    tintColor: '#8B5CF6', // Optional: apply a tint if using an SVG or simple illustration
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 15,
    color: '#3B82F6', // A vibrant blue for the main title
    textAlign: 'center',
  },
  message: {
    fontSize: 17,
    color: '#0284C7', // A slightly darker blue for the message
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#000000ff', // A strong purple for the button
    paddingHorizontal: 35,
    paddingVertical: 14,
    borderRadius: 28, // More rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6, // Stronger shadow for Android
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700', // Bolder text
    fontSize: 17,
  },
  hintText: {
    fontSize: 14,
    color: '#F59E0B', // An accent orange for a helpful tip
    textAlign: 'center',
    marginTop: 15,
  },
});