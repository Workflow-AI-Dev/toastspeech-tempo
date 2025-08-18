import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, TextInput } from "react-native";
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
  Inbox,
  X
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import QuickFeedbackEvaluations from "./QuickFeedbackEvaluations";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config/api";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LibraryHeader from "./LibraryHeader";

interface Evaluation {
  id: string;
  score: number;
  speechTitle: string;
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
  searchQuery: string;
  speechTypeFilter: string | null;
  durationFilter: "lt5" | "range5to7" | "gt7" | null;
  scoreRange: [number, number] | null;
  dateRange: "yesterday" | "last7days" | "last30days" | null;
  onViewDetailedFeedbackEval: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  isFilterModalVisible: boolean;
  setIsFilterModalVisible: (visible: boolean) => void;
}

const parseDateString = (input: unknown): Date | null => {
  if (typeof input !== "string" || !input.trim()) return null;

  try {
    const iso = input
      .replace(" ", "T")
      .replace(/(\.\d{3})\d+/, "$1"); 

    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};


const formatDate = (input: string) => {
  const d = parseDateString(input);
  if (!d) return "Invalid date";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function EvaluationsLibrary({
  searchQuery,
  speechTypeFilter,
  durationFilter,
  scoreRange,
  dateRange,
  onViewDetailedFeedbackEval = () => {},
  activeTab,
  setActiveTab,
  isFilterModalVisible,
  setIsFilterModalVisible,
  setSearchQuery,
}: EvaluationsLibraryProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<Evaluation | null>(null);
  const [evaluations, setEvaluations] = useState([]);
  const router = useRouter();
  const totalEvaluations = evaluations.length;
  const averageScore = Math.round(
    evaluations.reduce((acc, curr) => acc + curr.score, 0) / totalEvaluations,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const hasActiveFilters = searchQuery || speechTypeFilter || durationFilter || scoreRange || dateRange;


    // Helper function to check if duration matches filter
  const matchesDurationFilter = (duration: string, filter: string | null) => {
    if (!filter) return true;

    // Parse duration to minutes
    const parseDurationToMinutes = (dur: string): number => {
      if (!dur || dur.toLowerCase() === "n/a") return 0;

      // Check for "MM:SS" format
      const mmssMatch = dur.match(/^(\d+):(\d{1,2})$/);
      if (mmssMatch) {
        const minutes = parseInt(mmssMatch[1], 10);
        const seconds = parseInt(mmssMatch[2], 10);
        return minutes + seconds / 60;
      }

      // Check for "Xm" format
      const minMatch = dur.match(/^(\d+)m/);
      if (minMatch) {
        return parseInt(minMatch[1], 10);
      }

      return 0;
    };

    const minutes = parseDurationToMinutes(duration);

    switch (filter) {
      case "lt5":
        return minutes < 5;
      case "range5to7":
        return minutes >= 5 && minutes <= 7;
      case "gt7":
        return minutes > 7;
      default:
        return true;
    }
  };

  // Helper function to check if score matches range
  const matchesScoreRange = (score: number, range: [number, number] | null) => {
    if (!range) return true;
    return score >= range[0] && score <= range[1];
  };

  // // Helper function to check if date matches range
  // const matchesDateRange = (dateString: string, range: string | null) => {
  //   if (!range) return true;

  //   const itemDate = new Date(dateString);
  //   const now = new Date();
  //   const diffTime = now.getTime() - itemDate.getTime();
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //   switch (range) {
  //     case "yesterday":
  //       return diffDays <= 1;
  //     case "last7days":
  //       return diffDays <= 7;
  //     case "last30days":
  //       return diffDays <= 30;
  //     default:
  //       return true;
  //   }
  // };

  useEffect(() => {
    const fetchEvaluations = async () => {
      setIsLoading(true);
      try {
      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(`${BASE_URL}/evaluator/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch evaluations");
      }

      const data = await response.json();
      console.log("✅ Loaded evaluations from Supabase", data.evaluations);

      const transformed = data.evaluations
        .map((evaluation, idx, arr) => {
          const metadata = evaluation.summary?.Metadata || {};
          const currentScore = metadata.overall_score || 0;
          const previousScore =
            idx < arr.length - 1
              ? arr[idx + 1].summary?.Metadata?.overall_score || 0
              : null;

          const improvement =
            previousScore !== null
              ? `${currentScore - previousScore > 0 ? "+" : ""}${currentScore - previousScore}`
              : "0";

          return {
            id: evaluation.id || `evaluation-${idx}`,
            date: 'Aug 17, 2025',
            speechTitle: evaluation.speech_title,
            duration: (() => {
              const totalSpeakingSeconds =
                evaluation.analytics?.speaker_analysis?.[0]
                  ?.total_speaking_time_seconds || 0;
              const minutes = Math.floor(totalSpeakingSeconds / 60);
              const seconds = totalSpeakingSeconds % 60;
              return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
            })(),
            score: metadata.overall_score || 0,
            pace:
              evaluation.analytics?.speaker_analysis?.[0]?.words_per_minute ||
              0,
            pause:
              evaluation.analytics?.speaker_analysis?.[0]?.pause_frequency || 0,
            pausesData: evaluation.analytics?.pauses || [],
            fillerData: evaluation.analytics?.filler_words || [],
            crutchData: evaluation.analytics?.crutch_phrases || [],
            repeatedPhrases: evaluation.analytics?.repeated_words || [],
            grammarData: evaluation.analytics?.grammar_mistakes || [],
            environData: evaluation.analytics?.environmental_elements || [],
            pitchData: evaluation.pitch_track || [],
            emoji: { name: "mic", color: "#7c3aed" },
            improvement,
            summary: evaluation.summary,
            detailed: evaluation.detailed_evaluation,
          };
        });

      setEvaluations(transformed);
      } catch (err) {
        console.error("❌ Failed to load evaluation:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

    // Filter evaluations based on filters
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      if (searchQuery) {
        if (
          !evaluation.speechTitle ||
          !evaluation.speechTitle.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
      }
  
      if (!matchesDurationFilter(evaluation.duration, durationFilter)) {
        return false;
      }
  
      if (!matchesScoreRange(evaluation.score, scoreRange)) {
        return false;
      }
  
      // if (!matchesDateRange(evaluation.date, dateRange)) {
      //   return false;
      // }
  
      return true;
    });
  }, [evaluations, searchQuery, durationFilter, scoreRange, dateRange]);


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
    if (evaluations.length === 0) {
      return {
        count: 0,
        avgScore: 0,
        highestScore: 0,
        totalPracticeSeconds: 0,
        streak: 0,
      };
    }
    const count = evaluations.length;
    // Scores array
    const scores = evaluations.map((e) => e.score);
    const avgScore =
      scores.reduce((sum, val) => sum + val, 0) / scores.length || 0;
    const highestScore = Math.max(...scores);

    // Total practice seconds
    const totalPracticeSeconds = evaluations
      .map((e) => parseDurationToSeconds(e.duration))
      .reduce((sum, val) => sum + val, 0);

    // Calculate streak (consecutive days with evaluations)
    // Get unique evaluations dates sorted ascending (in yyyy-mm-dd)
    const datesSet = new Set(
      evaluations.map((e) => new Date(e.date).toISOString().slice(0, 10)),
    );
    const uniqueDates = Array.from(datesSet).sort();

    // let streak = 1;
    // for (let i = uniqueDates.length - 1; i > 0; i--) {
    //   const currDate = new Date(uniqueDates[i]);
    //   const prevDate = new Date(uniqueDates[i - 1]);
    //   const diffDays =
    //     (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
    //   if (diffDays === 1) {
    //     streak++;
    //   } else {
    //     break; // streak broken
    //   }
    // }
    const streak = 0;

    return {
      count,
      avgScore: Math.round(avgScore),
      highestScore,
      totalPracticeSeconds,
      streak,
    };
  }, [evaluations]);

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
        setEvaluations((prev) =>
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
      <View className="px-6">
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
              Evaluation: {item.speechTitle}
            </Text>
            <View className="flex-row items-center">
              <Calendar size={12} color={colors.textSecondary} />
              <Text
                className="text-xs ml-1"
                style={{ color: colors.textSecondary }}
              >
                {item.date}
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
      </View>
    );
  };

  const renderDetailView = () => {
    if (!selectedEvaluation) return null;

    const evaluationResults = {
      overallScore: selectedEvaluation.score,
      pace: selectedEvaluation.pace,
      fillerWords: 8,
      emotionalDelivery: 89,
      clarity: 92,
      confidence: 84,
      engagement: 88,
      improvement: selectedEvaluation.improvement,
      duration: selectedEvaluation.duration,
      wordCount: 425,
      avgPause: selectedEvaluation.pause,
      pausesData: selectedEvaluation.pausesData,
      fillerData: selectedEvaluation.fillerData,
      crutchData: selectedEvaluation.crutchData,
      grammarData: selectedEvaluation.grammarData,
      environData: selectedEvaluation.environData,
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
      OverallInsights: selectedEvaluation.detailed.OverallInsights,
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

  if (selectedEvaluation) {
    return renderDetailView();
  }

  return (
   <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
         <FlatList
           data={filteredEvaluations}
           renderItem={renderEvalItem}
           keyExtractor={(item) => item.id}
           ListHeaderComponent={
              <LibraryHeader
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSearchActive={isSearchActive}
                setIsSearchActive={setIsSearchActive}
                isFilterModalVisible={isFilterModalVisible}
                setIsFilterModalVisible={setIsFilterModalVisible}
                hasActiveFilters={hasActiveFilters}
                stats={stats}
              />
            }
           ListFooterComponent={<View style={{ height: 20 }} />}
           ListEmptyComponent={() => {
             if (isLoading) {
               return (
                 <View className="flex-1 justify-center items-center py-8">
                   <ActivityIndicator size="large" color={colors.primary} />
                   <Text style={{ color: colors.text, marginTop: 16 }}>
                     Loading your evaluations...
                   </Text>
                 </View>
               );
             } else {
               return (
                 <View className="flex-1 justify-center items-center px-6 py-12">
                   <Text className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                     No Evaluations Found
                   </Text>
                   <Text className="text-center" style={{ color: colors.textSecondary }}>
                     {searchQuery ? "Try a different search or clear your filters." : "You haven't recorded any evaluations yet."}
                   </Text>
                 </View>
               );
             }
           }}
           contentContainerStyle={{ flexGrow: 1 }}
         />
       </SafeAreaView>
  );
}
