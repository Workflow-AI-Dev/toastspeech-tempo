import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
} from "react-native";
import {
  ArrowLeft,
  Mic,
  Video,
  Award,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Star,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Upload,
  FileText,
  User,
  Calendar,
  BookOpen,
  ChevronRight,
} from "lucide-react-native";
import SpeechRecorder from "../components/SpeechRecorder";
import { useTheme, getThemeColors } from "../context/ThemeContext";

interface SpeakerModeScreenProps {
  onBack?: () => void;
  onViewDetailedFeedback?: () => void;
}

type SpeechType = "toastmasters" | "custom";
type CurrentStep =
  | "speechType"
  | "speechDetails"
  | "recordingMethod"
  | "record"
  | "results";

const stepLabels = ["Type", "Details", "Method", "Record", "Results"];
const stepKeys: CurrentStep[] = [
  "speechType",
  "speechDetails",
  "recordingMethod",
  "record",
  "results",
];

export default function SpeakerModeScreen({
  onBack = () => {},
  onViewDetailedFeedback = () => {},
}: SpeakerModeScreenProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [currentStep, setCurrentStep] = useState<CurrentStep>("speechType");
  const [speechType, setSpeechType] = useState<SpeechType | null>(null);
  const [recordingMethod, setRecordingMethod] = useState<
    "audio" | "video" | "upload" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechDetails, setSpeechDetails] = useState({
    title: "",
    evaluatorName: "",
    duration: "",
    purpose: "",
    criteria: [] as string[],
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const analysisResults = {
    overallScore: 87,
    pace: 85,
    fillerWords: 8,
    emotionalDelivery: 89,
    clarity: 92,
    confidence: 84,
    engagement: 88,
    improvement: "+15",
    duration: "4:32",
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

  const handleRecordingComplete = () => {
    setShowConfirmModal(true);
  };

  const confirmSubmission = () => {
    setShowConfirmModal(false);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep("results");
    }, 3000);
  };

  const evaluationCriteria = [
    "Content Organization",
    "Vocal Variety",
    "Body Language",
    "Eye Contact",
    "Grammar & Language",
    "Audience Engagement",
    "Time Management",
    "Confidence",
  ];

  const renderProgressIndicator = () => (
    <View className="flex-row items-center justify-center">
      {stepKeys.map((step, index) => {
        const isActive = currentStep === step;
        const isCompleted = stepKeys.indexOf(currentStep) > index;
        return (
          <View key={step} className="flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                // Allow navigation back to previous steps only
                if (stepKeys.indexOf(step) < stepKeys.indexOf(currentStep)) {
                  setCurrentStep(step);
                }
              }}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: isActive
                  ? colors.primary
                  : isCompleted
                    ? colors.success
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: isActive || isCompleted ? 0 : 1,
              }}
              disabled={stepKeys.indexOf(step) >= stepKeys.indexOf(currentStep)}
            >
              <Text
                className="font-bold text-xs"
                style={{
                  color:
                    isActive || isCompleted ? "white" : colors.textSecondary,
                }}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
            {index < stepKeys.length - 1 && (
              <View
                className="w-6 h-0.5 mx-1"
                style={{
                  backgroundColor: isCompleted ? colors.success : colors.border,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );

  const renderSpeechTypeSelection = () => (
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
            onPress={onBack}
            className="rounded-full p-2"
            style={{ backgroundColor: colors.surface }}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Speaker Mode
          </Text>
          <View className="w-10" />
        </View>
        {renderProgressIndicator()}
      </View>

      <ScrollView className="flex-1">
        <View className="p-6">
          <Text
            className="text-2xl font-bold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Choose Speech Type
          </Text>
          <Text
            className="text-center mb-8 text-base"
            style={{ color: colors.textSecondary }}
          >
            Select the format that best matches your needs
          </Text>

          {/* Toastmasters Speech Option */}
          <TouchableOpacity
            className="rounded-3xl p-6 mb-6 shadow-lg"
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
            onPress={() => {
              setSpeechType("toastmasters");
              setCurrentStep("speechDetails");
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="rounded-2xl p-4 mr-4"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#dbeafe",
                }}
              >
                <Award size={28} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Toastmasters Speech
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Structured evaluation with official criteria
                </Text>
              </View>
              <ChevronRight size={24} color={colors.textSecondary} />
            </View>
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Perfect for:
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Official Toastmasters projects
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Structured feedback based on manual criteria
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Competition preparation
              </Text>
            </View>
          </TouchableOpacity>

          {/* Custom Speech Option */}
          <TouchableOpacity
            className="rounded-3xl p-6 shadow-lg"
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
            onPress={() => {
              setSpeechType("custom");
              setCurrentStep("speechDetails");
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="rounded-2xl p-4 mr-4"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#f3e8ff",
                }}
              >
                <Target size={28} color={colors.accent} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Custom Speech
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Flexible practice with personalized goals
                </Text>
              </View>
              <ChevronRight size={24} color={colors.textSecondary} />
            </View>
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Perfect for:
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Workplace presentations
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Academic speeches
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Personal practice sessions
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderSpeechDetails = () => (
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
            onPress={() => setCurrentStep("speechType")}
            className="rounded-full p-2"
            style={{ backgroundColor: colors.surface }}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Speaker Mode
          </Text>
          <View className="w-10" />
        </View>
        {renderProgressIndicator()}
      </View>

      <ScrollView className="flex-1">
        <View className="p-6">
          <Text
            className="text-2xl font-bold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Speech Details
          </Text>
          <Text
            className="text-center mb-8 text-base"
            style={{ color: colors.textSecondary }}
          >
            {speechType === "toastmasters"
              ? "Configure your Toastmasters speech"
              : "Set up your custom speech"}
          </Text>

          {speechType === "toastmasters" && (
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
                <Upload size={24} color={colors.primary} />
                <Text
                  className="text-xl font-bold ml-3"
                  style={{ color: colors.text }}
                >
                  Upload Evaluation Form
                </Text>
              </View>
              <Text
                className="mb-4 text-base"
                style={{ color: colors.textSecondary }}
              >
                Have an evaluation form? Upload it for more accurate feedback.
              </Text>
              <TouchableOpacity
                className="border-2 border-dashed rounded-2xl p-6 items-center"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                }}
              >
                <FileText size={32} color={colors.primary} />
                <Text
                  className="font-semibold mt-2"
                  style={{ color: colors.primary }}
                >
                  Tap to upload PDF or image
                </Text>
                <Text
                  className="text-sm mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  Optional - you can fill details manually below
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: colors.text }}
            >
              Speech Information
            </Text>

            <View className="space-y-4">
              <View>
                <Text
                  className="font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  Speech Title *
                </Text>
                <TextInput
                  className="rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                  placeholder="Enter your speech title"
                  placeholderTextColor={colors.textSecondary}
                  value={speechDetails.title}
                  onChangeText={(text) =>
                    setSpeechDetails({ ...speechDetails, title: text })
                  }
                />
              </View>

              {speechType === "toastmasters" && (
                <View>
                  <Text
                    className="font-semibold mb-2"
                    style={{ color: colors.text }}
                  >
                    Evaluator Name
                  </Text>
                  <TextInput
                    className="rounded-2xl px-4 py-3"
                    style={{
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                      borderWidth: 1,
                    }}
                    placeholder="Who will evaluate this speech?"
                    placeholderTextColor={colors.textSecondary}
                    value={speechDetails.evaluatorName}
                    onChangeText={(text) =>
                      setSpeechDetails({
                        ...speechDetails,
                        evaluatorName: text,
                      })
                    }
                  />
                </View>
              )}

              <View>
                <Text
                  className="font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  Target Duration
                </Text>
                <TextInput
                  className="rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                  placeholder="e.g., 5-7 minutes"
                  placeholderTextColor={colors.textSecondary}
                  value={speechDetails.duration}
                  onChangeText={(text) =>
                    setSpeechDetails({ ...speechDetails, duration: text })
                  }
                />
              </View>

              <View>
                <Text
                  className="font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  Speech Purpose
                </Text>
                <TextInput
                  className="rounded-2xl px-4 py-4"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                  placeholder="What's the main goal of your speech?"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={speechDetails.purpose}
                  onChangeText={(text) =>
                    setSpeechDetails({ ...speechDetails, purpose: text })
                  }
                />
              </View>
            </View>
          </View>

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
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: colors.text }}
            >
              Key Evaluation Criteria
            </Text>
            <Text
              className="mb-4 text-base"
              style={{ color: colors.textSecondary }}
            >
              Select the areas you'd like to focus on during evaluation:
            </Text>
            <View className="flex-row flex-wrap">
              {evaluationCriteria.map((criterion) => (
                <TouchableOpacity
                  key={criterion}
                  className="mr-2 mb-2 px-4 py-2 rounded-full border-2"
                  style={{
                    backgroundColor: speechDetails.criteria.includes(criterion)
                      ? colors.surface
                      : colors.background,
                    borderColor: speechDetails.criteria.includes(criterion)
                      ? colors.primary
                      : colors.border,
                  }}
                  onPress={() => {
                    const newCriteria = speechDetails.criteria.includes(
                      criterion,
                    )
                      ? speechDetails.criteria.filter((c) => c !== criterion)
                      : [...speechDetails.criteria, criterion];
                    setSpeechDetails({
                      ...speechDetails,
                      criteria: newCriteria,
                    });
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: speechDetails.criteria.includes(criterion)
                        ? colors.primary
                        : colors.textSecondary,
                    }}
                  >
                    {criterion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            className="rounded-2xl py-4 px-6 mb-8"
            style={{
              backgroundColor: speechDetails.title.trim()
                ? colors.primary
                : colors.border,
              opacity: speechDetails.title.trim() ? 1 : 0.6,
            }}
            onPress={() => setCurrentStep("recordingMethod")}
            disabled={!speechDetails.title.trim()}
          >
            <Text className="text-white font-bold text-lg text-center">
              Continue to Recording Method
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderRecordingMethodSelection = () => (
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
            onPress={() => setCurrentStep("speechDetails")}
            className="rounded-full p-2"
            style={{ backgroundColor: colors.surface }}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Speaker Mode
          </Text>
          <View className="w-10" />
        </View>
        {renderProgressIndicator()}
      </View>

      <ScrollView className="flex-1">
        <View className="p-6">
          <Text
            className="text-2xl font-bold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Choose Recording Method
          </Text>
          <Text
            className="text-center mb-8 text-base"
            style={{ color: colors.textSecondary }}
          >
            How would you like to record your speech?
          </Text>

          {/* Audio Only Option */}
          <TouchableOpacity
            className="rounded-3xl p-6 mb-6 shadow-lg"
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
            onPress={() => {
              setRecordingMethod("audio");
              setCurrentStep("record");
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="rounded-2xl p-4 mr-4"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#dbeafe",
                }}
              >
                <Mic size={28} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Audio Only
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Record voice only with microphone
                </Text>
              </View>
              <ChevronRight size={24} color={colors.textSecondary} />
            </View>
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Perfect for:
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Quick sessions
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Focus on vocal delivery
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Smaller file sizes
              </Text>
            </View>
          </TouchableOpacity>

          {/* Video + Audio Option */}
          <TouchableOpacity
            className="rounded-3xl p-6 mb-6 shadow-lg"
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
            onPress={() => {
              setRecordingMethod("video");
              setCurrentStep("record");
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="rounded-2xl p-4 mr-4"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#f3e8ff",
                }}
              >
                <Video size={28} color={colors.accent} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Video + Audio
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Record with camera and microphone
                </Text>
              </View>
              <ChevronRight size={24} color={colors.textSecondary} />
            </View>
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Perfect for:
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Complete presentation analysis
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Body language feedback
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Comprehensive evaluation
              </Text>
            </View>
          </TouchableOpacity>

          {/* Upload Recording Option */}
          <TouchableOpacity
            className="rounded-3xl p-6 shadow-lg"
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
            onPress={() => {
              setRecordingMethod("upload");
              setCurrentStep("record");
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="rounded-2xl p-4 mr-4"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#dcfce7",
                }}
              >
                <Upload size={28} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Upload Recording
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Select a pre-recorded file from device
                </Text>
              </View>
              <ChevronRight size={24} color={colors.textSecondary} />
            </View>
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Perfect for:
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Analyzing existing recordings
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Professional presentations
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Recorded speeches or meetings
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderRecordingView = () => (
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
            onPress={() => setCurrentStep("recordingMethod")}
            className="rounded-full p-2"
            style={{ backgroundColor: colors.surface }}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Speaker Mode
          </Text>
          <View className="w-10" />
        </View>
        {renderProgressIndicator()}
      </View>

      <ScrollView className="flex-1">
        <View className="p-6">
          <Text
            className="text-2xl font-bold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Record Your Speech
          </Text>
          <Text
            className="text-center mb-8 text-base"
            style={{ color: colors.textSecondary }}
          >
            Ready to speak? Let's record your speech for AI analysis
          </Text>

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
              <View
                className="rounded-2xl p-4 mr-4"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#f3e8ff",
                }}
              >
                <Target size={24} color={colors.accent} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Speaker Session
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Record your speech for AI analysis
                </Text>
              </View>
            </View>

            {speechDetails.title && (
              <View
                className="rounded-2xl p-4 mb-4 border"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <Text className="font-bold mb-1" style={{ color: colors.text }}>
                  {speechDetails.title}
                </Text>
                {speechDetails.purpose && (
                  <Text
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {speechDetails.purpose}
                  </Text>
                )}
                {speechDetails.criteria.length > 0 && (
                  <View className="flex-row flex-wrap mt-2">
                    {speechDetails.criteria.slice(0, 3).map((criterion) => (
                      <View
                        key={criterion}
                        className="rounded-full px-2 py-1 mr-2 mb-1"
                        style={{
                          backgroundColor:
                            theme === "dark" ? colors.surface : "#dbeafe",
                        }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: colors.primary }}
                        >
                          {criterion}
                        </Text>
                      </View>
                    ))}
                    {speechDetails.criteria.length > 3 && (
                      <View
                        className="rounded-full px-2 py-1"
                        style={{ backgroundColor: colors.border }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: colors.textSecondary }}
                        >
                          +{speechDetails.criteria.length - 3} more
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>

          <SpeechRecorder
            onRecordingComplete={handleRecordingComplete}
            isProcessing={isProcessing}
            analysisResults={analysisResults}
            recordingMethod={recordingMethod}
          />

          {/* Confirmation Modal */}
          <Modal
            visible={showConfirmModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowConfirmModal(false)}
          >
            <View className="flex-1 justify-end bg-black/40">
              <View
                className="rounded-t-3xl px-6 pt-6 pb-10"
                style={{
                  backgroundColor: colors.card,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 20,
                }}
              >
                {/* Drag Handle */}
                <View className="w-10 h-1.5 bg-gray-400/50 rounded-full self-center mb-4" />

                {/* Modal Content */}
                <View className="items-center mb-6">
                  <View
                    className="rounded-full p-4 mb-4"
                    style={{
                      backgroundColor:
                        theme === "dark" ? colors.surface : "#dcfce7",
                    }}
                  >
                    <CheckCircle size={36} color={colors.success} />
                  </View>

                  <Text
                    className="text-xl font-bold mb-2 text-center"
                    style={{ color: colors.text }}
                  >
                    Ready to Submit?
                  </Text>
                  <Text
                    className="text-center text-base leading-6"
                    style={{ color: colors.textSecondary }}
                  >
                    Your speech will be sent for AI analysis. This usually takes{" "}
                    <Text style={{ fontWeight: "600", color: colors.text }}>
                      30–60 seconds.
                    </Text>
                  </Text>
                </View>

                {/* Buttons */}
                <View className="space-y-3">
                  <TouchableOpacity
                    className="rounded-2xl py-4 px-6 flex-row justify-center items-center"
                    style={{ backgroundColor: colors.success }}
                    onPress={confirmSubmission}
                  >
                    <Text className="text-white font-bold text-lg">
                      Yes, Analyze My Speech
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="rounded-2xl py-4 px-6 flex-row justify-center items-center"
                    style={{
                      backgroundColor:
                        theme === "dark" ? colors.surface : "#f0f9ff",
                    }}
                    onPress={() => {
                      setShowConfirmModal(false);
                      navigation.navigate("speaker-mode");
                    }}
                  >
                    <Mic size={20} color={colors.primary} />
                    <Text
                      className="ml-2 font-bold text-lg"
                      style={{ color: colors.primary }}
                    >
                      Record Another Speech
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );

  const renderResultsView = () => (
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
            onPress={() => setCurrentStep("record")}
            className="rounded-full p-2"
            style={{ backgroundColor: colors.surface }}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Speaker Mode
          </Text>
          <View className="w-10" />
        </View>
        {renderProgressIndicator()}
      </View>

      <ScrollView className="flex-1">
        <View className="p-6">
          <Text
            className="text-2xl font-bold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Analysis Complete
          </Text>
          <Text
            className="text-center mb-8 text-base"
            style={{ color: colors.textSecondary }}
          >
            Here's your comprehensive speech analysis
          </Text>

          {/* Overall Score */}
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
            <View className="items-center mb-6">
              <View
                className="rounded-full w-24 h-24 items-center justify-center mb-4"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#dcfce7",
                }}
              >
                <Text
                  className="text-4xl font-bold"
                  style={{ color: colors.success }}
                >
                  {analysisResults.overallScore}
                </Text>
              </View>
              <Text
                className="text-2xl font-bold mb-2"
                style={{ color: colors.text }}
              >
                Excellent Performance!
              </Text>
              <View className="flex-row items-center">
                <TrendingUp size={16} color={colors.success} />
                <Text
                  className="font-bold ml-1"
                  style={{ color: colors.success }}
                >
                  {analysisResults.improvement} from last speech
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
                  {analysisResults.duration}
                </Text>
              </View>
              <View className="items-center">
                <Mic size={20} color={colors.textSecondary} />
                <Text
                  className="text-sm mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  Words
                </Text>
                <Text className="font-bold" style={{ color: colors.text }}>
                  {analysisResults.wordCount}
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
                  {analysisResults.avgPause}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Metrics */}
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
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: colors.text }}
            >
              Performance Breakdown
            </Text>
            <View className="space-y-4">
              {[
                {
                  label: "Clarity",
                  value: analysisResults.clarity,
                  color: "#10b981",
                },
                {
                  label: "Confidence",
                  value: analysisResults.confidence,
                  color: "#3b82f6",
                },
                {
                  label: "Engagement",
                  value: analysisResults.engagement,
                  color: "#8b5cf6",
                },
                {
                  label: "Pace",
                  value: analysisResults.pace,
                  color: "#f59e0b",
                },
              ].map((metric, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between"
                >
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
                    <Text
                      className="font-bold w-8"
                      style={{ color: colors.text }}
                    >
                      {metric.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Key Insights */}
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
                    style={{
                      backgroundColor:
                        theme === "dark" ? colors.surface : "#fef3c7",
                    }}
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

          {/* Quick Feedback */}
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
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: colors.text }}
            >
              Major Feedback
            </Text>

            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <CheckCircle size={20} color={colors.success} />
                <Text
                  className="font-bold ml-2"
                  style={{ color: colors.success }}
                >
                  Strengths
                </Text>
              </View>
              <View className="space-y-2">
                {feedback.strengths.slice(0, 2).map((strength, index) => (
                  <Text
                    key={index}
                    className="text-sm ml-7"
                    style={{ color: colors.textSecondary }}
                  >
                    • {strength}
                  </Text>
                ))}
              </View>
            </View>

            <View>
              <View className="flex-row items-center mb-2">
                <AlertCircle size={20} color={colors.warning} />
                <Text
                  className="font-bold ml-2"
                  style={{ color: colors.warning }}
                >
                  Areas to Improve
                </Text>
              </View>
              <View className="space-y-2">
                {feedback.improvements.slice(0, 2).map((improvement, index) => (
                  <Text
                    key={index}
                    className="text-sm ml-7"
                    style={{ color: colors.textSecondary }}
                  >
                    • {improvement}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3 mb-8">
            <TouchableOpacity
              onPress={onViewDetailedFeedback}
              className="rounded-2xl py-4 px-6"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold text-lg text-center">
                View Detailed Analysis
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentStep("record")}
              className="border-2 rounded-2xl py-4 px-6"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <Text
                className="font-bold text-lg text-center"
                style={{ color: colors.primary }}
              >
                Record Another Speech
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {currentStep === "speechType" && renderSpeechTypeSelection()}
      {currentStep === "speechDetails" && renderSpeechDetails()}
      {currentStep === "recordingMethod" && renderRecordingMethodSelection()}
      {currentStep === "record" && renderRecordingView()}
      {currentStep === "results" && renderResultsView()}
    </SafeAreaView>
  );
}
