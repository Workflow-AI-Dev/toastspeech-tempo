import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import {
  ArrowLeft,
  Send,
  Edit3,
  MessageSquare,
  CheckCircle,
  User,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "./context/ThemeContext";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function EvaluatorSummaryScreen() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const router = useRouter();
  const params = useLocalSearchParams();

  const [evaluationSummary, setEvaluationSummary] = useState("");
  const [transcribedText] = useState(
    (params.transcribedText as string) ||
      "This is a well-structured speech with clear objectives. The speaker demonstrated good knowledge of sustainable technology and effectively engaged the audience. Areas for improvement include speaking pace and gesture usage.",
  );

  const handleSubmitEvaluation = () => {
    // Navigate to completion screen with evaluation data
    router.push({
      pathname: "/evaluator-complete",
      params: {
        evaluationSummary: evaluationSummary || transcribedText,
        transcribedText,
      },
    });
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
            onPress={() => router.back()}
            className="rounded-full p-2"
            style={{ backgroundColor: colors.surface }}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Evaluation Summary
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Auto-Transcription */}
        {transcribedText && (
          <View
            className="rounded-3xl p-6 shadow-lg mb-6"
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
              <View
                className="rounded-full p-3 mr-4"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#f0f9ff",
                }}
              >
                <MessageSquare size={24} color={colors.primary} />
              </View>
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Auto-Transcription
              </Text>
            </View>

            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="leading-relaxed" style={{ color: colors.text }}>
                {transcribedText}
              </Text>
            </View>

            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Review and edit the transcription below if needed
            </Text>
          </View>
        )}

        {/* Editable Summary */}
        <View
          className="p-6 mb-6"
          style={{
            backgroundColor: colors.card,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View
              className="rounded-full p-3 mr-4"
              style={{
                backgroundColor: theme === "dark" ? colors.surface : "#f0fdf4",
              }}
            >
              <Edit3 size={24} color={colors.success} />
            </View>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Evaluator Summary
            </Text>
          </View>

          <TextInput
            className="rounded-2xl p-4 min-h-32"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              color: colors.text,
            }}
            multiline
            numberOfLines={6}
            placeholder="Edit your evaluation summary here. This will be shared with the speaker along with your audio feedback..."
            placeholderTextColor={colors.textSecondary}
            value={evaluationSummary || transcribedText}
            onChangeText={setEvaluationSummary}
          />

          <Text
            className="text-sm mt-2"
            style={{ color: colors.textSecondary }}
          >
            This summary will be stored with the speaker's analysis
          </Text>
        </View>

        <View className="flex-row space-x-3 mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 rounded-2xl py-4 px-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="font-bold text-lg text-center"
              style={{ color: colors.text }}
            >
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmitEvaluation}
            className="flex-1 rounded-2xl py-4 px-6"
            style={{
              backgroundColor: colors.success,
              opacity: !transcribedText && !evaluationSummary ? 0.5 : 1,
            }}
            disabled={!transcribedText && !evaluationSummary}
          >
            <View className="flex-row items-center justify-center">
              <Send size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Submit</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
