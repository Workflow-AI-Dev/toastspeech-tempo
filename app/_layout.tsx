import {
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import "react-native-reanimated";
import "../global.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import OfflineScreen from "./components/OfflineScreen";
import { useNetworkStatus } from './hooks/useNetworkStatus';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const isConnected = useNetworkStatus();

  // Store PostHog instance here
  const [posthogReady, setPosthogReady] = useState(false);
  const posthogRef = useRef(null);

  // Init PostHog
  useEffect(() => {
    async function initPostHog() {
      if (Platform.OS === "web") {
        const posthogModule = await import("posthog-js");
        posthogRef.current = posthogModule.default;
        posthogRef.current.init("phc_CxsXAjKygNnvbinadZkNfINpJM68vnzGPvvuu9Ok2tV", {
          api_host: "https://app.posthog.com",
        });
      } else {
        const { PostHog } = await import("posthog-react-native");
        posthogRef.current = new PostHog("phc_CxsXAjKygNnvbinadZkNfINpJM68vnzGPvvuu9Ok2tV", {
          host: "https://app.posthog.com",
          captureApplicationLifecycleEvents: false,
        });
      }
      setPosthogReady(true);
    }

    initPostHog();
  }, []);

  // Send app_opened
  useEffect(() => {
    if (!posthogReady) return;

    posthogRef.current.capture("app_opened", {
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        posthogRef.current.capture("app_opened");
      }
    });

    return () => subscription.remove();
  }, [posthogReady]);

  // Send engaged_1_min after delay
  useEffect(() => {
    if (!posthogReady) return;

    const timer = setTimeout(() => {
      posthogRef.current.capture("engaged_1_min", {
        timestamp: new Date().toISOString(),
      });
    }, 1 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [posthogReady]);

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

  // Show offline fallback if not connected
  if (!isConnected) {
    return <OfflineScreen />;
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
            <Stack.Screen
              name="trial"
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
            <Stack.Screen
              name="feedback"
              options={{ headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </NavigationThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
