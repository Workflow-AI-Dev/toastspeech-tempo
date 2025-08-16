import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  X,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import SpeechLibrary from "./SpeechLibrary";
import EvaluationsLibrary from "./EvaluationsLibrary";
import PracticeLibrary from "./PracticeLibrary";

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

          <View className="flex-1 px-6 py-4">
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
          </View>

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

  const renderContent = () => {
    switch (activeTab) {
      case "speech":
        return (
          <SpeechLibrary
            activeTab={activeTab} // Pass activeTab for the header
            setActiveTab={setActiveTab} // Pass setter for the header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            speechTypeFilter={speechTypeFilter}
            durationFilter={durationFilter}
            scoreRange={scoreRange}
            dateRange={dateRange}
            onEditNotes={onEditNotes}
            onDeleteEntry={onDeleteEntry}
            onViewDetailedFeedback={onViewDetailedFeedback}
            isFilterModalVisible={isFilterModalVisible}
            setIsFilterModalVisible={setIsFilterModalVisible}
          />
        );
      case "practice":
        return (
          <PracticeLibrary
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            speechTypeFilter={speechTypeFilter}
            durationFilter={durationFilter}
            scoreRange={scoreRange}
            dateRange={dateRange}
            isFilterModalVisible={isFilterModalVisible}
            setIsFilterModalVisible={setIsFilterModalVisible}
          />
        );
      case "evaluation":
        return (
          <EvaluationsLibrary
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            speechTypeFilter={speechTypeFilter}
            durationFilter={durationFilter}
            scoreRange={scoreRange}
            dateRange={dateRange}
            onViewDetailedFeedbackEval={onViewDetailedFeedbackEval}
            isFilterModalVisible={isFilterModalVisible}
            setIsFilterModalVisible={setIsFilterModalVisible}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {renderContent()}
      {/* Filter Modal */}
      {renderFilterModal()}
    </View>
  );
}
