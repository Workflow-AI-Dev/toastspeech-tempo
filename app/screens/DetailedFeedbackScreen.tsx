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
} from "lucide-react-native";

interface DetailedFeedbackScreenProps {
  onBack?: () => void;
}

export default function DetailedFeedbackScreen({
  onBack = () => {},
}: DetailedFeedbackScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);

  const categories = [
    { id: "all", label: "All", icon: BarChart3, color: "#6b7280" },
    { id: "vocal", label: "Vocal", icon: Volume2, color: "#3b82f6" },
    {
      id: "language",
      label: "Language",
      icon: MessageSquare,
      color: "#8b5cf6",
    },
    { id: "delivery", label: "Delivery", icon: Eye, color: "#10b981" },
    { id: "emotion", label: "Emotion", icon: Heart, color: "#f59e0b" },
  ];

  const detailedFeedback = {
    vocal: {
      title: "Vocal Delivery",
      score: 85,
      strengths: [
        {
          text: "Excellent vocal variety with pitch modulation",
          timestamp: "0:45",
          confidence: 95,
        },
        {
          text: "Clear articulation throughout the speech",
          timestamp: "2:15",
          confidence: 92,
        },
        {
          text: "Appropriate volume for audience engagement",
          timestamp: "3:30",
          confidence: 88,
        },
      ],
      improvements: [
        {
          text: "Pace slightly fast during technical explanations",
          timestamp: "1:20",
          severity: "medium",
          suggestion: "Slow down by 10-15% when explaining complex concepts",
        },
        {
          text: "Inconsistent pause lengths between sentences",
          timestamp: "2:45",
          severity: "low",
          suggestion: "Practice using 1-2 second pauses consistently",
        },
      ],
      metrics: {
        averagePace: "165 WPM",
        optimalRange: "140-160 WPM",
        pauseFrequency: "Every 8.5 words",
        volumeConsistency: "87%",
      },
    },
    language: {
      title: "Language & Grammar",
      score: 78,
      strengths: [
        {
          text: "Rich vocabulary with varied word choices",
          timestamp: "1:10",
          confidence: 90,
        },
        {
          text: "Proper grammar structure throughout",
          timestamp: "Overall",
          confidence: 85,
        },
      ],
      improvements: [
        {
          text: "8 filler words detected ('um', 'uh', 'like')",
          timestamp: "Multiple",
          severity: "high",
          suggestion:
            "Practice with recording to build awareness of filler word usage",
          details: [
            "'Um' - 4 instances (0:30, 1:45, 2:20, 3:10)",
            "'Uh' - 3 instances (0:55, 2:35, 3:45)",
            "'Like' - 1 instance (1:30)",
          ],
        },
        {
          text: "Repetitive sentence starters",
          timestamp: "1:00-2:00",
          severity: "medium",
          suggestion: "Vary sentence beginnings to maintain audience interest",
        },
      ],
      metrics: {
        vocabularyDiversity: "72%",
        grammarAccuracy: "94%",
        fillerWordRate: "1.8 per minute",
        sentenceVariety: "65%",
      },
    },
    delivery: {
      title: "Physical Delivery",
      score: 82,
      strengths: [
        {
          text: "Strong eye contact with audience",
          timestamp: "Throughout",
          confidence: 88,
        },
        {
          text: "Natural hand gestures for emphasis",
          timestamp: "1:30-2:00",
          confidence: 85,
        },
      ],
      improvements: [
        {
          text: "Limited movement and positioning",
          timestamp: "Overall",
          severity: "medium",
          suggestion: "Use purposeful movement to emphasize transitions",
        },
        {
          text: "Occasional fidgeting with hands",
          timestamp: "2:30-3:00",
          severity: "low",
          suggestion: "Practice relaxed, open posture",
        },
      ],
      metrics: {
        eyeContactScore: "85%",
        gestureVariety: "72%",
        postureConsistency: "78%",
        movementPurpose: "65%",
      },
    },
    emotion: {
      title: "Emotional Delivery",
      score: 89,
      strengths: [
        {
          text: "Authentic enthusiasm for the topic",
          timestamp: "0:15-1:00",
          confidence: 92,
        },
        {
          text: "Emotional connection with personal stories",
          timestamp: "2:00-2:45",
          confidence: 95,
        },
        {
          text: "Confident and engaging tone",
          timestamp: "Throughout",
          confidence: 87,
        },
      ],
      improvements: [
        {
          text: "Energy dip during middle section",
          timestamp: "2:45-3:15",
          severity: "medium",
          suggestion: "Maintain consistent energy by varying vocal dynamics",
        },
      ],
      metrics: {
        emotionalRange: "78%",
        authenticity: "92%",
        audienceConnection: "85%",
        energyConsistency: "73%",
      },
    },
  };

  const overallInsights = [
    {
      type: "strength",
      icon: CheckCircle,
      color: "#10b981",
      title: "Natural Storyteller",
      description:
        "Your personal anecdotes created strong emotional connections with the audience.",
    },
    {
      type: "improvement",
      icon: AlertTriangle,
      color: "#f59e0b",
      title: "Filler Word Awareness",
      description:
        "Focus on eliminating filler words to sound more polished and confident.",
    },
    {
      type: "tip",
      icon: Lightbulb,
      color: "#8b5cf6",
      title: "Practice Recommendation",
      description:
        "Record yourself daily for 2 minutes to build awareness of speaking patterns.",
    },
  ];

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
              {Object.entries(detailedFeedback).map(([key, category]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedCategory(key)}
                  className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4"
                >
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">
                      {category.title}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <View className="bg-gray-200 rounded-full h-2 w-20 mr-3">
                        <View
                          className="rounded-full h-2 bg-blue-500"
                          style={{ width: `${category.score}%` }}
                        />
                      </View>
                      <Text className="text-gray-600 text-sm">
                        {category.strengths.length} strengths,{" "}
                        {category.improvements.length} improvements
                      </Text>
                    </View>
                  </View>
                  <Text className="font-bold text-gray-900 text-lg">
                    {category.score}
                  </Text>
                </TouchableOpacity>
              ))}
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
                {category.score}/100
              </Text>
            </View>
          </View>

          {/* Metrics */}
          <View className="bg-gray-50 rounded-2xl p-4">
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
          </View>
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
                  <View className="bg-green-100 rounded-full px-2 py-1">
                    <Text className="text-green-700 text-xs font-bold">
                      {strength.confidence}%
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Clock size={14} color="#059669" />
                  <Text className="text-green-700 text-sm ml-1">
                    {strength.timestamp}
                  </Text>
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
              Areas for Improvement ({category.improvements.length})
            </Text>
          </View>
          <View className="space-y-4">
            {category.improvements.map((improvement, index) => (
              <View key={index} className="bg-orange-50 rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-orange-800 font-semibold flex-1">
                    {improvement.text}
                  </Text>
                  <View
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
                  </View>
                </View>

                <View className="flex-row items-center mb-3">
                  <Clock size={14} color="#d97706" />
                  <Text className="text-orange-700 text-sm ml-1">
                    {improvement.timestamp}
                  </Text>
                </View>

                <View className="bg-white rounded-xl p-3">
                  <View className="flex-row items-center mb-2">
                    <Lightbulb size={16} color="#7c3aed" />
                    <Text className="text-purple-700 font-semibold ml-2">
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
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`flex-row items-center px-4 py-2 rounded-2xl ${
                    isSelected ? "bg-purple-100" : "bg-gray-100"
                  }`}
                >
                  <IconComponent
                    size={16}
                    color={isSelected ? "#7c3aed" : category.color}
                  />
                  <Text
                    className={`font-semibold ml-2 ${
                      isSelected ? "text-purple-700" : "text-gray-600"
                    }`}
                  >
                    {category.label}
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
}
