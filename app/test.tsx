import {
  StyleSheet,
  Text,
  View,
  Button,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import { Video } from "expo-av";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    Camera.useMicrophonePermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [video, setVideo] = useState(null);
  const [facing, setFacing] = useState("back");
  const [isSwitching, setIsSwitching] = useState(false);

  const cameraRef = useRef(null);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
      if (!microphonePermission?.granted) await requestMicrophonePermission();
    })();
  }, []);

  if (!cameraPermission) {
    return <Text>Requesting permissions...</Text>;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text>Camera permission not granted.</Text>
        <Button
          title="Grant Camera Permission"
          onPress={requestCameraPermission}
        />
      </View>
    );
  }

  if (!microphonePermission?.granted) {
    return (
      <View style={styles.container}>
        <Text>Microphone permission not granted.</Text>
        <Button
          title="Grant Microphone Permission"
          onPress={requestMicrophonePermission}
        />
      </View>
    );
  }

  // --- RECORD VIDEO ---
  const recordVideo = async () => {
    if (!cameraRef.current || !isCameraReady || isSwitching) return;

    setIsRecording(true);
    try {
      // Small delay ensures camera pipeline is ready (especially after flip)
      await new Promise((res) => setTimeout(res, 250));

      const options = {
        quality: "1080p",
        maxDuration: 60,
        mute: false,
      };

      const recordedVideo = await cameraRef.current.recordAsync(options);

      if (recordedVideo?.uri) {
        setVideo(recordedVideo);
      } else {
        console.warn("No valid video recorded (empty URI).");
      }
    } catch (error) {
      console.error("Recording failed:", error);
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (isRecording && cameraRef.current) {
      setIsRecording(false);
      await cameraRef.current.stopRecording();
    }
  };

  const toggleCameraFacing = async () => {
    if (isRecording) await stopRecording(); // stop recording before switching
    setIsSwitching(true);
    setIsCameraReady(false);
    setFacing((prev) => (prev === "back" ? "front" : "back"));

    // Give the camera time to reinitialize
    setTimeout(() => setIsSwitching(false), 800);
  };

  // --- WHEN VIDEO IS READY ---
  if (video) {
    const shareVideo = async () => {
      try {
        await shareAsync(video.uri);
      } catch (err) {
        console.error("Error sharing video:", err);
      } finally {
        setVideo(null);
      }
    };

    const saveVideo = async () => {
      try {
        await MediaLibrary.saveToLibraryAsync(video.uri);
      } catch (err) {
        console.error("Error saving video:", err);
      } finally {
        setVideo(null);
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <Video
          style={styles.video}
          source={{ uri: video.uri }}
          useNativeControls
          resizeMode="contain"
          isLooping
        />
        <Button title="Share" onPress={shareVideo} />
        {hasMediaLibraryPermission && (
          <Button title="Save" onPress={saveVideo} />
        )}
        <Button title="Discard" onPress={() => setVideo(null)} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing={facing}
        mode="video"
        onCameraReady={() => setIsCameraReady(true)}
      >
        {!isCameraReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff" }}>Initializing Camera...</Text>
          </View>
        )}
        <View style={styles.controls}>
          <View style={styles.buttonRow}>
            <Button
              title={isRecording ? "Stop Recording" : "Record Video"}
              onPress={isRecording ? stopRecording : recordVideo}
              disabled={!isCameraReady || isSwitching}
            />
            <Button
              title={`Flip to ${facing === "back" ? "Front" : "Back"}`}
              onPress={toggleCameraFacing}
              disabled={isRecording || isSwitching}
            />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  controls: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  video: {
    flex: 1,
    alignSelf: "stretch",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
