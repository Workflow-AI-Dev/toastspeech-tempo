import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
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
  Mic,
  Play,
  Award,
  BookOpen,
  Filter,
  Search,
  BarChart3,
  Target,
  Zap,
  Lightbulb,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import QuickFeedback from "./QuickFeedback";

interface SpeechEntry {
  id: string;
  title: string;
  date: string;
  duration: string;
  score: number;
  transcription: string;
  feedback: string[];
  suggestions: string[];
  emoji: string;
  category: string;
  improvement: string;
}

interface SpeechLibraryProps {
  speeches?: SpeechEntry[];
  onEditNotes?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
  onViewDetailedFeedback?: () => void;
}

export default function SpeechLibrary({
  onViewDetailedFeedback = () => {},
  speeches = [
    {
      id: "1",
      title: "My Leadership Journey",
      date: "2023-10-15",
      duration: "5:32",
      score: 85,
      emoji: <Mic size={24} color="#7c3aed" />,
      category: "Personal Story",
      improvement: "+12",
      transcription:
        "Hello everyone, my name is John and today I want to talk about effective communication...",
      feedback: [
        "🎯 Excellent eye contact throughout the speech",
        "📢 Clear and confident voice projection",
        '⚠️ Used too many filler words ("um", "like")',
        "💪 Strong opening but conclusion needs work",
      ],
      suggestions: [
        "Practice eliminating filler words with recording exercises",
        "Work on creating a more impactful conclusion with a call-to-action",
        "Consider using more vocal variety to maintain engagement",
      ],
    },
    {
      id: "2",
      title: "Why I Love Coffee",
      date: "2023-11-02",
      duration: "7:15",
      score: 92,
      emoji: <Mic size={24} color="#7c3aed" />,
      category: "Informative",
      improvement: "+18",
      transcription:
        "Today I want to convince you that investing in renewable energy is not just good for the environment...",
      feedback: [
        "🔥 Excellent use of persuasive techniques",
        "📋 Well-structured with clear arguments",
        "⏱️ Occasional pacing issues - spoke too quickly at times",
        "⏸️ Effective use of pauses for emphasis",
      ],
      suggestions: [
        "Work on consistent pacing throughout the speech",
        "Consider adding more concrete examples and statistics",
        "Practice smoother transitions between main points",
      ],
    },
    {
      id: "3",
      title: "Dream Vacation Plans",
      date: "2023-12-10",
      duration: "2:45",
      score: 78,
      emoji: <Mic size={24} color="#7c3aed" />,
      category: "Impromptu",
      improvement: "+5",
      transcription:
        "When asked about leadership, I believe the most important quality is empathy...",
      feedback: [
        "🧠 Good thinking on your feet",
        "🎯 Clear main point about empathy",
        "📝 Limited supporting examples",
        "😰 Some nervous gestures noticed",
      ],
      suggestions: [
        "Practice more impromptu speaking scenarios daily",
        "Work on body language awareness with video practice",
        "Develop technique for quickly generating examples",
      ],
    },
  ],
  onEditNotes = (id) => console.log(`Edit notes for speech ${id}`),
  onDeleteEntry = (id) => console.log(`Delete speech ${id}`),
}: SpeechLibraryProps) {
  const [selectedSpeech, setSelectedSpeech] = useState<SpeechEntry | null>(
    null,
  );
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

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
                className="rounded-full px-3 py-1 mr-2"
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
              <TrendingUp size={14} color="#10b981" />
              <Text className="text-sm ml-1 font-bold text-green-500">
                {item.improvement}
              </Text>
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
      pace: 85,
      fillerWords: 8,
      emotionalDelivery: 89,
      clarity: 92,
      confidence: 84,
      engagement: 88,
      improvement: selectedSpeech.improvement,
      duration: selectedSpeech.duration,
      wordCount: 425,
      avgPause: "1.2s",
    };

    const feedback = {
      strengths: [
        "Excellent vocal variety and tone modulation",
        "Strong opening that captured attention immediately",
        "Clear articulation throughout the speech",
        "Good use of pauses for emphasis",
      ],
      improvements: [
        "Reduce filler words like 'um' and 'uh' (8 instances)",
        "Work on smoother transitions between main points",
        "Consider adding more concrete examples",
      ],
      keyInsights: [
        "Your confidence increased 23% from start to finish",
        "Peak engagement occurred during storytelling segments",
        "Speaking pace was optimal for audience comprehension",
      ],
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
              onViewDetailedFeedback={onViewDetailedFeedback}
              onRecordAnother={() => setCurrentStep("record")}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  if (selectedSpeech) {
    return renderDetailView();
  }

  return (
    <>
      {/* Enhanced Stats Overview */}
      <View className="px-6 py-4">
        <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
          Your Progress
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
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
                  style={{ backgroundColor: "#fef3c7" }}
                >
                  <Target size={20} color="#f59e0b" />
                </View>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  AVG
                </Text>
              </View>
              <Text
                className="text-3xl font-bold"
                style={{ color: colors.text }}
              >
                85
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Average Score
              </Text>
            </View>

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
                  style={{ backgroundColor: "#dcfce7" }}
                >
                  <Star size={20} color="#10b981" />
                </View>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  BEST
                </Text>
              </View>
              <Text
                className="text-3xl font-bold"
                style={{ color: colors.text }}
              >
                92
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Highest Score
              </Text>
            </View>

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
                  <Clock size={20} color="#3b82f6" />
                </View>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  TIME
                </Text>
              </View>
              <Text
                className="text-3xl font-bold"
                style={{ color: colors.text }}
              >
                15m
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Total Practice
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
                  style={{ backgroundColor: "#f3e8ff" }}
                >
                  <Zap size={20} color="#8b5cf6" />
                </View>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  STREAK
                </Text>
              </View>
              <Text
                className="text-3xl font-bold"
                style={{ color: colors.text }}
              >
                7
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Day Streak
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {speeches.length > 0 ? (
        <View className="flex-1">
          <View className="px-6 py-2">
            <Text
              className="text-lg font-bold mb-3"
              style={{ color: colors.text }}
            >
              Recent Speeches
            </Text>
          </View>
          {speeches.map((speech) => (
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
              Ready to Begin?
            </Text>

            <Text
              className="text-center mb-8 text-base leading-6"
              style={{ color: colors.textSecondary }}
            >
              Record your first speech to start tracking your progress and
              unlock personalized feedback.
            </Text>

            <TouchableOpacity
              className="rounded-2xl px-8 py-4 w-full"
              style={{ backgroundColor: colors.primary }}
              onPress={() => {
                // This would typically navigate to the speech recorder
                alert("Navigate to speech recorder");
              }}
            >
              <View className="flex-row items-center justify-center">
                <Mic size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  Start Recording
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}
