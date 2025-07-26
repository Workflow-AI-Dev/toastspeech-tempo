import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import {
  Filter,
  Search,
  BarChart3,
  Mic,
  X,
  Calendar,
  Clock,
  Star,
  ChevronDown,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import SpeechLibrary from "./SpeechLibrary";
import EvaluationsLibrary from "./EvaluationsLibrary";
import PracticeLibrary from "./PracticeLibrary";
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

interface FeedbackLibraryProps {
  speeches?: SpeechEntry[];
  onEditNotes?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
  onViewDetailedFeedback?: () => void;
  onViewDetailedFeedbackEval?: () => void;
}

export default function FeedbackLibrary({
  onViewDetailedFeedback = () => {},
  onViewDetailedFeedbackEval = () => {},
  onEditNotes = (id) => console.log(`Edit notes for speech ${id}`),
  onDeleteEntry = (id) => console.log(`Delete speech ${id}`),
}: FeedbackLibraryProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [activeTab, setActiveTab] = useState<
    "speech" | "evaluation" | "practice"
  >("speech");
  const [speeches, setSpeeches] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [practices, setPractices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Filter states
  const [speechTypeFilter, setSpeechTypeFilter] = useState<string | null>(null);
  const [durationFilter, setDurationFilter] = useState<
    "lt5" | "range5to7" | "gt7" | null
  >(null);
  const [scoreRange, setScoreRange] = useState<[number, number] | null>(null);
  const [dateRange, setDateRange] = useState<
    "yesterday" | "last7days" | "last30days" | null
  >(null);

  useEffect(() => {
    setSearchQuery("");
    setIsSearchActive(false);
  }, [activeTab]);

  const fetchSpeeches = async () => {
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
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(), // 🧠 Newest first
        )

        .map((speech, idx, arr) => {
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
            grammarData: speech.analytics?.grammar_mistakes || [],
            environData: speech.analytics?.environmental_elements || [],
            emoji: <Mic size={24} color="#7c3aed" />,
            category: speech.speech_type || "General",
            improvement,
            summary: speech.summary,
            detailed: speech.detailed_evaluation,
          };
        });

      setSpeeches(transformed);
    } catch (err) {
      console.error("❌ Failed to load speeches:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeeches();
  }, []);

  const fetchEvaluations = async () => {
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
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(), // 🧠 Newest first
        )
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
              : "first evaluation";

          return {
            id: evaluation.id || `evaluation-${idx}`,
            date: new Date(evaluation.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
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
            grammarData: evaluation.analytics?.grammar_mistakes || [],
            environData: evaluation.analytics?.environmental_elements || [],
            emoji: <Mic size={24} color="#7c3aed" />,
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

  // then just call it inside useEffect
  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchPractices = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(`${BASE_URL}/practice/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch evaluations");
      }

      const data = await response.json();
      console.log("✅ Loaded practice records from Supabase", data.practices);

      const transformed = data.practices
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(), // 🧠 Newest first
        )
        .map((practice, idx, arr) => {
          const currentScore = practice.evaluation.OverallScore || 0;
          const previousScore =
            idx < arr.length - 1
              ? arr[idx + 1].evaluation.OverallScore || 0
              : null;

          const improvement =
            previousScore !== null
              ? `${currentScore - previousScore > 0 ? "+" : ""}${currentScore - previousScore}`
              : "first practice session";

          return {
            id: practice.id || `practice-${idx}`,
            date: new Date(practice.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            title: practice.speech_title,
            category: practice.speech_type,
            duration: practice.speech_target_duration || "N/A",
            score: practice.evaluation.OverallScore || 0,
            pace: 0,
            pause: 0,
            emoji: <Mic size={24} color="#7c3aed" />,
            improvement,
            evaluation: practice.evaluation,
          };
        });

      setPractices(transformed);
    } catch (err) {
      console.error("❌ Failed to load evaluation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // then just call it inside useEffect
  useEffect(() => {
    fetchPractices();
  }, []);

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

  // Filter speeches based on search and filters
  const filteredSpeeches = useMemo(() => {
    return speeches.filter((speech) => {
      // Search filter (only for speech tab)
      if (activeTab === "speech" && searchQuery) {
        if (!speech.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      // Speech type filter (only for speech tab)
      if (activeTab === "speech" && speechTypeFilter) {
        if (speech.category.toLowerCase() !== speechTypeFilter.toLowerCase()) {
          return false;
        }
      }

      // Duration filter
      if (!matchesDurationFilter(speech.duration, durationFilter)) {
        return false;
      }

      // Score range filter
      if (!matchesScoreRange(speech.score, scoreRange)) {
        return false;
      }

      // Date range filter
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
    activeTab,
  ]);

  // Filter evaluations based on filters
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      if (searchQuery) {
        if (
          !evaluation.speechTitle
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
      }

      // Duration filter
      if (!matchesDurationFilter(evaluation.duration, durationFilter)) {
        return false;
      }

      // Score range filter
      if (!matchesScoreRange(evaluation.score, scoreRange)) {
        return false;
      }

      // Date range filter
      if (!matchesDateRange(evaluation.date, dateRange)) {
        return false;
      }

      return true;
    });
  }, [evaluations, durationFilter, scoreRange, dateRange]);

  // Filter speeches based on search and filters
  const filteredPractices = useMemo(() => {
    return practices.filter((practice) => {
      if (activeTab === "practice" && searchQuery) {
        if (!practice.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      // Speech type filter
      if (activeTab === "practice" && speechTypeFilter) {
        if (
          practice.category.toLowerCase() !== speechTypeFilter.toLowerCase()
        ) {
          return false;
        }
      }

      // Duration filter
      if (!matchesDurationFilter(practice.duration, durationFilter)) {
        return false;
      }

      // Score range filter
      if (!matchesScoreRange(practice.score, scoreRange)) {
        return false;
      }

      // Date range filter
      if (!matchesDateRange(practice.date, dateRange)) {
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
    activeTab,
  ]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSpeechTypeFilter(null);
    setDurationFilter(null);
    setScoreRange(null);
    setDateRange(null);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    speechTypeFilter ||
    durationFilter ||
    scoreRange ||
    dateRange;

  // Render filter modal
  const renderFilterModal = () => {
    return (
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
          {/* Header */}
          <View
            className="px-6 py-6 border-b"
            style={{
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Filters
              </Text>
              <TouchableOpacity
                onPress={() => setIsFilterModalVisible(false)}
                className="rounded-full p-2"
                style={{ backgroundColor: colors.surface }}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {["speech", "practice", "evaluation"].includes(activeTab) && (
              <View className="mb-6">
                <Text
                  className="text-lg font-semibold mb-3"
                  style={{ color: colors.text }}
                >
                  Speech Type
                </Text>
                <View className="flex-row flex-wrap">
                  {["Custom", "Toastmasters"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      className={`rounded-full px-4 py-2 mr-2 mb-2 border`}
                      style={{
                        backgroundColor:
                          speechTypeFilter === type
                            ? colors.primary
                            : "transparent",
                        borderColor: colors.border,
                      }}
                      onPress={() =>
                        setSpeechTypeFilter(
                          speechTypeFilter === type ? null : type,
                        )
                      }
                    >
                      <Text
                        style={{
                          color:
                            speechTypeFilter === type ? "white" : colors.text,
                        }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Duration Filter */}
            <View className="mb-6">
              <Text
                className="text-lg font-semibold mb-3"
                style={{ color: colors.text }}
              >
                Duration
              </Text>
              <View className="flex-row flex-wrap">
                {[
                  { key: "lt5", label: "< 5 mins" },
                  { key: "range5to7", label: "5-7 mins" },
                  { key: "gt7", label: "> 7 mins" },
                ].map((duration) => (
                  <TouchableOpacity
                    key={duration.key}
                    className={`rounded-full px-4 py-2 mr-2 mb-2 border`}
                    style={{
                      backgroundColor:
                        durationFilter === duration.key
                          ? colors.primary
                          : "transparent",
                      borderColor: colors.border,
                    }}
                    onPress={() =>
                      setDurationFilter(
                        durationFilter === duration.key
                          ? null
                          : (duration.key as any),
                      )
                    }
                  >
                    <Text
                      style={{
                        color:
                          durationFilter === duration.key
                            ? "white"
                            : colors.text,
                      }}
                    >
                      {duration.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Score Range Filter */}
            <View className="mb-6">
              <Text
                className="text-lg font-semibold mb-3"
                style={{ color: colors.text }}
              >
                Score Range
              </Text>
              <View className="flex-row flex-wrap">
                {[
                  { range: [0, 50] as [number, number], label: "0-50" },
                  { range: [51, 70] as [number, number], label: "51-70" },
                  { range: [71, 85] as [number, number], label: "71-85" },
                  { range: [86, 100] as [number, number], label: "86-100" },
                ].map((score) => (
                  <TouchableOpacity
                    key={score.label}
                    className={`rounded-full px-4 py-2 mr-2 mb-2 border`}
                    style={{
                      backgroundColor:
                        scoreRange &&
                        scoreRange[0] === score.range[0] &&
                        scoreRange[1] === score.range[1]
                          ? colors.primary
                          : "transparent",
                      borderColor: colors.border,
                    }}
                    onPress={() => {
                      const isSelected =
                        scoreRange &&
                        scoreRange[0] === score.range[0] &&
                        scoreRange[1] === score.range[1];
                      setScoreRange(isSelected ? null : score.range);
                    }}
                  >
                    <Text
                      style={{
                        color:
                          scoreRange &&
                          scoreRange[0] === score.range[0] &&
                          scoreRange[1] === score.range[1]
                            ? "white"
                            : colors.text,
                      }}
                    >
                      {score.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Range Filter */}
            <View className="mb-6">
              <Text
                className="text-lg font-semibold mb-3"
                style={{ color: colors.text }}
              >
                Date Range
              </Text>
              <View className="flex-row flex-wrap">
                {[
                  { key: "yesterday", label: "Yesterday" },
                  { key: "last7days", label: "Last 7 days" },
                  { key: "last30days", label: "Last 30 days" },
                ].map((date) => (
                  <TouchableOpacity
                    key={date.key}
                    className={`rounded-full px-4 py-2 mr-2 mb-2 border`}
                    style={{
                      backgroundColor:
                        dateRange === date.key ? colors.primary : "transparent",
                      borderColor: colors.border,
                    }}
                    onPress={() =>
                      setDateRange(
                        dateRange === date.key ? null : (date.key as any),
                      )
                    }
                  >
                    <Text
                      style={{
                        color: dateRange === date.key ? "white" : colors.text,
                      }}
                    >
                      {date.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            className="px-6 py-4 border-t"
            style={{
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            }}
          >
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 rounded-2xl px-4 py-3 mr-2 border"
                style={{ borderColor: colors.border }}
                onPress={() => {
                  clearFilters();
                  setIsFilterModalVisible(false);
                }}
              >
                <Text
                  className="text-center font-medium"
                  style={{ color: colors.text }}
                >
                  Clear All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-2xl px-4 py-3 ml-2"
                style={{ backgroundColor: colors.primary }}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Text className="text-center font-medium text-white">
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Enhanced Header */}
        <View
          className="px-6 py-8"
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 0.5,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text
                className="text-3xl font-bold"
                style={{ color: colors.text }}
              >
                {activeTab === "speech"
                  ? "Speech Library"
                  : activeTab === "evaluation"
                    ? "Evaluation Library"
                    : "Practice Library"}
              </Text>

              <Text
                className="mt-1 text-base"
                style={{ color: colors.textSecondary }}
              >
                Explore your speeches, evaluations & practice
              </Text>
            </View>

            <View
              className="rounded-2xl p-4"
              style={{
                backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
              }}
            >
              <BarChart3 size={28} color={colors.primary} />
            </View>
          </View>

          {/* Search and Filter Section */}
          {isSearchActive ? (
            <View className="flex-row items-center">
              <View
                className="flex-1 flex-row items-center rounded-2xl px-4 py-3 mr-2 border"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <Search size={18} color={colors.textSecondary} />
                <TextInput
                  className="flex-1 ml-2"
                  placeholder={
                    activeTab === "speech"
                      ? "Search speeches..."
                      : activeTab === "evaluation"
                        ? "Search evaluations..."
                        : "Search practice sessions..."
                  }
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity
                className="rounded-2xl px-4 py-3"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#ebedf0",
                }}
                onPress={() => {
                  setIsSearchActive(false);
                  setSearchQuery("");
                }}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row justify-between">
              <TouchableOpacity
                className={`flex-row items-center rounded-2xl px-4 py-3 flex-1 mr-2`}
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#ebedf0",
                }}
                onPress={() => setIsSearchActive(true)}
              >
                <Search size={18} color={colors.textSecondary} />
                <Text
                  className="ml-2 font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Search
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center rounded-2xl px-4 py-3 ml-2"
                style={{
                  backgroundColor: hasActiveFilters
                    ? colors.primary
                    : theme === "dark"
                      ? colors.surface
                      : "#ebedf0",
                }}
                onPress={() => setIsFilterModalVisible(true)}
              >
                <Filter
                  size={18}
                  color={hasActiveFilters ? "white" : colors.textSecondary}
                />
                <Text
                  className="ml-2 font-medium"
                  style={{
                    color: hasActiveFilters ? "white" : colors.textSecondary,
                  }}
                >
                  Filter
                </Text>
                {hasActiveFilters && (
                  <View
                    className="ml-2 rounded-full w-5 h-5 items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                  >
                    <Text className="text-xs font-bold text-white">
                      {
                        [
                          searchQuery,
                          speechTypeFilter,
                          durationFilter,
                          scoreRange,
                          dateRange,
                        ].filter(Boolean).length
                      }
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/*Toggle*/}
        <View
          className="flex-row mx-6 my-4 justify-center rounded-xl overflow-hidden border"
          style={{ borderColor: colors.border }}
        >
          <TouchableOpacity
            className={`flex-1 px-4 py-2 items-center ${activeTab === "speech" ? "bg-blue-500" : ""}`}
            style={{
              backgroundColor:
                activeTab === "speech" ? colors.primary : "transparent",
            }}
            onPress={() => setActiveTab("speech")}
          >
            <Text
              style={{ color: activeTab === "speech" ? "#fff" : colors.text }}
            >
              Speech
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 px-4 py-2 items-center ${activeTab === "evaluation" ? "bg-blue-500" : ""}`}
            style={{
              backgroundColor:
                activeTab === "evaluation" ? colors.primary : "transparent",
            }}
            onPress={() => setActiveTab("evaluation")}
          >
            <Text
              style={{
                color: activeTab === "evaluation" ? "#fff" : colors.text,
              }}
            >
              Evaluation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 px-4 py-2 items-center ${activeTab === "practice" ? "bg-blue-500" : ""}`}
            style={{
              backgroundColor:
                activeTab === "practice" ? colors.primary : "transparent",
            }}
            onPress={() => setActiveTab("practice")}
          >
            <Text
              style={{
                color: activeTab === "practice" ? "#fff" : colors.text,
              }}
            >
              Practice
            </Text>
          </TouchableOpacity>
        </View>

        {/*Content based on selected option */}
        {activeTab === "speech" ? (
          <SpeechLibrary
            speeches={filteredSpeeches}
            onEditNotes={onEditNotes}
            onDeleteEntry={onDeleteEntry}
            onViewDetailedFeedback={onViewDetailedFeedback}
            onRefresh={fetchSpeeches}
          />
        ) : activeTab === "practice" ? (
          <PracticeLibrary
            practices={filteredPractices}
            onRefresh={fetchPractices}
          />
        ) : (
          <EvaluationsLibrary
            evaluations={filteredEvaluations}
            onViewDetailedFeedbackEval={onViewDetailedFeedbackEval}
            onRefresh={fetchEvaluations}
          />
        )}

        {/* Filter Modal */}
        {renderFilterModal()}
      </ScrollView>
    </View>
  );
}
