import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { ArrowLeft, Upload, Mic, Video, Send } from "lucide-react-native";
import SpeechRecorder from "../components/SpeechRecorder";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import QuickFeedbackEvaluations from "../components/QuickFeedbackEvaluations";
import ProgressIndicator from "../components/ProgressIndicator";

interface EvaluatorModeScreenProps {
  onBack?: () => void;
  onViewDetailedFeedback?: () => void;
}

export default function EvaluatorModeScreen({
  onBack = () => {},
  onViewDetailedFeedback = () => {},
}: EvaluatorModeScreenProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "record" | "selectMode" | "evaluate" | "feedback"
  >("upload");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [evaluationRecordMode, setEvaluationRecordMode] = useState<
    "audio" | "video"
  >("audio");

  // Upload step handlers
  const handleFileUpload = () => {
    setCurrentStep("record"); // Changed to go to selectMode next
  };

  // Record step handlers
  const [recordMode, setRecordMode] = useState<"audio" | "video" | "upload">(
    "audio",
  );

  // Called after recording original speech in record step
  const onRecordComplete = () => {
    setCurrentStep("selectMode"); // Changed to go to selectMode next
  };

  // Evaluation submit
  const handleSubmitEvaluation = () => {
    setCurrentStep("feedback");
  };

  // Navigation between steps (only backwards allowed except normal flow)
  const handleStepNavigation = (
    step: "upload" | "record" | "selectMode" | "evaluate" | "feedback",
  ) => {
    const stepOrder = [
      "upload",
      "record",
      "selectMode",
      "evaluate",
      "feedback",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(step);
    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
    }
  };

  // Render upload step (unchanged except next step)
  const renderUploadStep = () => (
    <ScrollView className="flex-1 px-6 py-4">
      <View
        className="p-6 mb-6"
        style={{
          backgroundColor: colors.card,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center mb-6">
          <View
            className="rounded-full p-3 mr-4"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
            }}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Ready to Evaluate
            </Text>
            <Text className="mt-1" style={{ color: colors.textSecondary }}>
              Choose how to access the speech
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <TouchableOpacity
            onPress={() => {
              setRecordMode("upload");
              setCurrentStep("record");
            }}
            className="rounded-2xl p-6"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
              borderColor: colors.primary,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Upload size={24} color={colors.primary} />
              <Text
                className="font-bold text-lg ml-3"
                style={{ color: colors.text }}
              >
                Upload Speech File
              </Text>
            </View>
            <Text className="mb-2" style={{ color: colors.textSecondary }}>
              Upload an existing audio or video recording
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Supported: MP3, WAV, M4A, MP4
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRecordMode("audio");
              setCurrentStep("record");
            }}
            className="rounded-2xl p-6"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#fef2f2",
              borderColor: colors.error,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Mic size={24} color={colors.error} />
              <Text
                className="font-bold text-lg ml-3"
                style={{ color: colors.text }}
              >
                Record New Speech (Audio only)
              </Text>
            </View>
            <Text className="mb-2" style={{ color: colors.textSecondary }}>
              Record a speech in real-time for evaluation
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Perfect for live sessions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRecordMode("video");
              setCurrentStep("record");
            }}
            className="rounded-2xl p-6"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#fff7ed",
              borderColor: colors.warning,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Video size={24} color={colors.warning} />
              <Text
                className="font-bold text-lg ml-3"
                style={{ color: colors.text }}
              >
                Record New Speech (Video + Audio)
              </Text>
            </View>
            <Text className="mb-2" style={{ color: colors.textSecondary }}>
              Record a speech in real-time for evaluation
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Perfect for live sessions
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // Record step UI
  const renderRecordStep = () => (
    <View className="flex-1 px-6 py-4">
      <SpeechRecorder
        onRecordingComplete={onRecordComplete}
        isProcessing={false}
        recordingMethod={recordMode}
      />

      <View className="flex-row space-x-3 mt-6">
        <TouchableOpacity
          onPress={() => setCurrentStep("upload")}
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
      </View>
    </View>
  );

  const renderSelectModeStep = () => (
    <ScrollView className="flex-1 px-6 py-4">
      <View
        className="p-6 mb-6"
        style={{
          backgroundColor: colors.card,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center mb-6">
          <View
            className="rounded-full p-3 mr-4"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
            }}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Let's Evaluate
            </Text>
            <Text className="mt-1" style={{ color: colors.textSecondary }}>
              Choose a method to share your evaluation
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <TouchableOpacity
            onPress={() => {
              setRecordMode("upload");
              setEvaluationRecordMode("upload");
              setCurrentStep("evaluate");
            }}
            className="rounded-2xl p-6"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
              borderColor: colors.primary,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Upload size={24} color={colors.primary} />
              <Text
                className="font-bold text-lg ml-3"
                style={{ color: colors.text }}
              >
                Upload Speech File
              </Text>
            </View>
            <Text className="mb-2" style={{ color: colors.textSecondary }}>
              Already recorded your evaluation?
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Upload your feedback as an audio or video file.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRecordMode("audio");
              setEvaluationRecordMode("audio");
              setCurrentStep("evaluate");
            }}
            className="rounded-2xl p-6"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#fef2f2",
              borderColor: colors.error,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Mic size={24} color={colors.error} />
              <Text
                className="font-bold text-lg ml-3"
                style={{ color: colors.text }}
              >
                Record New Speech (Audio only)
              </Text>
            </View>
            <Text className="mb-2" style={{ color: colors.textSecondary }}>
              Prefer to speak freely?
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Record just your voice for a quick evaluation session.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRecordMode("video");
              setEvaluationRecordMode("video");
              setCurrentStep("evaluate");
            }}
            className="rounded-2xl p-6"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#fff7ed",
              borderColor: colors.warning,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Video size={24} color={colors.warning} />
              <Text
                className="font-bold text-lg ml-3"
                style={{ color: colors.text }}
              >
                Record New Speech (Video + Audio)
              </Text>
            </View>
            <Text className="mb-2" style={{ color: colors.textSecondary }}>
              Want to go full screen with expression?
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Record both audio and video for a rich, expressive evaluation.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // Evaluate step UI with mode passed down
  const renderEvaluateStep = () => (
    <View className="flex-1 px-6 py-4">
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
              backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
            }}
          >
            <Mic size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Record Your Evaluation
            </Text>
            <Text className="mt-1" style={{ color: colors.textSecondary }}>
              Provide your feedback on the speech
            </Text>
          </View>
        </View>

        <SpeechRecorder
          onRecordingComplete={() => {
            setTimeout(() => {
              setTranscribedText(
                "This is a well-structured speech with clear objectives. The speaker demonstrated good knowledge of sustainable technology and effectively engaged the audience. Areas for improvement include speaking pace and gesture usage.",
              );
            }, 2000);
          }}
          isProcessing={false}
          recordingMethod={
            evaluationRecordMode === "video"
              ? "video"
              : evaluationRecordMode === "upload"
                ? "upload"
                : "audio"
          }
        />

        <View className="flex-row space-x-3 mt-6">
          <TouchableOpacity
            onPress={() => setCurrentStep("selectMode")}
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

          {transcribedText && (
            <TouchableOpacity
              onPress={handleSubmitEvaluation}
              className="flex-1 rounded-2xl py-4 px-6"
              style={{ backgroundColor: colors.success }}
            >
              <View className="flex-row items-center justify-center">
                <Send size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  Submit
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderCompleteStep = () => {
    return (
      <ScrollView className="flex-1 px-6 py-4">
        <Text
          className="text-2xl font-bold mb-2 text-center"
          style={{ color: colors.text }}
        >
          Evaluation Complete
        </Text>
        <Text
          className="text-center mb-8 text-base"
          style={{ color: colors.textSecondary }}
        >
          Here's your feedback on the evaluation you just delivered
        </Text>
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
          onViewDetailedFeedback={onViewDetailedFeedback}
          onRecordAnother={() => {
            setTranscribedText("");
            setCurrentStep("evaluate");
          }}
        />
      </ScrollView>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "upload":
        return renderUploadStep();
      case "record":
        return renderRecordStep();
      case "selectMode":
        return renderSelectModeStep();
      case "evaluate":
        return renderEvaluateStep();
      case "feedback":
        return renderCompleteStep();
      default:
        return renderUploadStep();
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
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
            onPress={() => {
              const stepOrder = [
                "upload",
                "record",
                "selectMode",
                "evaluate",
                "feedback",
              ];
              const currentIndex = stepOrder.indexOf(currentStep);
              if (currentIndex > 0) {
                const prevStep = stepOrder[currentIndex - 1];
                setCurrentStep(prevStep);
              } else {
                onBack(); // Go back to previous screen if on first step
              }
            }}
            className="rounded-full p-2"
            style={{ backgroundColor: colors.surface }}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Evaluator Mode
          </Text>
          <View className="w-10" />
        </View>

        <ProgressIndicator
          steps={["upload", "record", "selectMode", "evaluate", "feedback"]}
          stepLabels={["Setup", "Record", "Eval Mode", "Evaluate", "Feedback"]}
          currentStep={currentStep}
          onStepPress={(step) =>
            handleStepNavigation(
              step as
                | "upload"
                | "record"
                | "selectMode"
                | "evaluate"
                | "feedback",
            )
          }
          allowBackNavigation={true}
        />
      </View>

      {renderCurrentStep()}
    </SafeAreaView>
  );
}
