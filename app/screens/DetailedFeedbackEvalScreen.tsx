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
  Play,
  Pause,
  Volume2,
  MessageSquare,
  AlignLeft,
  Eye,
  Heart,
  BarChart3,
  Clock,
} from "lucide-react-native";

export default function DetailedFeedbackEvalScreen({ onBack = () => {} }) {
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
    { id: "content", label: "Content", icon: AlignLeft, color: "#ec4899" },
    { id: "delivery", label: "Delivery", icon: Eye, color: "#10b981" },
    { id: "emotion", label: "Emotion", icon: Heart, color: "#f59e0b" },
  ];

  const detailedFeedback = {
    vocal: {
      title: "Vocal Feedback",
      score: 82,
      strengths: [
        {
          text: "Good pitch control and vocal modulation",
          timestamp: "1:05",
          confidence: 90,
        },
        {
          text: "Pacing matched tone of message",
          timestamp: "2:20",
          confidence: 88,
        },
      ],
      improvements: [
        {
          text: "Volume dropped during conclusion",
          timestamp: "3:45",
          severity: "medium",
          suggestion: "Maintain consistent vocal energy till the end",
        },
      ],
      metrics: {
        clarityScore: "87%",
        modulationRange: "78%",
        averagePace: "158 WPM",
      },
    },
    language: {
      title: "Language & Expression",
      score: 76,
      strengths: [
        {
          text: "Varied and clear expressions",
          timestamp: "1:40",
          confidence: 85,
        },
      ],
      improvements: [
        {
          text: "Used the word 'basically' excessively",
          timestamp: "2:00-3:00",
          severity: "low",
          suggestion: "Minimize fillers to enhance professionalism",
        },
      ],
      metrics: {
        fillerWordRate: "2.1/min",
        vocabularyUse: "70%",
        grammarAccuracy: "96%",
      },
    },
    content: {
      title: "Content Quality",
      score: 88,
      strengths: [
        {
          text: "Accurate summary of the speaker's structure",
          timestamp: "0:30-1:00",
          confidence: 92,
        },
        {
          text: "Identified key transitions and rhetorical tools",
          timestamp: "1:50",
          confidence: 89,
        },
      ],
      improvements: [
        {
          text: "Missed mentioning call-to-action",
          timestamp: "3:40",
          severity: "medium",
          suggestion: "Mention all core components of the speech",
        },
      ],
      metrics: {
        accuracy: "90%",
        coverage: "85%",
        structureReflection: "78%",
      },
    },
    delivery: {
      title: "Evaluator's Delivery",
      score: 79,
      strengths: [
        {
          text: "Confident posture and consistent gestures",
          timestamp: "1:15",
          confidence: 84,
        },
      ],
      improvements: [
        {
          text: "Eye contact dropped during second half",
          timestamp: "2:30-3:30",
          severity: "low",
          suggestion: "Practice sustained eye contact",
        },
      ],
      metrics: {
        eyeContact: "72%",
        gestureUse: "80%",
        movementFluidity: "68%",
      },
    },
    emotion: {
      title: "Emotional Resonance",
      score: 84,
      strengths: [
        {
          text: "Warm tone and supportive energy",
          timestamp: "Throughout",
          confidence: 91,
        },
      ],
      improvements: [
        {
          text: "Could have smiled more during encouragement",
          timestamp: "3:00",
          severity: "low",
          suggestion: "Smiling adds emotional connection and encouragement",
        },
      ],
      metrics: {
        positivity: "88%",
        empathyShown: "82%",
        vocalWarmth: "79%",
      },
    },
  };

  const overallInsights = [
    {
      type: "strength",
      icon: CheckCircle,
      color: "#10b981",
      title: "Supportive Evaluator",
      description: "Your praise was meaningful and specific, boosting morale.",
    },
    {
      type: "improvement",
      icon: AlertTriangle,
      color: "#f59e0b",
      title: "Structural Completeness",
      description: "Try to include all parts of the speech in your critique.",
    },
    {
      type: "tip",
      icon: Lightbulb,
      color: "#8b5cf6",
      title: "Balance is Key",
      description: "Equal focus on praise and suggestions builds credibility.",
    },
  ];

  const renderCategoryContent = (categoryId) => {
    if (categoryId === "all") {
      return (
        <View className="space-y-6">
          {/* Insights */}
          <View className="bg-white rounded-3xl p-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Key Insights
            </Text>
            <View className="space-y-4">
              {overallInsights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <View key={index} className="flex-row items-start">
                    <View
                      className="rounded-full p-2 mr-3 mt-1"
                      style={{ backgroundColor: `${insight.color}20` }}
                    >
                      <Icon size={16} color={insight.color} />
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

    const category = detailedFeedback[categoryId];
    if (!category) return null;

    return (
      <View className="space-y-6">
        <View className="bg-white rounded-3xl p-6 shadow-sm">
          <View className="flex-row justify-between mb-4">
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
                <View key={key}>
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
            {category.strengths.map((s, i) => (
              <View key={i} className="bg-green-50 rounded-2xl p-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-green-800 font-semibold flex-1">
                    {s.text}
                  </Text>
                  <View className="bg-green-100 rounded-full px-2 py-1">
                    <Text className="text-green-700 text-xs font-bold">
                      {s.confidence}%
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Clock size={14} color="#059669" />
                  <Text className="text-green-700 text-sm ml-1">
                    {s.timestamp}
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
            {category.improvements.map((imp, i) => (
              <View key={i} className="bg-orange-50 rounded-2xl p-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-orange-800 font-semibold flex-1">
                    {imp.text}
                  </Text>
                  <View
                    className={`rounded-full px-2 py-1 ${
                      imp.severity === "high"
                        ? "bg-red-100"
                        : imp.severity === "medium"
                          ? "bg-orange-100"
                          : "bg-yellow-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        imp.severity === "high"
                          ? "text-red-700"
                          : imp.severity === "medium"
                            ? "text-orange-700"
                            : "text-yellow-700"
                      }`}
                    >
                      {imp.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center mb-3">
                  <Clock size={14} color="#d97706" />
                  <Text className="text-orange-700 text-sm ml-1">
                    {imp.timestamp}
                  </Text>
                </View>
                <View className="bg-white rounded-xl p-3">
                  <View className="flex-row items-center mb-2">
                    <Lightbulb size={16} color="#7c3aed" />
                    <Text className="text-purple-700 font-semibold ml-2">
                      Suggestion
                    </Text>
                  </View>
                  <Text className="text-gray-700">{imp.suggestion}</Text>
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
      <View className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={onBack}
            className="bg-white/20 rounded-full p-2"
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Evaluation Feedback
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
          In-depth review of your evaluation delivery
        </Text>
      </View>

      <View className="bg-white px-6 py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  className={`flex-row items-center px-4 py-2 rounded-2xl ${
                    isSelected ? "bg-purple-100" : "bg-gray-100"
                  }`}
                >
                  <Icon size={16} color={isSelected ? "#7c3aed" : cat.color} />
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

      <ScrollView className="flex-1 px-6 py-4">
        {renderCategoryContent(selectedCategory)}
      </ScrollView>
    </SafeAreaView>
  );
}
