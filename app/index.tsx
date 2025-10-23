import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Mic,
  BarChart2,
  BookOpen,
  Award,
  User,
  Flame,
  Zap,
  Crown,
  TrendingUp,
  X,
  Settings,
  ChevronRight,
  House,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "./context/ThemeContext";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import LevelCard from "./components/LevelCard";
import { usePlanQuery } from "./queries/usePlanQuery";
import { useLimitsQuery } from "./queries/useLimitsQuery";
import { useProgressQuery } from "./queries/useProgressQuery";
import { useSessionsQuery } from "./queries/useSessionsQuery";
import { LOADING_TIPS } from "./constants/tips";
import { styles } from "./styles/index-styles";

dayjs.extend(relativeTime);
dayjs.extend(utc);

export default function HomeScreen() {
  const router = useRouter();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const { data: plan, isLoading: planLoading } = usePlanQuery();
  const { data: limits, isLoading: limitsLoading } = useLimitsQuery();
  const { data: progress, isLoading: progressLoading } = useProgressQuery();
  const { data: sessions, isLoading: sessionsLoading } = useSessionsQuery();

  const recentSessions = sessions ?? [];
  const recentAchievements = useMemo(() => {
    return recentSessions
      .slice(0, 3)
      .flatMap((s) => s.analytics?.achievement?.tag || [])
      .filter((tag, idx, arr) => arr.indexOf(tag) === idx);
  }, [recentSessions]);

  const calculateStreak = (sessions: any[]) => {
    const today = dayjs().startOf("day");

    const datesSet = new Set(
      sessions.map((s) =>
        dayjs.utc(s.created_at).local().startOf("day").format("YYYY-MM-DD"),
      ),
    );

    let streak = 0;
    let currentDate = today;

    while (datesSet.has(currentDate.format("YYYY-MM-DD"))) {
      streak++;
      currentDate = currentDate.subtract(1, "day");
    }

    return streak;
  };

  // streak from sessions
  const streakDays = useMemo(
    () => calculateStreak(recentSessions),
    [recentSessions],
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning!";
    if (hour >= 12 && hour < 17) return "Good afternoon!";
    if (hour >= 17 && hour < 21) return "Good evening!";
    return "Hey there!";
  }, []);

  const loading =
    planLoading || limitsLoading || progressLoading || sessionsLoading;

  const userLevel = progress ?? {
    current: 1,
    currentName: "Beginner",
    nextLevel: 2,
    nextName: "Ice Breaker",
    progress: 0,
    xpRemaining: 0,
    totalXP: 0,
  };

  const handleFeaturePress = (
    featureId: string,
    currentOnPress: () => void,
    isLocked: boolean,
  ) => {
    if (isLocked) {
      setModalTitle("Feature Locked");
      setModalMessage(
        "This feature is locked. Upgrade your plan to unlock your full potential!",
      );
      setShowSubscriptionModal(true);
      return;
    }
    console.log(limits);
    if (!limits) {
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
        break;
    }

    if (hasLimitReached) {
      setModalTitle("Limit Reached");
      setModalMessage(
        `You've reached your limit for ${limitType} this month. Upgrade your plan for more!`,
      );
      setShowSubscriptionModal(true);
    } else {
      currentOnPress();
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
        color: colors.accent,
        bgColor: theme === "light" ? "#faf5ff" : colors.surface,
        locked: isCasual,
        onPress: () => router.push("/performance-dashboard"),
      },
      {
        id: "speech-recorder",
        title: "Speaker Mode",
        description: "AI-powered feedback in seconds",
        icon: Mic,
        color: colors.primary,
        bgColor: theme === "light" ? "#f0f9ff" : colors.surface,
        locked: false,
        onPress: () => router.push("/speaker-mode"),
      },
      {
        id: "evaluation-tools",
        title: "Evaluator Mode",
        description: "Test your evaluation skills",
        icon: Award,
        color: colors.success,
        bgColor: theme === "light" ? "#f0fdf4" : colors.surface,
        locked: isAspiringOrCasual,
        onPress: () => router.push("/evaluator-mode"),
      },
      {
        id: "practice",
        title: "Practice Mode",
        description: "Warmup to sharpen your delivery skills",
        icon: Zap,
        color: colors.warning,
        bgColor: theme === "light" ? "#fff7ed" : colors.surface,
        locked: false,
        onPress: () => router.push("/practice-mode"),
      },
      {
        id: "feedback-library",
        title: "Library",
        description: "Browse all your past sessions",
        icon: BookOpen,
        color: colors.primary,
        bgColor: theme === "light" ? "#f0fdfa" : colors.surface,
        locked: false,
        onPress: () => router.push("/feedback-library"),
      },
    ];
  }, [plan, router, theme, colors]);

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const randomTip = LOADING_TIPS[currentTip];

  if (loading) {
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
            fontWeight: "600",
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
        <View className="flex-row justify-between items-center px-6 py-6 mt-2">
          <View>
            <Text
              className="text-3xl font-bold mb-1 mt-2"
              style={{ color: colors.text }}
            >
              {greeting}
            </Text>

            <View className="flex-row items-center">
              <View
                className="rounded-full px-3 py-1 mr-3"
                style={{
                  backgroundColor:
                    theme === "light" ? "#fef3c7" : colors.surface,
                }}
              >
                <View className="flex-row items-center">
                  <Crown size={14} color={colors.warning} />
                  <Text
                    className="text-sm font-semibold ml-1"
                    style={{ color: colors.warning }}
                  >
                    Level {userLevel.current}
                  </Text>
                </View>
              </View>
              <View
                className="rounded-full px-3 py-1"
                style={{
                  backgroundColor:
                    streakDays > 0
                      ? theme === "light"
                        ? colors.warning + "20"
                        : colors.surface
                      : colors.border,
                }}
              >
                <View className="flex-row items-center">
                  {streakDays > 0 ? (
                    <>
                      <Flame size={14} color={colors.warning} />
                      <Text
                        className="text-sm font-semibold ml-1"
                        style={{ color: colors.warning }}
                      >
                        {streakDays} day
                        {streakDays > 1 ? "s" : ""}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-lg mr-1">😞</Text>
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: colors.textSecondary }}
                      >
                        0 days
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            className="rounded-full p-3"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            onPress={() => router.push("/profile-settings")}
          >
            <Settings size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <LevelCard userLevel={userLevel} colors={colors} />

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
                  className="rounded-2xl p-4 mb-3 flex-row items-center"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                  onPress={() =>
                    handleFeaturePress(
                      feature.id,
                      feature.onPress,
                      feature.locked,
                    )
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
                          <View
                            className="rounded-full px-2 py-1 ml-2"
                            style={{ backgroundColor: colors.success + "20" }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: colors.success }}
                            >
                              {feature.badge}
                            </Text>
                          </View>
                        )}
                        {feature.locked && (
                          <View
                            className="rounded-full px-2 py-1 ml-2"
                            style={{ backgroundColor: colors.error + "20" }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: colors.error }}
                            >
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
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="px-6 mb-8">
          <Text
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            Recent Achievements
          </Text>
          {recentAchievements.length === 0 ? (
            <View
              className="items-center justify-center py-10 rounded-2xl border"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Award size={32} color={colors.textSecondary} />
              <Text
                style={{ color: colors.textSecondary }}
                className="text-center mt-3 font-medium"
              >
                No achievements yet
              </Text>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-center text-sm mt-1"
              >
                Start your next session to earn one!
              </Text>
            </View>
          ) : (
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
                  <View
                    className="rounded-full w-12 h-12 items-center justify-center mb-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-2xl">
                      <Flame color={colors.warning} />
                    </Text>
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
          )}
        </View>

        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Recent Sessions
            </Text>
            <TouchableOpacity onPress={() => router.push("/feedback-library")}>
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.primary }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {recentSessions.length === 0 ? (
            <View
              className="items-center justify-center py-10 rounded-2xl border"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Mic size={32} color={colors.textSecondary} />
              <Text
                style={{ color: colors.textSecondary }}
                className="text-center mt-3 font-medium"
              >
                No sessions yet
              </Text>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-center text-sm mt-1"
              >
                Record your first one to get started!
              </Text>
            </View>
          ) : (
            recentSessions.map((session) => {
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
                  <View
                    className="rounded-2xl w-12 h-12 items-center justify-center mr-4"
                    style={{ backgroundColor: colors.surface }}
                  >
                    {isSpeech ? (
                      <Mic size={24} color={colors.primary} />
                    ) : (
                      <Award size={24} color={colors.success} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-bold mb-1"
                      style={{ color: colors.text }}
                    >
                      {session.title ||
                        (isSpeech ? "Untitled Speech" : "Evaluation")}
                    </Text>
                    <View className="flex-row items-center">
                      <Text
                        className="text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        {dayjs(session.created_at).fromNow()}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    {session.summary.Metadata.overall_score && (
                      <View
                        className="rounded-xl px-3 py-2 mb-2"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <Text
                          className="font-bold text-lg"
                          style={{ color: colors.primary }}
                        >
                          {session.summary.Metadata.overall_score}
                        </Text>
                      </View>
                    )}
                    {session.improvement && (
                      <View className="flex-row items-center">
                        <TrendingUp size={12} color={colors.success} />
                        <Text
                          className="text-xs ml-1 font-semibold"
                          style={{ color: colors.success }}
                        >
                          {session.improvement}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

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
            style={{ backgroundColor: colors.surface }}
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
        <View
          style={[
            styles.centeredView,
            {
              backgroundColor:
                theme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
            },
          ]}
        >
          <View style={[styles.modalView, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSubscriptionModal(false)}
            >
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Crown
              size={60}
              color={colors.warning}
              style={{ marginBottom: 20 }}
            />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {modalTitle}
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              {modalMessage}
            </Text>
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                { backgroundColor: colors.warning },
              ]}
              onPress={() => {
                setShowSubscriptionModal(false);
                router.push("/subscription");
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
