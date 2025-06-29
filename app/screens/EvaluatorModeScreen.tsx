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
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";

interface EvaluatorModeScreenProps {
  onBack?: () => void;
}

export default function EvaluatorModeScreen({
  onBack = () => {},
}: EvaluatorModeScreenProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "record" | "evaluate" | "complete"
  >("upload");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [evaluationSummary, setEvaluationSummary] = useState("");
  const [isRecordingEvaluation, setIsRecordingEvaluation] = useState(false);
  const [evaluationRecordingTime, setEvaluationRecordingTime] = useState(0);
  const [transcribedText, setTranscribedText] = useState("");

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
    setCurrentStep("complete");
  };

  const handleStepNavigation = (
    step: "upload" | "record" | "evaluate" | "complete",
  ) => {
    // Only allow navigation to previous steps or current step
    const stepOrder = ["upload", "record", "evaluate", "complete"];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(step);

    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
    }
  };

  const renderUploadStep = () => (
    <ScrollView className="flex-1 px-6 py-4">
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
            onPress={() => setCurrentStep("record")}
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
                Record New Speech
              </Text>
            </View>
            <Text className="mb-2" style={{ color: colors.textSecondary }}>
              Record a speech in real-time for evaluation
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Perfect for live practice sessions
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
        <View className="flex-row items-center mb-6">
          <View
            className="rounded-full p-3 mr-4"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#fef2f2",
            }}
          >
            <Mic size={24} color={colors.error} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Record Speech
            </Text>
            <Text className="mt-1" style={{ color: colors.textSecondary }}>
              Tap to start recording the speech
            </Text>
          </View>
        </View>

        <View className="items-center py-12">
          {isRecording && (
            <View className="mb-6">
              <Text
                className="text-4xl font-bold text-center"
                style={{ color: colors.error }}
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

          <TouchableOpacity
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            className="w-24 h-24 rounded-full items-center justify-center shadow-lg"
            style={{
              backgroundColor: isRecording ? colors.error : colors.error,
              shadowColor: theme === "dark" ? "#000" : "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: theme === "dark" ? 0.3 : 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {isRecording ? (
              <Square size={32} color="white" fill="white" />
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
              : "Tap the microphone to start recording"}
          </Text>
        </View>

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
      {/* Record Evaluation */}
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
              backgroundColor: theme === "dark" ? colors.surface : "#fef3c7",
            }}
          >
            <Mic size={24} color={colors.warning} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Record Your Evaluation
            </Text>
            <Text className="mt-1" style={{ color: colors.textSecondary }}>
              Provide verbal feedback for the speaker
            </Text>
          </View>
        </View>

        <View className="items-center py-8">
          {isRecordingEvaluation && (
            <View className="mb-6">
              <Text
                className="text-3xl font-bold text-center"
                style={{ color: colors.warning }}
              >
                {formatTime(evaluationRecordingTime)}
              </Text>
              <Text
                className="text-center mt-2"
                style={{ color: colors.textSecondary }}
              >
                Recording evaluation...
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
                : colors.warning,
              shadowColor: theme === "dark" ? "#000" : "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: theme === "dark" ? 0.3 : 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {isRecordingEvaluation ? (
              <Square size={28} color="white" fill="white" />
            ) : (
              <Mic size={28} color="white" />
            )}
          </TouchableOpacity>

          <Text
            className="text-center mt-4 max-w-xs"
            style={{ color: colors.textSecondary }}
          >
            {isRecordingEvaluation
              ? "Recording your evaluation feedback"
              : "Tap to start recording your evaluation"}
          </Text>
        </View>
      </View>

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
                backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
              }}
            >
              <MessageSquare size={24} color={colors.primary} />
            </View>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
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

        <Text className="text-sm mt-2" style={{ color: colors.textSecondary }}>
          This summary will be stored with the speaker's analysis
        </Text>
      </View>

      <View className="flex-row space-x-3 mb-8">
        <TouchableOpacity
          onPress={() =>
            setCurrentStep(
              currentStep === "evaluate" && uploadedFile ? "upload" : "record",
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
  );

  const renderCompleteStep = () => (
    <View className="flex-1 justify-center items-center px-6 py-8">
      <View
        className="rounded-3xl p-8 shadow-lg items-center max-w-sm w-full"
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
            backgroundColor: theme === "dark" ? colors.surface : "#f0fdf4",
          }}
        >
          <CheckCircle size={60} color={colors.success} />
        </View>

        <Text
          className="text-2xl font-bold mb-4 text-center"
          style={{ color: colors.text }}
        >
          Evaluation Submitted
        </Text>

        <Text
          className="text-center mb-6"
          style={{ color: colors.textSecondary }}
        >
          Your evaluation has been submitted to {speakerInfo.name}. Thank you
          for helping them improve their speaking skills!
        </Text>

        <View
          className="rounded-2xl p-4 mb-6 w-full"
          style={{
            backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
            borderColor: colors.primary,
            borderWidth: 1,
          }}
        >
          <Text
            className="font-semibold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Progress Earned
          </Text>
          <Text
            className="text-center text-sm"
            style={{ color: colors.textSecondary }}
          >
            +75 XP for comprehensive evaluation{"\n"}+25 XP for voice feedback
          </Text>
        </View>

        <View className="w-full space-y-3">
          <TouchableOpacity
            onPress={() => {
              setCurrentStep("upload");
              setUploadedFile(null);
              setTranscribedText("");
              setEvaluationSummary("");
              setRecordingTime(0);
              setEvaluationRecordingTime(0);
            }}
            className="rounded-2xl py-4 px-6 w-full"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-bold text-center">
              Evaluate Another Speech
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onBack}
            className="rounded-2xl py-4 px-6 w-full"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="font-bold text-center"
              style={{ color: colors.text }}
            >
              Return to Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "upload":
        return renderUploadStep();
      case "record":
        return renderRecordStep();
      case "evaluate":
        return renderEvaluateStep();
      case "complete":
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
        <View className="flex-row items-center justify-center">
          {["upload", "record", "evaluate", "complete"].map((step, index) => {
            const stepLabels = ["Setup", "Record", "Evaluate", "Complete"];
            const isActive = currentStep === step;
            const stepOrder = ["upload", "record", "evaluate", "complete"];
            const currentIndex = stepOrder.indexOf(currentStep);
            const isCompleted = currentIndex > index;
            const canNavigate = index <= currentIndex;

            return (
              <View key={step} className="flex-row items-center">
                <TouchableOpacity
                  onPress={() =>
                    canNavigate &&
                    handleStepNavigation(
                      step as "upload" | "record" | "evaluate" | "complete",
                    )
                  }
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isActive
                      ? colors.primary
                      : isCompleted
                        ? colors.success
                        : colors.surface,
                    borderColor: colors.border,
                    borderWidth: isActive || isCompleted ? 0 : 1,
                    opacity: canNavigate ? 1 : 0.5,
                  }}
                  disabled={!canNavigate}
                >
                  <Text
                    className="font-bold text-xs"
                    style={{
                      color:
                        isActive || isCompleted
                          ? "white"
                          : colors.textSecondary,
                    }}
                  >
                    {index + 1}
                  </Text>
                </TouchableOpacity>
                {index < 3 && (
                  <View
                    className="w-6 h-0.5 mx-1"
                    style={{
                      backgroundColor: isCompleted
                        ? colors.success
                        : colors.border,
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {renderCurrentStep()}
    </SafeAreaView>
  );
}
