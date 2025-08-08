import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
} from "react-native";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
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
  Clock
} from "lucide-react-native";
import { Audio, Video } from "expo-av";
import { useTheme, getThemeColors } from "../context/ThemeContext";

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
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const isVideo = detailed?.url?.includes("/video/") || detailed?.url?.endsWith(".mp4");
  const [isVideoModalVisible, setVideoModalVisible] = useState(false);

  // Use the theme hook to get current theme and colors
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const isDark = theme === 'dark';

  // Define conditional colors for the UI
  const sectionBgColor = isDark ? colors.surface : colors.card;
  const sectionTitleColor = isDark ? colors.text : "#111827";
  const sectionTextColor = isDark ? colors.textSecondary : "#6b7280";
  const overallCardBg = isDark ? colors.surface : "#f8f9fa";
  const tabBgColor = isDark ? colors.surface : "#f8f9fa";
  const tabTextColor = isDark ? colors.textSecondary : "#6b7280";
  const selectedTabBg = isDark ? "#2a2a2a" : "#eef2ff"; // A soft purple for dark mode, light purple for light mode
  const selectedTabTextColor = isDark ? colors.accent : "#7c3aed";
  const strengthsCardBg = isDark ? "#1f2a24" : "#ecfdf5";
  const strengthsTextColor = isDark ? "#a7f3d0" : "#065f46";
  const improvementsCardBg = isDark ? "#2a241f" : "#fff7ed";
  const improvementsTextColor = isDark ? "#fcd34d" : "#92400e";
  const scoreBadgeBg = isDark ? "#1e2a3c" : "#e0f2fe";
  const scoreBadgeText = isDark ? "#60a5fa" : "#2563eb";
  const insightsBg = isDark ? colors.surface : "#f8f9fa";
  const insightsTextColor = isDark ? colors.text : "#111827";
  const insightsDescriptionColor = isDark ? colors.textSecondary : "#6b7280";
  const progressBg = isDark ? '#374151' : '#e5e7eb';
  const headerGradientFrom = isDark ? colors.surface : "#8b5cf6"; // Darker gradient for dark mode
  const headerGradientTo = isDark ? colors.surface : "#6b46c1"; // Darker gradient for dark mode

  // Optional: Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const hasFeedback = (category: any) => {
    return (
      category?.strengths?.length > 0 || category?.improvements?.length > 0
    );
  };

  const handlePlayPause = async () => {
    if (isVideo) {
      setVideoModalVisible(true);
      return;
    }

    try {
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: detailed?.url },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
      } else {
        const status = await sound.getStatusAsync();
        if (status.isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error handling audio playback:", error);
    }
  };

  const categories = [
    { id: "all", label: "All", icon: BarChart3, color: isDark ? colors.textSecondary : "#6b7280" },
    {
      id: "gestures",
      label: "Gestures",
      icon: HandMetal,
      color: "#14b8a6",
    },
    {
      id: "presence",
      label: "Stage Presence",
      icon: Mic,
      color: "#f472b6",
    },
    {
      id: "visuals",
      label: "Visual Engagement",
      icon: Heart,
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
      icon: Brain,
      color: "#f59e0b",
    },
    {
      id: "storyStages",
      label: "Story Stages",
      icon: Clock,
      color: "#0ea5e9",
    },
    {
      id: "audience",
      label: "Audience Connection",
      icon: Eye,
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

  const overallInsights =
    detailed?.OverallInsights?.map((item: any) => {
      const iconMap = {
        strength: CheckCircle,
        improvement: AlertTriangle,
        tip: Lightbulb,
      };

      const colorMap = {
        strength: colors.success,
        improvement: colors.warning,
        tip: colors.accent,
      };

      return {
        ...item,
        icon: iconMap[item.type] || Lightbulb,
        color: colorMap[item.type] || colors.secondary,
      };
    }) || [];

  const renderCategoryContent = (categoryId: string) => {
    if (categoryId === "all") {
      return (
        <View className="space-y-6">
          {/* Overall Insights */}
          <View style={{ backgroundColor: sectionBgColor }} className="rounded-3xl p-6 shadow-sm">
            <Text style={{ color: sectionTitleColor }} className="text-xl font-bold mb-4">
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
                      <Text style={{ color: insightsTextColor }} className="font-bold mb-1">
                        {insight.title}
                      </Text>
                      <Text style={{ color: insightsDescriptionColor }} className="text-sm">
                        {insight.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Category Scores */}
          <View style={{ backgroundColor: sectionBgColor }} className="rounded-3xl p-6 shadow-sm">
            <Text style={{ color: sectionTitleColor }} className="text-xl font-bold mb-4">
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
                      className="flex-row items-center justify-between rounded-2xl p-4"
                      style={{ backgroundColor: isDark ? colors.surface : "#f8f9fa" }}
                    >
                      <View className="flex-row items-center flex-1">
                        <View
                          className="rounded-full p-2 mr-3"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <IconComponent size={16} color={color} />
                        </View>
                        <View className="flex-1">
                          <Text style={{ color: sectionTitleColor }} className="font-semibold">
                            {category.title}
                          </Text>
                          <View style={{ backgroundColor: progressBg }} className="rounded-full h-2 w-full mt-2">
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
        <View style={{ backgroundColor: sectionBgColor }} className="rounded-3xl p-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: sectionTitleColor }} className="text-2xl font-bold">
              {category.title}
            </Text>
            <View style={{ backgroundColor: scoreBadgeBg }} className="rounded-full px-4 py-2">
              <Text style={{ color: scoreBadgeText }} className="font-bold text-lg">
                {category.score}/10
              </Text>
            </View>
          </View>
        </View>

        {/* Strengths */}
        <View style={{ backgroundColor: sectionBgColor }} className="rounded-3xl p-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <CheckCircle size={24} color={colors.success} />
            <Text style={{ color: sectionTitleColor }} className="text-xl font-bold ml-2">
              Strengths ({category.strengths.length})
            </Text>
          </View>
          <View className="space-y-4">
            {category.strengths.map((strength, index) => (
              <View key={index} style={{ backgroundColor: strengthsCardBg }} className="rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <Text style={{ color: strengthsTextColor }} className="font-semibold flex-1">
                    {strength.text}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={14} color={colors.success} />
                  <Text style={{ color: strengthsTextColor }} className="text-sm ml-1">
                    {strength.timestamp}
                  </Text>
                </View>

                <View style={{ backgroundColor: sectionBgColor }} className="rounded-xl p-3 mt-3">
                  <View className="flex-row items-center mb-2">
                    <Flame size={16} color={colors.success} />
                    <Text style={{ color: strengthsTextColor }} className="font-semibold ml-2">
                      Impact
                    </Text>
                  </View>
                  <Text style={{ color: sectionTextColor }}>{strength.impact}</Text>

                  {strength.details && (
                    <View className="mt-3">
                      <Text style={{ color: sectionTextColor }} className="font-medium mb-2">
                        Details:
                      </Text>
                      {strength.details.map((detail, detailIndex) => (
                        <Text
                          key={detailIndex}
                          style={{ color: sectionTextColor }}
                          className="text-sm ml-2"
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
        <View style={{ backgroundColor: sectionBgColor }} className="rounded-3xl p-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <AlertTriangle size={24} color={colors.warning} />
            <Text style={{ color: sectionTitleColor }} className="text-xl font-bold ml-2">
              Recommendations ({category.improvements.length})
            </Text>
          </View>
          <View className="space-y-4">
            {category.improvements.map((improvement, index) => (
              <View key={index} style={{ backgroundColor: improvementsCardBg }} className="rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <Text style={{ color: improvementsTextColor }} className="font-semibold flex-1">
                    {improvement.text}
                  </Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <Clock size={14} color={colors.warning} />
                  <Text style={{ color: improvementsTextColor }} className="text-sm ml-1">
                    {improvement.timestamp}
                  </Text>
                </View>

                <View style={{ backgroundColor: sectionBgColor }} className="rounded-xl p-3">
                  <View className="flex-row items-center mb-2">
                    <Lightbulb size={16} color={colors.warning} />
                    <Text style={{ color: improvementsTextColor }} className="font-semibold ml-2">
                      Suggestion
                    </Text>
                  </View>
                  <Text style={{ color: sectionTextColor }}>
                    {improvement.suggestion}
                  </Text>

                  {improvement.details && (
                    <View className="mt-3">
                      <Text style={{ color: sectionTextColor }} className="font-medium mb-2">
                        Details:
                      </Text>
                      {improvement.details.map((detail, detailIndex) => (
                        <Text
                          key={detailIndex}
                          style={{ color: sectionTextColor }}
                          className="text-sm ml-2"
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
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      {/* Header */}
      <View style={{ backgroundColor: headerGradientFrom }} className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={onBack}
            className="rounded-full p-2"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)" }}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Detailed Feedback
          </Text>
          <TouchableOpacity
            onPress={handlePlayPause}
            className="rounded-full p-2"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)" }}
          >
            {isPlaying ? (
              <Pause size={24} color="white" />
            ) : (
              <Play size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={{ color: "rgba(255,255,255,0.8)" }}>
          Comprehensive analysis of your speech performance
        </Text>
      </View>

      {/* Category Tabs */}
      <View style={{ backgroundColor: colors.surface }} className="px-6 py-4">
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
                    className="flex-row items-center px-4 py-2 rounded-2xl"
                    style={{
                      backgroundColor: isSelected ? selectedTabBg : tabBgColor,
                    }}
                  >
                    <IconComponent
                      size={16}
                      color={isSelected ? selectedTabTextColor : cat.color}
                    />
                    <Text
                      className="font-semibold ml-2"
                      style={{
                        color: isSelected ? selectedTabTextColor : tabTextColor,
                      }}
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
      <ScrollView
        style={{ backgroundColor: colors.background }}
        className="flex-1 px-6 py-4"
      >
        {renderCategoryContent(selectedCategory)}
      </ScrollView>

      <Modal
        visible={isVideoModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: '90%',
              aspectRatio: 16 / 9,
              backgroundColor: '#000',
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setVideoModalVisible(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 2,
                backgroundColor: isDark ? '#fff' : '#000',
                borderRadius: 16,
                padding: 6,
                elevation: 5,
              }}
            >
              <Text style={{ color: isDark ? '#000' : '#fff', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>

            {/* Video */}
            <Video
              source={{ uri: detailed?.url }}
              useNativeControls
              shouldPlay
              resizeMode="contain"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DetailedFeedbackScreen;