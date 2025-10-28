import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Alert } from "react-native";
import { Mic, Pause, Square, Loader, Zap, Upload } from "lucide-react-native";
import { Video as VideoIcon } from "lucide-react-native";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { Video as VideoCompressor } from "react-native-compressor";
import * as FileSystem from "expo-file-system";
import RealisticProgressLoader from "./RealisticProgressLoader";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import CircularProgress from "./CircularProgress";
import { styles } from "../styles/speech-recorder-styles";
import MovToMp4 from "react-native-mov-to-mp4";
import * as ImagePicker from "expo-image-picker";

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
  useCameraDevices = () => ({});
}

const SpeechRecorderSpeaker = ({
  onRecordingComplete = () => {},
  isProcessing = false,
  recordingMethod = "audio",
  plan,
  limits,
}: SpeechRecorderSpeakerProps) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [recordingState, setRecordingState] = useState<
    "idle" | "recording" | "paused" | "completed" | "uploading" | "compressing"
  >("idle");
  const [compressionProgress, setCompressionProgress] = useState(0);
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
  const [messageIndex, setMessageIndex] = useState(0);
  type CameraDirection = "front" | "back";
  const [cameraType, setCameraType] = useState<CameraDirection>("front");
  const devices = useCameraDevices();
  const device = devices ? devices[cameraType] : undefined;

  // Stage durations in ms: 1m, 1m, 2m, 1m
  const stageDurations = [60000, 60000, 120000, 60000];

  useEffect(() => {
    if (isProcessing || recordingState === "uploading") {
      let timers = [];
      let elapsed = 0;

      stageDurations.forEach((duration, idx) => {
        const t = setTimeout(() => {
          setMessageIndex(idx);
        }, elapsed);
        timers.push(t);
        elapsed += duration;
      });

      return () => timers.forEach(clearTimeout);
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
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const audioTypes = ["audio/mpeg", "audio/wav", "audio/m4a", "audio/mp4"];
      const audioExts = ["mp3", "wav", "m4a"];
      const videoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
      const videoExts = ["mp4", "mov", "avi"];

      let allowedTypes: string[] = [];
      let allowedExtensions: string[] = [];

      if (
        limits.remaining_audio_speeches > 0 ||
        limits.remaining_audio_practice > 0
      ) {
        allowedTypes.push(...audioTypes);
        allowedExtensions.push(...audioExts);
      }

      if (
        limits.remaining_video_speeches > 0 ||
        limits.remaining_video_practice > 0
      ) {
        allowedTypes.push(...videoTypes);
        allowedExtensions.push(...videoExts);
      }

      if (allowedTypes.length === 0) {
        Alert.alert(
          "No Uploads Remaining",
          "You don't have any remaining audio or video uploads available.",
          [{ text: "OK" }],
        );
        return;
      }

      let result: any;

      // Platform-specific picker logic
      if (Platform.OS === "ios") {
        // Use ImagePicker for video/audio on iOS
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["videos", "images"], // "images" optional, if you want mixed media
          allowsEditing: false,
          quality: 1,
        });

        if (result.canceled) return;

        const asset = result.assets[0];
        const fileUri = asset.uri;
        const mimeType = asset.mimeType || "video/mp4";
        const fileName =
          asset.fileName || `upload-${Date.now()}.${mimeType.split("/")[1]}`;
        const fileSize = asset.fileSize;

        const file = { uri: fileUri, name: fileName, size: fileSize, mimeType };

        setSelectedFile(file);
        setRecordingState("uploading");

        const { uri: processedUri, size: processedSize } =
          await processVideoFile(file.uri, file.name, file.mimeType);

        setRecordingState("completed");

        onRecordingComplete({
          duration: timer,
          timestamp: new Date(),
          method: recordingMethod,
          recordingUri: processedUri,
          fileName: file.name,
          fileSize: processedSize,
          mimeType: file.mimeType,
        });
      } else {
        // Android or others – still use DocumentPicker
        const pickerTypes =
          allowedTypes.length > 0 ? allowedTypes : ["video/*", "audio/*"];

        result = await DocumentPicker.getDocumentAsync({
          type: pickerTypes,
          copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets?.length) return;

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
          return;
        }

        setSelectedFile(file);
        setRecordingState("uploading");

        const { uri: processedUri, size: processedSize } =
          await processVideoFile(file.uri, file.name, file.mimeType);

        setRecordingState("completed");

        onRecordingComplete({
          duration: timer,
          timestamp: new Date(),
          method: recordingMethod,
          recordingUri: processedUri,
          fileName: file.name,
          fileSize: processedSize,
          mimeType: file.mimeType,
        });
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
    setRecordingState("compressing");

    const safeUri = await ensureFilePath(videoUri);
    const fileInfo = await FileSystem.getInfoAsync(safeUri);
    const sizeMB = fileInfo.size / (1024 * 1024);

    if (sizeMB <= 5) {
      console.log("✅ Video already under 5 MB. Skipping compression.");
      setRecordingState("uploading");
      return safeUri;
    }

    try {
      const result = await VideoCompressor.compress(
        safeUri,
        {
          compressionMethod: "manual",
          bitrate: 800,
          maxSize: 360,
        },
        (progress) => {
          const percent = Math.round(progress * 100);
          setCompressionProgress(percent);
          console.log(`Compression progress: ${percent}%`);
        },
      );

      const compressedUri = await ensureFilePath(result);
      setRecordingState("uploading");

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
      setRecordingState("uploading");
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

      // Detect and convert MOV files to MP4
      if (fileName?.toLowerCase().endsWith(".mov")) {
        try {
          console.log("🎬 Converting MOV to MP4...");
          const filename = Date.now().toString();
          const convertedUri = await MovToMp4.convertMovToMp4(
            safeUri.replace("file://", ""),
            `${filename}.mp4`,
          );
          console.log("✅ MOV successfully converted:", convertedUri);

          safeUri = convertedUri.startsWith("file://")
            ? convertedUri
            : `file://${convertedUri}`;
        } catch (convErr) {
          console.error("❌ MOV to MP4 conversion failed:", convErr);
        }
      }

      if (!isVideo) {
        const info = await FileSystem.getInfoAsync(safeUri);
        console.log("Audio file info:", info);
        return { uri: safeUri, size: info.size || 0 };
      }

      // Compress video (after MOV conversion)
      const compressedUri = await compressVideo(safeUri);
      const fileInfo = await FileSystem.getInfoAsync(compressedUri);

      if (!fileInfo.exists) throw new Error("Compressed file not found");

      return { uri: compressedUri, size: fileInfo.size || 0 };
    } catch (error) {
      console.error("Error processing video file:", error);
      const safeUri = await ensureFilePath(fileUri);
      const info = await FileSystem.getInfoAsync(safeUri);
      return { uri: safeUri, size: info.size || 0 };
    }
  };

  const getRecordingIcon = () => {
    const iconColor = colors.background;
    switch (recordingMethod) {
      case "video":
        return <VideoIcon size={40} color={iconColor} />;
      case "upload":
        return <Upload size={40} color={iconColor} />;
      default:
        return <Mic size={40} color={iconColor} />;
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
    <>
      {isProcessing || recordingState === "uploading" ? (
        // Show only the loader, no header/gradient
        <RealisticProgressLoader
          isProcessing={true}
          file={selectedFile ? { name: selectedFile.name } : undefined}
        />
      ) : recordingState === "compressing" ? (
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.centerWrapper}>
            {/* Circular progress */}
            <Animated.View
              style={[
                styles.circleWrapper,
                {
                  backgroundColor: colors.card,
                },
              ]}
            >
              <CircularProgress
                size={130}
                strokeWidth={10}
                progress={compressionProgress}
                color={colors.primary}
                backgroundColor={colors.border}
              />
            </Animated.View>

            {/* Main title */}
            <Text style={[styles.title, { color: colors.text }]}>
              Compressing your video...
            </Text>

            {/* Secondary text */}
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              Optimizing file size and preparing for upload.
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            width: "100%",
            height: 500,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: colors.purple,
              padding: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
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
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.surface,
              padding: 16,
            }}
          >
            {recordingState === "idle" && (
              <View className="items-center">
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 8,
                  }}
                >
                  Ready?
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    textAlign: "center",
                    marginBottom: 24,
                  }}
                >
                  {getRecordingDescription()}
                </Text>

                <TouchableOpacity
                  onPress={
                    recordingMethod === "upload"
                      ? handleFileUpload
                      : handleStartRecording
                  }
                  style={{
                    backgroundColor: colors.purple,
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: colors.text,
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                  }}
                >
                  {getRecordingIcon()}
                </TouchableOpacity>
              </View>
            )}

            {/* Recording controls + visualization */}
            {(recordingState === "recording" ||
              recordingState === "paused") && (
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
                          backgroundColor: colors.surface,
                          width: 60,
                          height: 60,
                          borderRadius: 30,
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        {recordingState === "recording" ? (
                          <Pause size={28} color={colors.primary} />
                        ) : (
                          <Mic size={28} color={colors.primary} />
                        )}
                      </TouchableOpacity>

                      {/* Stop */}
                      <TouchableOpacity
                        onPress={handleStopRecording}
                        style={{
                          backgroundColor: colors.error,
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Square size={36} color={colors.surface} />
                      </TouchableOpacity>

                      {/* Flip Camera */}
                      <TouchableOpacity
                        onPress={toggleCamera}
                        style={{
                          backgroundColor: colors.overlay,
                          width: 60,
                          height: 60,
                          borderRadius: 30,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: colors.textOnAccent,
                            fontWeight: "bold",
                          }}
                        >
                          Flip
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : recordingMethod === "video" && Platform.OS === "web" ? (
                  <View
                    style={{
                      height: 130,
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.warningBackground,
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.warningText,
                        textAlign: "center",
                        fontWeight: "500",
                      }}
                    >
                      Video recording is not supported on the web.{"\n"}
                      Please use audio recording or upload a file instead.
                    </Text>
                  </View>
                ) : recordingMethod === "audio" ? (
                  /* Audio visualization */
                  <View
                    style={{
                      height: 130,
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      marginBottom: 32,
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    {audioLevels.map((level, index) => (
                      <Animated.View
                        key={index}
                        style={{
                          height: recordingState === "recording" ? level : 5,
                          opacity: recordingState === "paused" ? 0.5 : 1,
                          backgroundColor: colors.primary,
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
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 32,
                  }}
                >
                  <TouchableOpacity
                    onPress={handlePauseRecording}
                    style={{
                      backgroundColor: colors.surface,
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      shadowColor: colors.text,
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                    }}
                  >
                    {recordingState === "recording" ? (
                      <Pause size={28} color={colors.primary} />
                    ) : (
                      <Mic size={28} color={colors.primary} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleStopRecording}
                    style={{
                      backgroundColor: colors.error,
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: colors.text,
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                    }}
                  >
                    <Square size={32} color={colors.surface} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </>
  );
};

export default SpeechRecorderSpeaker;
