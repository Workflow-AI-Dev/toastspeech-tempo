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
  Upload,
  Mic,
  Play,
  Pause,
  Square,
  Send,
  Clock,
  User,
  CheckCircle,
  FileAudio,
  Volume2,
  Edit3,
  MessageSquare,
  Video,
} from "lucide-react-native";
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
    "upload" | "record" | "evaluate" | "feedback"
  >("upload");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [evaluationSummary, setEvaluationSummary] = useState("");
  const [isRecordingEvaluation, setIsRecordingEvaluation] = useState(false);
  const [evaluationRecordingTime, setEvaluationRecordingTime] = useState(0);
  const [transcribedText, setTranscribedText] = useState("");
  const [recordMode, setRecordMode] = useState<"audio" | "video">("audio");
  const [evaluationRecordMode, setEvaluationRecordMode] = useState<
    "upload" | "audio" | "video"
  >("audio");

  const speakerInfo = {
    name: "Sarah Johnson",
    speechTitle: "The Future of Sustainable Technology",
    speechType: "Informative Speech",
    duration: "6:45",
    objectives: [
      "Explain three key sustainable technologies",
      "Demonstrate environmental impact",
      "Inspire audience action",
    ],
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // Start timer
    const timer = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    // Store timer reference to clear later
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setCurrentStep("evaluate");
  };

  const handleStartEvaluationRecording = () => {
    setIsRecordingEvaluation(true);
    setEvaluationRecordingTime(0);
    // Simulate transcription after recording
    setTimeout(() => {
      setTranscribedText(
        "This is a well-structured speech with clear objectives. The speaker demonstrated good knowledge of sustainable technology and effectively engaged the audience. Areas for improvement include speaking pace and gesture usage.",
      );
    }, 3000);
  };

  const handleStopEvaluationRecording = () => {
    setIsRecordingEvaluation(false);
  };

  const handleFileUpload = () => {
    // Simulate file upload
    setUploadedFile("sustainable_tech_speech.mp3");
    setCurrentStep("evaluate");
  };

  const handleSubmitEvaluation = () => {
    // Navigate to evaluator summary screen
    // In a real app, you would use navigation here
    // For now, we'll simulate navigation by setting state
    console.log(
      "Navigate to evaluator summary with transcribed text:",
      transcribedText,
    );
    setCurrentStep("feedback");
  };

  const handleStepNavigation = (
    step: "upload" | "record" | "evaluate" | "feedback",
  ) => {
    // Only allow navigation to previous steps or current step
    const stepOrder = ["upload", "record", "evaluate", "feedback"];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(step);

    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
    }
  };

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
            <User size={24} color={colors.primary} />
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
            onPress={handleFileUpload}
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

      {uploadedFile && (
        <View
          className="rounded-2xl p-4 mb-6"
          style={{
            backgroundColor: theme === "dark" ? colors.surface : "#f0fdf4",
            borderColor: colors.success,
            borderWidth: 1,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <CheckCircle size={20} color={colors.success} />
              <Text
                className="font-semibold ml-2"
                style={{ color: colors.text }}
              >
                {uploadedFile}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setCurrentStep("evaluate")}
              className="rounded-xl px-4 py-2"
              style={{ backgroundColor: colors.success }}
            >
              <Text className="text-white font-bold">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderRecordStep = () => (
    <View className="flex-1 px-6 py-4">
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
        {/* Title Row with Icon */}
        <View className="flex-row items-center mb-6">
          <View
            className="rounded-full p-3 mr-4"
            style={{
              backgroundColor:
                theme === "dark"
                  ? colors.surface
                  : recordMode === "video"
                    ? "#fef3c7"
                    : "#fef2f2",
            }}
          >
            {recordMode === "video" ? (
              <Video size={24} color={colors.warning} />
            ) : (
              <Mic size={24} color={colors.error} />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              {recordMode === "video"
                ? "Record Speech (Video)"
                : "Record Speech"}
            </Text>
            <Text className="mt-1" style={{ color: colors.textSecondary }}>
              {recordMode === "video"
                ? "Camera will be used for this recording"
                : "Audio-only recording"}
            </Text>
          </View>
        </View>

        {/* Recording Area */}
        <View className="items-center py-12">
          {isRecording && (
            <View className="mb-6">
              <Text
                className="text-4xl font-bold text-center"
                style={{
                  color: recordMode === "video" ? colors.warning : colors.error,
                }}
              >
                {formatTime(recordingTime)}
              </Text>
              <Text
                className="text-center mt-2"
                style={{ color: colors.textSecondary }}
              >
                Recording in progress...
              </Text>
            </View>
          )}

          {/* Record Button */}
          <TouchableOpacity
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            className="w-24 h-24 rounded-full items-center justify-center shadow-lg"
            style={{
              backgroundColor:
                recordMode === "video" ? colors.warning : colors.error,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {isRecording ? (
              <Square size={32} color="white" fill="white" />
            ) : recordMode === "video" ? (
              <Video size={32} color="white" />
            ) : (
              <Mic size={32} color="white" />
            )}
          </TouchableOpacity>

          <Text
            className="text-center mt-4 max-w-xs"
            style={{ color: colors.textSecondary }}
          >
            {isRecording
              ? "Tap the square to stop recording"
              : recordMode === "video"
                ? "Tap the camera icon to start recording"
                : "Tap the mic icon to start recording"}
          </Text>
        </View>

        {/* Completed Recording Summary */}
        {!isRecording && recordingTime > 0 && (
          <View
            className="rounded-2xl p-4 mt-6"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#f0fdf4",
              borderColor: colors.success,
              borderWidth: 1,
            }}
          >
            <Text
              className="font-semibold text-center"
              style={{ color: colors.text }}
            >
              Recording completed: {formatTime(recordingTime)}
            </Text>
          </View>
        )}
      </View>

      {/* Navigation Buttons */}
      <View className="flex-row space-x-3">
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

        {recordingTime > 0 && !isRecording && (
          <TouchableOpacity
            onPress={() => setCurrentStep("evaluate")}
            className="flex-1 rounded-2xl py-4 px-6"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-bold text-lg text-center">
              Continue
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEvaluateStep = () => (
    <ScrollView className="flex-1 px-6 py-4">
      {/* Evaluation Recording Options */}
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
            <Mic size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Record Your Evaluation
            </Text>
            <Text className="mt-1" style={{ color: colors.textSecondary }}>
              Choose how to provide your feedback
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <TouchableOpacity
            onPress={() => {
              setEvaluationRecordMode("upload");
              // Simulate file upload for evaluation
              setTimeout(() => {
                setTranscribedText(
                  "This is a well-structured speech with clear objectives. The speaker demonstrated good knowledge of sustainable technology and effectively engaged the audience. Areas for improvement include speaking pace and gesture usage.",
                );
              }, 1000);
            }}
            className="rounded-2xl p-6"
            style={{
              backgroundColor:
                evaluationRecordMode === "upload"
                  ? theme === "dark"
                    ? colors.surface
                    : "#f0f9ff"
                  : colors.surface,
              borderColor:
                evaluationRecordMode === "upload"
                  ? colors.primary
                  : colors.border,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Upload size={24} color={colors.primary} />
              <Text
                className="font-bold text-lg ml-3"
                style={{ color: colors.text }}
              >
                Upload Evaluation Recording
              </Text>
            </View>
            <Text className="mb-2" style={{ color: colors.textSecondary }}>
              Upload a pre-recorded evaluation
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Supported: MP3, WAV, M4A, MP4
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEvaluationRecordMode("audio");
              handleStartEvaluationRecording();
            }}
            className="rounded-2xl p-6"
            style={{
              backgroundColor:
                evaluationRecordMode === "audio"
                  ? theme === "dark"
                    ? colors.surface
                    : "#fef2f2"
                  : colors.surface,
              borderColor:
                evaluationRecordMode === "audio" ? colors.error : colors.border,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Mic size={24} color={colors.error} />
              <Text
                className="font-bold text-lg ml-3"
                style={{ color: colors.text }}
              >
                Record Audio Evaluation
              </Text>
            </View>
            <Text className="mb-2" style={{ color: colors.textSecondary }}>
              Record your evaluation feedback with audio only
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Perfect for detailed verbal feedback
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEvaluationRecordMode("video");
              handleStartEvaluationRecording();
            }}
            className="rounded-2xl p-6"
            style={{
              backgroundColor:
                evaluationRecordMode === "video"
                  ? theme === "dark"
                    ? colors.surface
                    : "#fff7ed"
                  : colors.surface,
              borderColor:
                evaluationRecordMode === "video"
                  ? colors.warning
                  : colors.border,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Video size={24} color={colors.warning} />
              <Text
                className="font-bold text-lg ml-3"
                style={{ color: colors.text }}
              >
                Record Video + Audio Evaluation
              </Text>
            </View>
            <Text className="mb-2" style={{ color: colors.textSecondary }}>
              Record your evaluation with both video and audio
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Include visual feedback and demonstrations
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recording Interface */}
      {(evaluationRecordMode === "audio" ||
        evaluationRecordMode === "video") && (
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
          <View className="items-center py-8">
            {isRecordingEvaluation && (
              <View className="mb-6">
                <Text
                  className="text-3xl font-bold text-center"
                  style={{
                    color:
                      evaluationRecordMode === "video"
                        ? colors.warning
                        : colors.error,
                  }}
                >
                  {formatTime(evaluationRecordingTime)}
                </Text>
                <Text
                  className="text-center mt-2"
                  style={{ color: colors.textSecondary }}
                >
                  Recording {evaluationRecordMode} evaluation...
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={
                isRecordingEvaluation
                  ? handleStopEvaluationRecording
                  : handleStartEvaluationRecording
              }
              className="w-20 h-20 rounded-full items-center justify-center shadow-lg"
              style={{
                backgroundColor: isRecordingEvaluation
                  ? colors.error
                  : evaluationRecordMode === "video"
                    ? colors.warning
                    : colors.error,
                shadowColor: theme === "dark" ? "#000" : "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: theme === "dark" ? 0.3 : 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              {isRecordingEvaluation ? (
                <Square size={28} color="white" fill="white" />
              ) : evaluationRecordMode === "video" ? (
                <Video size={28} color="white" />
              ) : (
                <Mic size={28} color="white" />
              )}
            </TouchableOpacity>

            <Text
              className="text-center mt-4 max-w-xs"
              style={{ color: colors.textSecondary }}
            >
              {isRecordingEvaluation
                ? `Recording your ${evaluationRecordMode} evaluation feedback`
                : `Tap to start recording your ${evaluationRecordMode} evaluation`}
            </Text>
          </View>
        </View>
      )}

      {/* Continue Button */}
      {transcribedText && (
        <View className="flex-row space-x-3 mb-8">
          <TouchableOpacity
            onPress={() =>
              setCurrentStep(
                currentStep === "evaluate" && uploadedFile
                  ? "upload"
                  : "record",
              )
            }
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
            style={{ backgroundColor: colors.success }}
          >
            <View className="flex-row items-center justify-center">
              <Send size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Submit</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "upload":
        return renderUploadStep();
      case "record":
        return renderRecordStep();
      case "evaluate":
        return renderEvaluateStep();
      case "feedback":
        return renderCompleteStep();
      default:
        return renderUploadStep();
    }
  };

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
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={onBack}
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

        {/* Progress Indicator */}
        <ProgressIndicator
          steps={["upload", "record", "evaluate", "feedback"]}
          stepLabels={["Setup", "Record", "Evaluate", "Feedback"]}
          currentStep={currentStep}
          onStepPress={(step) =>
            handleStepNavigation(
              step as "upload" | "record" | "evaluate" | "feedback",
            )
          }
          allowBackNavigation={true}
        />
      </View>

      {renderCurrentStep()}
    </SafeAreaView>
  );
}
