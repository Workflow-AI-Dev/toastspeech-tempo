import React, { useState, useMemo, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, ActivityIndicator } from "react-native";
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
  Annoyed,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "./context/ThemeContext";
import { BASE_URL } from "./config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(utc);

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); 
  const [modalTitle, setModalTitle] = useState("");
  const [isFirstTime, setIsFirstTime] = useState(true);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [plan, setPlan] = useState<string | null>(null);
  const [limits, setLimits] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning!";
    if (hour >= 12 && hour < 17) return "Good afternoon!";
    if (hour >= 17 && hour < 21) return "Good evening!";
    return "Hey there!";
  }, []);

  const fetchPlan = useCallback(async () => {
      try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) {
              console.warn("No auth token found. User might not be authenticated.");
              return;
          }
          const res = await fetch(`${BASE_URL}/subscription/plan`, { 
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          });
          const data = await res.json();
          if (res.ok) {
              setPlan(data.id);
          } else {
              console.error("Plan fetch failed", data);
              // Handle specific error codes if necessary, e.g., token expired
          }
      } catch (error) {
          console.error("Error fetching subscription plan", error);
      }
  }, []);

  const fetchLimits = useCallback(async () => {
      try {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) {
              console.warn("No auth token found. User might not be authenticated.");
              return;
          }
          const res = await fetch(`${BASE_URL}/subscription/check_limits`, { 
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          });
          const data = await res.json();
          if (res.ok) {
              setLimits(data);
          } else {
              console.error("Limits fetch failed", data);
          }
      } catch (error) {
          console.error("Error fetching limits", error);
      }
  }, []);

  const fetchSessions = useCallback(async () => {
    const token = await AsyncStorage.getItem("auth_token");
    try {
      const response = await fetch(`${BASE_URL}/dashboard/recent`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { recent_sessions } = await response.json();
      const sessions = recent_sessions || [];

      setRecentSessions(sessions);

      const achievements = sessions
        .slice(0, 3)
        .flatMap((s) => s.analytics?.achievement?.tag || [])
        .filter((tag, index, self) => self.indexOf(tag) === index);

      setRecentAchievements(achievements);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  }, []);


  useEffect(() => {
  const initializeAppData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        fetchPlan(),
        fetchLimits(),
        fetchSessions()
      ]);
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setDataLoading(false);
    }
  };

  initializeAppData();
}, []);


  const calculateStreak = (sessions: any[]) => {
    const today = dayjs().startOf("day");

    const datesSet = new Set(
      sessions.map((s) =>
        dayjs.utc(s.created_at).local().startOf("day").format("YYYY-MM-DD")
      )
    );

    let streak = 0;
    let currentDate = today;

    while (datesSet.has(currentDate.format("YYYY-MM-DD"))) {
      streak++;
      currentDate = currentDate.subtract(1, "day");
    }

    return streak;
  };


  const streakDays = useMemo(() => calculateStreak(recentSessions), [recentSessions]);


  const userLevel = {
    current: 7,
    progress: 65,
    nextLevel: 8,
    streakDays: streakDays,
  };

  const handleFeaturePress = (featureId: string, currentOnPress: () => void, isLocked: boolean) => {
    if (isLocked) {
      setModalTitle("Feature Locked");
      setModalMessage("This feature is locked. Upgrade your plan to unlock your full potential!");
      setShowSubscriptionModal(true);
      return;
    }

    if (!limits) {
      // Limits not loaded yet, prevent action and maybe show a loading indicator or alert
      console.log("Limits not yet loaded. Please wait.");
      return;
    }

    let hasLimitReached = false;
    let limitType = "";

    switch (featureId) {
      case "speech-recorder":
        if (limits.total_remaining_speeches <= 0) {
          hasLimitReached = true;
          limitType = "speeches";
        }
        break;
      case "evaluation-tools":
        if (limits.total_remaining_eval <= 0) {
          hasLimitReached = true;
          limitType = "evaluations";
        }
        break;
      case "practice":
        if (limits.total_remaining_practice <= 0) {
          hasLimitReached = true;
          limitType = "practice sessions";
        }
        break;
      default:
        // For features without specific limits, proceed normally
        break;
    }

    if (hasLimitReached) {
      setModalTitle("Limit Reached");
      setModalMessage(`You've reached your limit for ${limitType} this month. Upgrade your plan for more!`);
      setShowSubscriptionModal(true);
    } else {
      currentOnPress(); // Proceed with the original navigation
    }
  };

  const features = useMemo(() => {
    const isAspiringOrCasual = plan === "aspiring" || plan === "casual";
    const isCasual = plan === "casual";

    return [
        {
            id: "performance-dashboard",
            title: "Your Progress",
            description: "Track stats & level up",
            icon: BarChart2,
            color: "#8b5cf6",
            bgColor: "#faf5ff",
            locked: isCasual, // casual users don't get dashboard
            onPress: () => router.push("/performance-dashboard"),
        },
        {
            id: "speech-recorder",
            title: "Speaker Mode",
            description: "AI-powered feedback in seconds",
            icon: Mic,
            color: "#6366f1",
            bgColor: "#f0f9ff",
            locked: false,
            onPress: () => router.push("/speaker-mode"),
        },
        {
            id: "evaluation-tools",
            title: "Evaluator Mode",
            description: "Test your evaluation skills",
            icon: Award,
            color: "#10b981",
            bgColor: "#f0fdf4",
            locked: isAspiringOrCasual, // disable for aspiring and casual
            onPress: () => router.push("/evaluator-mode"),
        },
        {
            id: "practice",
            title: "Practice Mode",
            description: "Warmup to sharpen your delivery skills",
            icon: Zap,
            color: "#f59e0b",
            bgColor: "#fff7ed",
            locked: false,
            onPress: () => router.push("/practice-mode"),
        },
        {
            id: "feedback-library",
            title: "Library",
            description: "Browse all your past sessions",
            icon: BookOpen,
            color: "#06b6d4",
            bgColor: "#f0fdfa",
            locked: false,
            onPress: () => router.push("/feedback-library"),
        },
    ];
  }, [plan, router]);

  const tips = [
    "Greatness takes time… and a fast internet connection.",
    "Did you hydrate today? Your voice matters.",
    "Fun fact: The fear of public speaking is called glossophobia.",
    "Warming up your charisma engine…",
    "Preparing the stage for your brilliance...",
    "Even the best speakers need a dramatic pause…",
    "Checking mic levels... Testing, testing... 1, 2, YOU!",
    "Behind every great speech is a loading spinner.",
    "Aligning your confidence chakras",
    "Powering up your persuasive powers",
    "Downloading applause. This may take a moment...",
    "The audience is getting seated. Please hold.",
    "Applying your charisma filter...",
    "Searching for your inner TED Talk.",
    "Installing virtual standing ovations...",
    "Getting your 'um's and 'uh's under control...",
    "Unmuting your potential...",
    "Almost there… your voice is warming up!",
  ];


  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000); // change tip every 3 seconds
    return () => clearInterval(interval);
  }, []);

const randomTip = tips[currentTip];


  // Show loading state while checking authentication
  if (loading || dataLoading) {
    return (
      <SafeAreaView
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            color: colors.textSecondary,
            marginTop: 16,
            textAlign: "center",
            paddingHorizontal: 30,
            fontSize: 15,
            lineHeight: 22,
            fontWeight: '600'
          }}
        >
          {randomTip}
        </Text>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView className="flex-1">
        {/* Header with Level & Streak */}
        <View className="flex-row justify-between items-center px-6 py-6 mt-2">
          <View>
            <Text
              className="text-3xl font-bold mb-1 mt-2"
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
              <View className="rounded-full px-3 py-1" style={{ backgroundColor: userLevel.streakDays > 0 ? "#ffedd5" : "#f3f4f6" }}>
                <View className="flex-row items-center">
                  {userLevel.streakDays > 0 ? (
                    <>
                      <Flame size={14} color="#ea580c" />
                      <Text className="text-sm font-semibold text-orange-700 ml-1">
                        {userLevel.streakDays} day{userLevel.streakDays > 1 ? "s" : ""}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-lg mr-1">😞</Text>
                      <Text className="text-sm font-semibold text-gray-500">0 days</Text>
                    </>
                  )}
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
                  onPress={() => handleFeaturePress(feature.id, feature.onPress, feature.locked)}
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
                          <View className="bg-red-100 rounded-full px-2 py-1 ml-2">
                            <Text className="text-xs font-bold text-gray-600">
                              LOCKED
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
            {recentAchievements.map((achievement, index) => (
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
                  <Text className="text-2xl"><Flame color="#fc5e03" /></Text>
                </View>
                <Text
                  className="font-semibold text-center text-sm"
                  style={{ color: colors.text }}
                >
                  {achievement}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Speeches */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Recent Sessions
            </Text>
            <TouchableOpacity onPress={() => router.push("/feedback-library")}>
              <Text className="text-sm text-indigo-600 font-semibold">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {recentSessions.map((session) => {
          const isSpeech = session.type === "speech";
          return (
            <TouchableOpacity
              key={session.id}
              className="rounded-2xl p-4 mb-3 flex-row items-center"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
              }}
            >
              <View className="bg-gray-50 rounded-2xl w-12 h-12 items-center justify-center mr-4">
                {isSpeech ? (
                  <Mic size={24} color="#7c3aed" />
                ) : (
                  <Award size={24} color="#10b981" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-bold mb-1" style={{ color: colors.text }}>
                  {session.title || (isSpeech ? "Untitled Speech" : "Evaluation")}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-500">
                    {dayjs(session.created_at).fromNow()}  {/* e.g., "1 day ago" */}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                {session.summary.Metadata.overall_score && (
                  <View className="bg-indigo-50 rounded-xl px-3 py-2 mb-2">
                    <Text className="font-bold text-indigo-600 text-lg">
                      {session.summary.Metadata.overall_score}
                    </Text>
                  </View>
                )}
                {session.improvement && (
                  <View className="flex-row items-center">
                    <TrendingUp size={12} color="#10b981" />
                    <Text className="text-xs text-green-600 ml-1 font-semibold">
                      {session.improvement}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

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

      <Modal
        animationType="slide"
        transparent={true}
        visible={showSubscriptionModal}
        onRequestClose={() => setShowSubscriptionModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSubscriptionModal(false)}
            >
              <X size={24} color="#333" />
            </TouchableOpacity>
            <Crown size={60} color="#f97316" style={{ marginBottom: 20 }} />
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalText}>
              {modalMessage} {/* This will display the specific message */}
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => {
                setShowSubscriptionModal(false);
                router.push("/subscription"); // Navigate to your subscription page
              }}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "flex-end", // Align to bottom
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalView: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "100%", // Take full width
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    modalText: {
        marginBottom: 25,
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
    },
    upgradeButton: {
        backgroundColor: "#f97316", // Orange color for upgrade button
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 30,
        elevation: 2,
    },
    upgradeButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
    },
});