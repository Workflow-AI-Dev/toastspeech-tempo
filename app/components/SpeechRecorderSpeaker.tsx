import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Alert } from "react-native";
import { Mic, Pause, Square, Loader, Zap, Upload } from "lucide-react-native";
import { Video as VideoIcon } from "lucide-react-native";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { Video as VideoCompressor } from "react-native-compressor";
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

let CameraComponent: any;
let useCameraDevices: any;

if (Platform.OS !== "web") {
  const visionCamera = require("react-native-vision-camera");
  CameraComponent = visionCamera.Camera;
  useCameraDevices = visionCamera.useCameraDevices;
} else {
  CameraComponent = () => null;
  useCameraDevices = () => ({}); // returns empty object on web
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
  const cameraRef = useRef<any>(null);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const processingMessages = [
    "Processing file...",
    "Hang tight...",
    "AI is analyzing...",
    "Curating results for you...",
    "Almost done...",
  ];

  const [messageIndex, setMessageIndex] = useState(0);
  type CameraDirection = "front" | "back";
  const [cameraType, setCameraType] = useState<CameraDirection>("front");
  const devices = useCameraDevices();
  const device = devices ? devices[cameraType] : undefined;

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

  const toggleCamera = () => {
    setCameraType((prev) => (prev === "front" ? "back" : "front"));
  };

  const requestPermissions = async () => {
    try {
      // AUDIO PERMISSION
      const { status: audioStatus } = await Audio.getPermissionsAsync();
      let audioGranted = audioStatus === "granted";

      // VIDEO PERMISSION (only if video recording is selected and not web)
      let camGranted = false;
      if (recordingMethod === "video" && Platform.OS !== "web") {
        const camStatus = await CameraComponent.getCameraPermissionStatus();
        const micStatus = await CameraComponent.getMicrophonePermissionStatus();

        camGranted = camStatus === "authorized";
        const micGranted = micStatus === "authorized";

        // Request only if not authorized
        if (!camGranted) {
          const newCamStatus = await CameraComponent.requestCameraPermission();
          camGranted = newCamStatus === "authorized";
        }
        if (!micGranted) {
          const newMicStatus =
            await CameraComponent.requestMicrophonePermission();
          audioGranted = audioGranted || newMicStatus === "authorized";
        }

        setHasCameraPermission(camGranted);
      }

      setHasAudioPermission(audioGranted);

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log(`Permissions: Audio=${audioGranted}, Camera=${camGranted}`);
    } catch (err) {
      console.error("Permission error:", err);
      Alert.alert(
        "Permission Error",
        "Unable to get camera/mic permissions. Please check your settings.",
      );
    }
  };

  useEffect(() => {
    if (recordingState === "recording" && recordingMethod === "audio") {
      // Only animate for audio recordings
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);

        setAudioLevels((prev) => {
          const newLevels = [...prev];
          newLevels.shift();
          newLevels.push(Math.floor(Math.random() * 50) + 5);
          return newLevels;
        });
      }, 1000);

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

      return () => clearInterval(interval);
    } else {
      pulseAnim.setValue(1);
    }
  }, [recordingState, recordingMethod, pulseAnim]);

  const handleStartRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // START RECORDING
      if (recordingMethod === "audio") {
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        setRecording(newRecording);
        setRecordingState("recording");
      } else if (recordingMethod === "video" && cameraRef.current && device) {
        setIsRecordingVideo(true);
        setRecordingState("recording");

        await cameraRef.current.startRecording({
          flash: "off",
          onRecordingFinished: async (video) => {
            setRecordedVideoUri(video.path);
            setIsRecordingVideo(false);
            setRecordingState("uploading");

            const { uri: processedUri, size } = await processVideoFile(
              video.path,
            );

            setRecordingState("completed");
            onRecordingComplete({
              duration: timer,
              timestamp: new Date(),
              method: "video",
              recordingUri: processedUri,
              fileSize: size,
            });
          },
          onRecordingError: (error) => {
            console.error("Recording error:", error);
            Alert.alert("Recording Error", "Unable to record video.");
            setIsRecordingVideo(false);
            setRecordingState("idle");
          },
        });
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const handlePauseRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (recordingState === "recording") {
        if (recordingMethod === "audio" && recording) {
          await recording.pauseAsync();
          setRecordingState("paused");
        } else if (recordingMethod === "video") {
          Alert.alert("Pause Unavailable", "Video pause is not supported.");
        }
      } else if (recordingState === "paused") {
        if (recordingMethod === "audio" && recording) {
          await recording.startAsync();
          setRecordingState("recording");
        }
      }
    } catch (error) {
      console.error("Error pausing/resuming:", error);
    }
  };

  const handleStopRecording = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      let recordingUri: string | null = null;

      if (recording && recordingMethod === "audio") {
        await recording.stopAndUnloadAsync();
        recordingUri = recording.getURI();
        setRecording(null);
      } else if (
        recordingMethod === "video" &&
        isRecordingVideo &&
        cameraRef.current
      ) {
        await cameraRef.current.stopRecording(); // triggers onRecordingFinished
      }

      setRecordingState("uploading");

      if (recordingUri) {
        const { uri: processedUri, size: fileSize } =
          await processVideoFile(recordingUri);

        setRecordingState("completed");

        onRecordingComplete({
          duration: timer,
          timestamp: new Date(),
          method: recordingMethod,
          recordingUri: processedUri,
          fileSize,
        });
      } else {
        setRecordingState("completed");
        onRecordingComplete({
          duration: timer,
          timestamp: new Date(),
          method: recordingMethod,
          recordingUri: null,
          fileSize: null,
        });
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert("Recording Error", "Unable to stop recording.");
    }
  };

  // ✅ Ensure we always get a file path (handles content://)
  const ensureFilePath = async (uri: string): Promise<string> => {
    if (uri.startsWith("content://")) {
      console.log("⚠️ Got content:// URI, copying to cache...");
      const destPath = FileSystem.cacheDirectory + "upload_" + Date.now();
      await FileSystem.copyAsync({ from: uri, to: destPath });
      return destPath;
    }
    return uri;
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

      if (
        limits.remaining_audio_speeches > 0 ||
        limits.remaining_audio_practice > 0
      ) {
        allowedTypes = [...allowedTypes, ...audioTypes];
        allowedExtensions = [...allowedExtensions, ...audioExts];
      }

      if (
        limits.remaining_video_speeches > 0 ||
        limits.remaining_video_practice > 0
      ) {
        allowedTypes = [...allowedTypes, ...videoTypes];
        allowedExtensions = [...allowedExtensions, ...videoExts];
      }

      if (allowedTypes.length === 0) {
        Alert.alert(
          "No Uploads Remaining",
          "You don't have any remaining audio or video uploads available.",
          [{ text: "OK" }],
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

        if (
          !allowedTypes.includes(file.mimeType || "") &&
          !allowedExtensions.includes(fileExtension)
        ) {
          Alert.alert(
            "Unsupported File",
            `This file type is not supported.\nPlease upload a valid audio/video file.`,
            [{ text: "OK" }],
          );
          console.log("unsupported file");
          return;
        }

        setSelectedFile(file);
        setRecordingState("uploading");

        try {
          // Always process and compress the uploaded file
          const { uri: processedUri, size: processedSize } =
            await processVideoFile(file.uri, file.name, file.mimeType);

          console.log("✅ Processed file ready:", processedUri, processedSize);

          setRecordingState("completed");

          // Fire immediately instead of relying on timeout
          onRecordingComplete({
            duration: timer,
            timestamp: new Date(),
            method: recordingMethod,
            recordingUri: processedUri,
            fileName: file.name,
            fileSize: processedSize,
            mimeType: file.mimeType,
          });
        } catch (error) {
          console.error("❌ Processing failed, falling back:", error);

          setRecordingState("completed");

          onRecordingComplete({
            duration: 180,
            timestamp: new Date(),
            method: "upload",
            fileName: file.name,
            fileUri: file.uri,
            fileSize: file.size,
            mimeType: file.mimeType,
          });
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

  const compressVideo = async (videoUri: string): Promise<string> => {
    console.log("🚀 Starting one-pass video compression...");

    const safeUri = await ensureFilePath(videoUri);
    const fileInfo = await FileSystem.getInfoAsync(safeUri);
    const sizeMB = fileInfo.size / (1024 * 1024);

    if (sizeMB <= 5) {
      console.log("✅ Video already under 5 MB. Skipping compression.");
      return safeUri;
    }

    try {
      const result = await VideoCompressor.compress(
        safeUri,
        {
          compressionMethod: "manual",
          bitrate: 400, // kbps — tuned for small file size
          maxSize: 480, // resolution cap
        },
        (progress) => {
          console.log(`Compression progress: ${Math.round(progress * 100)}%`);
        },
      );

      const compressedUri = await ensureFilePath(result);
      const compressedInfo = await FileSystem.getInfoAsync(compressedUri);
      const finalMB = compressedInfo.size / (1024 * 1024);

      console.log(`🎯 Final compressed size: ${finalMB.toFixed(2)} MB`);

      if (finalMB > 5) {
        console.warn(
          "⚠️ Still above 5 MB — may need a second pass if strict limit is required.",
        );
      } else {
        console.log("✅ Successfully compressed under 5 MB in one pass!");
      }

      return compressedUri;
    } catch (err) {
      console.error("❌ Compression error:", err);
      return safeUri;
    }
  };

  // Main processor
  const processVideoFile = async (
    fileUri: string,
    fileName?: string,
    mimeType?: string,
  ): Promise<{ uri: string; size: number }> => {
    try {
      const isWeb = Platform.OS === "web";

      const isVideoFile = (mimeType?: string, name?: string) => {
        const videoExtensions = ["mp4", "mov", "avi"];
        const hasExt = name
          ? videoExtensions.includes(name.split(".").pop()?.toLowerCase() || "")
          : false;
        return mimeType?.startsWith("video/") || hasExt;
      };

      const isVideo = isVideoFile(mimeType, fileName);

      if (isWeb) {
        return { uri: fileUri, size: selectedFile?.size || 0 };
      }

      let safeUri = await ensureFilePath(fileUri);

      if (!isVideo) {
        const info = await FileSystem.getInfoAsync(safeUri);
        console.log("Audio file info:", info);
        return { uri: safeUri, size: info.size || 0 };
      }

      const compressedUri = await compressVideo(safeUri);
      console.log("Compressed URI:", compressedUri);

      const fileInfo = await FileSystem.getInfoAsync(compressedUri);
      console.log("Compressed file info:", fileInfo);

      if (!fileInfo.exists) {
        throw new Error("Compressed file not found");
      }

      return { uri: compressedUri, size: fileInfo.size || 0 };
    } catch (error) {
      console.error("Error processing video file:", error);

      let safeUri = await ensureFilePath(fileUri);
      const info = await FileSystem.getInfoAsync(safeUri);
      return { uri: safeUri, size: info.size || 0 };
    }
  };

  const getRecordingIcon = () => {
    switch (recordingMethod) {
      case "video":
        return <VideoIcon size={40} color="white" />;
      case "upload":
        return <Upload size={40} color="white" />;
      default:
        return <Mic size={40} color="white" />;
    }
  };

  const getRecordingTitle = () => {
    switch (recordingMethod) {
      case "video":
        return "Video Recording";
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
        if (limits.remaining_video_speeches > 0)
          formats.push("MP4", "MOV", "AVI");
        if (plan !== "casual") formats.push("M4A");

        const uniqueFormats = [...new Set(formats)];
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
            <VideoIcon size={24} color="white" />
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
            device ? (
              <View className="flex-1 w-full relative">
                <CameraComponent
                  ref={cameraRef}
                  style={{ flex: 1 }}
                  device={device}
                  isActive={isRecordingVideo}
                  video={true}
                />

                {/* Overlay: Controls */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 40,
                    left: 0,
                    right: 0,
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "center",
                  }}
                >
                  {/* Pause/Resume (disabled for video) */}
                  <TouchableOpacity
                    onPress={handlePauseRecording}
                    style={{
                      backgroundColor: "white",
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {recordingState === "recording" ? (
                      <Pause size={28} color="#7c3aed" />
                    ) : (
                      <Mic size={28} color="#7c3aed" />
                    )}
                  </TouchableOpacity>

                  {/* Stop */}
                  <TouchableOpacity
                    onPress={handleStopRecording}
                    style={{
                      backgroundColor: "red",
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Square size={36} color="white" />
                  </TouchableOpacity>

                  {/* Flip Camera */}
                  <TouchableOpacity
                    onPress={toggleCamera}
                    style={{
                      backgroundColor: "rgba(0,0,0,0.6)",
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Flip
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : recordingMethod === "video" && Platform.OS === "web" ? (
              <View className="h-32 w-full items-center justify-center bg-yellow-100 rounded-2xl p-4 mb-8">
                <Text className="text-yellow-800 text-center font-medium">
                  Video recording is not supported on the web.{"\n"}
                  Please use audio recording or upload a file instead.
                </Text>
              </View>
            ) : recordingMethod === "audio" ? (
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
            ) : null}

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
