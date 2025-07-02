import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  BarChart3,
  Star,
  Calendar,
  ChevronRight,
  ArrowLeft,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import QuickFeedbackEvaluations from "./QuickFeedbackEvaluations";

interface Evaluation {
  id: string;
  score: number;
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
  evaluations: Evaluation[];
  onViewDetailedFeedbackEval: (id: string) => void;
}

export default function EvaluationsLibrary({
  evaluations = [
    {
      id: "eval1",
      score: 88,
      improvement: "+10%",
      strengths: ["Great clarity", "Strong body language"],
      improvements: ["More structured intro", "Slow down ending"],
      keyInsights: [
        "Strong eye contact increased engagement",
        "Score improved by 10% compared to last time",
      ],
      date: "2024-06-15",
      evaluationAccuracy: 95,
      speakingQuality: 88,
      contentInsight: 84,
      clarity: 91,
      confidence: 86,
      duration: "4:30",
      wordCount: 420,
      avgPause: "1.1s",
    },
    {
      id: "eval2",
      score: 76,
      improvement: "+5%",
      strengths: ["Clear articulation", "Good vocal tone"],
      improvements: ["Too many filler words", "Unfocused middle section"],
      keyInsights: [
        "Audience engagement peaked mid-speech",
        "Confidence level dipped near the end",
      ],
      date: "2024-06-10",
      evaluationAccuracy: 88,
      speakingQuality: 75,
      contentInsight: 70,
      clarity: 80,
      confidence: 74,
      duration: "3:50",
      wordCount: 360,
      avgPause: "1.4s",
    },
  ],
  onViewDetailedFeedbackEval,
}: EvaluationsLibraryProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<Evaluation | null>(null);

  const totalEvaluations = evaluations.length;
  const averageScore = Math.round(
    evaluations.reduce((acc, curr) => acc + curr.score, 0) / totalEvaluations,
  );

  const renderDetailView = () => {
    if (!selectedEvaluation) return null;

    const evaluationResults = {
      overallScore: selectedEvaluation.score,
      evaluationAccuracy: selectedEvaluation.evaluationAccuracy,
      speakingQuality: selectedEvaluation.speakingQuality,
      contentInsight: selectedEvaluation.contentInsight,
      clarity: selectedEvaluation.clarity,
      confidence: selectedEvaluation.confidence,
      improvement: selectedEvaluation.improvement,
      duration: selectedEvaluation.duration,
      wordCount: selectedEvaluation.wordCount,
      avgPause: selectedEvaluation.avgPause,
    };

    const feedback = {
      strengths: selectedEvaluation.strengths,
      improvements: selectedEvaluation.improvements,
      keyInsights: selectedEvaluation.keyInsights,
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
          evaluationResults={{
            overallScore: 87,
            clarity: 78,
            confidence: 85,
            engagement: 82,
            evaluationAccuracy: 90,
            contentInsight: 75,
            duration: "5:23",
            wordCount: 180,
            avgPause: "1.1s",
          }}
          feedback={{
            strengths: [
              "You identified key moments in the speaker’s message accurately.",
              "Your evaluation was confident and easy to follow.",
            ],
            improvements: [
              "Dive deeper into the emotional tone of the speech.",
              "Avoid repeating the speaker’s content word-for-word.",
            ],
            keyInsights: [
              "You did well to highlight the call-to-action.",
              "Clarity in delivery made your evaluation sound structured.",
            ],
          }}
          onViewDetailedFeedback={onViewDetailedFeedbackEval}
          onRecordAnother={() => {}}
        />
      </View>
    );
  };

  if (selectedEvaluation) {
    return renderDetailView();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <ScrollView className="px-6 pt-4 pb-16">
      {/* KPI Cards */}
      <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
        Your Evaluations
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row mb-6">
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
              <View
                className="rounded-full p-2"
                style={{ backgroundColor: "#dbeafe" }}
              >
                <BarChart3 size={20} color="#3b82f6" />
              </View>
              <Text
                className="text-xs font-medium"
                style={{ color: colors.textSecondary }}
              >
                TOTAL
              </Text>
            </View>
            <Text className="text-3xl font-bold" style={{ color: colors.text }}>
              {totalEvaluations}
            </Text>
            <Text
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              Evaluations
            </Text>
          </View>

          <View
            className="rounded-3xl p-5 shadow-lg min-w-[140px]"
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
              <View
                className="rounded-full p-2"
                style={{ backgroundColor: "#fef3c7" }}
              >
                <Star size={20} color="#f59e0b" />
              </View>
              <Text
                className="text-xs font-medium"
                style={{ color: colors.textSecondary }}
              >
                AVG
              </Text>
            </View>
            <Text className="text-3xl font-bold" style={{ color: colors.text }}>
              {averageScore}
            </Text>
            <Text
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              Avg Score
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Evaluation Cards */}
      {evaluations.map((evaluation) => (
        <TouchableOpacity
          key={evaluation.id}
          className="rounded-3xl p-5 mb-4 shadow-lg"
          style={{
            backgroundColor: colors.card,
            shadowColor: theme === "dark" ? "#000" : "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme === "dark" ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
          onPress={() => setSelectedEvaluation(evaluation)}
        >
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text
                className="text-xl font-bold mb-1"
                style={{ color: colors.text }}
              >
                Evaluation
              </Text>
              <View className="flex-row items-center">
                <Calendar size={12} color={colors.textSecondary} />
                <Text
                  className="text-xs ml-1"
                  style={{ color: colors.textSecondary }}
                >
                  {formatDate(evaluation.date)}
                </Text>
              </View>
            </View>
            <View
              className="rounded-2xl px-4 py-2 items-center justify-center min-w-[60px]"
              style={{ backgroundColor: "#dbeafe" }}
            >
              <Text className="text-2xl font-bold text-blue-600">
                {evaluation.score}
              </Text>
              <Text className="text-xs font-medium text-blue-600">SCORE</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Tap to view full feedback
            </Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
