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
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Clock,
  Mic,
  BarChart2,
  Star,
  ChevronRight,
  Play,
  Eye,
  Download,
} from "lucide-react-native";

interface AIEvaluationSummaryScreenProps {
  onBack?: () => void;
  onViewDetailedFeedback?: () => void;
  speechData?: {
    title: string;
    date: string;
    duration: string;
    overallScore: number;
  };
}

export default function AIEvaluationSummaryScreen({
  onBack = () => {},
  onViewDetailedFeedback = () => {},
  speechData = {
    title: "My Leadership Journey",
    date: "2024-01-15",
    duration: "4:32",
    overallScore: 87,
  },
}: AIEvaluationSummaryScreenProps) {
  const [selectedTab, setSelectedTab] = useState("overview");

  const metrics = {
    pace: { score: 85, change: "+8", status: "good" },
    clarity: { score: 92, change: "+12", status: "excellent" },
    confidence: { score: 78, change: "-3", status: "good" },
    engagement: { score: 88, change: "+15", status: "excellent" },
    fillerWords: { count: 8, change: "-5", status: "improved" },
    vocabulary: { score: 84, change: "+6", status: "good" },
  };

  const comparisonData = {
    previousSpeeches: [
      { title: "Why I Love Coffee", score: 72, date: "2024-01-08" },
      { title: "Dream Vacation Plans", score: 68, date: "2024-01-01" },
      { title: "New Year Resolutions", score: 75, date: "2023-12-28" },
    ],
    averageImprovement: "+12",
    bestCategory: "Clarity",
    focusArea: "Confidence",
  };

  const renderOverviewTab = () => (
    <View className="space-y-6">
      {/* Overall Score Card */}
      <View className="bg-white rounded-3xl p-6 shadow-sm">
        <View className="items-center mb-6">
          <View className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 items-center justify-center mb-4">
            <Text className="text-4xl font-bold text-green-600">
              {speechData.overallScore}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Great Performance! 🎉
          </Text>
          <View className="flex-row items-center">
            <TrendingUp size={16} color="#10b981" />
            <Text className="text-green-600 font-bold ml-1">
              {comparisonData.averageImprovement} from average
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between bg-gray-50 rounded-2xl p-4">
          <View className="items-center">
            <Clock size={20} color="#6b7280" />
            <Text className="text-gray-500 text-sm mt-1">Duration</Text>
            <Text className="font-bold text-gray-900">
              {speechData.duration}
            </Text>
          </View>
          <View className="items-center">
            <Award size={20} color="#6b7280" />
            <Text className="text-gray-500 text-sm mt-1">Best Area</Text>
            <Text className="font-bold text-gray-900">
              {comparisonData.bestCategory}
            </Text>
          </View>
          <View className="items-center">
            <Target size={20} color="#6b7280" />
            <Text className="text-gray-500 text-sm mt-1">Focus On</Text>
            <Text className="font-bold text-gray-900">
              {comparisonData.focusArea}
            </Text>
          </View>
        </View>
      </View>

      {/* Key Metrics */}
      <View className="bg-white rounded-3xl p-6 shadow-sm">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Performance Breakdown
        </Text>
        <View className="space-y-4">
          {Object.entries(metrics).map(([key, metric]) => {
            const isNegative = metric.change?.startsWith("-");
            const getColor = (status: string) => {
              switch (status) {
                case "excellent":
                  return "#10b981";
                case "good":
                  return "#3b82f6";
                case "improved":
                  return "#8b5cf6";
                default:
                  return "#6b7280";
              }
            };

            return (
              <View key={key} className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Text>
                  {key === "fillerWords" && (
                    <Text className="text-gray-500 text-sm">
                      {metric.count} instances
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  {key !== "fillerWords" && (
                    <View className="bg-gray-200 rounded-full h-2 w-16 mr-3">
                      <View
                        className="rounded-full h-2"
                        style={{
                          width: `${metric.score}%`,
                          backgroundColor: getColor(metric.status),
                        }}
                      />
                    </View>
                  )}
                  <View className="items-end min-w-[60px]">
                    {key !== "fillerWords" && (
                      <Text className="font-bold text-gray-900">
                        {metric.score}
                      </Text>
                    )}
                    <View className="flex-row items-center">
                      {isNegative ? (
                        <TrendingDown size={12} color="#ef4444" />
                      ) : (
                        <TrendingUp size={12} color="#10b981" />
                      )}
                      <Text
                        className={`text-xs font-semibold ml-1 ${
                          isNegative ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {metric.change}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-white rounded-3xl p-6 shadow-sm">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Quick Actions
        </Text>
        <View className="space-y-3">
          <TouchableOpacity
            onPress={onViewDetailedFeedback}
            className="flex-row items-center justify-between bg-purple-50 rounded-2xl p-4"
          >
            <View className="flex-row items-center">
              <BarChart2 size={20} color="#7c3aed" />
              <Text className="text-purple-700 font-semibold ml-3">
                View Detailed Analysis
              </Text>
            </View>
            <ChevronRight size={20} color="#7c3aed" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-blue-50 rounded-2xl p-4">
            <View className="flex-row items-center">
              <Play size={20} color="#3b82f6" />
              <Text className="text-blue-700 font-semibold ml-3">
                Listen to Recording
              </Text>
            </View>
            <ChevronRight size={20} color="#3b82f6" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-green-50 rounded-2xl p-4">
            <View className="flex-row items-center">
              <Download size={20} color="#10b981" />
              <Text className="text-green-700 font-semibold ml-3">
                Export Report
              </Text>
            </View>
            <ChevronRight size={20} color="#10b981" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderComparisonTab = () => (
    <View className="space-y-6">
      {/* Progress Chart */}
      <View className="bg-white rounded-3xl p-6 shadow-sm">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Progress Over Time
        </Text>
        <View className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 mb-4">
          <Text className="text-center text-gray-600 mb-2">
            📈 Score Progression
          </Text>
          <View className="flex-row items-end justify-between h-20">
            {comparisonData.previousSpeeches.map((speech, index) => (
              <View key={index} className="items-center">
                <View
                  className="bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-lg w-8 mb-2"
                  style={{ height: `${(speech.score / 100) * 60}px` }}
                />
                <Text className="text-xs text-gray-600 text-center">
                  {speech.score}
                </Text>
              </View>
            ))}
            <View className="items-center">
              <View
                className="bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg w-8 mb-2"
                style={{ height: `${(speechData.overallScore / 100) * 60}px` }}
              />
              <Text className="text-xs text-green-600 font-bold text-center">
                {speechData.overallScore}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Previous Speeches */}
      <View className="bg-white rounded-3xl p-6 shadow-sm">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Recent Speeches
        </Text>
        <View className="space-y-3">
          {comparisonData.previousSpeeches.map((speech, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4"
            >
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  {speech.title}
                </Text>
                <Text className="text-gray-500 text-sm">{speech.date}</Text>
              </View>
              <View className="items-end">
                <Text className="font-bold text-gray-900">{speech.score}</Text>
                <View className="flex-row items-center">
                  <TrendingUp size={12} color="#10b981" />
                  <Text className="text-green-500 text-xs font-semibold ml-1">
                    +{speechData.overallScore - speech.score}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

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
          <Text className="text-white text-xl font-bold">AI Analysis</Text>
          <TouchableOpacity className="bg-white/20 rounded-full p-2">
            <Eye size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View>
          <Text className="text-white text-lg font-semibold">
            {speechData.title}
          </Text>
          <Text className="text-white/80">
            {new Date(speechData.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white px-6 py-2">
        <View className="flex-row bg-gray-100 rounded-2xl p-1">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ${
              selectedTab === "overview" ? "bg-white shadow-sm" : ""
            }`}
            onPress={() => setSelectedTab("overview")}
          >
            <Text
              className={`text-center font-semibold ${
                selectedTab === "overview" ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ${
              selectedTab === "comparison" ? "bg-white shadow-sm" : ""
            }`}
            onPress={() => setSelectedTab("comparison")}
          >
            <Text
              className={`text-center font-semibold ${
                selectedTab === "comparison" ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Progress
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-4">
        {selectedTab === "overview"
          ? renderOverviewTab()
          : renderComparisonTab()}
      </ScrollView>
    </SafeAreaView>
  );
}
