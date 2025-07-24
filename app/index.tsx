import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "./context/AuthContext";
import {
  Mic,
  BarChart2,
  BookOpen,
  Award,
  User,
  Flame,
  Trophy,
  Target,
  Zap,
  Crown,
  Star,
  TrendingUp,
  X,
  Settings,
  ChevronRight,
  House,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "./context/ThemeContext";

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning!";
    if (hour >= 12 && hour < 17) return "Good afternoon!";
    if (hour >= 17 && hour < 21) return "Good evening!";
    return "Hey there!";
  };

  const greeting = useMemo(() => getTimeBasedGreeting(), []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.text }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // This screen should only be accessible to authenticated users
  // The AuthContext will handle redirecting unauthenticated users

  const userLevel = {
    current: 7,
    progress: 65,
    nextLevel: 8,
    streakDays: 12,
  };

  const features = [
    {
      id: "performance-dashboard",
      title: "Your Progress",
      description: "Track stats & level up",
      icon: BarChart2,
      color: "#8b5cf6",
      bgColor: "#faf5ff",
      onPress: () => router.push("/performance-dashboard"),
    },
    {
      id: "speech-recorder",
      title: "Speaker Mode",
      description: "AI-powered feedback in seconds",
      icon: Mic,
      color: "#6366f1",
      bgColor: "#f0f9ff",
      onPress: () => router.push("/speaker-mode"),
    },
    {
      id: "evaluation-tools",
      title: "Evaluator Mode",
      description: "Test your evaluation skills",
      icon: Award,
      color: "#10b981",
      bgColor: "#f0fdf4",
      onPress: () => router.push("/evaluator-mode"),
    },
    {
      id: "practice",
      title: "Practice Mode",
      description: "Warmup to sharpen your delivery skills",
      icon: Zap,
      color: "#f59e0b",
      bgColor: "#fff7ed",
      onPress: () => router.push("/practice-mode"),
    },
    {
      id: "feedback-library",
      title: "Library",
      description: "Browse all your past sessions",
      icon: BookOpen,
      color: "#06b6d4",
      bgColor: "#f0fdfa",
      onPress: () => router.push("/feedback-library"),
    },
  ];

  const achievements = [
    {
      icon: <Flame color="#fc5e03" />,
      title: "12-day streak!",
      color: "#ff6b6b",
    },
    {
      icon: <Target color="#3dbf2c" />,
      title: "Level 7 Speaker",
      color: "#fc0303",
    },
    { icon: <Zap color="#0993d9" />, title: "Fast Improver", color: "#ffe66d" },
  ];

  const recentSpeeches = [
    {
      id: "1",
      title: "My Leadership Story",
      date: "2 days ago",
      duration: "7:32",
      score: 85,
      improvement: "+12",
      emoji: <Mic size={24} color="#7c3aed" />,
    },
    {
      id: "2",
      title: "Why I Love Coffee",
      date: "1 week ago",
      duration: "5:45",
      score: 78,
      improvement: "+5",
      emoji: <Mic size={24} color="#7c3aed" />,
    },
    {
      id: "3",
      title: "My Dream Vacation",
      date: "2 weeks ago",
      duration: "6:15",
      score: 92,
      improvement: "+18",
      emoji: <Mic size={24} color="#7c3aed" />,
    },
  ];

  const SubscriptionModal = () => (
    <View className="absolute inset-0 bg-black/50 flex-1 justify-center items-center z-50">
      <View
        className="rounded-3xl mx-4 p-6 max-w-sm w-full"
        style={{ backgroundColor: colors.card }}
      >
        <TouchableOpacity
          className="absolute top-4 right-4 z-10"
          onPress={() => setShowSubscriptionModal(false)}
        >
          <X size={24} color="#666" />
        </TouchableOpacity>

        <View className="items-center mb-6">
          <Text className="text-2xl mb-2">🚀</Text>
          <Text className="text-xl font-bold text-center">
            Unlock Your Speaking Potential!
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            You've used your free evaluation this month
          </Text>
        </View>

        {/* Free Plan */}
        <View
          className="rounded-2xl p-4 mb-3"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-bold text-lg">Try & Taste</Text>
            <Text className="text-2xl font-bold text-gray-800">FREE</Text>
          </View>
          <Text className="text-sm text-gray-600 mb-3">
            Perfect for getting started
          </Text>
          <View className="space-y-1">
            <Text className="text-sm">✅ 1 evaluation per month</Text>
            <Text className="text-sm">✅ Basic AI feedback</Text>
            <Text className="text-sm">❌ Video analysis</Text>
            <Text className="text-sm">❌ Detailed reports</Text>
          </View>
        </View>

        {/* Essential Plan */}
        <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-3 border-2 border-blue-200">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="font-bold text-lg">Practice & Improve</Text>
              <View className="bg-blue-500 rounded-full px-2 py-1">
                <Text className="text-white text-xs font-bold">POPULAR</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-bold text-blue-600">$5</Text>
              <Text className="text-sm text-gray-600">/month</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600 mb-3">
            For regular speakers
          </Text>
          <View className="space-y-1">
            <Text className="text-sm">✅ 2 evaluations per month</Text>
            <Text className="text-sm">✅ Video + voice analysis</Text>
            <Text className="text-sm">✅ Detailed feedback</Text>
            <Text className="text-sm">✅ Progress tracking</Text>
          </View>
          <TouchableOpacity className="bg-blue-500 rounded-xl py-3 mt-4">
            <Text className="text-white font-bold text-center">
              Choose Essential
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pro Plan */}
        <View className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="font-bold text-lg">Coach & Analyze</Text>
              <View className="bg-purple-500 rounded-full px-2 py-1">
                <Text className="text-white text-xs font-bold">PRO</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-bold text-purple-600">$20</Text>
              <Text className="text-sm text-gray-600">/month</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600 mb-3">
            For serious speakers
          </Text>
          <View className="space-y-1">
            <Text className="text-sm">✅ 10 evaluations per month</Text>
            <Text className="text-sm">✅ Evaluator mode</Text>
            <Text className="text-sm">✅ Advanced analytics</Text>
            <Text className="text-sm">✅ Priority support</Text>
          </View>
          <TouchableOpacity className="bg-purple-500 rounded-xl py-3 mt-4">
            <Text className="text-white font-bold text-center">Choose Pro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView className="flex-1">
        {/* Header with Level & Streak */}
        <View className="flex-row justify-between items-center px-6 py-6">
          <View>
            <Text
              className="text-3xl font-bold mb-1"
              style={{ color: colors.text }}
            >
              {greeting}
            </Text>

            <View className="flex-row items-center">
              <View className="bg-amber-100 rounded-full px-3 py-1 mr-3">
                <View className="flex-row items-center">
                  <Crown size={14} color="#f59e0b" />
                  <Text className="text-sm font-semibold text-amber-700 ml-1">
                    Level {userLevel.current}
                  </Text>
                </View>
              </View>
              <View className="bg-orange-100 rounded-full px-3 py-1">
                <View className="flex-row items-center">
                  <Flame size={14} color="#ea580c" />
                  <Text className="text-sm font-semibold text-orange-700 ml-1">
                    {userLevel.streakDays} days
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            className="bg-gray-100 rounded-full p-3"
            onPress={() => router.push("/profile-settings")}
          >
            <Settings size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Level Progress Bar */}
        <View className="px-6 mb-8">
          <View
            className="rounded-3xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Level {userLevel.nextLevel} Progress
              </Text>
              <Text className="text-sm font-semibold text-gray-600">
                {userLevel.progress}%
              </Text>
            </View>
            <View className="bg-gray-200 rounded-full h-2 mb-3">
              <View
                className="bg-indigo-500 rounded-full h-2"
                style={{ width: `${userLevel.progress}%` }}
              />
            </View>
            <Text className="text-sm text-gray-600">
              2 more speeches to reach Level {userLevel.nextLevel}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-8">
          <Text
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            Quick Actions
          </Text>
          <View className="space-y-3">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <TouchableOpacity
                  key={feature.id}
                  className="rounded-2xl p-4 flex-row items-center justify-between"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                  onPress={
                    feature.locked
                      ? () => router.push("/subscription")
                      : feature.onPress
                  }
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="rounded-2xl p-3 mr-4"
                      style={{ backgroundColor: feature.bgColor }}
                    >
                      <IconComponent size={24} color={feature.color} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text
                          className="text-lg font-bold"
                          style={{ color: colors.text }}
                        >
                          {feature.title}
                        </Text>
                        {feature.badge && (
                          <View className="bg-green-100 rounded-full px-2 py-1 ml-2">
                            <Text className="text-xs font-bold text-green-700">
                              {feature.badge}
                            </Text>
                          </View>
                        )}
                        {feature.locked && (
                          <View className="bg-gray-100 rounded-full px-2 py-1 ml-2">
                            <Text className="text-xs font-bold text-gray-600">
                              PRO
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        className="mt-1"
                        style={{ color: colors.textSecondary }}
                      >
                        {feature.description}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#d1d5db" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Achievements */}
        <View className="px-6 mb-8">
          <Text
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            Recent Achievements
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-6 px-6"
          >
            {achievements.map((achievement, index) => (
              <View
                key={index}
                className="rounded-2xl p-4 mr-3 min-w-[140px] items-center"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}
              >
                <View className="bg-gray-50 rounded-full w-12 h-12 items-center justify-center mb-3">
                  <Text className="text-2xl">{achievement.icon}</Text>
                </View>
                <Text
                  className="font-semibold text-center text-sm"
                  style={{ color: colors.text }}
                >
                  {achievement.title.replace("!", "")}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Speeches */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Recent Speeches
            </Text>
            <TouchableOpacity onPress={() => router.push("/feedback-library")}>
              <Text className="text-sm text-indigo-600 font-semibold">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {recentSpeeches.map((speech) => (
            <TouchableOpacity
              key={speech.id}
              className="rounded-2xl p-4 mb-3 flex-row items-center"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              onPress={() => router.push("/ai-evaluation-summary")}
            >
              <View className="bg-gray-50 rounded-2xl w-12 h-12 items-center justify-center mr-4">
                <Text className="text-xl">{speech.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold mb-1" style={{ color: colors.text }}>
                  {speech.title}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-500">{speech.date}</Text>
                  <Text className="text-sm text-gray-400 mx-2">•</Text>
                  <Text className="text-sm text-gray-500">
                    {speech.duration}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <View className="bg-indigo-50 rounded-xl px-3 py-2 mb-2">
                  <Text className="font-bold text-indigo-600 text-lg">
                    {speech.score}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <TrendingUp size={12} color="#10b981" />
                  <Text className="text-xs text-green-600 ml-1 font-semibold">
                    {speech.improvement}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Challenge */}
        {/*<View className="px-6 mb-8">
          <View className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
            <View className="flex-row items-center mb-3">
              <View className="bg-indigo-100 rounded-full p-2 mr-3">
                <Target size={20} color="#6366f1" />
              </View>
              <Text className="text-indigo-900 font-bold text-lg">
                Today's Challenge
              </Text>
            </View>
            <Text className="text-indigo-800 mb-4 leading-relaxed">
              Record a 2-minute speech about your favorite hobby. Focus on using
              descriptive language and clear structure.
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 rounded-2xl py-3 px-6 self-start"
              onPress={() => router.push("/speaker-mode")}
            >
              <Text className="text-white font-bold">Start Challenge</Text>
            </TouchableOpacity>
          </View>
        </View> */}
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        className="flex-row justify-around items-center py-4 border-t"
        style={{ backgroundColor: colors.card, borderTopColor: colors.border }}
      >
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/")}
        >
          <View
            className="rounded-2xl p-3"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <House size={22} color={colors.primary} />
          </View>
          <Text className="text-xs mt-2" style={{ color: colors.primary }}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/performance-dashboard")}
        >
          <View
            className="rounded-2xl p-3"
            style={{ backgroundColor: colors.surface }}
          >
            <BarChart2 size={22} color={colors.textSecondary} />
          </View>
          <Text
            className="text-xs mt-2 font-semibold"
            style={{ color: colors.textSecondary }}
          >
            Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/feedback-library")}
        >
          <View
            className="rounded-2xl p-3"
            style={{ backgroundColor: colors.surface }}
          >
            <BookOpen size={22} color={colors.textSecondary} />
          </View>
          <Text
            className="text-xs mt-2"
            style={{ color: colors.textSecondary }}
          >
            Library
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/profile-settings")}
        >
          <View
            className="rounded-2xl p-3"
            style={{ backgroundColor: colors.surface + "20" }}
          >
            <User size={22} color={colors.textSecondary} />
          </View>
          <Text
            className="text-xs mt-2 font-semibold"
            style={{ color: colors.textSecondary }}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {showSubscriptionModal && <SubscriptionModal />}
    </SafeAreaView>
  );
}
