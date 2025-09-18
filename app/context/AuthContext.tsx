import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { BASE_URL } from "../api";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { registerForPushNotificationsAsync } from "../hooks/NotificationManager";
import { Platform } from "react-native";
import Constants from "expo-constants";

const isWeb = Platform.OS === "web";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: any;
  loading: boolean;
  setUser: (user: any) => void;
  signUp: (
    email: string,
    password: string,
    userData: any,
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signUpWithGoogle: (userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    userInfoEndpoint: "https://www.googleapis.com/oauth2/v2/userinfo",
  };

  const updatePushTokenOnBackend = async (expoPushToken: string) => {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) return;

    await fetch(`${BASE_URL}/notifications/register-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ expo_push_token: expoPushToken }),
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        console.log(userData);
        await AsyncStorage.setItem("plan", userData.current_plan_id);

        const expoToken = await registerForPushNotificationsAsync();
        if (expoToken) {
          await updatePushTokenOnBackend(expoToken);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    const unauthenticatedRoutes = [
      "(auth)",
      "onboarding",
      "sign-in",
      "sign-up",
      "reset-password",
    ];

    const currentSegment = segments[0];
    const isInUnauthenticatedGroup =
      unauthenticatedRoutes.includes(currentSegment);

    const checkJustSignedUp = async () => {
      const justSignedUp = await AsyncStorage.getItem("just_signed_up");
      if (user && justSignedUp) {
        await AsyncStorage.removeItem("just_signed_up");
        router.replace("/trial"); // redirect to trial first
        return;
      }

      if (!user && !isInUnauthenticatedGroup) {
        router.replace("/onboarding");
      } else if (
        user &&
        isInUnauthenticatedGroup &&
        currentSegment !== "subscription"
      ) {
        router.replace("/"); // default post-login route
      }
    };

    checkJustSignedUp();
  }, [user, segments, loading]);

  const signUp = async (
    email: string,
    password: string,
    userData: any,
  ): Promise<{ error: any; userId?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: userData.name,
          gender: userData.gender,
          age_group: userData.ageGroup,
          profession: userData.profession,
          purposes: userData.purposes,
          custom_purpose: userData.customPurpose,
          avatar: userData.avatar,
          avatar_style: userData.avatar_style,
          store_audio: userData.store_audio,
          store_video: userData.store_video,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.detail || "Signup failed" };
      }

      return { error: null, userId: data.user_id };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: any }> => {
    try {
      // Step 1: Sign in and get the new token
      const res = await fetch(`${BASE_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.detail || "Login failed" };
      }

      const token = data.access_token;
      console.log(token);

      // Step 2: Store the token in AsyncStorage
      await AsyncStorage.setItem("auth_token", token);

      // Step 3: Use the token directly for the subsequent API call
      const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`, // Use the token variable directly
        },
      });

      const userData = await meRes.json();
      if (meRes.ok) {
        setUser(userData);
        await AsyncStorage.setItem("plan", userData.current_plan_id);

        const expoToken = await registerForPushNotificationsAsync();
        if (expoToken) {
          await updatePushTokenOnBackend(expoToken);
        }
      } else {
        console.error("Failed to fetch user data after sign-in");
        return { error: userData.detail || "Failed to fetch user data" };
      }

      return { error: null };
    } catch (error) {
      console.error("Sign-in failed:", error);
      return { error: "An unexpected error occurred." };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("auth_token");
      setUser(null);
      router.replace("/onboarding");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: any }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.detail || "Email verification failed" };
      }

      return { error: null };
    } catch (error) {
      return { error: "Failed to verify email. Please try again." };
    }
  };

  const updatePassword = async (
    email: string,
    password: string,
  ): Promise<{ error: any }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.detail || "Password update failed" };
      }

      return { error: null };
    } catch (error) {
      return { error: "Failed to update password. Please try again." };
    }
  };

  const fetchGoogleClientId = async (platform: "web" | "android") => {
    const res = await fetch(
      `${BASE_URL}/auth/google-client-id?platform=${platform}`,
    );
    if (!res.ok) throw new Error("Failed to fetch Google client ID");
    const data = await res.json();
    return data.client_id;
  };

  const signInWithGoogle = async (): Promise<{ error: any; user?: any }> => {
    try {
      console.log("Google sign-in initiated");

      const platform = isWeb ? "web" : "android";
      const clientId = await fetchGoogleClientId(platform);

      const redirectUri = isWeb
        ? AuthSession.makeRedirectUri({ useProxy: __DEV__ })
        : AuthSession.makeRedirectUri({
            useProxy: false,
            native:
              "com.googleusercontent.apps.278297929608-kosre9rlgcvpr7tpmbhagr2aphjjskth.apps.googleusercontent.com:/oauthredirect",
          });

      console.log(redirectUri);

      const request = new AuthSession.AuthRequest({
        clientId,
        redirectUri,
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      });

      const result = await request.promptAsync(discovery, {
        useProxy: isWeb ? __DEV__ : false,
      });

      if (result.type === "success") {
        const res = await fetch(`${BASE_URL}/auth/google-signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: result.params.code,
            code_verifier: request.codeVerifier,
            redirect_uri: redirectUri,
          }),
        });

        const data = await res.json();
        if (!res.ok) return { error: data.detail || "Google sign in failed" };

        await AsyncStorage.setItem("auth_token", data.access_token);
        setUser(data.user);

        const expoToken = await registerForPushNotificationsAsync();
        if (expoToken) await updatePushTokenOnBackend(expoToken);

        return { error: null, user: data.user };
      }

      return { error: "Google sign in was cancelled" };
    } catch (error) {
      console.error("Google sign-in error", error);
      return { error };
    }
  };

  const signUpWithGoogle = async (
    userData?: any,
  ): Promise<{ error: any; user?: any }> => {
    try {
      console.log("Google sign-up initiated");

      const platform = isWeb ? "web" : "android";
      const clientId = await fetchGoogleClientId(platform);

      const redirectUri = isWeb
        ? AuthSession.makeRedirectUri({ useProxy: __DEV__ })
        : AuthSession.makeRedirectUri({
            useProxy: false,
            native:
              "com.googleusercontent.apps.278297929608-kosre9rlgcvpr7tpmbhagr2aphjjskth.apps.googleusercontent.com:/oauthredirect",
          });

      console.log(redirectUri);

      const request = new AuthSession.AuthRequest({
        clientId,
        redirectUri,
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      });

      const result = await request.promptAsync(discovery, {
        useProxy: isWeb ? __DEV__ : false,
      });

      if (result.type === "success") {
        const res = await fetch(`${BASE_URL}/auth/google-signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: result.params.code,
            code_verifier: request.codeVerifier,
            redirect_uri: redirectUri,
            ...userData,
          }),
        });

        const data = await res.json();
        if (!res.ok) return { error: data.detail || "Google sign up failed" };

        await AsyncStorage.setItem("auth_token", data.access_token);
        await AsyncStorage.setItem("plan", data.user.current_plan_id);

        const expoToken = await registerForPushNotificationsAsync();
        if (expoToken) await updatePushTokenOnBackend(expoToken);

        return { error: null, user: data.user };
      }

      return { error: "Google sign up was cancelled" };
    } catch (error) {
      console.error("Google sign-up error", error);
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    setUser,
    signUp,
    signIn,
    signInWithGoogle,
    signUpWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
