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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config/api";
import { Platform } from "react-native";
import { useRouter } from "expo-router";

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
  const [evaluationRecordMode, setEvaluationRecordMode] = useState<
    "audio" | "video"
  >("audio");
  const [speakerFile, setSpeakerFile] = useState<{
    uri: string;
    type: "audio" | "video";
  } | null>(null);
  const [evaluatorFile, setEvaluatorFile] = useState<{
    uri: string;
    type: "audio" | "video";
  } | null>(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [feedback, setFeedback] = useState({
    strengths: [],
    improvements: [],
    keyInsights: [],
  });
  const [detailedFeedback, setDetailedFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Upload step handlers
  const handleFileUpload = () => {
    setCurrentStep("record"); // Changed to go to selectMode next
  };

  // Record step handlers
  const [recordMode, setRecordMode] = useState<"audio" | "video" | "upload">(
    "audio",
  );

  // Called after recording original speech in record step
  const onSpeakerRecordComplete = (file: {
    uri: string;
    type: "audio" | "video";
  }) => {
    console.log("Speaker file recorded/uploaded:", file);
    setSpeakerFile(file);
    setCurrentStep("selectMode");
  };

  const onEvaluatorRecordComplete = (file: {
    uri: string;
    type: "audio" | "video";
  }) => {
    console.log("Evaluator file recorded/uploaded:", file);
    setEvaluatorFile(file);
  };

  // Evaluation submit
  const handleSubmitEvaluation = async () => {
    if (!speakerFile || !evaluatorFile) {
      alert("Both speaker and evaluator files must be recorded or uploaded.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("auth_token");
      const formData = new FormData();

      // Prepare file extensions and MIME types
      const speakerExt = speakerFile.fileType === "audio" ? "mp3" : "mp4";
      const evaluatorExt = evaluatorFile.fileType === "audio" ? "mp3" : "mp4";

      const speakerMime =
        speakerFile.fileType === "audio" ? "audio/mpeg" : "video/mp4";
      const evaluatorMime =
        evaluatorFile.fileType === "audio" ? "audio/mpeg" : "video/mp4";

      if (Platform.OS === "web") {
        // Fetch blobs from URIs for browser
        const speakerRes = await fetch(speakerFile.recordingUri);
        const speakerBlob = await speakerRes.blob();
        const speakerWebFile = new File(
          [speakerBlob],
          `speaker.${speakerExt}`,
          {
            type: speakerMime,
          },
        );
        formData.append("speaker_file", speakerWebFile);

        const evaluatorRes = await fetch(evaluatorFile.recordingUri);
        const evaluatorBlob = await evaluatorRes.blob();
        const evaluatorWebFile = new File(
          [evaluatorBlob],
          `evaluator.${evaluatorExt}`,
          {
            type: evaluatorMime,
          },
        );
        formData.append("evaluator_file", evaluatorWebFile);
      } else {
        // React Native: use uri-based file object
        formData.append("speaker_file", {
          uri: speakerFile.recordingUri,
          name: `speaker.${speakerExt}`,
          type: speakerMime,
        } as any);

        formData.append("evaluator_file", {
          uri: evaluatorFile.recordingUri,
          name: `evaluator.${evaluatorExt}`,
          type: evaluatorMime,
        } as any);
      }

      // Add task types
      formData.append(
        "task_type_speaker",
        `${speakerFile.fileType}_evaluation`,
      );
      formData.append(
        "task_type_evaluator",
        `${evaluatorFile.fileType}_evaluation`,
      );

      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      setIsLoading(true);

      const response = await fetch(`${BASE_URL}/evaluator/process_evaluation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend error:", data);
        alert("Failed to process evaluation.");
        return;
      }

      console.log("Evaluation Results:", data);

      const mappedResults = {
        overallScore: data.summary.Metadata?.overall_score ?? 0,
        pace: data.summary.Metadata?.words_per_minute ?? 0,
        fillerWords: 0, // Gemini may not return this yet
        emotionalDelivery: 0,
        clarity: 0,
        confidence: 0,
        engagement: 0,
        improvement: "N/A", // Or calculate based on history
        duration: data.summary.Metadata?.duration ?? "00:00",
        avgPause: `${data.summary.Metadata?.average_pause_duration ?? 0}s`,
      };

      const mappedFeedback = {
        strengths: data.summary.Commendations ?? [],
        improvements: data.summary.Recommendations ?? [],
        keyInsights: data.summary.KeyInsights ?? [],
      };

      const detailedFeedback = data.detailed;

      setAnalysisResults(mappedResults);
      setFeedback(mappedFeedback);
      setDetailedFeedback(detailedFeedback);
      setIsLoading(false);
      setCurrentStep("feedback");
    } catch (err) {
      setIsLoading(false);
      console.error("Error submitting evaluation:", err);
      alert("An error occurred during evaluation submission.");
    }
  };

  const renderLoadingScreen = () => (
    <View className="flex-1 justify-center items-center px-6">
      <Text style={{ color: colors.text, fontSize: 20, marginBottom: 12 }}>
        Processing Evaluation...
      </Text>
      <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
        Hang tight! We're analyzing your evaluation and the original speech.
      </Text>
    </View>
  );

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
        onRecordingComplete={onSpeakerRecordComplete}
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
          onRecordingComplete={onEvaluatorRecordComplete}
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
          evaluationResults={analysisResults}
          feedback={feedback}
          detailedFeedback={detailedFeedback}
          onViewDetailedFeedback={() => {
            router.push({
              pathname: "/detailed-feedback-eval",
              params: {
                feedback: JSON.stringify(detailedFeedback),
              },
            });
          }}
          onRecordAnother={() => {
            setCurrentStep("evaluate");
          }}
        />
      </ScrollView>
    );
  };

  const renderCurrentStep = () => {
    if (isLoading) {
      return renderLoadingScreen();
    }

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
