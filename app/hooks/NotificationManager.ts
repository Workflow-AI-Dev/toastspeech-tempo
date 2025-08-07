import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert, Platform } from 'react-native';

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Skip push registration on web
  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web.');
    return null;
  }

  // Check for physical device
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  try {
    // Check existing permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Exit if still not granted
    if (finalStatus !== 'granted') {
      Alert.alert('❌ Push notification permission not granted!');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('📱 Expo Push Token:', tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error('🔥 Error getting push token:', error);
    return null;
  }
}
