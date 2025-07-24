import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  ChevronRight,
  Clock,
  Star,
  Edit3,
  Trash2,
  ArrowLeft,
  Calendar,
  Trophy,
  TrendingUp,
  TrendingDown,
  Mic,
  Play,
  Award,
  BookOpen,
  Filter,
  Search,
  BarChart3,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import QuickFeedbackPractice from "./QuickFeedbackPractice";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config/api";

interface PracticeEntry {
  id: string;
  title: string;
  date: string;
  duration: string;
  score: number;
  feedback: string[];
  suggestions: string[];
  emoji: string;
  category: string;
  improvement: string;
}

interface PracticeLibraryProps {
  practices?: PracticeEntry[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function PracticeLibrary({
  practices = [],
  isLoading = false,
  onRefresh = () => {},
}: PracticeLibraryProps) {
  const [selectedPractice, setSelectedPractice] =
    useState<PracticeEntry | null>(null);
  const [localPractices, setLocalPractices] =
    useState<PracticeEntry[]>(practices);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const router = useRouter();

  useEffect(() => {
    setLocalPractices(practices);
  }, [practices]);

  // Helper: Parse duration string (e.g. "5m 30s") to total seconds
  const parseDurationToSeconds = (duration: string): number => {
    if (!duration || duration.toLowerCase() === "n/a") return 0;

    // Check for "MM:SS" format
    const mmssMatch = duration.match(/^(\d+):(\d{1,2})$/);
    if (mmssMatch) {
      const minutes = parseInt(mmssMatch[1], 10);
      const seconds = parseInt(mmssMatch[2], 10);
      return minutes * 60 + seconds;
    }

    // Fallback: try to parse as number (seconds)
    const justNumber = parseInt(duration, 10);
    if (!isNaN(justNumber)) return justNumber;

    return 0;
  };

  // Calculate stats memoized for performance
  const stats = useMemo(() => {
    if (localPractices.length === 0) {
      return {
        count: 0,
        avgScore: 0,
        highestScore: 0,
        totalPracticeSeconds: 0,
        streak: 0,
      };
    }
    const count = localPractices.length;
    // Scores array
    const scores = localPractices.map((s) => s.score);
    const avgScore =
      scores.reduce((sum, val) => sum + val, 0) / scores.length || 0;
    const highestScore = Math.max(...scores);

    // Total practice seconds
    const totalPracticeSeconds = localPractices
      .map((s) => parseDurationToSeconds(s.duration))
      .reduce((sum, val) => sum + val, 0);

    // Calculate streak (consecutive days with practices)
    // Get unique speech dates sorted ascending (in yyyy-mm-dd)
    const datesSet = new Set(
      localPractices.map((s) => new Date(s.date).toISOString().slice(0, 10)),
    );
    const uniqueDates = Array.from(datesSet).sort();

    let streak = 1;
    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const currDate = new Date(uniqueDates[i]);
      const prevDate = new Date(uniqueDates[i - 1]);
      const diffDays =
        (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays === 1) {
        streak++;
      } else {
        break; // streak broken
      }
    }

    return {
      count,
      avgScore: Math.round(avgScore),
      highestScore,
      totalPracticeSeconds,
      streak,
    };
  }, [localPractices]);

  // Convert seconds to mm:ss or "Xm" format
  const formatSecondsToDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return { bg: "#dcfce7", text: "#166534", icon: "#22c55e" };
    if (score >= 80) return { bg: "#dbeafe", text: "#1e40af", icon: "#3b82f6" };
    if (score >= 70) return { bg: "#fef3c7", text: "#92400e", icon: "#f59e0b" };
    return { bg: "#fee2e2", text: "#991b1b", icon: "#ef4444" };
  };

  const handleDeletePractice = async (practiceId: string) => {
    const confirmed = confirm("Are you sure you want to delete this practice?");
    if (!confirmed) return;

    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${BASE_URL}/practice/delete/${practiceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail || "Failed to delete practice.");
        return;
      }

      if (onRefresh) {
        onRefresh();
      } else {
        // fallback: update local
        setLocalPractices((prev) =>
          prev.filter((practice) => practice.id !== practiceId),
        );
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const renderPracticeItem = ({ item }: { item: PracticeEntry }) => {
    const scoreColors = getScoreColor(item.score);

    return (
      <TouchableOpacity
        className="rounded-3xl p-5 mb-4 shadow-lg"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 0.5,
          shadowColor: theme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === "dark" ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
        onPress={() => setSelectedPractice(item)}
        onLongPress={() => handleDeletePractice(item.id)}
      >
        {/* Header Row */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-3">
            <Text
              className="text-xl font-bold mb-1"
              style={{ color: colors.text }}
            >
              {item.title}
            </Text>
            <View className="flex-row items-center">
              <View
                className="rounded-full px-3 py-1 mr-2"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#f3f4f6",
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.primary }}
                >
                  {item.category}
                </Text>
              </View>
              <Calendar size={12} color={colors.textSecondary} />
              <Text
                className="text-xs ml-1"
                style={{ color: colors.textSecondary }}
              >
                {formatDate(item.date)}
              </Text>
            </View>
          </View>

          {/* Score Badge */}
          <View
            className="rounded-2xl px-4 py-2 items-center justify-center min-w-[60px]"
            style={{ backgroundColor: scoreColors.bg }}
          >
            <Text
              className="text-2xl font-bold"
              style={{ color: scoreColors.text }}
            >
              {item.score}
            </Text>
            <Text
              className="text-xs font-medium"
              style={{ color: scoreColors.text }}
            >
              SCORE
            </Text>
          </View>
        </View>

        {/* Metrics Row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="flex-row items-center mr-4">
              <Clock size={14} color={colors.textSecondary} />
              <Text
                className="text-sm ml-1 font-medium"
                style={{ color: colors.textSecondary }}
              >
                {item.duration}
              </Text>
            </View>

            <View className="flex-row items-center">
              {item.improvement === "N/A" ? (
                <>
                  <TrendingUp size={14} color="#9ca3af" /> {/* Gray */}
                  <Text className="text-sm ml-1 font-medium text-gray-400">
                    New
                  </Text>
                </>
              ) : parseInt(item.improvement) > 0 ? (
                <>
                  <TrendingUp size={14} color="#10b981" />
                  <Text className="text-sm ml-1 font-bold text-green-500">
                    {item.improvement}
                  </Text>
                </>
              ) : parseInt(item.improvement) < 0 ? (
                <>
                  <TrendingDown size={14} color="#ef4444" />
                  <Text className="text-sm ml-1 font-bold text-red-500">
                    {item.improvement}
                  </Text>
                </>
              ) : (
                <>
                  <TrendingUp size={14} color="#9ca3af" />
                  <Text className="text-sm ml-1 font-medium text-gray-400">
                    ±0
                  </Text>
                </>
              )}
            </View>
          </View>

          <ChevronRight size={20} color={colors.textSecondary} />
        </View>

        {/* Progress Bar */}
        <View className="mt-3">
          <View
            className="h-1 rounded-full"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#f3f4f6",
            }}
          >
            <View
              className="h-1 rounded-full"
              style={{
                backgroundColor: scoreColors.icon,
                width: `${item.score}%`,
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailView = () => {
    if (!selectedPractice) return null;

    // Convert speech data to analysis results format
    const analysisResults = {
      overallScore: selectedPractice.score,
      pace: selectedPractice.pace,
      fillerWords: 8,
      emotionalDelivery: 89,
      clarity: 92,
      confidence: 84,
      engagement: 88,
      improvement: selectedPractice.improvement,
      duration: selectedPractice.duration,
      wordCount: 425,
      avgPause: selectedPractice.pause,
    };

    const feedback = {
      strengths: selectedPractice.evaluation.Commendations,
      improvements: selectedPractice.evaluation.Recommendations,
    };

    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          className="px-6 py-6"
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 0.5,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => setSelectedPractice(null)}
              className="rounded-full p-2"
              style={{ backgroundColor: colors.surface }}
            >
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Practice Session Analysis
            </Text>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView className="flex-1">
          <View className="p-6">
            <Text
              className="text-2xl font-bold mb-2 text-center"
              style={{ color: colors.text }}
            >
              {selectedPractice.title}
            </Text>
            <Text
              className="text-center mb-8 text-base"
              style={{ color: colors.textSecondary }}
            >
              Recorded on {formatDate(selectedPractice.date)} •{" "}
              {selectedPractice.category}
            </Text>

            {/* Quick Feedback */}
            <QuickFeedbackPractice
              analysisResults={analysisResults}
              feedback={feedback}
              onRecordAnother={() => setCurrentStep("record")}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text style={{ color: colors.text, fontSize: 18, marginBottom: 12 }}>
          Loading your practices...
        </Text>
        <Award size={48} color={colors.primary} />
      </View>
    );
  }

  if (selectedPractice) {
    return renderDetailView();
  }

  // Optional helper component for cleaner JSX
  function StatCard({
    colors,
    bgColor,
    icon,
    title,
    value,
    subtitle,
  }: {
    colors: ReturnType<typeof getThemeColors>;
    bgColor: string;
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle: string;
  }) {
    return (
      <View
        className="rounded-3xl p-5 mr-4 shadow-lg min-w-[140px]"
        style={{
          backgroundColor: colors.card,
          shadowColor: "#000", // always black works better cross-theme
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4, // Android
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View
            className="rounded-full p-2"
            style={{ backgroundColor: bgColor }}
          >
            {icon}
          </View>
          <Text
            className="text-xs font-medium"
            style={{ color: colors.textSecondary }}
          >
            {title}
          </Text>
        </View>
        <Text className="text-3xl font-bold" style={{ color: colors.text }}>
          {value}
        </Text>
        <Text
          className="text-sm font-medium"
          style={{ color: colors.textSecondary }}
        >
          {subtitle}
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Enhanced Stats Overview */}
      <View className="px-6 py-4">
        <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
          Your Practice
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {/* Count */}
            <StatCard
              colors={colors}
              bgColor="#e0f2fe"
              icon={<Mic size={20} color="#0284c7" />}
              title="COUNT"
              value={stats.count}
              subtitle="Total Sessions"
            />

            {/* AVG Score */}
            <StatCard
              colors={colors}
              bgColor="#fef3c7"
              icon={<Target size={20} color="#f59e0b" />}
              title="AVG"
              value={stats.avgScore}
              subtitle="Average Score"
            />

            {/* Highest Score */}
            <StatCard
              colors={colors}
              bgColor="#dcfce7"
              icon={<Star size={20} color="#10b981" />}
              title="BEST"
              value={stats.highestScore}
              subtitle="Highest Score"
            />

            {/* Total Practice Time */}
            <StatCard
              colors={colors}
              bgColor="#dbeafe"
              icon={<Clock size={20} color="#3b82f6" />}
              title="TIME"
              value={formatSecondsToDuration(stats.totalPracticeSeconds)}
              subtitle="Total Practice"
            />

            {/* Streak */}
            <StatCard
              colors={colors}
              bgColor="#f3e8ff"
              icon={<Zap size={20} color="#8b5cf6" />}
              title="STREAK"
              value={stats.streak}
              subtitle="Day Streak"
            />
          </View>
        </ScrollView>
      </View>

      {localPractices.length > 0 ? (
        <View className="flex-1">
          <View className="px-6 py-2">
            <Text
              className="text-lg font-bold mb-3"
              style={{ color: colors.text }}
            >
              Recent Practice Sessions
            </Text>
          </View>
          {localPractices.map((practice) => (
            <View key={practice.id} style={{ paddingHorizontal: 24 }}>
              {renderPracticeItem({ item: practice })}
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <View
            className="rounded-3xl p-10 items-center shadow-lg w-full max-w-sm"
            style={{
              backgroundColor: colors.card,
              shadowColor: theme === "dark" ? "#000" : "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: theme === "dark" ? 0.3 : 0.1,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <View
              className="rounded-full p-6 mb-6"
              style={{
                backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
              }}
            >
              <Mic size={48} color={colors.primary} />
            </View>

            <Text
              className="text-2xl font-bold mb-3 text-center"
              style={{ color: colors.text }}
            >
              Looks like you're new here!
            </Text>

            <Text
              className="text-center mb-8 text-base leading-6"
              style={{ color: colors.textSecondary }}
            >
              No past practices yet. Time to grab that mic and show the world
              what you've got. Your ToastSpeech journey starts now!
            </Text>

            <TouchableOpacity
              className="rounded-2xl px-8 py-4 w-full"
              style={{ backgroundColor: colors.primary }}
              onPress={() => {}}
            >
              <View className="flex-row items-center justify-center">
                <Mic size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  Start Your First practice
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}
