import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  Inbox
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import QuickFeedback from "./QuickFeedback";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config/api";

interface SpeechEntry {
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

interface SpeechLibraryProps {
  searchQuery: string;
  speechTypeFilter: string | null;
  durationFilter: "lt5" | "range5to7" | "gt7" | null;
  scoreRange: [number, number] | null;
  dateRange: "yesterday" | "last7days" | "last30days" | null;
  onEditNotes?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
  onViewDetailedFeedback?: () => void;
}

export default function SpeechLibrary({
  searchQuery,
  speechTypeFilter,
  durationFilter,
  scoreRange,
  dateRange,
  onViewDetailedFeedback,
  onEditNotes,
  onDeleteEntry,
}: SpeechLibraryProps) {
  const [selectedSpeech, setSelectedSpeech] = useState<SpeechEntry | null>(
    null,
  );
  const [speeches, setSpeeches] = useState([]);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);


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

  // Helper function to check if date matches range
  const matchesDateRange = (dateString: string, range: string | null) => {
    if (!range) return true;

    const itemDate = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - itemDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (range) {
      case "yesterday":
        return diffDays <= 1;
      case "last7days":
        return diffDays <= 7;
      case "last30days":
        return diffDays <= 30;
      default:
        return true;
    }
  };


  useEffect(() => {
    const fetchSpeeches = async () => {
      setIsLoading(true);
      try {
      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(`${BASE_URL}/speech/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch speeches");
      }

      const data = await response.json();
      console.log("✅ Loaded speeches from Supabase", data.speeches);

      const transformed = data.speeches
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(), 
        ).map((speech, idx, arr) => {
          const metadata = speech.summary?.Metadata || {};
          const currentScore = metadata.overall_score || 0;
          const previousScore =
            idx < arr.length - 1
              ? arr[idx + 1].summary?.Metadata?.overall_score || 0
              : null;

          const improvement =
            previousScore !== null
              ? `${currentScore - previousScore > 0 ? "+" : ""}${currentScore - previousScore}`
              : "first speech";

          return {
            id: speech.id || `speech-${idx}`,
            title: speech.title || "Untitled",
            date: new Date(speech.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            duration: (() => {
              const totalSpeakingSeconds =
                speech.analytics?.speaker_analysis?.[0]
                  ?.total_speaking_time_seconds || 0;
              const minutes = Math.floor(totalSpeakingSeconds / 60);
              const seconds = Math.floor(totalSpeakingSeconds % 60);
              return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
            })(),
            score: currentScore,
            pace:
              speech.analytics?.speaker_analysis?.[0]?.words_per_minute || 0,
            pause:
              speech.analytics?.speaker_analysis?.[0]?.pause_frequency || 0,
            pausesData: speech.analytics?.pauses || [],
            fillerData: speech.analytics?.filler_words || [],
            crutchData: speech.analytics?.crutch_phrases || [],
            repeatedPhrases: speech.analytics?.repeated_words || [],
            grammarData: speech.analytics?.grammar_mistakes || [],
            environData: speech.analytics?.environmental_elements || [],
            pitchData: speech.pitch_track || [],
            emoji: { name: "mic", color: "#7c3aed" },
            category: speech.speech_type || "General",
            improvement,
            summary: speech.summary,
            detailed: speech.detailed_evaluation,
            url: speech.url,
          };
        });

      setSpeeches(transformed);
      } catch (err) {
        console.error("❌ Failed to load speeches:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpeeches();
  }, []);

   // Use useMemo to filter the data whenever the props or data changes
  const filteredSpeeches = useMemo(() => {
    return speeches.filter((speech) => {
      // Apply all the filters using the props
      if (searchQuery && !speech.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (speechTypeFilter && speech.category.toLowerCase() !== speechTypeFilter.toLowerCase()) {
        return false;
      }
      if (!matchesDurationFilter(speech.duration, durationFilter)) {
        return false;
      }
      if (!matchesScoreRange(speech.score, scoreRange)) {
        return false;
      }
      if (!matchesDateRange(speech.date, dateRange)) {
        return false;
      }
      return true;
    });
  }, [
    speeches,
    searchQuery,
    speechTypeFilter,
    durationFilter,
    scoreRange,
    dateRange,
  ]);

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
    if (speeches.length === 0) {
      return {
        count: 0,
        avgScore: 0,
        highestScore: 0,
        totalPracticeSeconds: 0,
        streak: 0,
      };
    }
    const count = speeches.length;
    // Scores array
    const scores = speeches.map((s) => s.score);
    const avgScore =
      scores.reduce((sum, val) => sum + val, 0) / scores.length || 0;
    const highestScore = Math.max(...scores);

    // Total practice seconds
    const totalPracticeSeconds = speeches
      .map((s) => parseDurationToSeconds(s.duration))
      .reduce((sum, val) => sum + val, 0);

    // Calculate streak (consecutive days with speeches)
    // Get unique speech dates sorted ascending (in yyyy-mm-dd)
    const datesSet = new Set(
      speeches.map((s) => new Date(s.date).toISOString().slice(0, 10)),
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
  }, [speeches]);

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

  const handleDeleteSpeech = async (speechId: string) => {
    const confirmed = confirm("Are you sure you want to delete this speech?");
    if (!confirmed) return;

    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${BASE_URL}/speech/delete/${speechId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail || "Failed to delete speech.");
        return;
      }

      // if (onRefresh) {
      //   onRefresh();
      // } else {
      //   // fallback: update local
      //   setSpeeches((prev) =>
      //     prev.filter((speech) => speech.id !== speechId),
      //   );
      // }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const renderSpeechItem = ({ item }: { item: SpeechEntry }) => {
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
        onPress={() => setSelectedSpeech(item)}
        onLongPress={() => handleDeleteSpeech(item.id)}
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
                className="rounded-full py-1 mr-2"
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
    if (!selectedSpeech) return null;

    // Convert speech data to analysis results format
    const analysisResults = {
      overallScore: selectedSpeech.score,
      pace: selectedSpeech.pace,
      fillerWords: 8,
      emotionalDelivery: 89,
      clarity: 92,
      confidence: 84,
      engagement: 88,
      improvement: selectedSpeech.improvement,
      duration: selectedSpeech.duration,
      wordCount: 425,
      avgPause: selectedSpeech.pause,
      pausesData: selectedSpeech.pausesData,
      fillerData: selectedSpeech.fillerData,
      crutchData: selectedSpeech.crutchData,
      repeatedPhrases: selectedSpeech.repeatedPhrases,
      grammarData: selectedSpeech.grammarData,
      environData: selectedSpeech.environData,
      pitchData: selectedSpeech.pitchData
    };

    const feedback = {
      strengths: selectedSpeech.summary.Commendations,
      improvements: selectedSpeech.summary.Recommendations,
      keyInsights: selectedSpeech.summary.KeyInsights,
    };

    const detailedFeedback = {
      Introduction: selectedSpeech.detailed.Introduction,
      Conclusion: selectedSpeech.detailed.Conclusion,
      VocalVariety_commendations:
        selectedSpeech.detailed.VocalVariety_commendations,
      VocalVariety_recommendations:
        selectedSpeech.detailed.VocalVariety_recommendations,
      VocalVariety_score: selectedSpeech.detailed.VocalVariety_score,
      SpeechStructure_commendations:
        selectedSpeech.detailed.SpeechStructure_commendations,
      SpeechStructure_recommendations:
        selectedSpeech.detailed.SpeechStructure_recommendations,
      SpeechStructure_score: selectedSpeech.detailed.SpeechStructure_score,
      Storytelling_commendations:
        selectedSpeech.detailed.Storytelling_commendations,
      Storytelling_recommendations:
        selectedSpeech.detailed.Storytelling_recommendations,
      Storytelling_score: selectedSpeech.detailed.Storytelling_score,
      Language_commendations: selectedSpeech.detailed.Language_commendations,
      Language_recommendations:
        selectedSpeech.detailed.Language_recommendations,
      Language_score: selectedSpeech.detailed.Language_score,
      QuestionResolution_commendations:
        selectedSpeech.detailed.QuestionResolution_commendations,
      QuestionResolution_recommendations:
        selectedSpeech.detailed.QuestionResolution_recommendations,
      QuestionResolution_score:
        selectedSpeech.detailed.QuestionResolution_score,
      StoryStages_commendations:
        selectedSpeech.detailed.StoryStages_commendations,
      StoryStages_recommendations:
        selectedSpeech.detailed.StoryStages_recommendations,
      StoryStages_score: selectedSpeech.detailed.StoryStages_score,
      Connections_commendations:
        selectedSpeech.detailed.Connections_commendations,
      Connections_recommendations:
        selectedSpeech.detailed.Connections_recommendations,
      Connections_score: selectedSpeech.detailed.Connections_score,
      OverallInsights: selectedSpeech.detailed.OverallInsights,
      url: selectedSpeech.url,
    };

    console.log(detailedFeedback);

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
              onPress={() => setSelectedSpeech(null)}
              className="rounded-full p-2"
              style={{ backgroundColor: colors.surface }}
            >
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Speech Analysis
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
              {selectedSpeech.title}
            </Text>
            <Text
              className="text-center mb-8 text-base"
              style={{ color: colors.textSecondary }}
            >
              Recorded on {formatDate(selectedSpeech.date)} •{" "}
              {selectedSpeech.category}
            </Text>

            {/* Quick Feedback */}
            <QuickFeedback
              analysisResults={analysisResults}
              feedback={feedback}
              detailedFeedback={detailedFeedback}
              onViewDetailedFeedback={(detailed) => {
                const feedbackParam = encodeURIComponent(
                  JSON.stringify(detailed),
                );
                router.push(`/detailed-feedback?feedback=${feedbackParam}`);
              }}
              onRecordAnother={() => setCurrentStep("record")}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

if (isLoading) {
  return (
    <SafeAreaView
      className="flex-1 justify-center items-center mt-9" // Centers content both horizontally and vertically
      style={{ backgroundColor: colors.background }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {/* Provides clear visual separation and emphasis for the loading message */}
      <Text style={{ color: colors.text, marginTop: 16, fontSize: 16, fontWeight: '600' }}>
        Loading your speeches...
      </Text>
    </SafeAreaView>
  );
}

// Handle no results case here
  if (filteredSpeeches.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-6 py-12">
        <Text className="text-xl font-bold mb-2" style={{ color: colors.text }}>No Speeches Found</Text>
        <Text className="text-center" style={{ color: colors.textSecondary }}>
          {searchQuery ? "Try a different search or clear your filters." : "You haven't recorded any speeches yet."}
        </Text>
      </View>
    );
  }


  if (selectedSpeech) {
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
          Your Speeches
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
              subtitle="Total Speeches"
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

      {speeches.length > 0 ? (
        <View className="flex-1">
          <View className="px-6 py-2">
            {/* <Text
              className="text-lg font-bold mb-3"
              style={{ color: colors.text }}
            >
              Recent Speeches
            </Text> */}
          </View>
          {filteredSpeeches.map((speech) => (
            <View key={speech.id} style={{ paddingHorizontal: 24 }}>
              {renderSpeechItem({ item: speech })}
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
              No past sessions yet. Time to grab that mic and start yout Echozi journey!
            </Text>

            <TouchableOpacity
              className="rounded-2xl px-8 py-4 w-full"
              style={{ backgroundColor: colors.primary }}
              onPress={() => {
                router.push(`/speaker-mode`);
              }}
            >
              <View className="flex-row items-center justify-center">
                <Mic size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  Start Your First Speech
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}
