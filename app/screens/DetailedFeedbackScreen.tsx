import React, { useState } from "react";
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
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Clock,
  Mic,
  Volume2,
  Eye,
  Heart,
  Brain,
  MessageSquare,
  BarChart3,
  Play,
  Pause,
  AlignLeft,
  Flame,
  HandMetal,
} from "lucide-react-native";

interface DetailedFeedbackScreenProps {
  detailed: QuickFeedbackProps["detailedFeedback"];
  onBack: () => void;
}

const DetailedFeedbackScreen = ({
  detailed,
  onBack,
}: DetailedFeedbackScreenProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const hasFeedback = (category: any) => {
    return (
      category?.strengths?.length > 0 || category?.improvements?.length > 0
    );
  };

  const categories = [
    { id: "all", label: "All", icon: BarChart3, color: "#6b7280" },
    {
      id: "gestures",
      label: "Gestures",
      icon: HandMetal, // expressive hand icon
      color: "#14b8a6",
    },
    {
      id: "presence",
      label: "Stage Presence",
      icon: Mic, // presence on stage / speech delivery
      color: "#f472b6",
    },
    {
      id: "visuals",
      label: "Visual Engagement",
      icon: Heart, // emotional/visual connection
      color: "#fb923c",
    },
    { id: "vocal", label: "Vocal", icon: Volume2, color: "#3b82f6" },
    {
      id: "language",
      label: "Language",
      icon: MessageSquare,
      color: "#8b5cf6",
    },
    { id: "structure", label: "Structure", icon: AlignLeft, color: "#ec4899" },
    {
      id: "storytelling",
      label: "Storytelling",
      icon: Flame,
      color: "#ef4444",
    },
    {
      id: "question",
      label: "Question Resolution",
      icon: Brain, // Thoughtful processing
      color: "#f59e0b",
    },
    {
      id: "storyStages",
      label: "Story Stages",
      icon: Clock, // Timing and sequencing
      color: "#0ea5e9",
    },
    {
      id: "audience",
      label: "Audience Connection",
      icon: Eye, // Connection with the crowd
      color: "#10b981",
    },
  ];

  const categoryMap = {
    gestures: { title: "Gestures", key: "Gestures" },
    presence: { title: "Stage Presence", key: "StagePresence" },
    visuals: { title: "Visual Engagement", key: "VisualEngagement" },
    vocal: { title: "Vocal Variety", key: "VocalVariety" },
    language: { title: "Language & Grammar", key: "Language" },
    structure: { title: "Speech Structure", key: "SpeechStructure" },
    storytelling: { title: "Storytelling", key: "Storytelling" },
    question: { title: "Question Resolution", key: "QuestionResolution" },
    storyStages: { title: "Story Stages", key: "StoryStages" },
    audience: { title: "Audience Connection", key: "Connections" },
  };

  const normalizeToArray = (value: any) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return [value];
    return [];
  };

  const parseCategory = (detailed: any, key: string, title: string) => {
    const commendationsRaw = normalizeToArray(
      detailed?.[`${key}_commendations`],
    );
    const recommendationsRaw = normalizeToArray(
      detailed?.[`${key}_recommendations`],
    );

    const strengths = commendationsRaw.map((item: any) => ({
      text: item.action,
      timestamp: item.timestamp || "N/A",
      impact: item.impact,
      details: item.details || undefined,
    }));

    const improvements = recommendationsRaw.map((item: any) => ({
      text: item.action,
      timestamp: item.timestamp || "N/A",
      suggestion: item.suggestion,
      details: item.details || undefined,
    }));

    return {
      title,
      score: detailed?.[`${key}_score`] ?? 0,
      strengths,
      improvements,
      metrics: detailed?.[`${key}_metrics`] || undefined,
    };
  };

  const detailedFeedback = Object.fromEntries(
    Object.entries(categoryMap).map(([id, { key, title }]) => [
      id,
      parseCategory(detailed, key, title),
    ]),
  );

  const overallInsights = detailed?.OverallInsights?.map((item: any) => {
      const iconMap = {
        strength: CheckCircle,
        improvement: AlertTriangle,
        tip: Lightbulb,
      };

      const colorMap = {
        strength: "#10b981", // green
        improvement: "#f59e0b", // yellow
        tip: "#8b5cf6", // purple
      };

      return {
        ...item,
        icon: iconMap[item.type] || Lightbulb,
        color: colorMap[item.type] || "#6b7280",
      };
    }) || [];


  const renderCategoryContent = (categoryId: string) => {
    if (categoryId === "all") {
      return (
        <View className="space-y-6">
          {/* Overall Insights */}
          <View className="bg-white rounded-3xl p-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Key Insights
            </Text>
            <View className="space-y-4">
              {overallInsights.map((insight, index) => {
                const IconComponent = insight.icon;
                return (
                  <View key={index} className="flex-row items-start">
                    <View
                      className="rounded-full p-2 mr-3 mt-1"
                      style={{ backgroundColor: `${insight.color}20` }}
                    >
                      <IconComponent size={16} color={insight.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 mb-1">
                        {insight.title}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {insight.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Category Scores */}
          <View className="bg-white rounded-3xl p-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Category Breakdown
            </Text>
            <View className="space-y-4">
              {categories
                .filter(
                  (cat) =>
                    cat.id !== "all" && hasFeedback(detailedFeedback[cat.id]),
                )
                .map((cat) => {
                  const category = detailedFeedback[cat.id];
                  const IconComponent = cat.icon;
                  const color = cat.color;

                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4"
                    >
                      <View className="flex-row items-center flex-1">
                        <View
                          className="rounded-full p-2 mr-3"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <IconComponent size={16} color={color} />
                        </View>
                        <View className="flex-1">
                          <Text className="font-semibold text-gray-900">
                            {category.title}
                          </Text>
                          <View className="bg-gray-200 rounded-full h-2 w-full mt-2">
                            <View
                              className="rounded-full h-2"
                              style={{
                                width: `${(category.score / 10) * 100}%`,
                                backgroundColor: color,
                              }}
                            />
                          </View>
                        </View>
                      </View>
                      <Text
                        className="font-bold text-lg"
                        style={{ color: color }}
                      >
                        {category.score}/10
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        </View>
      );
    }

    const category =
      detailedFeedback[categoryId as keyof typeof detailedFeedback];
    if (!category) return null;

    return (
      <View className="space-y-6">
        {/* Category Header */}
        <View className="bg-white rounded-3xl p-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900">
              {category.title}
            </Text>
            <View className="bg-blue-100 rounded-full px-4 py-2">
              <Text className="font-bold text-blue-600 text-lg">
                {category.score}/10
              </Text>
            </View>
          </View>

          {/* Metrics */}
          {/*<View className="bg-gray-50 rounded-2xl p-4">
            <Text className="font-bold text-gray-800 mb-3">Key Metrics</Text>
            <View className="grid grid-cols-2 gap-3">
              {Object.entries(category.metrics).map(([key, value]) => (
                <View key={key} className="">
                  <Text className="text-gray-600 text-sm capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Text>
                  <Text className="font-semibold text-gray-900">{value}</Text>
                </View>
              ))}
            </View>
          </View>*/}
        </View>

        {/* Strengths */}
        <View className="bg-white rounded-3xl p-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <CheckCircle size={24} color="#10b981" />
            <Text className="text-xl font-bold text-gray-900 ml-2">
              Strengths ({category.strengths.length})
            </Text>
          </View>
          <View className="space-y-4">
            {category.strengths.map((strength, index) => (
              <View key={index} className="bg-green-50 rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-green-800 font-semibold flex-1">
                    {strength.text}
                  </Text>
                  {/*<View
                    className={`rounded-full px-2 py-1 ${
                      strength.severity === "high"
                        ? "bg-red-100"
                        : strength.severity === "medium"
                          ? "bg-orange-100"
                          : "bg-yellow-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        strength.severity === "high"
                          ? "text-red-700"
                          : strength.severity === "medium"
                            ? "text-orange-700"
                            : "text-yellow-700"
                      }`}
                    >
                      {strength.severity.toUpperCase()}
                    </Text>
                  </View>*/}
                </View>
                <View className="flex-row items-center">
                  <Clock size={14} color="#059669" />
                  <Text className="text-green-700 text-sm ml-1">
                    {strength.timestamp}
                  </Text>
                </View>

                <View className="bg-white rounded-xl p-3">
                  <View className="flex-row items-center mb-2">
                    <Flame size={16} color="#22c55e" />
                    <Text className="text-green-800 font-semibold ml-2">
                      Impact
                    </Text>
                  </View>
                  <Text className="text-gray-700">{strength.impact}</Text>

                  {strength.details && (
                    <View className="mt-3">
                      <Text className="text-gray-600 font-medium mb-2">
                        Details:
                      </Text>
                      {strength.details.map((detail, detailIndex) => (
                        <Text
                          key={detailIndex}
                          className="text-gray-600 text-sm ml-2"
                        >
                          • {detail}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Improvements */}
        <View className="bg-white rounded-3xl p-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <AlertTriangle size={24} color="#f59e0b" />
            <Text className="text-xl font-bold text-gray-900 ml-2">
              Weaknesses ({category.improvements.length})
            </Text>
          </View>
          <View className="space-y-4">
            {category.improvements.map((improvement, index) => (
              <View key={index} className="bg-orange-50 rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-orange-800 font-semibold flex-1">
                    {improvement.text}
                  </Text>
                  {/*<View
                    className={`rounded-full px-2 py-1 ${
                      improvement.severity === "high"
                        ? "bg-red-100"
                        : improvement.severity === "medium"
                          ? "bg-orange-100"
                          : "bg-yellow-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        improvement.severity === "high"
                          ? "text-red-700"
                          : improvement.severity === "medium"
                            ? "text-orange-700"
                            : "text-yellow-700"
                      }`}
                    >
                      {improvement.severity.toUpperCase()}
                    </Text>
                  </View>*/}
                </View>

                <View className="flex-row items-center mb-3">
                  <Clock size={14} color="#d97706" />
                  <Text className="text-orange-700 text-sm ml-1">
                    {improvement.timestamp}
                  </Text>
                </View>

                <View className="bg-white rounded-xl p-3">
                  <View className="flex-row items-center mb-2">
                    <Lightbulb size={16} color="#f97316" />
                    <Text className="text-orange-800 font-semibold ml-2">
                      Suggestion
                    </Text>
                  </View>
                  <Text className="text-gray-700">
                    {improvement.suggestion}
                  </Text>

                  {improvement.details && (
                    <View className="mt-3">
                      <Text className="text-gray-600 font-medium mb-2">
                        Details:
                      </Text>
                      {improvement.details.map((detail, detailIndex) => (
                        <Text
                          key={detailIndex}
                          className="text-gray-600 text-sm ml-2"
                        >
                          • {detail}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={onBack}
            className="bg-white/20 rounded-full p-2"
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Detailed Feedback
          </Text>
          <TouchableOpacity
            onPress={() => setIsPlaying(!isPlaying)}
            className="bg-white/20 rounded-full p-2"
          >
            {isPlaying ? (
              <Pause size={24} color="white" />
            ) : (
              <Play size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <Text className="text-white/80">
          Comprehensive analysis of your speech performance
        </Text>
      </View>

      {/* Category Tabs */}
      <View className="bg-white px-6 py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {categories
              .filter(
                (cat) =>
                  cat.id === "all" || hasFeedback(detailedFeedback[cat.id]),
              )
              .map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    className={`flex-row items-center px-4 py-2 rounded-2xl ${
                      isSelected ? "bg-purple-100" : "bg-gray-100"
                    }`}
                  >
                    <IconComponent
                      size={16}
                      color={isSelected ? "#7c3aed" : cat.color}
                    />
                    <Text
                      className={`font-semibold ml-2 ${
                        isSelected ? "text-purple-700" : "text-gray-600"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-4">
        {renderCategoryContent(selectedCategory)}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailedFeedbackScreen;
