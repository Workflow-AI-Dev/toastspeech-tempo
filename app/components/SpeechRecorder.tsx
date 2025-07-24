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
import { Platform } from "react-native";

import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { Camera as ExpoCamera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const cameraRef = useRef<Camera>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingRecordingData, setPendingRecordingData] = useState<any>(null);

  const BASE_URL = "http://127.0.0.1:8000";

  // Animation value for audio visualization
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (!showConfirmationModal) {
      setPendingRecordingData(null);
    }
  }, [showConfirmationModal]);

  const requestPermissions = async () => {
    try {
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      setHasAudioPermission(audioStatus === "granted");

      const { status: cameraStatus } =
        await ExpoCamera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus === "granted");

      await MediaLibrary.requestPermissionsAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error("Permission error:", error);
      Alert.alert("Permission Error", "Failed to get required permissions.");
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

  const getFileType = (
    uri: string,
    fileName?: string,
    mimeType?: string,
  ): "audio" | "video" | "unknown" => {
    // Use MIME type first if available:
    if (mimeType) {
      if (mimeType.startsWith("audio")) return "audio";
      if (mimeType.startsWith("video")) return "video";
    }
    // Fallback to extension check:
    const name = fileName || uri;
    const lower = name.toLowerCase();
    if (
      lower.endsWith(".mp4") ||
      lower.endsWith(".mov") ||
      lower.endsWith(".avi")
    )
      return "video";
    if (
      lower.endsWith(".mp3") ||
      lower.endsWith(".wav") ||
      lower.endsWith(".m4a")
    )
      return "audio";

    return "unknown";
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
        if (cameraRef.current) {
          setIsRecordingVideo(true);
          const videoRecording = await cameraRef.current.recordAsync({
            maxDuration: 180,
            quality: ExpoCamera.Constants.VideoQuality["480p"],
          });

          console.log("Video recorded:", videoRecording.uri);
          // Process this file
          setIsRecordingVideo(false);
        }
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
        } else if (
          recordingMethod === "video" &&
          cameraRef.current &&
          isRecordingVideo
        ) {
          // Vision Camera doesn't support pause/resume, so we stop and restart
          await cameraRef.current.stopRecording();
          setIsRecordingVideo(false);
        }
        setRecordingState("paused");
      } else if (recordingState === "paused") {
        if (recording && recordingMethod === "audio") {
          await recording.resumeAsync();
        } else if (recordingMethod === "video" && cameraRef.current && device) {
          // Restart video recording
          setIsRecordingVideo(true);
          cameraRef.current.startRecording({
            flash: "off",
            onRecordingFinished: (video) => {
              console.log("Video recorded:", video.path);
              setIsRecordingVideo(false);
            },
            onRecordingError: (error) => {
              console.error("Recording error:", error);
              setIsRecordingVideo(false);
            },
            videoCodec: "h264",
            videoBitRate: "low",
          });
        }
        setRecordingState("recording");
      }
    } catch (error) {
      console.error("Error pausing/resuming recording:", error);
    }
  };

  const handleStopRecording = async () => {
    let processedUri = null;
    let fileSize = 0;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      let recordingUri = null;

      if (recording && recordingMethod === "audio") {
        await recording.stopAndUnloadAsync();
        recordingUri = recording.getURI();
        setRecording(null);
      } else if (
        recordingMethod === "video" &&
        cameraRef.current &&
        isRecordingVideo
      ) {
        // Stop video recording with Vision Camera
        await cameraRef.current.stopRecording();
        setIsRecordingVideo(false);
        // The recordingUri will be set in the onRecordingFinished callback
        // For now, we'll use a placeholder and handle it in the processing
      }

      setRecordingState("uploading"); // Show processing state

      // Process and compress the file if needed
      if (recordingUri) {
        try {
          const fileType = getFileType(recordingUri);
          console.log("Recording stopped.");
          console.log("URI:", recordingUri);
          console.log("File type:", fileType);

          const { uri, size } = await processVideoFile(recordingUri);
          processedUri = uri;
          fileSize = size;

          setRecordingState("completed");
          const fallbackUri = processedUri || (selectedFile?.uri ?? null);

          // Send recording data with processed file URI
          setTimeout(() => {
            setPendingRecordingData({
              duration: timer,
              timestamp: new Date(),
              method: recordingMethod,
              recordingUri: fallbackUri,
              fileSize: fileSize,
              fileType: fileType,
            });
            setShowConfirmationModal(true);
          }, 1000);
        } catch (error) {
          console.error("Error processing recorded file:", error);
          setRecordingState("completed");

          const fallbackUri = processedUri || (selectedFile?.uri ?? null);

          // Fallback to original file
          setTimeout(() => {
            setPendingRecordingData({
              duration: timer,
              timestamp: new Date(),
              method: recordingMethod,
              recordingUri: fallbackUri,
              fileSize: fileSize,
            });
            setShowConfirmationModal(true);
          }, 1000);
        }
      } else {
        setRecordingState("completed");
        const fallbackUri = processedUri || (selectedFile?.uri ?? null);
        setTimeout(() => {
          setPendingRecordingData({
            duration: timer,
            timestamp: new Date(),
            method: recordingMethod,
            recordingUri: fallbackUri,
            fileSize: fileSize,
          });
          setShowConfirmationModal(true);
        }, 1000);
      }
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
    console.log("test");
    let processedUri = null;
    let fileSize = 0;
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

        const fileType = getFileType(file.uri, file.name, file.mimeType);
        console.log("File uploaded:");
        console.log("URI:", file.uri);
        console.log("File type:", fileType);

        try {
          // Always process and compress the uploaded file
          const processed = await processVideoFile(file.uri, file.name);
          processedUri = processed.uri;
          fileSize = processed.size;

          const fileSizeInMB = fileSize / (1024 * 1024);
          console.log(
            `Final processed file size: ${fileSizeInMB.toFixed(2)} MB`,
          );

          setRecordingState("completed");
          const fallbackUri = processedUri || selectedFile?.uri;

          if (!fallbackUri) {
            console.error("No valid URI found for uploaded file.");
            Alert.alert(
              "Upload Error",
              "Something went wrong with the selected file.",
            );
            return;
          }

          setTimeout(() => {
            setPendingRecordingData({
              duration: timer,
              timestamp: new Date(),
              method: recordingMethod,
              recordingUri: fallbackUri, // ✅ fallbackUri is guaranteed valid now
              fileSize: fileSize,
              fileType: fileType,
            });
            setShowConfirmationModal(true);
          }, 1000);
        } catch (error) {
          console.error("Error processing uploaded file:", error);

          // Use original file if processing fails
          setRecordingState("completed");
          const fallbackUri = processedUri || (selectedFile?.uri ?? null);

          setTimeout(() => {
            setPendingRecordingData({
              duration: timer,
              timestamp: new Date(),
              method: recordingMethod,
              recordingUri: fallbackUri,
              fileSize: fileSize,
            });
            setShowConfirmationModal(true);
          }, 1000);
        }
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

  // Function to process and compress files
  const processVideoFile = async (
    fileUri: string,
    fileName?: string,
  ): Promise<{ uri: string; size: number }> => {
    try {
      const isWeb = Platform.OS === "web";

      // Detect if it's a video file
      const isVideo = fileName
        ? fileName.toLowerCase().includes(".mp4") ||
          fileName.toLowerCase().includes(".mov") ||
          fileName.toLowerCase().includes(".avi")
        : fileUri.toLowerCase().includes(".mp4") ||
          fileUri.toLowerCase().includes(".mov") ||
          fileUri.toLowerCase().includes(".avi");

      if (!isVideo || isWeb) {
        // ✅ Skip compression and FileSystem if on web or audio file
        return {
          uri: fileUri,
          size: selectedFile?.size || 0, // fallback to file.size from picker
        };
      }

      // ✅ Native only — compress video
      const compressedUri = fileUri;
      const fileInfo = await FileSystem.getInfoAsync(compressedUri);

      return { uri: compressedUri, size: fileInfo.size || 0 };
    } catch (error) {
      console.error("Error processing video file:", error);
      return {
        uri: fileUri,
        size: selectedFile?.size || 0, // fallback again
      };
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
      setSelectedFile(null);
      setPendingRecordingData(null);
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
            {Platform.OS !== "web" &&
            recordingMethod === "video" &&
            hasCameraPermission &&
            device ? (
              <View className="h-48 w-full rounded-2xl overflow-hidden mb-8">
                <ExpoCamera
                  ref={cameraRef}
                  style={{ flex: 1 }}
                  type={ExpoCamera.Constants.Type.front}
                  ratio="16:9"
                  useCamera2Api={true}
                />
              </View>
            ) : recordingMethod === "video" && Platform.OS === "web" ? (
              <View className="h-32 w-full items-center justify-center bg-yellow-100 rounded-2xl p-4 mb-8">
                <Text className="text-yellow-800 text-center font-medium">
                  Video recording is not supported on the web.{"\n"}
                  Please use audio recording or upload a file instead.
                </Text>
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
                ? "Compressing & Processing..."
                : "AI is Analyzing..."}
            </Text>
            <Text className="text-gray-600 text-center">
              {recordingState === "uploading"
                ? selectedFile
                  ? `Optimizing ${selectedFile.name} for upload...`
                  : "Compressing video to reduce file size and processing for analysis."
                : "Hang tight! We're processing your speech to give you personalized feedback."}
            </Text>
          </View>
        )}

        {showConfirmationModal && (
          <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
            <View className="bg-white rounded-2xl p-6 w-11/12 shadow-xl">
              <Text className="text-lg font-bold text-gray-800 mb-2 text-center">
                Use This Recording?
              </Text>
              <Text className="text-gray-600 mb-6 text-center">
                Do you want to continue with this recording or upload?
              </Text>

              <View className="flex-row justify-between space-x-4">
                <TouchableOpacity
                  onPress={() => {
                    setShowConfirmationModal(false);
                    resetRecording();
                  }}
                  className="flex-1 bg-red-100 py-3 rounded-xl"
                >
                  <Text className="text-red-600 font-semibold text-center">
                    Record Again
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowConfirmationModal(false);
                    if (pendingRecordingData) {
                      onRecordingComplete(pendingRecordingData);
                    }
                    setPendingRecordingData(null);
                  }}
                  className="flex-1 bg-green-600 py-3 rounded-xl"
                >
                  <Text className="text-white font-semibold text-center">
                    Use This
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default SpeechRecorder;
