import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Star,
  TrendingUp,
  ClipboardCheck,
  Mic,
  Zap,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";

interface QuickFeedbackEvaluationsProps {
  evaluationResults: {
    overallScore: number;
    evaluationAccuracy: number;
    speakingQuality: number;
    contentInsight: number;
    clarity: number;
    confidence: number;
    improvement: string;
    duration: string;
    wordCount: number;
    avgPause: string;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    keyInsights: string[];
  };
  onViewDetailedFeedback: () => void;
}

const QuickFeedbackEvaluations = ({
  evaluationResults,
  feedback,
  onViewDetailedFeedback,
}: QuickFeedbackEvaluationsProps) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <View className="p-6">
      {/* Overall Score */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{ backgroundColor: colors.card }}
      >
        <View className="items-center mb-6">
          <View
            className="rounded-full w-24 h-24 items-center justify-center mb-4"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#dcfce7",
            }}
          >
            <Text
              className="text-4xl font-bold"
              style={{ color: colors.success }}
            >
              {evaluationResults.overallScore}
            </Text>
          </View>
          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Strong Evaluation!
          </Text>
          <View className="flex-row items-center">
            <TrendingUp size={16} color={colors.success} />
            <Text className="font-bold ml-1" style={{ color: colors.success }}>
              {evaluationResults.improvement} from last evaluation
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <View className="items-center">
            <ClipboardCheck size={20} color={colors.textSecondary} />
            <Text
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              Accuracy
            </Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              {evaluationResults.evaluationAccuracy}%
            </Text>
          </View>
          <View className="items-center">
            <Mic size={20} color={colors.textSecondary} />
            <Text
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              Words
            </Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              {evaluationResults.wordCount}
            </Text>
          </View>
          <View className="items-center">
            <Zap size={20} color={colors.textSecondary} />
            <Text
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              Avg Pause
            </Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              {evaluationResults.avgPause}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Metrics */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{ backgroundColor: colors.card }}
      >
        <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>
          Evaluation Breakdown
        </Text>
        <View className="space-y-4">
          {[
            {
              label: "Content Insight",
              value: evaluationResults.contentInsight,
              color: "#6366f1",
            },
            {
              label: "Speaking Quality",
              value: evaluationResults.speakingQuality,
              color: "#3b82f6",
            },
            {
              label: "Clarity",
              value: evaluationResults.clarity,
              color: "#10b981",
            },
            {
              label: "Confidence",
              value: evaluationResults.confidence,
              color: "#f59e0b",
            },
          ].map((metric, index) => (
            <View key={index} className="flex-row items-center justify-between">
              <Text className="font-medium" style={{ color: colors.text }}>
                {metric.label}
              </Text>
              <View className="flex-row items-center">
                <View
                  className="rounded-full h-2 w-20 mr-3"
                  style={{ backgroundColor: colors.border }}
                >
                  <View
                    className="rounded-full h-2"
                    style={{
                      width: `${metric.value}%`,
                      backgroundColor: metric.color,
                    }}
                  />
                </View>
                <Text className="font-bold w-8" style={{ color: colors.text }}>
                  {metric.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Key Insights */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{ backgroundColor: colors.card }}
      >
        <View className="flex-row items-center mb-4">
          <Lightbulb size={24} color={colors.warning} />
          <Text
            className="text-xl font-bold ml-2"
            style={{ color: colors.text }}
          >
            Key Insights
          </Text>
        </View>
        <View className="space-y-3">
          {feedback.keyInsights.map((insight, index) => (
            <View key={index} className="flex-row items-start">
              <View
                className="rounded-full p-1 mr-3 mt-1"
                style={{ backgroundColor: colors.surface }}
              >
                <Star size={12} color={colors.warning} />
              </View>
              <Text
                className="flex-1 text-base"
                style={{ color: colors.textSecondary }}
              >
                {insight}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Feedback Summary */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{ backgroundColor: colors.card }}
      >
        <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>
          Summary
        </Text>

        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <CheckCircle size={20} color={colors.success} />
            <Text className="font-bold ml-2" style={{ color: colors.success }}>
              Strengths
            </Text>
          </View>
          <View className="space-y-2">
            {feedback.strengths.slice(0, 2).map((item, index) => (
              <Text
                key={index}
                className="text-sm ml-7"
                style={{ color: colors.textSecondary }}
              >
                • {item}
              </Text>
            ))}
          </View>
        </View>

        <View>
          <View className="flex-row items-center mb-2">
            <AlertCircle size={20} color={colors.warning} />
            <Text className="font-bold ml-2" style={{ color: colors.warning }}>
              Areas to Improve
            </Text>
          </View>
          <View className="space-y-2">
            {feedback.improvements.slice(0, 2).map((item, index) => (
              <Text
                key={index}
                className="text-sm ml-7"
                style={{ color: colors.textSecondary }}
              >
                • {item}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="space-y-3 mb-8">
        <TouchableOpacity
          onPress={onViewDetailedFeedback}
          className="rounded-2xl py-4 px-6"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-bold text-lg text-center">
            View Detailed Feedback
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuickFeedbackEvaluations;
