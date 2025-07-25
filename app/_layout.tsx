import {
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform } from "react-native";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_TEMPO && Platform.OS === "web" && __DEV__) {
      try {
        const { TempoDevtools } = require("tempo-devtools");
        if (
          typeof window !== "undefined" &&
          window.location.hostname === "localhost"
        ) {
          TempoDevtools.init();
        }
      } catch (error) {
        console.warn("Failed to initialize TempoDevtools:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationThemeProvider value={DefaultTheme}>
          <Stack
            screenOptions={({ route }) => ({
              headerShown: !route.name.startsWith("tempobook"),
            })}
          >
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen
              name="subscription"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="speaker-mode"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ai-evaluation-summary"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="detailed-feedback"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="detailed-feedback-eval"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="evaluator-mode"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="practice-mode"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile-settings"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="performance-dashboard"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="feedback-library"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="evaluator-summary"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="evaluator-complete"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="reset-password"
              options={{ headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </NavigationThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
