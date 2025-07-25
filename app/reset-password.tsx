import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  const handleResetPassword = async () => {
    const newErrors = { password: "", confirmPassword: "" };
    let isValid = true;

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    setIsLoading(true);

    try {
      const { error } = await updatePassword(email as string, password);

      if (error) {
        Toast.show({
          type: "error",
          text1: "Password Update Failed",
          text2:
            typeof error === "string"
              ? error
              : error.message || "Please try again",
          position: "top",
          visibilityTime: 4000,
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Password Updated",
          text2: "Your password has been updated successfully!",
          position: "top",
          visibilityTime: 3000,
        });

        // Redirect to sign in after a short delay
        setTimeout(() => {
          router.replace("/sign-in");
        }, 2000);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again.",
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
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

        <Text className="text-2xl font-semibold text-gray-900 mb-2">
          Reset Password
        </Text>
        <Text className="text-gray-600 mb-8">
          Enter your new password for {email}
        </Text>

        {/* New Password */}
        <View className="relative mb-4">
          <TextInput
            placeholder="New Password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            className={`bg-[#f6f7fb] px-12 py-4 rounded-xl border text-gray-900 ${
              errors.password ? "border-red-500" : "border-gray-200"
            }`}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
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

        {/* Confirm Password */}
        <View className="relative mb-8">
          <TextInput
            placeholder="Confirm New Password"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            className={`bg-[#f6f7fb] px-12 py-4 rounded-xl border text-gray-900 ${
              errors.confirmPassword ? "border-red-500" : "border-gray-200"
            }`}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword)
                setErrors({ ...errors, confirmPassword: "" });
            }}
          />
          <Lock
            size={20}
            color="#6b7280"
            style={{ position: "absolute", top: 18, left: 16 }}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ position: "absolute", top: 16, right: 16 }}
          >
            {showConfirmPassword ? (
              <EyeOff size={22} color="#6b7280" />
            ) : (
              <Eye size={22} color="#6b7280" />
            )}
          </TouchableOpacity>
          {errors.confirmPassword ? (
            <Text className="text-red-500 text-sm mt-1 ml-1">
              {errors.confirmPassword}
            </Text>
          ) : null}
        </View>

        {/* Update Password Button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center justify-center mb-4 ${
            isLoading ? "bg-gray-400" : "bg-black"
          }`}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          <Text className="text-white font-semibold text-lg">
            {isLoading ? "Updating..." : "Update Password"}
          </Text>
        </TouchableOpacity>

        {/* Back to Sign In */}
        <View className="flex-row justify-center">
          <TouchableOpacity onPress={() => router.replace("/sign-in")}>
            <Text className="text-indigo-600 font-semibold">
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
