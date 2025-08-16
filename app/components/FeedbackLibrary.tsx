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
                  backgroundColor: theme === "dark" ? colors.card : colors.surface, // Changed this line
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
                  style={{ color: colors.text }}
                />
              </View>
              <TouchableOpacity
                className="rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: theme === "dark" ? colors.card : "#ebedf0", // Changed this line
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
                  backgroundColor: theme === "dark" ? colors.card : "#ebedf0", // Changed this line
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
                    ? colors.card
                    : "#ebedf0", // Changed this line
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
            searchQuery={searchQuery}
            speechTypeFilter={speechTypeFilter}
            durationFilter={durationFilter}
            scoreRange={scoreRange}
            dateRange={dateRange}
            onEditNotes={onEditNotes}
            onDeleteEntry={onDeleteEntry}
            onViewDetailedFeedback={onViewDetailedFeedback}
          />
        ) : activeTab === "practice" ? (
          <PracticeLibrary
            searchQuery={searchQuery}
            speechTypeFilter={speechTypeFilter}
            durationFilter={durationFilter}
            scoreRange={scoreRange}
            dateRange={dateRange}
          />
        ) : (
          <EvaluationsLibrary
            searchQuery={searchQuery}
            speechTypeFilter={speechTypeFilter}
            durationFilter={durationFilter}
            scoreRange={scoreRange}
            dateRange={dateRange}
            onViewDetailedFeedbackEval={onViewDetailedFeedbackEval}
          />
        )}

        {/* Filter Modal */}
        {renderFilterModal()}
      </ScrollView>
    </View>
  );
}
