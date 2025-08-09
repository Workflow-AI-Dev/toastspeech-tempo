import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { BASE_URL, GOOGLE_CLIENT_ID } from "../config/api";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../lib/supabase";
import {registerForPushNotificationsAsync} from "../hooks/NotificationManager"

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

    // These are routes that an unauthenticated user should be able to access.
    // Once authenticated, a user should generally not be sent back to these.
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

    // If there's no user and the current route is not an unauthenticated route, redirect to onboarding.
    if (!user && !isInUnauthenticatedGroup) {
      router.replace("/onboarding");
    }
    // If there's a user and the current route *is* an unauthenticated route, redirect to the main app.
    // We specifically allow "/subscription" here so the user isn't redirected if they just signed up.
    else if (
      user &&
      isInUnauthenticatedGroup &&
      currentSegment !== "subscription"
    ) {
      router.replace("/");
    }
  }, [user, segments, loading]);

  const signUp = async (
    email: string,
    password: string,
    userData: any,
  ): Promise<{ error: any }> => {
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
          store_audio: userData.store_audio,
          store_video: userData.store_video,
        }),
      });

      const data = await res.json();
      if (!res.ok) return { error: data.detail || "Signup failed" };

      // If signup returns a token, store it and authenticate the user
      if (data.access_token) {
        const token = data.access_token;
        await AsyncStorage.setItem("auth_token", token);
        await AsyncStorage.setItem("plan", data.current_plan_id);

        // Fetch user data
        const meRes = await fetch(`${BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userDataResponse = await meRes.json();
        if (meRes.ok) {
          setUser(userDataResponse);
          const expoToken = await registerForPushNotificationsAsync();
          if (expoToken) {
            await updatePushTokenOnBackend(expoToken);
          }
        }
      } else {
        // If no token returned, try to sign in automatically
        const signInResult = await signIn(email, password);
        if (signInResult.error) {
          return { error: signInResult.error };
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: any }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return { error: data.detail || "Login failed" };

      const token = data.access_token;
      await AsyncStorage.setItem("auth_token", token);

      const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = await meRes.json();
      await AsyncStorage.setItem("plan", userData.current_plan_id);
      if (meRes.ok) {
        setUser(userData);

        const expoToken = await registerForPushNotificationsAsync();
        if (expoToken) {
          await updatePushTokenOnBackend(expoToken);
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
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

  const signInWithGoogle = async (): Promise<{ error: any }> => {
    try {
      console.log("Google sign-in initiated");

      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
      });
      console.log("Redirect URI:", redirectUri);

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ["openid", "profile", "email"],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      });

      await request.makeAuthUrlAsync(discovery);
      console.log("Auth URL created");

      const result = await request.promptAsync(discovery);

      console.log("Google Auth Result:", result);

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
        console.log("Backend response:", data);

        if (!res.ok) return { error: data.detail || "Google sign in failed" };

        await AsyncStorage.setItem("auth_token", data.access_token);

        setUser(data.user); // optional here, but also return for explicit use
        const expoToken = await registerForPushNotificationsAsync();
        if (expoToken) {
          await updatePushTokenOnBackend(expoToken);
        }
        return { error: null, user: data.user };
      }
    } catch (error) {
      console.log("Google sign-in error", error);
      return { error };
    }
  };

  const signUpWithGoogle = async (userData?: any): Promise<{ error: any }> => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
      });

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ["openid", "profile", "email"],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      });

      await request.makeAuthUrlAsync(discovery);
      const result = await request.promptAsync(discovery);

      if (result.type === "success") {
        const res = await fetch(`${BASE_URL}/auth/google-signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: result.params.code,
            code_verifier: request.codeVerifier,
            redirect_uri: redirectUri,
          }),
        });

        const data = await res.json();
        if (!res.ok) return { error: data.detail || "Google sign up failed" };

        await AsyncStorage.setItem("auth_token", data.access_token);
        // setUser(data.user);
        const expoToken = await registerForPushNotificationsAsync();
        if (expoToken) {
          await updatePushTokenOnBackend(expoToken);
        }
        return { error: null, user: data.user };
      } else {
        return { error: "Google sign up was cancelled" };
      }
    } catch (error) {
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
