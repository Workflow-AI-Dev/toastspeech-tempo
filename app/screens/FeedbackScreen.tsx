import React from 'react';
import { View, StyleSheet, Text, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';

const FeedbackScreen = () => {
  // if (Platform.OS === 'web') {
  //   return (
  //     <View style={styles.container}>
  //       <Text>Feedback view not supported on web. Please use the mobile app.</Text>
  //     </View>
  //   );
  // }

  if (Platform.OS === 'web') {
  Linking.openURL('https://echozi.canny.io/feature-requests');
}

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://echozi.canny.io/feedback' }}
        style={{ flex: 1 }}
        startInLoadingState
      />
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
