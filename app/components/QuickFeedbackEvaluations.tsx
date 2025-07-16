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
  Clock,
  Flame,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";

interface QuickFeedbackEvaluationsProps {
  evaluationResults: {
    overallScore: number;
    improvement: string;
    duration: string;
    pace: number;
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
    keyInsights: string[];
  };
  detailedFeedback: {
    Introduction: string;
    Conclusion: string;
    AnalysisQuality_commendations: string[];
    AnalysisQuality_recommendations: {
      point: string;
    };
    AnalysisQuality_score: number;
    Recommendations_commendations: {
      point_1: string;
      point_2: string;
    };
    Recommendations_recommendations: {
      point: string;
    };
    Recommendations_score: number;
    DeliveryTechnique_commendations: {
      point_1: string;
      point_2: string;
    };
    DeliveryTechnique_recommendations: {
      point: string;
    };
    DeliveryTechnique_score: number;
    OverallImpact_commendations: {
      point_1: string;
      point_2: string;
    };
    OverallImpact_recommendations: {
      point: string;
    };
    OverallImpact_score: number;
  };
  onViewDetailedFeedback: (
    detailedFeedback: QuickFeedbackEvaluationsProps["detailedFeedback"],
  ) => void;
}

const QuickFeedbackEvaluations = ({
  evaluationResults,
  feedback,
  detailedFeedback,
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
            <Clock size={20} color={colors.textSecondary} />
            <Text
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              Duration
            </Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              {evaluationResults.duration}
            </Text>
          </View>
          <View className="items-center">
            <Mic size={20} color={colors.textSecondary} />
            <Text
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              Pace(WPM)
            </Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              {evaluationResults.pace}
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

      {/*
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
      </View>/*}

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

      {/* Commendations Section */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{
          backgroundColor: colors.card,
          shadowColor: theme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === "dark" ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 8,
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
              className="rounded-2xl p-4"
              style={{
                backgroundColor: theme === "dark" ? "#052e16" : "#dcfce7",
              }}
            >
              <Text className="font-semibold text-green-900 mb-1">
                {item.action}
              </Text>
              <View className="flex-row items-center mb-2">
                <Clock size={14} color="#15803d" />
                <Text className="text-green-700 text-sm ml-1">
                  {item.timestamp}
                </Text>
              </View>
              <View className="bg-white rounded-xl p-3">
                <View className="flex-row items-center mb-1">
                  <Flame size={16} color="#22c55e" />
                  <Text className="text-green-800 font-semibold ml-2">
                    Impact
                  </Text>
                </View>
                <Text className="text-gray-700">{item.impact}</Text>
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
          shadowOpacity: theme === "dark" ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 8,
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
              className="rounded-2xl p-4"
              style={{
                backgroundColor: theme === "dark" ? "#7c2d12" : "#fef3c7",
              }}
            >
              <Text className="font-semibold text-orange-900 mb-1">
                {item.action}
              </Text>
              <View className="flex-row items-center mb-2">
                <Clock size={14} color="#c2410c" />
                <Text className="text-orange-700 text-sm ml-1">
                  {item.timestamp}
                </Text>
              </View>
              <View className="bg-white rounded-xl p-3">
                <View className="flex-row items-center mb-1">
                  <Lightbulb size={16} color="#f97316" />
                  <Text className="text-orange-800 font-semibold ml-2">
                    Suggestion
                  </Text>
                </View>
                <Text className="text-gray-700">{item.suggestion}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="space-y-3 mb-8">
        <TouchableOpacity
          onPress={() => onViewDetailedFeedback(detailedFeedback)}
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
