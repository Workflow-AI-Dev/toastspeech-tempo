import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mic,
  Sparkles,
  Heart,
  Zap,
} from "lucide-react-native";

export default function SignInScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Welcome animation
    Animated.timing(welcomeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the mic icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Almost there! 🎯", "Please fill in both fields to continue");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/subscription");
    }, 1500);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "No worries! 🔑",
      "We'll send a magic link to reset your password.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send Magic Link ✨", onPress: () => {} },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity
            className="bg-white/80 rounded-full p-2 mr-4"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">
            Welcome Back! 👋
          </Text>
        </View>

        <Animated.View
          className="flex-1 px-6 py-8"
          style={{
            opacity: welcomeAnim,
            transform: [
              {
                translateY: welcomeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          }}
        >
          {/* Logo */}
          <View className="items-center mb-12">
            <Animated.View
              className="relative mb-6"
              style={{
                transform: [{ scale: pulseAnim }],
              }}
            >
              <View className="bg-white rounded-full p-8 shadow-2xl border-4 border-indigo-100">
                <Mic size={56} color="#6366f1" />
              </View>
              <View className="absolute -top-2 -right-2 bg-pink-400 rounded-full p-2">
                <Heart size={18} color="white" />
              </View>
            </Animated.View>

            <Text className="text-3xl font-black text-gray-900 mb-3 text-center">
              Ready to continue?
            </Text>
            <Text className="text-xl text-gray-600 text-center leading-relaxed">
              Your speaking journey awaits! ✨
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-6 mb-8">
            <View>
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Your email address 📧
              </Text>
              <TextInput
                className="bg-white/80 rounded-3xl px-6 py-5 text-gray-900 text-lg border border-gray-200"
                placeholder="you@example.com"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View>
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Your password 🔐
              </Text>
              <View className="relative">
                <TextInput
                  className="bg-white/80 rounded-3xl px-6 py-5 pr-14 text-gray-900 text-lg border border-gray-200"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  className="absolute right-5 top-5"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={24} color="#6b7280" />
                  ) : (
                    <Eye size={24} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <View className="items-end">
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text className="text-indigo-600 font-bold text-lg">
                  Forgot Password? 🤔
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            className={`rounded-3xl py-5 px-8 mb-6 ${
              isLoading
                ? "bg-gray-400"
                : "bg-gradient-to-r from-indigo-600 to-purple-600"
            }`}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-white font-bold text-xl mr-2">
                {isLoading ? "Welcome back..." : "Let's Go!"}
              </Text>
              {!isLoading && <Zap size={20} color="white" />}
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-gray-500 px-4 font-semibold">
              or continue with
            </Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Sign In */}
          <View className="space-y-4 mb-8">
            <TouchableOpacity className="bg-white/90 border-2 border-gray-200 rounded-3xl py-4 px-6 flex-row items-center justify-center shadow-sm">
              <Text className="text-gray-700 font-bold text-lg mr-2">
                Continue with Google
              </Text>
              <Text className="text-xl">🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-black rounded-3xl py-4 px-6 flex-row items-center justify-center">
              <Text className="text-white font-bold text-lg mr-2">
                Continue with Apple
              </Text>
              <Text className="text-xl">🍎</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600 text-lg">New to ToastSpeech? </Text>
            <TouchableOpacity onPress={() => router.push("/sign-up")}>
              <Text className="text-indigo-600 font-bold text-lg">
                Join Us! ✨
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
