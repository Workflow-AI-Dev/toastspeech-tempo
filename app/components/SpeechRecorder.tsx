import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Alert } from "react-native";
import {
  Mic,
  Pause,
  Square,
  Loader,
  CheckCircle,
  Zap,
  Target,
  Award,
  TrendingUp,
  Video,
  Upload,
  FileText,
} from "lucide-react-native";

import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { Camera, CameraView } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

interface SpeechRecorderProps {
  onRecordingComplete?: (recordingData: any) => void;
  isProcessing?: boolean;
  analysisResults?: {
    pace: number;
    fillerWords: number;
    emotionalDelivery: number;
    overallScore: number;
  };
  recordingMethod?: "audio" | "video" | "upload" | null;
}

const SpeechRecorder = ({
  onRecordingComplete = () => {},
  isProcessing = false,
  analysisResults = {
    pace: 85,
    fillerWords: 12,
    emotionalDelivery: 78,
    overallScore: 82,
  },
  recordingMethod = "audio",
}: SpeechRecorderProps) => {
  const [recordingState, setRecordingState] = useState<
    "idle" | "recording" | "paused" | "completed" | "uploading"
  >("idle");
  const [timer, setTimer] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(30).fill(5));
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Animation value for audio visualization
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request audio permission
      const audioStatus = await Audio.requestPermissionsAsync();
      setHasAudioPermission(audioStatus.status === "granted");

      // Request camera permission if video recording is needed
      if (recordingMethod === "video") {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus.status === "granted");

        // Request media library permission for saving videos
        await MediaLibrary.requestPermissionsAsync();
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert(
        "Permission Error",
        "Unable to access camera/microphone. Please check your permissions in Settings.",
        [{ text: "OK" }],
      );
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (recordingState === "recording") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);

        // Simulate audio levels
        setAudioLevels((prev) => {
          const newLevels = [...prev];
          newLevels.shift();
          newLevels.push(Math.floor(Math.random() * 50) + 5);
          return newLevels;
        });
      }, 1000);

      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState, pulseAnim]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Check permissions first
      if (!hasAudioPermission) {
        Alert.alert(
          "Permission Required",
          "Microphone access is required for recording. Please enable it in Settings.",
          [{ text: "OK" }],
        );
        return;
      }

      if (recordingMethod === "video" && !hasCameraPermission) {
        Alert.alert(
          "Permission Required",
          "Camera access is required for video recording. Please enable it in Settings.",
          [{ text: "OK" }],
        );
        return;
      }

      if (recordingMethod === "audio") {
        // Start audio recording
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        setRecording(newRecording);
      } else if (recordingMethod === "video") {
        // Video recording will be handled by CameraView component
        // The actual recording start will be triggered by the camera component
      }

      setRecordingState("recording");
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert(
        "Recording Error",
        "Unable to start recording. Please try again.",
        [{ text: "OK" }],
      );
    }
  };

  const handlePauseRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (recordingState === "recording") {
        if (recording && recordingMethod === "audio") {
          await recording.pauseAsync();
        }
        setRecordingState("paused");
      } else if (recordingState === "paused") {
        if (recording && recordingMethod === "audio") {
          await recording.startAsync();
        }
        setRecordingState("recording");
      }
    } catch (error) {
      console.error("Error pausing/resuming recording:", error);
    }
  };

  const handleStopRecording = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      let recordingUri = null;

      if (recording && recordingMethod === "audio") {
        await recording.stopAndUnloadAsync();
        recordingUri = recording.getURI();
        setRecording(null);
      } else if (recordingMethod === "video" && cameraRef.current) {
        // Stop video recording
        const videoResult = await cameraRef.current.stopRecording();
        recordingUri = videoResult?.uri;
      }

      setRecordingState("completed");

      // Send recording data with actual file URI
      setTimeout(() => {
        onRecordingComplete({
          duration: timer,
          timestamp: new Date(),
          method: recordingMethod,
          recordingUri: recordingUri,
          fileSize: null, // Would need to calculate actual file size
        });
      }, 1000);
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert(
        "Recording Error",
        "Unable to stop recording. Please try again.",
        [{ text: "OK" }],
      );
    }
  };

  const handleFileUpload = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "audio/mpeg",
          "audio/wav",
          "audio/m4a",
          "audio/mp4",
          "video/mp4",
          "video/mov",
          "video/avi",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        setRecordingState("uploading");

        // Simulate processing time
        setTimeout(() => {
          setRecordingState("completed");
          setTimeout(() => {
            onRecordingComplete({
              duration: 180, // This would be calculated from actual file
              timestamp: new Date(),
              method: "upload",
              fileName: file.name,
              fileUri: file.uri,
              fileSize: file.size,
              mimeType: file.mimeType,
            });
          }, 1000);
        }, 2000);
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert(
        "File Selection Error",
        "Unable to select file. Please try again.",
        [{ text: "OK" }],
      );
    }
  };

  const resetRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }
      setRecordingState("idle");
      setTimer(0);
      setAudioLevels(Array(30).fill(5));
    } catch (error) {
      console.error("Error resetting recording:", error);
    }
  };

  const getRecordingIcon = () => {
    switch (recordingMethod) {
      case "video":
        return <Video size={40} color="white" />;
      case "upload":
        return <Upload size={40} color="white" />;
      default:
        return <Mic size={40} color="white" />;
    }
  };

  const getRecordingTitle = () => {
    switch (recordingMethod) {
      case "video":
        return "Video + Audio Recording";
      case "upload":
        return "Upload Recording";
      default:
        return "Audio Recording";
    }
  };

  const getRecordingDescription = () => {
    switch (recordingMethod) {
      case "video":
        return "Tap to start recording with camera and microphone";
      case "upload":
        return "Tap to select a file from your device\nSupported: MP3, WAV, M4A, MP4, MOV, AVI";
      default:
        return "Tap the mic to start recording";
    }
  };

  return (
    <View className="bg-gradient-to-b from-purple-50 to-indigo-50 w-full h-[500px] rounded-2xl overflow-hidden">
      {/* Header */}
      <View className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 items-center">
        <View className="flex-row items-center">
          {recordingMethod === "video" ? (
            <Video size={24} color="white" />
          ) : recordingMethod === "upload" ? (
            <Upload size={24} color="white" />
          ) : (
            <Zap size={24} color="white" />
          )}
          <Text className="text-white text-xl font-bold ml-2">
            {getRecordingTitle()}
          </Text>
        </View>
        {recordingState !== "idle" && (
          <View className="flex-row items-center mt-2">
            <Text className="text-white text-2xl font-bold">
              {formatTime(timer)}
            </Text>
            <View className="bg-white/20 rounded-full px-2 py-1 ml-3">
              <Text className="text-white text-sm font-semibold">LIVE</Text>
            </View>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center p-6">
        {recordingState === "idle" && (
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
              Ready?
            </Text>
            <Text className="text-gray-600 mb-8 text-center">
              {getRecordingDescription()}
            </Text>

            <TouchableOpacity
              onPress={
                recordingMethod === "upload"
                  ? handleFileUpload
                  : handleStartRecording
              }
              className="bg-gradient-to-r from-red-500 to-pink-500 w-24 h-24 rounded-full items-center justify-center shadow-lg"
            >
              {getRecordingIcon()}
            </TouchableOpacity>
          </View>
        )}

        {(recordingState === "recording" || recordingState === "paused") && (
          <View className="w-full items-center">
            {/* Video preview for video recording */}
            {recordingMethod === "video" && hasCameraPermission ? (
              <View className="h-48 w-full rounded-2xl overflow-hidden mb-8">
                <CameraView
                  ref={cameraRef}
                  style={{ flex: 1 }}
                  facing="front"
                  mode="video"
                  videoQuality="720p"
                  onCameraReady={() => {
                    if (recordingState === "recording" && cameraRef.current) {
                      cameraRef.current.recordAsync();
                    }
                  }}
                />
              </View>
            ) : (
              /* Audio visualization */
              <View className="h-32 w-full flex-row items-end justify-center mb-8 bg-white/30 rounded-2xl p-4">
                {audioLevels.map((level, index) => (
                  <Animated.View
                    key={index}
                    style={{
                      height: recordingState === "recording" ? level : 5,
                      opacity: recordingState === "paused" ? 0.5 : 1,
                      backgroundColor: "#a855f7",
                      width: 8,
                      marginHorizontal: 1,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      transform:
                        recordingState === "recording"
                          ? [{ scaleY: pulseAnim }]
                          : [{ scaleY: 1 }],
                    }}
                  />
                ))}
              </View>
            )}

            {/* Recording controls */}
            <View className="flex-row justify-center items-center space-x-8">
              <TouchableOpacity
                onPress={handlePauseRecording}
                className="bg-white w-16 h-16 rounded-full items-center justify-center shadow-lg"
              >
                {recordingState === "recording" ? (
                  <Pause size={28} color="#7c3aed" />
                ) : (
                  <Mic size={28} color="#7c3aed" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStopRecording}
                className="bg-gradient-to-r from-red-500 to-pink-500 w-20 h-20 rounded-full items-center justify-center shadow-lg"
              >
                <Square size={32} color="white" />
              </TouchableOpacity>
            </View>

            <View className="mt-8 bg-white/50 rounded-2xl p-4 items-center">
              <Text className="text-lg font-bold text-gray-800">
                {recordingState === "recording"
                  ? recordingMethod === "video"
                    ? "🎥 Recording Video..."
                    : "🔴 Recording Audio..."
                  : "⏸️ Paused"}
              </Text>
              <Text className="text-gray-600 text-center mt-1">
                {recordingState === "recording"
                  ? recordingMethod === "video"
                    ? "Look at the camera and speak clearly!"
                    : "Speak clearly and confidently!"
                  : "Tap mic to resume recording"}
              </Text>
            </View>
          </View>
        )}

        {(isProcessing || recordingState === "uploading") && (
          <View className="items-center">
            <Animated.View
              style={{
                backgroundColor: "white",
                borderRadius: 50,
                padding: 24,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                transform: [
                  {
                    rotate: pulseAnim.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              }}
            >
              {recordingState === "uploading" ? (
                <Upload size={60} color="#7c3aed" />
              ) : (
                <Loader size={60} color="#7c3aed" />
              )}
            </Animated.View>
            <Text className="text-xl font-bold text-gray-800 mb-2">
              {recordingState === "uploading"
                ? "Processing File..."
                : "AI is Analyzing..."}
            </Text>
            <Text className="text-gray-600 text-center">
              {recordingState === "uploading"
                ? selectedFile
                  ? `Processing ${selectedFile.name}...`
                  : "Processing your uploaded file for analysis."
                : "Hang tight! We're processing your speech to give you personalized feedback."}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SpeechRecorder;
