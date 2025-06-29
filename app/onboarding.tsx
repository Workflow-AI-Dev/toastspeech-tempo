import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Mic,
  Sparkles,
  TrendingUp,
  Star,
  Zap,
  Award,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const [animatedValue] = useState(new Animated.Value(0));
  const [floatingIcons] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  useEffect(() => {
    // Main entrance animation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Floating icons animation
    const animateIcons = () => {
      floatingIcons.forEach((icon, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(icon, {
              toValue: 1,
              duration: 2000 + index * 500,
              useNativeDriver: true,
            }),
            Animated.timing(icon, {
              toValue: 0,
              duration: 2000 + index * 500,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      });
    };

    setTimeout(animateIcons, 500);
  }, []);

  const handleGetStarted = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push("/sign-up");
    });
  };

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <View className="flex-1 px-6 py-8 relative">
        {/* Floating Background Icons */}
        <Animated.View
          className="absolute top-20 right-8"
          style={{
            transform: [
              {
                translateY: floatingIcons[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
            ],
            opacity: floatingIcons[0].interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.7],
            }),
          }}
        >
          <View className="bg-yellow-100 rounded-full p-3">
            <Star size={24} color="#f59e0b" />
          </View>
        </Animated.View>

        <Animated.View
          className="absolute top-40 left-8"
          style={{
            transform: [
              {
                translateY: floatingIcons[1].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15],
                }),
              },
            ],
            opacity: floatingIcons[1].interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.6],
            }),
          }}
        >
          <View className="bg-green-100 rounded-full p-3">
            <Zap size={20} color="#10b981" />
          </View>
        </Animated.View>

        <Animated.View
          className="absolute bottom-80 right-12"
          style={{
            transform: [
              {
                translateY: floatingIcons[2].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
            ],
            opacity: floatingIcons[2].interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 0.8],
            }),
          }}
        >
          <View className="bg-purple-100 rounded-full p-2">
            <Award size={18} color="#8b5cf6" />
          </View>
        </Animated.View>

        {/* Main Content */}
        <Animated.View
          className="flex-1 justify-center"
          style={{
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          }}
        >
          {/* Hero Section */}
          <View className="items-center mb-16">
            <Animated.View
              className="relative mb-8"
              style={{
                transform: [
                  {
                    scale: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              }}
            >
              <View className="bg-white rounded-full p-8 shadow-2xl border-4 border-indigo-100">
                <Mic size={64} color="#6366f1" />
              </View>
              <View className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                <Sparkles size={20} color="white" />
              </View>
            </Animated.View>

            <Text className="text-5xl font-black text-gray-900 text-center mb-3">
              ToastSpeech
            </Text>
            <Text className="text-xl text-gray-600 text-center leading-relaxed mb-6 px-4">
              Transform your speaking skills with AI magic ✨
            </Text>

            {/* Feature Pills */}
            <View className="flex-row flex-wrap justify-center gap-2 mb-8">
              <View className="bg-indigo-100 rounded-full px-4 py-2">
                <Text className="text-indigo-700 font-semibold text-sm">
                  🎯 Instant Feedback
                </Text>
              </View>
              <View className="bg-purple-100 rounded-full px-4 py-2">
                <Text className="text-purple-700 font-semibold text-sm">
                  📈 Track Progress
                </Text>
              </View>
              <View className="bg-green-100 rounded-full px-4 py-2">
                <Text className="text-green-700 font-semibold text-sm">
                  🏆 Level Up
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-4 px-4">
            <TouchableOpacity
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl py-5 px-8 shadow-lg"
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-white font-bold text-xl mr-2">
                  Start Your Journey
                </Text>
                <Sparkles size={20} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/80 backdrop-blur border-2 border-gray-200 rounded-3xl py-4 px-8"
              onPress={handleSignIn}
              activeOpacity={0.7}
            >
              <Text className="text-gray-700 font-semibold text-lg text-center">
                Welcome Back
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom Stats */}
        <Animated.View
          className="items-center mt-8"
          style={{
            opacity: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          }}
        >
          <View className="flex-row items-center space-x-6">
            <View className="items-center">
              <Text className="text-2xl font-bold text-indigo-600">10K+</Text>
              <Text className="text-gray-500 text-xs">Speakers</Text>
            </View>
            <View className="w-px h-8 bg-gray-300" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-600">50K+</Text>
              <Text className="text-gray-500 text-xs">Speeches</Text>
            </View>
            <View className="w-px h-8 bg-gray-300" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">95%</Text>
              <Text className="text-gray-500 text-xs">Improved</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
