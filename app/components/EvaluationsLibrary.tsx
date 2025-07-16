import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  BarChart3,
  Star,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Clock,
  TrendingUp,
  TrendingDown,
  Mic,
  Award,
  Target,
  Zap,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import QuickFeedbackEvaluations from "./QuickFeedbackEvaluations";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config/api";
import { Alert } from "react-native";

interface Evaluation {
  id: string;
  score: number;
  strengths: string[];
  improvements: string[];
  keyInsights: string[];
  date: string;
  improvement: string;
  evaluationAccuracy: number;
  speakingQuality: number;
  contentInsight: number;
  clarity: number;
  confidence: number;
  duration: string;
  wordCount: number;
  avgPause: string;
}

interface EvaluationsLibraryProps {
  evaluations: Evaluation[];
  onViewDetailedFeedbackEval: (id: string) => void;
  onRefresh?: () => void;
}

export default function EvaluationsLibrary({
  evaluations = [],
  onViewDetailedFeedbackEval = () => {},
  isLoading = false,
  onRefresh = () => {},
}: EvaluationsLibraryProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<Evaluation | null>(null);
  const [localEvals, setLocalEvals] = useState<Evaluation[]>(evaluations);
  const router = useRouter();
  const totalEvaluations = localEvals.length;
  const averageScore = Math.round(
    evaluations.reduce((acc, curr) => acc + curr.score, 0) / totalEvaluations,
  );

  useEffect(() => {
    setLocalEvals(evaluations);
  }, [evaluations]);

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
    if (localEvals.length === 0) {
      return {
        count: 0,
        avgScore: 0,
        highestScore: 0,
        totalPracticeSeconds: 0,
        streak: 0,
      };
    }
    const count = localEvals.length;
    // Scores array
    const scores = localEvals.map((e) => e.score);
    const avgScore =
      scores.reduce((sum, val) => sum + val, 0) / scores.length || 0;
    const highestScore = Math.max(...scores);

    // Total practice seconds
    const totalPracticeSeconds = localEvals
      .map((e) => parseDurationToSeconds(e.duration))
      .reduce((sum, val) => sum + val, 0);

    // Calculate streak (consecutive days with evaluations)
    // Get unique evaluations dates sorted ascending (in yyyy-mm-dd)
    const datesSet = new Set(
      localEvals.map((e) => new Date(e.date).toISOString().slice(0, 10)),
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
  }, [localEvals]);

  // Convert seconds to mm:ss or "Xm" format
  const formatSecondsToDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
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

  const handleDeleteEvaluation = async (evaluationId: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this evaluation?",
    );
    if (!confirmed) return;

    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${BASE_URL}/evaluator/delete/${evaluationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail || "Failed to delete evaluation.");
        return;
      }

      if (onRefresh) {
        onRefresh();
      } else {
        // fallback: update local
        setLocalEvals((prev) =>
          prev.filter((evaluation) => evaluation.id !== evaluationId),
        );
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const renderEvalItem = ({ item }: { item: Evaluation }) => {
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
        onPress={() => setSelectedEvaluation(item)}
        onLongPress={() => handleDeleteEvaluation(item.id)}
      >
        {/* Header Row */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-3">
            <Text
              className="text-xl font-bold mb-1"
              style={{ color: colors.text }}
            >
              Evaluation
            </Text>
            <View className="flex-row items-center">
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
    if (!selectedEvaluation) return null;

    const evaluationResults = {
      overallScore: selectedEvaluation.score,
      improvement: selectedEvaluation.improvement,
      duration: selectedEvaluation.duration,
      pace: selectedEvaluation.pace,
      avgPause: selectedEvaluation.avgPause,
    };

    const feedback = {
      strengths: selectedEvaluation.summary.Commendations,
      improvements: selectedEvaluation.summary.Recommendations,
      keyInsights: selectedEvaluation.summary.KeyInsights,
    };

    const detailedFeedback = {
      Introduction: selectedEvaluation.detailed.Introduction,
      Conclusion: selectedEvaluation.detailed.Conclusion,
      AnalysisQuality_commendations:
        selectedEvaluation.detailed.AnalysisQuality_commendations,
      AnalysisQuality_recommendations:
        selectedEvaluation.detailed.AnalysisQuality_recommendations,
      AnalysisQuality_score: selectedEvaluation.detailed.AnalysisQuality_score,
      Recommendations_commendations:
        selectedEvaluation.detailed.Recommendations_commendations,
      Recommendations_recommendations:
        selectedEvaluation.detailed.Recommendations_recommendations,
      Recommendations_score: selectedEvaluation.detailed.Recommendations_score,
      DeliveryTechnique_commendations:
        selectedEvaluation.detailed.DeliveryTechnique_commendations,
      DeliveryTechnique_recommendations:
        selectedEvaluation.detailed.DeliveryTechnique_recommendations,
      DeliveryTechnique_score:
        selectedEvaluation.detailed.DeliveryTechnique_score,
      OverallImpact_commendations:
        selectedEvaluation.detailed.OverallImpact_commendations,
      OverallImpact_recommendations:
        selectedEvaluation.detailed.OverallImpact_recommendations,
      OverallImpact_score: selectedEvaluation.detailed.OverallImpact_score,
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
              onPress={() => setSelectedEvaluation(null)}
              className="rounded-full p-2"
              style={{ backgroundColor: colors.surface }}
            >
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Evaluation Analysis
            </Text>
            <View className="w-10" />
          </View>
        </View>

        <QuickFeedbackEvaluations
          evaluationResults={evaluationResults}
          feedback={feedback}
          detailedFeedback={detailedFeedback}
          onViewDetailedFeedback={(detailed) => {
            const feedbackParam = encodeURIComponent(JSON.stringify(detailed));
            router.push(`/detailed-feedback-eval?feedback=${feedbackParam}`);
          }}
          onRecordAnother={() => {}}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text style={{ color: colors.text, fontSize: 18, marginBottom: 12 }}>
          Loading your speeches...
        </Text>
        <Award size={48} color={colors.primary} />
      </View>
    );
  }

  if (selectedEvaluation) {
    return renderDetailView();
  }

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
          Your Evaluations
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            <StatCard
              colors={colors}
              bgColor="#e0f2fe"
              icon={<Mic size={20} color="#0284c7" />}
              title="COUNT"
              value={stats.count}
              subtitle="Total Evaluations"
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

      {localEvals.length > 0 ? (
        <View className="flex-1">
          <View className="px-6 py-2">
            <Text
              className="text-lg font-bold mb-3"
              style={{ color: colors.text }}
            >
              Recent Evaluations
            </Text>
          </View>
          {localEvals.map((evaluation) => (
            <View key={evaluation.id} style={{ paddingHorizontal: 24 }}>
              {renderEvalItem({ item: evaluation })}
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
              No past evaluations yet. Time to grab that mic and show the world
              what you've got. Your ToastSpeech journey starts now!
            </Text>

            <TouchableOpacity
              className="rounded-2xl px-8 py-4 w-full"
              style={{ backgroundColor: colors.primary }}
              onPress={() => {
                alert("Navigating to Evaluator Mode...");
              }}
            >
              <View className="flex-row items-center justify-center">
                <Mic size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  Start Your First Evaluation
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}
