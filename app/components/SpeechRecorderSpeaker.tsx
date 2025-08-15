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
import { Video as VideoCompressor } from 'react-native-compressor'; 
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

interface SpeechRecorderSpeakerProps {
  onRecordingComplete?: (recordingData: any) => void;
  isProcessing?: boolean;
  analysisResults?: {
    pace: number;
    fillerWords: number;
    emotionalDelivery: number;
    overallScore: number;
  };
  recordingMethod?: "audio" | "video" | "upload" | null;
  plan: string;
  limits: {};
}

const SpeechRecorderSpeaker = ({
  onRecordingComplete = () => {},
  isProcessing = false,
  recordingMethod = "audio",
  plan,
  limits,
}: SpeechRecorderSpeakerProps) => {
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
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const expoCameraRef = useRef<ExpoCamera>(null);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const processingMessages = [
    "Processing file...",
    "Hang tight...",
    "AI is analyzing...",
    "Curating results for you...",
    "Almost done...",
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (isProcessing || recordingState === "uploading") {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % processingMessages.length);
      }, 2000); // switch message every 2s

      return () => clearInterval(interval);
    }
  }, [isProcessing, recordingState]);


  // Animation value for audio visualization
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      setHasAudioPermission(audioStatus === "granted");

      if (recordingMethod === "video") {
        const { status: cameraStatus } =
          await ExpoCamera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus === "granted");

        await MediaLibrary.requestPermissionsAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (err) {
      console.error("Permission error:", err);
      Alert.alert(
        "Permission Error",
        "Check camera/mic permissions in Settings.",
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
        const video = await expoCameraRef.current?.recordAsync({
          quality: ExpoCamera.Constants.VideoQuality["480p"],
          maxDuration: 300,
        });
        if (video?.uri) {
          setIsRecordingVideo(true);
          setRecordedVideoUri(video.uri);
        } else {
          Alert.alert("Recording Error", "Could not start video recording.");
          return;
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
        } else if (recordingMethod === "video" && isRecordingVideo) {
          // Vision Camera doesn't support pause/resume, so we stop and restart
          await expoCameraRef.current?.stopRecording();
          setIsRecordingVideo(false);
        }
        setRecordingState("paused");
      } else if (recordingState === "paused") {
        if (recording && recordingMethod === "audio") {
          await recording.startAsync();
        } else if (recordingMethod === "video") {
          // Restart video recording
          const video = await expoCameraRef.current?.recordAsync({
            quality: ExpoCamera.Constants.VideoQuality["480p"],
            maxDuration: 300,
          });
          setIsRecordingVideo(true);
          setRecordedVideoUri(video.uri);
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
      } else if (recordingMethod === "video" && isRecordingVideo) {
        await expoCameraRef.current?.stopRecording();
        setIsRecordingVideo(false);
        recordingUri = recordedVideoUri; // Use the URI captured when recording started
      }

      setRecordingState("uploading"); // Show processing state

      // Process and compress the file if needed
      if (recordingUri) {
        try {
          const { uri: processedUri, size: fileSize } =
            await processVideoFile(recordingUri);

          setRecordingState("completed");

          // Send recording data with processed file URI
          setTimeout(() => {
            onRecordingComplete({
              duration: timer,
              timestamp: new Date(),
              method: recordingMethod,
              recordingUri: processedUri,
              fileSize: fileSize,
            });
          }, 1000);
        } catch (error) {
          console.error("Error processing recorded file:", error);
          setRecordingState("completed");

          // Fallback to original file
          setTimeout(() => {
            onRecordingComplete({
              duration: timer,
              timestamp: new Date(),
              method: recordingMethod,
              recordingUri: processedUri,
              fileName: file.name,
              fileSize: processedSize,
              mimeType: file.mimeType,
            });
          }, 1000);
        }
      } else {
        setRecordingState("completed");
        setTimeout(() => {
          onRecordingComplete({
            duration: timer,
            timestamp: new Date(),
            method: recordingMethod,
            recordingUri: null,
            fileSize: null,
          });
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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Base sets for file types/extensions
      const audioTypes = ["audio/mpeg", "audio/wav", "audio/m4a", "audio/mp4"];
      const audioExts = ["mp3", "wav", "m4a"];

      const videoTypes = ["video/mp4", "video/mov", "video/avi"];
      const videoExts = ["mp4", "mov", "avi"];

      // Decide allowed types/extensions based on remaining limits
      let allowedTypes: string[] = [];
      let allowedExtensions: string[] = [];

      if (limits.remaining_audio_speeches > 0 || limits.remaining_audio_practice > 0) {
        allowedTypes = [...allowedTypes, ...audioTypes];
        allowedExtensions = [...allowedExtensions, ...audioExts];
      }

      if (limits.remaining_video_speeches > 0 || limits.remaining_video_practice > 0) {
        allowedTypes = [...allowedTypes, ...videoTypes];
        allowedExtensions = [...allowedExtensions, ...videoExts];
      }

      if (allowedTypes.length === 0) {
        Alert.alert(
          "No Uploads Remaining",
          "You don't have any remaining audio or video uploads available.",
          [{ text: "OK" }]
        );
        return;
      }
          
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true,
      });


      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

        if (!allowedTypes.includes(file.mimeType || "") && !allowedExtensions.includes(fileExtension)) {
          Alert.alert(
            "Unsupported File",
            `This file type is not supported.\nPlease upload a valid audio/video file.`,
            [{ text: "OK" }]
          );
          console.log('unsupported file')
          return;
        }

        setSelectedFile(file);
        setRecordingState("uploading");

        try {
          // Always process and compress the uploaded file
          const { uri: processedUri, size: processedSize } =
            await processVideoFile(file.uri, file.name);

          const fileSizeInMB = processedSize / (1024 * 1024);
          console.log(
            `Final processed file size: ${fileSizeInMB.toFixed(2)} MB`,
          );

          setRecordingState("completed");
          setTimeout(() => {
            onRecordingComplete({
              duration: timer,
              timestamp: new Date(),
              method: recordingMethod,
              recordingUri: processedUri,
              fileName: file.name,
              fileSize: processedSize,
              mimeType: file.mimeType,
            });
          }, 1000);
        } catch (error) {
          console.error("Error processing uploaded file:", error);

          // Use original file if processing fails
          setRecordingState("completed");
          setTimeout(() => {
            onRecordingComplete({
              duration: 180,
              timestamp: new Date(),
              method: "upload",
              fileName: file.name,
              fileUri: file.uri,
              fileSize: file.size,
              mimeType: file.mimeType,
            });
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

  // Video compression function using react-native-compressor
  const compressVideo = async (videoUri: string): Promise<string> => {
    console.log("Starting video compression...");
    const originalFileInfo = await FileSystem.getInfoAsync(videoUri);
    console.log(`Original video size: ${ (originalFileInfo.size / (1024 * 1024)).toFixed(2)} MB`);

    const outputUri = `${FileSystem.cacheDirectory}compressed_video_${Date.now()}.mp4`;

    try {
      const result = await VideoCompressor.compress(
        videoUri,
        {
          bitrate: 500, // Target bitrate in kbps
          maxSize: 720, // Max dimension (width or height)
          minimumFileSizeForCompress: 0, // Compress even small files
          // The next two options help control file size but aren't direct "max size" in MB
          // quality: 'low', // You can try 'low', 'medium', 'high'
          compressionMethod: 'auto', // 'auto', 'fast', 'manual'
        },
        (progress) => {
          console.log(`Compression progress: ${Math.round(progress * 100)}%`);
        }
      );

      const compressedFileInfo = await FileSystem.getInfoAsync(result);
      const compressedSizeMB = (compressedFileInfo.size / (1024 * 1024));

      console.log(`Compression successful!`);
      console.log(`Compressed video URI: ${result}`);
      console.log(`Compressed video size: ${compressedSizeMB.toFixed(2)} MB`);

      if (compressedSizeMB > 20) {
        console.warn(`Compressed file size (${compressedSizeMB.toFixed(2)} MB) is over 20MB.`);
        // You might want to handle this case, e.g., re-compress with stricter settings or alert the user.
        // For now, we'll proceed with the larger file.
      }

      return result;
    } catch (error) {
      console.error("Video compression failed:", error);
      throw new Error("Video compression failed");
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
      const isVideoFile = (mimeType?: string, name?: string) => {
        const videoMimeTypes = ["video/mp4", "video/mov", "video/avi"];
        const videoExtensions = ["mp4", "mov", "avi"];

        const hasVideoMime = mimeType ? videoMimeTypes.includes(mimeType.toLowerCase()) : false;
        const hasVideoExtension = name ? videoExtensions.includes(name.split(".").pop()?.toLowerCase() || "") : false;

        // Also ensure it's not specifically an audio MIME type
        const audioMimeTypes = ["audio/mpeg", "audio/wav", "audio/m4a", "audio/mp4"];
        const isAudioMime = mimeType ? audioMimeTypes.includes(mimeType.toLowerCase()) : false;

        return (hasVideoMime || hasVideoExtension) && !isAudioMime;
      };
      const isVideo = isVideoFile(selectedFile?.mimeType, fileName);

      if (!isVideo || isWeb) {
        // ✅ Skip compression and FileSystem if on web or audio file
        return {
          uri: fileUri,
          size: selectedFile?.size || 0, // fallback to file.size from picker
        };
      }

      // ✅ Native only — compress video
      const compressedUri = await compressVideo(fileUri);
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
        // Define supported formats based on limits
        let formats = [];
        
        if (limits.remaining_audio_speeches > 0) formats.push("MP3", "WAV");
        if (limits.remaining_video_speeches > 0) formats.push("MP4", "MOV", "AVI");
        if (plan !== "casual") formats.push("M4A"); // M4A is not allowed for casual users

        const uniqueFormats = [...new Set(formats)]; // remove duplicates just in case
        return `Tap to select a file from your device\nSupported: ${uniqueFormats.join(", ")}`;

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
            Platform.OS !== "web" ? (
              <View className="h-48 w-full rounded-2xl overflow-hidden mb-8">
                <ExpoCamera
                  ref={expoCameraRef}
                  style={{ flex: 1 }}
                  type={ExpoCamera.Constants.Type.front}
                  ratio="16:9"
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
              <Loader size={60} color="#7c3aed" />
            </Animated.View>

            <Text className="text-xl font-bold text-gray-800 mb-2">
              {processingMessages[messageIndex]}
            </Text>
            <Text className="text-gray-600 text-center">
              {recordingState === "uploading"
                ? selectedFile
                  ? `Optimizing ${selectedFile.name} for upload...`
                  : "Compressing video and preparing it for analysis."
                : "Analyzing speech patterns, emotional delivery, and pacing..."}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SpeechRecorderSpeaker;
