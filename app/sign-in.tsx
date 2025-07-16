import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "./context/AuthContext";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from "lucide-react-native";
import GLogo from "../assets/images/glogo.webp";
import { Image } from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        Alert.alert("Sign In Failed", error.message);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Try again.");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }

    Alert.alert("Reset Password", "We'll send a reset link to your email.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send Link",
        onPress: async () => {
          const { error } = await resetPassword(formData.email);
          if (error) {
            Alert.alert("Error", error.message);
          } else {
            Alert.alert("Check Email", "Password reset link sent.");
          }
        },
      },
    ]);
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
      } else {
        setUser(user); // Set global user state
        router.push("/"); // Redirect to home/dashboard
      }
    } catch {
      Alert.alert(
        "Error",
        "Something went wrong with Google sign in. Try again.",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            className="p-2 rounded-full border border-gray-300"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#111" />
          </TouchableOpacity>
        </View>

        <Text className="text-2xl font-semibold text-gray-900 mb-10">
          Welcome Back
        </Text>

        {/* Email */}
        <View className="relative mb-2">
          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            className={`bg-[#f6f7fb] px-12 py-4 rounded-xl border text-gray-900 ${
              errors.email ? "border-red-500" : "border-gray-200"
            }`}
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
          />
          <Mail
            size={20}
            color="#6b7280"
            style={{ position: "absolute", top: 18, left: 16 }}
          />
          {errors.email ? (
            <Text className="text-red-500 text-sm mt-1 ml-1">
              {errors.email}
            </Text>
          ) : null}
        </View>

        <View className="relative mb-2">
          <TextInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            className={`bg-[#f6f7fb] px-12 py-4 rounded-xl border text-gray-900 ${
              errors.password ? "border-red-500" : "border-gray-200"
            }`}
            value={formData.password}
            onChangeText={(text) => {
              setFormData({ ...formData, password: text });
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
          />
          <Lock
            size={20}
            color="#6b7280"
            style={{ position: "absolute", top: 18, left: 16 }}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", top: 16, right: 16 }}
          >
            {showPassword ? (
              <EyeOff size={22} color="#6b7280" />
            ) : (
              <Eye size={22} color="#6b7280" />
            )}
          </TouchableOpacity>
          {errors.password ? (
            <Text className="text-red-500 text-sm mt-1 ml-1">
              {errors.password}
            </Text>
          ) : null}
        </View>

        {/* Forgot Password */}
        <View className="items-end mb-10">
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text className="text-sm text-indigo-600 font-semibold">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center justify-center mb-4 ${
            isLoading ? "bg-gray-400" : "bg-black"
          }`}
          onPress={handleSignIn}
          disabled={isLoading || isGoogleLoading}
        >
          <Text className="text-white font-semibold text-lg">
            {isLoading ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500 text-sm">or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Google Sign In Button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center justify-center mb-6 border border-gray-300 flex-row ${
            isGoogleLoading ? "bg-gray-100" : "bg-white"
          }`}
          onPress={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
        >
          <Image
            source={GLogo}
            style={{ width: 20, height: 20, marginRight: 12 }}
            resizeMode="contain"
          />

          <Text className="text-gray-700 font-semibold text-lg">
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-600">New here? </Text>
          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <Text className="text-black font-semibold">Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
