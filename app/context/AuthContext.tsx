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
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup =
      segments[0] === "(auth)" ||
      segments[0] === "onboarding" ||
      segments[0] === "sign-in" ||
      segments[0] === "sign-up";

    if (!user && !inAuthGroup) {
      router.replace("/onboarding");
    } else if (user && inAuthGroup) {
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
        }),
      });

      const data = await res.json();
      if (!res.ok) return { error: data.detail || "Signup failed" };

      // If signup returns a token, store it and authenticate the user
      if (data.access_token) {
        const token = data.access_token;
        await AsyncStorage.setItem("auth_token", token);

        // Fetch user data
        const meRes = await fetch(`${BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userDataResponse = await meRes.json();
        if (meRes.ok) {
          setUser(userDataResponse);
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
      if (meRes.ok) {
        setUser(userData);
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

  const resetPassword = async (email: string) => {
    return { error: "Reset password not supported yet." };
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
