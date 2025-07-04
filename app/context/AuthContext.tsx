import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";

interface AuthContextType {
  user: any;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData: any,
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const BASE_URL = "http://127.0.0.1:8000";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

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

      router.push("/subscription");
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

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
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
