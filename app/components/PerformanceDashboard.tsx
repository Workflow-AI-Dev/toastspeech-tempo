import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import {
  ChevronDown,
  TrendingUp,
  Clock,
  Mic,
  BarChart2,
  Trophy,
  Target,
  Zap,
  Award,
  Flame,
  Star,
  TrendingDown,
  House,
  Timer,
  CheckCircle,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";

interface PerformanceDashboardProps {
  data?: {
    pace: number[];
    fillerWords: number[];
    emotionalDelivery: number[];
    overallScore: number[];
    speakingDuration: number[];
    grammarAccuracy: number[];
  };
  timeLabels?: string[];
  currentScore?: {
    pace: number;
    fillerWords: number;
    emotionalDelivery: number;
    overallScore: number;
    speakingDuration: number;
    grammarAccuracy: number;
  };
  fillerWordsBreakdown?: {
    labels: string[];
    data: number[];
  };
  emotionalTonesBreakdown?: {
    labels: string[];
    data: number[];
  };
}

const PerformanceDashboard = ({
  data = {
    pace: [65, 68, 75, 70, 72, 78, 80],
    fillerWords: [12, 10, 8, 9, 7, 6, 5],
    emotionalDelivery: [60, 65, 70, 68, 75, 78, 82],
    overallScore: [65, 68, 72, 70, 75, 80, 85],
    speakingDuration: [180, 195, 210, 185, 220, 240, 255],
    grammarAccuracy: [75, 78, 82, 80, 85, 88, 92],
  },
  timeLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  currentScore = {
    pace: 80,
    fillerWords: 5,
    emotionalDelivery: 82,
    overallScore: 85,
    speakingDuration: 255,
    grammarAccuracy: 92,
  },
  fillerWordsBreakdown = {
    labels: ["um", "like", "you know", "uh", "so"],
    data: [8, 12, 5, 3, 7],
  },
  emotionalTonesBreakdown = {
    labels: ["Confident", "Nervous", "Happy", "Calm", "Excited"],
    data: [35, 15, 25, 20, 5],
  },
}: PerformanceDashboardProps) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("Week");
  const [selectedMetric, setSelectedMetric] = useState("Overall");
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const screenWidth = Dimensions.get("window").width - 32; // Accounting for padding

  const timeFrames = ["Week", "Month", "Year"];
  const metrics = [
    "Overall",
    "Pace",
    "Filler Words",
    "Emotion",
    "Duration",
    "Grammar",
  ];

  const getChartData = () => {
    let chartData;
    switch (selectedMetric) {
      case "Pace":
        chartData = data.pace;
        break;
      case "Filler Words":
        chartData = data.fillerWords;
        break;
      case "Emotion":
        chartData = data.emotionalDelivery;
        break;
      case "Duration":
        chartData = data.speakingDuration;
        break;
      case "Grammar":
        chartData = data.grammarAccuracy;
        break;
      default:
        chartData = data.overallScore;
    }

    return {
      labels: timeLabels,
      datasets: [
        {
          data: chartData,
          color: (opacity = 1) => `rgba(72, 149, 239, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getBarChartData = () => {
    if (selectedMetric === "Filler Words") {
      return {
        labels: fillerWordsBreakdown.labels,
        datasets: [
          {
            data: fillerWordsBreakdown.data,
          },
        ],
      };
    } else if (selectedMetric === "Emotion") {
      return {
        labels: emotionalTonesBreakdown.labels,
        datasets: [
          {
            data: emotionalTonesBreakdown.data,
          },
        ],
      };
    }
    return null;
  };

  const shouldShowBarChart = () => {
    return selectedMetric === "Filler Words" || selectedMetric === "Emotion";
  };

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(72, 149, 239, ${opacity})`,
    labelColor: (opacity = 1) =>
      theme === "dark"
        ? `rgba(241, 245, 249, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#4895ef",
    },
  };

  const renderScoreCard = (
    title: string,
    value: number,
    icon: React.ReactNode,
    bgColor: string,
    iconColor: string,
    improvement?: string,
  ) => (
    <View
      className="rounded-3xl p-5 mr-4 shadow-lg min-w-[140px]"
      style={{
        backgroundColor: colors.card,
        shadowColor: theme === "dark" ? "#000" : "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme === "dark" ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="rounded-full p-2" style={{ backgroundColor: bgColor }}>
          {React.cloneElement(icon as React.ReactElement, {
            size: 20,
            color: iconColor,
          })}
        </View>
        <Text
          className="text-xs font-medium"
          style={{ color: colors.textSecondary }}
        >
          {title.toUpperCase()}
        </Text>
      </View>
      <Text className="text-3xl font-bold" style={{ color: colors.text }}>
        {value}
      </Text>
      {improvement && (
        <View className="flex-row items-center mt-2">
          <View className="bg-green-100 rounded-full p-1 mr-2">
            <TrendingUp size={10} color="#10b981" />
          </View>
          <Text className="text-green-600 text-xs font-bold">
            {improvement}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1">
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
                Your Progress
              </Text>
              <Text
                className="mt-1 text-base"
                style={{ color: colors.textSecondary }}
              >
                Level 7 Speaker • 12-day streak
              </Text>
            </View>

            <View
              className="rounded-2xl p-4"
              style={{
                backgroundColor: theme === "dark" ? colors.card : "#fef3c7",
              }}
            >
              <Trophy size={28} color="#f59e0b" />
            </View>
          </View>

          {/* Quick Stats Cards */}
          <View className="flex-row justify-between">
            <View
              className="rounded-2xl p-4 flex-1 mr-2"
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-2xl font-bold">85</Text>
                  <Text className="text-white/90 text-sm font-medium mt-1">
                    Avg Score
                  </Text>
                </View>
                <View className="bg-white/20 rounded-full p-2">
                  <TrendingUp size={18} color="white" />
                </View>
              </View>
            </View>
            <View
              className="rounded-2xl p-4 flex-1 ml-2"
              style={{
                backgroundColor: colors.success,
                shadowColor: colors.success,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-2xl font-bold">23</Text>
                  <Text className="text-white/90 text-sm font-medium mt-1">
                    Speeches
                  </Text>
                </View>
                <View className="bg-white/20 rounded-full p-2">
                  <Mic size={18} color="white" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Time Frame Selector */}
        <View className="px-6 py-4">
          <View
            className="flex-row rounded-2xl p-1"
            style={{
              backgroundColor: colors.card,
              shadowColor: theme === "dark" ? "#000" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === "dark" ? 0.3 : 0.08,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {timeFrames.map((timeFrame) => (
              <TouchableOpacity
                key={timeFrame}
                className="flex-1 py-3 rounded-xl"
                style={{
                  backgroundColor:
                    selectedTimeFrame === timeFrame
                      ? colors.primary
                      : "transparent",
                }}
                onPress={() => setSelectedTimeFrame(timeFrame)}
              >
                <Text
                  className="text-center font-semibold"
                  style={{
                    color:
                      selectedTimeFrame === timeFrame ? "white" : colors.text,
                  }}
                >
                  {timeFrame}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Main Chart */}
        <View className="px-6 py-4">
          <View
            className="rounded-3xl p-6 shadow-lg"
            style={{
              backgroundColor: colors.card,
              shadowColor: theme === "dark" ? "#000" : "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: theme === "dark" ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View
                  className="rounded-full p-2 mr-3"
                  style={{
                    backgroundColor:
                      theme === "dark" ? colors.surface : "#f0f9ff",
                  }}
                >
                  <BarChart2 size={20} color={colors.primary} />
                </View>
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  {selectedMetric} Progress
                </Text>
              </View>
              <View
                className="rounded-full px-3 py-1"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#f3f4f6",
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.primary }}
                >
                  This {selectedTimeFrame}
                </Text>
              </View>
            </View>

            {shouldShowBarChart() ? (
              <BarChart
                data={getBarChartData()!}
                width={screenWidth - 80}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  barPercentage: 0.7,
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                showValuesOnTopOfBars
              />
            ) : (
              <LineChart
                data={getChartData()}
                width={screenWidth - 80}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: colors.primary,
                    fill: colors.primary,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            )}
          </View>
        </View>

        {/* Metric Selector */}
        <View className="px-6 py-4">
          <Text
            className="text-lg font-bold mb-3"
            style={{ color: colors.text }}
          >
            Metrics
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {metrics.map((metric, index) => {
                const icons = [
                  BarChart2,
                  Clock,
                  Mic,
                  Target,
                  Timer,
                  CheckCircle,
                ];
                const IconComponent = icons[index];
                return (
                  <TouchableOpacity
                    key={metric}
                    className="mr-3 py-3 px-4 rounded-2xl flex-row items-center"
                    style={{
                      backgroundColor:
                        selectedMetric === metric
                          ? colors.primary
                          : colors.card,
                      shadowColor: theme === "dark" ? "#000" : "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: theme === "dark" ? 0.3 : 0.1,
                      shadowRadius: 6,
                      elevation: 3,
                    }}
                    onPress={() => setSelectedMetric(metric)}
                  >
                    <View
                      className="rounded-full p-1.5 mr-2"
                      style={{
                        backgroundColor:
                          selectedMetric === metric
                            ? "rgba(255, 255, 255, 0.2)"
                            : theme === "dark"
                              ? colors.surface
                              : "#f0f9ff",
                      }}
                    >
                      <IconComponent
                        size={14}
                        color={
                          selectedMetric === metric ? "white" : colors.primary
                        }
                      />
                    </View>
                    <Text
                      className="font-semibold text-sm"
                      style={{
                        color:
                          selectedMetric === metric ? "white" : colors.text,
                      }}
                    >
                      {metric}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Score Cards */}
        <View className="px-6 py-4">
          <Text
            className="text-lg font-bold mb-3"
            style={{ color: colors.text }}
          >
            Current Performance
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {renderScoreCard(
                "Overall",
                currentScore.overallScore,
                <Trophy />,
                "#fef3c7",
                "#f59e0b",
                "+12",
              )}
              {renderScoreCard(
                "Pace",
                currentScore.pace,
                <Clock />,
                "#dbeafe",
                "#3b82f6",
                "+8",
              )}
              {renderScoreCard(
                "Filler Words",
                currentScore.fillerWords,
                <Mic />,
                "#fee2e2",
                "#ef4444",
                "-3",
              )}
              {renderScoreCard(
                "Confidence",
                currentScore.emotionalDelivery,
                <Zap />,
                "#f3e8ff",
                "#8b5cf6",
                "+15",
              )}
              {renderScoreCard(
                "Duration",
                Math.round(currentScore.speakingDuration / 60),
                <Timer />,
                "#ecfdf5",
                "#10b981",
                "+2m",
              )}
              {renderScoreCard(
                "Grammar",
                currentScore.grammarAccuracy,
                <CheckCircle />,
                "#fef7ff",
                "#a855f7",
                "+7",
              )}
            </View>
          </ScrollView>
        </View>

        {/* Recent Improvements */}
        <View
          className="px-6 py-6 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Recent Wins
          </Text>

          <View className="space-y-1">
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4 rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="rounded-xl p-2 mr-3"
                  style={{ backgroundColor: colors.card }}
                >
                  <TrendingUp size={20} color={colors.success} />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Pace Mastery
                  </Text>
                  <Text
                    className="text-sm mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    More consistent speaking rhythm
                  </Text>
                </View>
              </View>
              <View className="bg-green-100 rounded-full px-3 py-1">
                <Text className="text-green-600 font-bold text-sm">+12%</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4 rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="rounded-xl p-2 mr-3"
                  style={{ backgroundColor: colors.card }}
                >
                  <Mic size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Cleaner Speech
                  </Text>
                  <Text
                    className="text-sm mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Reduced filler words significantly
                  </Text>
                </View>
              </View>
              <View className="bg-blue-100 rounded-full px-3 py-1">
                <Text className="text-blue-600 font-bold text-sm">-40%</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4 rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="rounded-xl p-2 mr-3"
                  style={{ backgroundColor: colors.card }}
                >
                  <Zap size={20} color={colors.accent} />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Confidence Boost
                  </Text>
                  <Text
                    className="text-sm mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    More expressive delivery
                  </Text>
                </View>
              </View>
              <View className="bg-purple-100 rounded-full px-3 py-1">
                <Text className="text-purple-600 font-bold text-sm">+18%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggested Focus Areas */}
        <View className="px-6 py-6">
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Next Level Goals
          </Text>
          <View className="space-y-1">
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4 rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="rounded-xl p-2 mr-3"
                  style={{ backgroundColor: colors.card }}
                >
                  <Target size={20} color={colors.warning} />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Master Strategic Pauses
                  </Text>
                  <Text
                    className="text-sm mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Use pauses to create impact and emphasis
                  </Text>
                </View>
              </View>
              <View className="bg-orange-100 rounded-full px-3 py-1">
                <Text className="text-orange-600 font-bold text-xs">FOCUS</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4 rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="rounded-xl p-2 mr-3"
                  style={{ backgroundColor: colors.card }}
                >
                  <Mic size={20} color={colors.warning} />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Vocal Variety
                  </Text>
                  <Text
                    className="text-sm mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Practice varying tone, pitch, and volume
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="rounded-full px-4 py-2"
                style={{ backgroundColor: colors.warning }}
              >
                <Text className="text-white text-xs font-bold">PRACTICE</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PerformanceDashboard;
