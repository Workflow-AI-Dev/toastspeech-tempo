import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "./context/AuthContext";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import GLogo from "../assets/images/glogo.webp";
import Toast from "react-native-toast-message";
import { useTheme, getThemeColors } from "./context/ThemeContext";

export default function SignInScreen() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const router = useRouter();
  const { signIn, signInWithGoogle, resetPassword } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [signInError, setSignInError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignIn = async () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    setSignInError("");
    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        setSignInError(
          typeof error === "string"
            ? error
            : error.message || "Invalid credentials",
        );
        setIsLoading(false);
        return;
      }
    } catch {
      setSignInError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      Toast.show({
        type: "error",
        text1: "Email Required",
        text2: "Please enter your email address.",
        position: "top",
        visibilityTime: 4000,
      });
      return;
    }
    if (!validateEmail(formData.email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
        position: "top",
        visibilityTime: 4000,
      });
      return;
    }

    try {
      const { error } = await resetPassword(formData.email);
      if (error) {
        Toast.show({
          type: "error",
          text1: "Email Not Found",
          text2:
            typeof error === "string"
              ? error
              : error.message || "This email is not registered.",
          position: "top",
          visibilityTime: 4000,
        });
      } else {
        router.push(
          `/reset-password?email=${encodeURIComponent(formData.email)}`,
        );
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again.",
        position: "top",
        visibilityTime: 4000,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error, user } = await signInWithGoogle();
      if (error) {
        Alert.alert(
          "Google Sign In",
          typeof error === "string"
            ? error
            : error.message || "Please try again",
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 32 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            style={{
              padding: 8,
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 40,
          }}
        >
          Welcome Back
        </Text>

        {/* Email */}
        <View style={{ marginBottom: 16 }}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            style={{
              backgroundColor: colors.surface,
              paddingVertical: 16,
              paddingLeft: 48,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: errors.email ? colors.error : colors.border,
              color: colors.text,
            }}
          />
          <Mail
            size={20}
            color={colors.textSecondary}
            style={{ position: "absolute", top: 18, left: 16 }}
          />
          {errors.email ? (
            <Text style={{ color: colors.error, marginTop: 4 }}>
              {errors.email}
            </Text>
          ) : null}
        </View>

        {/* Password */}
        <View style={{ marginBottom: 16 }}>
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={formData.password}
            onChangeText={(text) => {
              setFormData({ ...formData, password: text });
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            style={{
              backgroundColor: colors.surface,
              paddingVertical: 16,
              paddingLeft: 48,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: errors.password ? colors.error : colors.border,
              color: colors.text,
            }}
          />
          <Lock
            size={20}
            color={colors.textSecondary}
            style={{ position: "absolute", top: 18, left: 16 }}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", top: 16, right: 16 }}
          >
            {showPassword ? (
              <EyeOff size={22} color={colors.textSecondary} />
            ) : (
              <Eye size={22} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          {errors.password ? (
            <Text style={{ color: colors.error, marginTop: 4 }}>
              {errors.password}
            </Text>
          ) : null}
        </View>

        {/* Forgot Password */}
        <View style={{ alignItems: "flex-end", marginBottom: 32 }}>
          <TouchableOpacity
            onPress={handleForgotPassword}
            disabled={isLoading || isGoogleLoading}
          >
            <Text
              style={{
                color:
                  isLoading || isGoogleLoading ? colors.border : colors.primary,
                fontWeight: "600",
              }}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleSignIn}
          disabled={isLoading || isGoogleLoading}
          style={{
            backgroundColor: isLoading ? colors.border : colors.primary,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        {signInError ? (
          <Text
            style={{
              color: colors.error,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {signInError}
          </Text>
        ) : null}

        {/* Divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{ flex: 1, height: 1, backgroundColor: colors.border }}
          />
          <Text style={{ marginHorizontal: 12, color: colors.textSecondary }}>
            or
          </Text>
          <View
            style={{ flex: 1, height: 1, backgroundColor: colors.border }}
          />
        </View>

        {/* Google Sign In */}
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: isGoogleLoading
              ? colors.surface
              : colors.background,
            marginBottom: 24,
          }}
        >
          <Image
            source={GLogo}
            style={{ width: 20, height: 20, marginRight: 12 }}
            resizeMode="contain"
          />
          <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        {/* Sign Up */}
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Text style={{ color: colors.textSecondary }}>New here? </Text>
          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <Text style={{ color: colors.text, fontWeight: "600" }}>
              Create an account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
