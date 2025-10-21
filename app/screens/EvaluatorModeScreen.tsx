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
  Upload,
  Mic,
  Video,
  Send,
  Award,
  Target,
  FileText,
  ChevronRight,
  CheckCircle,
} from "lucide-react-native";
import SpeechRecorder from "../components/SpeechRecorder";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import QuickFeedbackEvaluations from "../components/QuickFeedbackEvaluations";
import ProgressIndicator from "../components/ProgressIndicator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";
import { Platform } from "react-native";
import { useRouter } from "expo-router";

interface EvaluatorModeScreenProps {
  onBack?: () => void;
  onViewDetailedFeedback?: () => void;
}

type SpeechType = "toastmasters" | "custom";

export default function EvaluatorModeScreen({
  onBack = () => {},
  onViewDetailedFeedback = () => {},
}: EvaluatorModeScreenProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [currentStep, setCurrentStep] = useState<
    | "speechType"
    | "speechDetails"
    | "speechInput"
    | "evaluationInput"
    | "feedback"
  >("speechType");
  const [speechType, setSpeechType] = useState<SpeechType | null>(null);
  const [speechDetails, setSpeechDetails] = useState({
    title: "",
    evaluatorName: "",
    duration: "",
    purpose: "",
    criteria: [] as string[],
  });
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [evaluationRecordMode, setEvaluationRecordMode] = useState<
    "audio" | "video" | "upload" | null
  >(null);
  const [showEvaluationRecorder, setShowEvaluationRecorder] = useState(false);
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [limits, setLimits] = useState(null);

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

  const router = useRouter();

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

  // Record step handlers
  const [recordMode, setRecordMode] = useState<"audio" | "video" | "upload">(
    "audio",
  );

  // Called after recording original speech in speechInput step
  const onSpeakerRecordComplete = (file: {
    uri: string;
    type: "audio" | "video";
  }) => {
    console.log("Speaker file recorded/uploaded:", file);
    setSpeakerFile(file);
    setCurrentStep("evaluationInput");
  };

  const onEvaluatorRecordComplete = (file: {
    uri: string;
    type: "audio" | "video";
  }) => {
    console.log("Evaluator file recorded/uploaded:", file);
    setEvaluatorFile(file);
    // handleSubmitEvaluation();
    setShowConfirmModal(true);
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

      // File extensions + MIME
      const speakerExt = speakerFile.fileType === "audio" ? "mp3" : "mp4";
      const evaluatorExt = evaluatorFile.fileType === "audio" ? "mp3" : "mp4";

      const speakerMime =
        speakerFile.fileType === "audio" ? "audio/mpeg" : "video/mp4";
      const evaluatorMime =
        evaluatorFile.fileType === "audio" ? "audio/mpeg" : "video/mp4";

      if (Platform.OS === "web") {
        // Web → convert blobs
        const speakerRes = await fetch(speakerFile.recordingUri);
        const speakerBlob = await speakerRes.blob();
        formData.append(
          "speaker_file",
          new File([speakerBlob], `speaker.${speakerExt}`, {
            type: speakerMime,
          }),
        );

        const evaluatorRes = await fetch(evaluatorFile.recordingUri);
        const evaluatorBlob = await evaluatorRes.blob();
        formData.append(
          "evaluator_file",
          new File([evaluatorBlob], `evaluator.${evaluatorExt}`, {
            type: evaluatorMime,
          }),
        );
      } else {
        // RN → URI-based
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

      // Add task metadata
      formData.append(
        "task_type_speaker",
        `${speakerFile.fileType}_evaluation`,
      );
      formData.append(
        "task_type_evaluator",
        `${evaluatorFile.fileType}_evaluation`,
      );
      formData.append("speech_type", speechType);
      formData.append("speech_details", JSON.stringify(speechDetails));

      setIsLoading(true);

      // 🔹 Step 1: Submit evaluation
      const response = await fetch(`${BASE_URL}/evaluator/process_evaluation`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok)
        throw new Error(`Upload failed with status ${response.status}`);
      const { task_id } = await response.json();

      // 🔹 Step 2: Poll until results are ready
      const data = await pollForResults(task_id, token);
      const finalData = data.result ?? data;

      // 🔹 Step 3: Map results as before
      const mappedResults = {
        overallScore:
          finalData.summary_evaluation?.Metadata?.overall_score ?? 0,
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
          const seconds = totalSpeakingSeconds % 60;
          return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        })(),
        avgPause:
          finalData.analytics?.speaker_analysis?.[0]?.pause_frequency || 0,
        pausesData: finalData.analytics?.pauses || [],
        fillerData: finalData.analytics?.filler_words || [],
        crutchData: finalData.analytics?.crutch_phrases || [],
        grammarData: finalData.analytics?.grammar_mistakes || [],
        environData: finalData.analytics?.environmental_elements || [],
        pitchData: finalData.pitch_track || [],
      };

      const mappedFeedback = {
        strengths: finalData.summary_evaluation?.Commendations ?? [],
        improvements: finalData.summary_evaluation?.Recommendations ?? [],
        keyInsights: finalData.summary_evaluation?.KeyInsights ?? [],
      };

      setAnalysisResults(mappedResults);
      setFeedback(mappedFeedback);
      setDetailedFeedback(finalData.detailed_evaluation);
      setCurrentStep("feedback");
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      alert("An error occurred during evaluation submission.");
    } finally {
      setIsLoading(false);
    }
  };

  const pollForResults = (taskId, token) => {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `${BASE_URL}/evaluator/status/${taskId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!statusResponse.ok) {
            const err = await statusResponse.text();
            clearInterval(pollInterval);
            reject(new Error(err || "Status check failed"));
          }

          const statusData = await statusResponse.json();
          console.log(`Polling for task ${taskId}:`, statusData.message);

          // Check if the task is completed
          if (statusData.success) {
            clearInterval(pollInterval); // Stop polling
            console.log("✅ Polling success:", statusData);
            resolve(statusData); // Return the final result
          }
        } catch (err) {
          clearInterval(pollInterval);
          reject(err);
        }
      }, 5000); // Poll every 5 seconds
    });
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
    step:
      | "speechType"
      | "speechDetails"
      | "speechInput"
      | "evaluationInput"
      | "feedback",
  ) => {
    const stepOrder = [
      "speechType",
      "speechDetails",
      "speechInput",
      "evaluationInput",
      "feedback",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(step);
    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
    }
  };

  const renderSpeechTypeSelection = () => (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
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
              setCurrentStep("speechInput");
              console.log(speechDetails);
            }}
            disabled={!speechDetails.title.trim()}
          >
            <Text className="text-white font-bold text-lg text-center">
              Continue to Speech Input
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // Move showRecorder state to component level to avoid conditional hook calls
  const [showRecorder, setShowRecorder] = useState(false);

  const renderSpeechInputStep = () => {
    if (showRecorder) {
      return (
        <View className="flex-1 px-6 py-4">
          <SpeechRecorder
            onRecordingComplete={onSpeakerRecordComplete}
            isProcessing={false}
            recordingMethod={recordMode}
            plan={plan}
          />

          <View className="flex-row space-x-3 mt-6">
            <TouchableOpacity
              onPress={() => setShowRecorder(false)}
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
    }

    return (
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <View className="p-6">
          <Text
            className="text-2xl font-bold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Choose Speech Input Method
          </Text>
          <Text
            className="text-center mb-8 text-base"
            style={{ color: colors.textSecondary }}
          >
            How would you like to provide the speech for evaluation?
          </Text>

          {/* Record Audio */}
          <TouchableOpacity
            onPress={() => {
              setRecordMode("audio");
              setShowRecorder(true);
            }}
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
                  Record Audio
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Capture real-time voice input
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
                • Quick feedback
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • On-the-go evaluations
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Voice-only analysis
              </Text>
            </View>
          </TouchableOpacity>

          {/* Record Video */}
          {/* <TouchableOpacity
            onPress={() => {
              setRecordMode("video");
              setShowRecorder(true);
            }}
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
                  Record Video
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Capture with camera and mic
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
                • Body language feedback
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Live evaluator training
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Visual context evaluation
              </Text>
            </View>
          </TouchableOpacity> */}

          {/* Upload Speech File */}
          <TouchableOpacity
            onPress={() => {
              setRecordMode("upload");
              setShowRecorder(true);
            }}
            className="rounded-3xl p-6 mt-6 shadow-lg"
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
                  Use an existing audio or video speech
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
                • Past speeches
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Offline evaluations
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Flexible reviewing
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderEvaluationInputStep = () => {
    if (showEvaluationRecorder && evaluationRecordMode) {
      return (
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
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#f0f9ff",
                }}
              >
                {evaluationRecordMode === "video" ? (
                  <Video size={24} color={colors.primary} />
                ) : evaluationRecordMode === "upload" ? (
                  <Upload size={24} color={colors.primary} />
                ) : (
                  <Mic size={24} color={colors.primary} />
                )}
              </View>
              <View className="flex-1">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Record Your Evaluation
                </Text>
                <Text className="mt-1" style={{ color: colors.textSecondary }}>
                  Provide your feedback on the speech
                </Text>
              </View>
            </View>

            <SpeechRecorder
              onRecordingComplete={onEvaluatorRecordComplete}
              isProcessing={isLoading}
              recordingMethod={evaluationRecordMode}
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
                      Your evaluation will be sent for AI analysis. This usually
                      takes{" "}
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
                      onPress={handleSubmitEvaluation}
                    >
                      <Text className="text-white font-bold text-lg">
                        Yes, Analyze My Evaluation
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
                        setCurrentStep("evaluationInput");
                      }}
                    >
                      <Mic size={20} color={colors.primary} />
                      <Text
                        className="ml-2 font-bold text-lg"
                        style={{ color: colors.primary }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <View className="flex-row space-x-3 mt-6">
              <TouchableOpacity
                onPress={() => {
                  setShowEvaluationRecorder(false);
                  setEvaluationRecordMode(null);
                }}
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
        </View>
      );
    }

    return (
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <View className="p-6">
          <Text
            className="text-2xl font-bold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Share Your Evaluation
          </Text>
          <Text
            className="text-center mb-8 text-base"
            style={{ color: colors.textSecondary }}
          >
            Choose how you'd like to deliver your feedback
          </Text>

          {/* Record Audio Evaluation */}
          <TouchableOpacity
            onPress={() => {
              setEvaluationRecordMode("audio");
              setShowEvaluationRecorder(true);
            }}
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
                  Record Audio
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Voice-only evaluation in real-time
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
                • Quick verbal feedback
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • On-the-go sessions
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Lightweight uploads
              </Text>
            </View>
          </TouchableOpacity>

          {/* Record Video Evaluation */}
          {/* <TouchableOpacity
            onPress={() => {
              setEvaluationRecordMode("video");
              setShowEvaluationRecorder(true);
            }}
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
                  Record Video
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Record with camera and mic
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
                • Expressive visual feedback
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Engaging delivery tips
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Full-body language cues
              </Text>
            </View>
          </TouchableOpacity> */}

          {/* Upload Evaluation */}
          <TouchableOpacity
            onPress={() => {
              setEvaluationRecordMode("upload");
              setShowEvaluationRecorder(true);
            }}
            className="rounded-3xl p-6 mt-6 shadow-lg"
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
                  Upload Evaluation
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Submit an existing audio or video file
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
                • Pre-recorded feedback
              </Text>
              <Text
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                • Offline evaluations
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Studio-quality inputs
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
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
      case "speechType":
        return renderSpeechTypeSelection();
      case "speechDetails":
        return renderSpeechDetails();
      case "speechInput":
        return renderSpeechInputStep();
      case "evaluationInput":
        return renderEvaluationInputStep();
      case "feedback":
        return renderCompleteStep();
      default:
        return renderSpeechInputStep();
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
              if (showEvaluationRecorder && currentStep === "evaluationInput") {
                setShowEvaluationRecorder(false);
                setEvaluationRecordMode(null);
                return;
              }

              const stepOrder = [
                "speechType",
                "speechDetails",
                "speechInput",
                "evaluationInput",
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
          steps={[
            "speechType",
            "speechDetails",
            "speechInput",
            "evaluationInput",
            "feedback",
          ]}
          stepLabels={[
            "Speech Type",
            "Speech Details",
            "Speech Input",
            "Evaluation",
            "Feedback",
          ]}
          currentStep={currentStep}
          onStepPress={(step) =>
            handleStepNavigation(
              step as
                | "speechType"
                | "speechDetails"
                | "speechInput"
                | "evaluationInput"
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
