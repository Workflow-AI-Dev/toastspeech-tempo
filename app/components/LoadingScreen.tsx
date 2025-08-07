import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import { Mic, Sparkles } from "lucide-react-native";

export default function LoadingScreen() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <SafeAreaView
      className="flex-1 justify-center items-center"
      style={{ backgroundColor: colors.background }}
    >
      <View className="items-center">
        <View className="bg-white rounded-full p-8 shadow-2xl border-4 border-indigo-100 mb-6">
          <Mic size={48} color="#6366f1" />
        </View>
        <View className="flex-row items-center mb-4">
          <Sparkles size={20} color={colors.primary} />
          <Text
            className="text-xl font-bold ml-2"
            style={{ color: colors.text }}
          >
            Echozi
          </Text>
        </View>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-sm mt-4" style={{ color: colors.textSecondary }}>
          Loading your speaking journey...
        </Text>
      </View>
    </SafeAreaView>
  );
}
