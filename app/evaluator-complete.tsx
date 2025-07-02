import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import {
  ArrowLeft,
  CheckCircle,
  User,
  MessageSquare,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "./context/ThemeContext";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function EvaluatorCompleteScreen() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const router = useRouter();
  const params = useLocalSearchParams();

  const evaluationSummary = params.evaluationSummary as string;
  const transcribedText = params.transcribedText as string;

  // Mock AI evaluation for comparison
  const aiEvaluation = {
    summary:
      "This speech demonstrates strong technical knowledge and clear structure. The speaker effectively explained sustainable technology concepts with good pacing. However, there were opportunities to improve audience engagement through more dynamic gestures and varied vocal tone. The conclusion could have been more compelling with a stronger call to action.",
    strengths: [
      "Clear technical explanations",
      "Well-structured content",
      "Good pacing and timing",
      "Strong opening hook",
    ],
    improvements: [
      "More dynamic gestures",
      "Varied vocal tone",
      "Stronger conclusion",
      "Better audience engagement",
    ],
    overallScore: 78,
  };

  const userEvaluation = {
    summary: evaluationSummary,
    overallScore: 82,
  };

  // Calculate accuracy score based on similarity
  const calculateAccuracyScore = () => {
    // Simple similarity calculation based on score difference and content overlap
    const scoreDifference = Math.abs(
      aiEvaluation.overallScore - userEvaluation.overallScore,
    );
    const scoreAccuracy = Math.max(0, 100 - scoreDifference * 2);

    // Check for keyword overlap (simplified)
    const aiKeywords = aiEvaluation.summary.toLowerCase().split(" ");
    const userKeywords = userEvaluation.summary.toLowerCase().split(" ");
    const commonWords = aiKeywords.filter(
      (word) => userKeywords.includes(word) && word.length > 3,
    );
    const contentSimilarity = Math.min(
      100,
      (commonWords.length / Math.max(aiKeywords.length, userKeywords.length)) *
        200,
    );

    return Math.round((scoreAccuracy + contentSimilarity) / 2);
  };

  const accuracyScore = calculateAccuracyScore();
  const xpReward = Math.round(50 + accuracyScore * 0.5); // Base 50 XP + bonus based on accuracy

  const getAccuracyColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getAccuracyLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View
        className="px-6 py-6"
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 0.5,
        }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.push("/")}
            className="rounded-full p-2"
            style={{ backgroundColor: colors.surface }}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Evaluation Complete
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Accuracy Score Header */}
        <View
          className="rounded-3xl p-6 shadow-lg mb-6 items-center"
          style={{
            backgroundColor: colors.card,
            shadowColor: theme === "dark" ? "#000" : "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme === "dark" ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View
            className="rounded-full p-4 mb-4"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
            }}
          >
            <CheckCircle size={48} color={getAccuracyColor(accuracyScore)} />
          </View>

          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Evaluation Complete
          </Text>

          <View className="items-center mb-4">
            <Text
              className="text-4xl font-bold mb-1"
              style={{ color: getAccuracyColor(accuracyScore) }}
            >
              {accuracyScore}%
            </Text>
            <Text
              className="text-lg font-semibold"
              style={{ color: getAccuracyColor(accuracyScore) }}
            >
              {getAccuracyLabel(accuracyScore)}
            </Text>
            <Text
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              Evaluation Accuracy Score
            </Text>
          </View>
        </View>

        {/* Comparison Section */}
        <View
          className="p-6 mb-6"
          style={{
            backgroundColor: colors.card,
            elevation: 8,
          }}
        >
          <Text
            className="text-xl font-bold mb-4 text-center"
            style={{ color: colors.text }}
          >
            Evaluation Comparison
          </Text>

          {/* Your Evaluation */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <View
                className="rounded-full p-2 mr-3"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#f0f9ff",
                }}
              >
                <User size={20} color={colors.primary} />
              </View>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Your Evaluation
              </Text>
              <View
                className="ml-auto rounded-full px-3 py-1"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-bold text-sm">
                  {userEvaluation.overallScore}%
                </Text>
              </View>
            </View>
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="leading-relaxed" style={{ color: colors.text }}>
                {userEvaluation.summary}
              </Text>
            </View>
          </View>

          {/* AI Evaluation */}
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <View
                className="rounded-full p-2 mr-3"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#fef3c7",
                }}
              >
                <MessageSquare size={20} color={colors.warning} />
              </View>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                AI Evaluation
              </Text>
              <View
                className="ml-auto rounded-full px-3 py-1"
                style={{ backgroundColor: colors.warning }}
              >
                <Text className="text-white font-bold text-sm">
                  {aiEvaluation.overallScore}%
                </Text>
              </View>
            </View>
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="leading-relaxed mb-4"
                style={{ color: colors.text }}
              >
                {aiEvaluation.summary}
              </Text>

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text
                    className="font-semibold mb-2"
                    style={{ color: colors.success }}
                  >
                    Strengths
                  </Text>
                  {aiEvaluation.strengths.map((strength, index) => (
                    <Text
                      key={index}
                      className="text-sm mb-1"
                      style={{ color: colors.textSecondary }}
                    >
                      • {strength}
                    </Text>
                  ))}
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold mb-2"
                    style={{ color: colors.error }}
                  >
                    Improvements
                  </Text>
                  {aiEvaluation.improvements.map((improvement, index) => (
                    <Text
                      key={index}
                      className="text-sm mb-1"
                      style={{ color: colors.textSecondary }}
                    >
                      • {improvement}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* XP Reward */}
        <View
          className="rounded-2xl p-4 mb-6"
          style={{
            backgroundColor: theme === "dark" ? colors.surface : "#f0fdf4",
            borderColor: colors.success,
            borderWidth: 1,
          }}
        >
          <Text
            className="font-semibold mb-2 text-center"
            style={{ color: colors.text }}
          >
            XP Earned
          </Text>
          <Text
            className="text-center text-sm"
            style={{ color: colors.textSecondary }}
          >
            +{xpReward} XP for evaluation accuracy{"\n"}
            {accuracyScore >= 80
              ? "+25 XP accuracy bonus"
              : accuracyScore >= 60
                ? "+10 XP participation bonus"
                : "Keep practicing to earn bonus XP!"}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3 mb-8">
          <TouchableOpacity
            onPress={() => router.push("/evaluator-mode")}
            className="rounded-2xl py-4 px-6"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-bold text-lg text-center">
              Try Another
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/")}
            className="rounded-2xl py-4 px-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="font-bold text-lg text-center"
              style={{ color: colors.text }}
            >
              Return to Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
