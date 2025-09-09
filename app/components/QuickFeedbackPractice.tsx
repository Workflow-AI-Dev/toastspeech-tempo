import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  Mic,
  Zap,
  Flame,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";

interface QuickFeedbackPracticeProps {
  analysisResults: {
    overallScore: number;
    pace: number;
    fillerWords: number;
    emotionalDelivery: number;
    clarity: number;
    confidence: number;
    engagement: number;
    improvement: string;
    duration: string;
    avgPause: string;
  };
  feedback: {
    strengths: {
      timestamp: string;
      action: string;
      impact: string;
    }[];
    improvements: {
      timestamp: string;
      action: string;
      suggestion: string;
    }[];
  };
  onRecordAnother: () => void;
}

const QuickFeedbackPractice = ({
  analysisResults,
  feedback,
  onRecordAnother,
}: QuickFeedbackPracticeProps) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";

  return (
    <View className="p-3">
      {/* Overall Score */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{
          backgroundColor: colors.card,
          shadowColor: theme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === "dark" ? 0.6 : 0.1,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View className="items-center mb-6">
          <View
            className="rounded-full w-24 h-24 items-center justify-center mb-4"
            style={{
              backgroundColor: theme === "dark" ? "#14532d" : "#dcfce7",
            }}
          >
            <Text
              className="text-4xl font-bold"
              style={{ color: theme === "dark" ? "#4ade80" : "#10b981" }}
            >
              {analysisResults.overallScore}
            </Text>
          </View>
          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Excellent Performance!
          </Text>
          {analysisResults.improvement?.trim().toLowerCase() !== "n/a" &&
            analysisResults.improvement &&
            (() => {
              const isNegative = analysisResults.improvement.includes("-");
              const Icon = isNegative ? TrendingDown : TrendingUp;
              const color = isNegative ? "#f87171" : "#4ade80";

              return (
                <View className="flex-row items-center">
                  <Icon size={16} color={color} />
                  <Text className="font-bold ml-1" style={{ color }}>
                    {analysisResults.improvement} from last speech
                  </Text>
                </View>
              );
            })()}
        </View>
      </View>

      {/* Commendations Section */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{
          backgroundColor: colors.card,
          shadowColor: theme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === "dark" ? 0.6 : 0.1,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center mb-4">
          <CheckCircle size={24} color={colors.success} />
          <Text
            className="text-xl font-bold ml-2"
            style={{ color: colors.text }}
          >
            Strengths ({feedback.strengths.length})
          </Text>
        </View>

        <View className="space-y-4">
          {feedback.strengths.slice(0, 3).map((item, index) => (
            <View
              key={index}
              className="rounded-2xl p-4 mb-3"
              style={{
                backgroundColor: isDark ? "#1f2a24" : "#ecfdf5",
              }}
            >
              <Text
                className="font-semibold"
                style={{ color: isDark ? "#a7f3d0" : "#065f46" }}
              >
                {item.action}
              </Text>
              <View className="flex-row items-center mb-2">
                <Clock size={14} color={isDark ? "#a7f3d0" : "#065f46"} />
                <Text
                  className="text-sm ml-1"
                  style={{ color: isDark ? "#a7f3d0" : "#065f46" }}
                >
                  {item.timestamp}
                </Text>
              </View>
              <View
                className="rounded-xl p-3"
                style={{
                  backgroundColor: isDark ? colors.surface : "#fff",
                }}
              >
                <View className="flex-row items-center mb-1">
                  <Flame
                    size={16}
                    color={isDark ? colors.success : "#22c55e"}
                  />
                  <Text
                    className="font-semibold ml-2"
                    style={{ color: isDark ? colors.textSecondary : "#065f46" }}
                  >
                    Impact
                  </Text>
                </View>
                <Text
                  style={{ color: isDark ? colors.textSecondary : "#4b5563" }}
                >
                  {item.impact}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recommendations Section */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{
          backgroundColor: colors.card,
          shadowColor: theme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === "dark" ? 0.6 : 0.1,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center mb-4">
          <AlertCircle size={24} color={colors.warning} />
          <Text
            className="text-xl font-bold ml-2"
            style={{ color: colors.text }}
          >
            Recommendations ({feedback.improvements.length})
          </Text>
        </View>

        <View className="space-y-4">
          {feedback.improvements.slice(0, 3).map((item, index) => (
            <View
              key={index}
              className="rounded-2xl p-4 mb-3"
              style={{
                backgroundColor: isDark ? "#2a241f" : "#fff7ed",
              }}
            >
              <Text
                className="font-semibold"
                style={{ color: isDark ? "#fcd34d" : "#92400e" }}
              >
                {item.action}
              </Text>
              <View className="flex-row items-center mb-2">
                <Clock size={14} color={isDark ? "#fcd34d" : "#92400e"} />
                <Text
                  className="text-sm ml-1"
                  style={{ color: isDark ? "#fcd34d" : "#92400e" }}
                >
                  {item.timestamp}
                </Text>
              </View>
              <View
                className="rounded-xl p-3"
                style={{
                  backgroundColor: isDark ? colors.surface : "#fff",
                }}
              >
                <View className="flex-row items-center mb-1">
                  <Lightbulb
                    size={16}
                    color={isDark ? colors.warning : "#f97316"}
                  />
                  <Text
                    className="font-semibold ml-2"
                    style={{ color: isDark ? colors.textSecondary : "#92400e" }}
                  >
                    Suggestion
                  </Text>
                </View>
                <Text
                  style={{ color: isDark ? colors.textSecondary : "#4b5563" }}
                >
                  {item.suggestion}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="space-y-3 mb-8">
        <TouchableOpacity
          onPress={onRecordAnother}
          className="border-2 rounded-2xl py-4 px-6"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <Text
            className="font-bold text-lg text-center"
            style={{ color: colors.primary }}
          >
            Record Another Speech
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuickFeedbackPractice;
