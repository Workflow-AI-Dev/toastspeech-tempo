import React, { useState, useEffect } from "react";
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
  Target,
  CheckCircle,
  Upload,
  FileText,
  ChevronRight,
  Loader
} from "lucide-react-native";
import SpeechRecorder from "../components/SpeechRecorderSpeaker";
import QuickFeedback from "../components/QuickFeedback";
import ProgressIndicator from "../components/ProgressIndicator";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { BASE_URL } from "../api";
import * as FileSystem from "expo-file-system";

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
  const [recordingData, setRecordingData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [feedback, setFeedback] = useState({
    strengths: [],
    improvements: [],
    keyInsights: [],
  });
  const [detailedFeedback, setDetailedFeedback] = useState(null);
  const router = useRouter();
  const [plan, setPlan] = useState<string | null>(null);
  const [limits, setLimits] = useState(null);
  const [partialReceived, setPartialReceived] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const plan = await AsyncStorage.getItem("plan");
        setPlan(plan);
      } catch (error) {
        console.error("Error fetching subscription plan", error);
      }
    };
    fetchPlan();
  }, []);

  useEffect(() => {
    (async () => {
      const savedLimits = await AsyncStorage.getItem("limits");
      if (savedLimits) {
        setLimits(JSON.parse(savedLimits));
      }
    })();
  }, []);

  const isAudioLocked = limits?.remaining_audio_speeches === 0;
  const isVideoLocked =
    limits?.remaining_video_speeches === 0 || plan === "casual";
  const isUploadLocked = limits?.total_remaining_speeches === 0;

  const handleRecordingComplete = (data) => {
    setRecordingData(data); // Save recording file info
    console.log`File data:${data}`;
    setShowConfirmModal(true);
  };

  const getTaskType = (method: string, fileName: string): string => {
    if (method === "audio") return "audio_evaluation";
    if (method === "video") return "video_evaluation";

    // If uploaded, check file extension
    const ext = fileName.split(".").pop()?.toLowerCase();
    const videoExtensions = ["mp4", "mov", "avi", "mkv"];
    const audioExtensions = ["mp3", "m4a", "wav", "aac", "ogg"];

    if (ext && videoExtensions.includes(ext)) return "video_evaluation";
    if (ext && audioExtensions.includes(ext)) return "audio_evaluation";

    // Fallback (just in case)
    return "audio_evaluation";
  };

  const uploadFileToBackend = async ({
    fileUri,
    fileName,
    mimeType,
    taskType,
    modeType,
    speechType,
    token,
  }) => {
    try {
      if (Platform.OS === "web") {
        const formData = new FormData();
        const res = await fetch(fileUri);
        const blob = await res.blob();
        const file = new File([blob], fileName, { type: mimeType });
        formData.append("file", file);
        formData.append("task_type", taskType);
        formData.append("mode_type", modeType);
        formData.append("speech_type", speechType);
        formData.append("speech_details", JSON.stringify(speechDetails));

        const response = await fetch(`${BASE_URL}/speech/process_file`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return await pollForResults(data.task_id, token);
      } else {
        // Mobile upload using expo-file-system
        const result = await FileSystem.uploadAsync(
          `${BASE_URL}/speech/process_file`,
          fileUri,
          {
            headers: { Authorization: `Bearer ${token}` },
            httpMethod: "POST",
            fieldName: "file",
            mimeType,
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            parameters: {
              task_type: taskType,
              mode_type: modeType,
              speech_type: speechType,
              speech_details: JSON.stringify(speechDetails),
            },
          },
        );

        if (result.status < 200 || result.status >= 300) {
          throw new Error(`Upload failed with status ${result.status}`);
        }

        const data = JSON.parse(result.body);
        return await pollForResults(data.task_id, token);
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      throw err;
    }
  };

  const pollForResults = (taskId, token, onPartial) => {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `${BASE_URL}/speech/status/${taskId}`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          const statusData = await statusResponse.json();

          // ✅ Handle partials
          if (statusResponse.status === 206 && statusData.partial) {
            console.log("📡 Partial update:", statusData.partial);
            if (onPartial) onPartial(statusData.partial);
          }

          // ✅ Handle final
          if (statusData.success) {
            clearInterval(pollInterval);
            console.log("✅ Final result:", statusData);
            resolve(statusData);
          }
        } catch (err) {
          clearInterval(pollInterval);
          reject(err);
        }
      }, 5000);
    });
  };

  const mapResults = (data) => {
    const finalData = data.result ?? data;

    return {
      analysisResults: {
        overallScore: finalData.summary?.Metadata?.overall_score ?? 0,
        pace: finalData.analytics?.speaker_analysis?.[0]?.words_per_minute || 0,
        fillerWords: 0,
        emotionalDelivery: 0,
        clarity: 0,
        confidence: 0,
        engagement: 0,
        improvement: "N/A",
        duration: (() => {
          const totalSpeakingSeconds =
            finalData.analytics?.speaker_analysis?.[0]
              ?.total_speaking_time_seconds || 0;
          const minutes = Math.floor(totalSpeakingSeconds / 60);
          const seconds = Math.floor(totalSpeakingSeconds % 60);
          return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
        })(),
        avgPause: finalData.analytics?.speaker_analysis?.[0]?.pause_frequency || 0,
        pausesData: finalData.analytics?.pauses || [],
        fillerData: finalData.analytics?.filler_words || [],
        crutchData: finalData.analytics?.crutch_phrases || [],
        repeatedPhrases: finalData.analytics?.repeated_words || [],
        grammarData: finalData.analytics?.grammar_mistakes || [],
        environData: finalData.analytics?.environmental_elements || [],
        pitchData: finalData.pitch_track || [],
      },
      feedback: {
        strengths: finalData.summary?.Commendations ?? [],
        improvements: finalData.summary?.Recommendations ?? [],
        keyInsights: finalData.summary?.KeyInsights ?? [],
      },
      detailedFeedback: {
        ...finalData.detailed,
        url: finalData.url,
      },
    };
  };


  const confirmSubmission = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);

    try {
      const token = await AsyncStorage.getItem("auth_token");

      const taskType = getTaskType(
        recordingData?.method || recordingMethod,
        recordingData?.fileName || "recording.mp4",
      );

      const result = await uploadFileToBackend({
        fileUri: recordingData.recordingUri,
        fileName: recordingData.fileName || "recording.mp4",
        mimeType: recordingData.mimeType || "application/octet-stream",
        taskType: taskType,
        modeType: "speaker",
        speechType: speechType || "custom",
        token,
        onPartial: (partial) => {
        console.log("📡 Received partial update:", partial);
        setPartialReceived(true);
        
        const { analysisResults, feedback, detailedFeedback } = mapResults(partial);
        
        // Update state with partial results
        setAnalysisResults((prev) => ({ ...prev, ...analysisResults }));
        setFeedback((prev) => ({ ...prev, ...feedback }));
        setDetailedFeedback((prev) => ({ ...prev, ...detailedFeedback }));
        
        // IMPORTANT: Immediately switch to results view when first partial arrives
        setCurrentStep("results");
        setIsProcessing(false); // Stop showing the processing loader
      },


      });

      const { analysisResults, feedback, detailedFeedback } = mapResults(result);
    setAnalysisResults(analysisResults);
    setFeedback(feedback);
    setDetailedFeedback(detailedFeedback);

    // Ensure we're on results step and not processing
    setIsProcessing(false);
    setCurrentStep("results")
    } catch (error) {
      console.error("Upload failed:", error);
      setIsProcessing(false);
    }
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
        <View className="flex-row items-center justify-between mb-4 mt-4">
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
        <ProgressIndicator
          steps={stepKeys}
          stepLabels={stepLabels}
          currentStep={currentStep}
          onStepPress={(step) => setCurrentStep(step as CurrentStep)}
          allowBackNavigation={true}
        />
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
        <View className="flex-row items-center justify-between mb-4 mt-4">
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
        <ProgressIndicator
          steps={stepKeys}
          stepLabels={stepLabels}
          currentStep={currentStep}
          onStepPress={(step) => setCurrentStep(step as CurrentStep)}
          allowBackNavigation={true}
        />
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
                  Tap to upload PDF
                </Text>
                <Text
                  className="text-sm mt-1 text-center"
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
            onPress={() => {
              setCurrentStep("recordingMethod");
              console.log(speechDetails);
            }}
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
        <View className="flex-row items-center justify-between mb-4 mt-4">
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
        <ProgressIndicator
          steps={stepKeys}
          stepLabels={stepLabels}
          currentStep={currentStep}
          onStepPress={(step) => setCurrentStep(step as CurrentStep)}
          allowBackNavigation={true}
        />
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
            disabled={isAudioLocked}
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
              opacity: isAudioLocked ? 0.4 : 1,
            }}
            onPress={
              isAudioLocked
                ? undefined
                : () => {
                    setRecordingMethod("audio");
                    setCurrentStep("record");
                  }
            }
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
                <View className="flex-1 flex-row items-center">
                  <Text
                    className="text-xl font-bold"
                    style={{ color: colors.text }}
                  >
                    Record Audio
                  </Text>
                  {isAudioLocked && (
                    <View className="bg-gray-100 rounded-full px-2 py-1 ml-2">
                      <Text className="text-xs font-bold text-gray-600">
                        LOCKED
                      </Text>
                    </View>
                  )}
                </View>
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
            disabled={isVideoLocked}
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
              opacity: isVideoLocked ? 0.4 : 1,
            }}
            onPress={
              isVideoLocked
                ? undefined
                : () => {
                    setRecordingMethod("video");
                    setCurrentStep("record");
                  }
            }
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
                <View className="flex-row items-center">
                  <Text
                    className="text-xl font-bold"
                    style={{ color: colors.text }}
                  >
                    Record Video
                  </Text>

                  {isVideoLocked && (
                    <View className="bg-gray-100 rounded-full px-2 py-1 ml-2">
                      <Text className="text-xs font-bold text-gray-600">
                        LOCKED
                      </Text>
                    </View>
                  )}
                </View>

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
            disabled={isUploadLocked}
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
              opacity: isUploadLocked ? 0.4 : 1,
            }}
            onPress={
              isUploadLocked
                ? undefined
                : () => {
                    setRecordingMethod("upload");
                    setCurrentStep("record");
                  }
            }
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
                {isUploadLocked && (
                  <View className="bg-gray-100 rounded-full px-2 py-1 ml-2">
                    <Text className="text-xs font-bold text-gray-600">
                      LOCKED
                    </Text>
                  </View>
                )}
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
        <View className="flex-row items-center justify-between mb-4 mt-4">
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
        <ProgressIndicator
          steps={stepKeys}
          stepLabels={stepLabels}
          currentStep={currentStep}
          onStepPress={(step) => setCurrentStep(step as CurrentStep)}
          allowBackNavigation={true}
        />
      </View>

      <ScrollView className="flex-1">
        <View className="p-6">
          <SpeechRecorder
            onRecordingComplete={handleRecordingComplete}
            isProcessing={isProcessing}
            analysisResults={analysisResults}
            recordingMethod={recordingMethod}
            plan={plan}
            limits={limits}
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
        <View className="flex-row items-center justify-between mb-4 mt-4">
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
        <ProgressIndicator
          steps={stepKeys}
          stepLabels={stepLabels}
          currentStep={currentStep}
          onStepPress={(step) => setCurrentStep(step as CurrentStep)}
          allowBackNavigation={true}
        />
      </View>

      <ScrollView className="flex-1">
        <Text
        className="text-2xl font-bold mb-2 text-center mt-2"
        style={{ color: colors.text }}
      >
        {isProcessing && partialReceived ? "Analysis in Progress..." : "Analysis Complete"}
      </Text>
      <Text
        className="text-center mb-8 text-base"
        style={{ color: colors.textSecondary }}
      >
        {isProcessing && partialReceived 
          ? "Here are your initial results - more details coming soon!"
          : "Here's your comprehensive speech analysis"
        }
      </Text>

      {isProcessing && partialReceived && (
        <View className="mx-6 mb-4 p-3 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center">
            <Loader size={16} color={colors.primary} />
            <Text className="ml-2 text-sm" style={{ color: colors.textSecondary }}>
              Analyzing remaining speech data...
            </Text>
          </View>
        </View>
      )}
        
        <QuickFeedback
          analysisResults={analysisResults}
          feedback={feedback}
          detailedFeedback={detailedFeedback}
          onViewDetailedFeedback={() => {
            router.push({
              pathname: "/detailed-feedback",
              params: {
                feedback: JSON.stringify(detailedFeedback),
              },
            });
          }}
          onRecordAnother={() => setCurrentStep("record")}
        />
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
    {(partialReceived || currentStep === "results") && renderResultsView()}
    </SafeAreaView>
  );
}
