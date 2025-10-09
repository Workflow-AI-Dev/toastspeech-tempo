import {
  StyleSheet,
  Text,
  View,
  Button,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Video } from "expo-av";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as Audio from "expo-av"; // ✅ For microphone permissions

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [video, setVideo] = useState(null);
  const [facing, setFacing] = useState("back");
  const [isSwitching, setIsSwitching] = useState(false);

  const cameraRef = useRef(null);

  // ─── Request Permissions ───────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      // Request media library permission
      const mediaLibPerm = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibPerm.status === "granted");

      // Request microphone permission via expo-av
      const micPerm = await Audio.Audio.requestPermissionsAsync();
      setMicrophonePermission(micPerm);
    })();
  }, []);

  // ─── Handle Permissions ────────────────────────────────────────────────
  if (!cameraPermission) return <Text>Requesting camera permissions…</Text>;

  if (!cameraPermission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission not granted.</Text>
        <Button
          title="Grant Camera Permission"
          onPress={requestCameraPermission}
        />
      </View>
    );
  }

  if (!microphonePermission || microphonePermission.status !== "granted") {
    return (
      <View style={styles.center}>
        <Text>Microphone permission not granted.</Text>
        <Button
          title="Grant Microphone Permission"
          onPress={async () => {
            const micPerm = await Audio.Audio.requestPermissionsAsync();
            setMicrophonePermission(micPerm);
          }}
        />
      </View>
    );
  }

  // ─── Record Video ────────────────────────────────────────────────
  const recordVideo = async () => {
    if (!cameraRef.current || !isCameraReady || isSwitching) return;

    setIsRecording(true);
    try {
      // Delay helps avoid race conditions after flipping camera
      await new Promise((res) => setTimeout(res, 300));

      const options = {
        quality: "1080p",
        maxDuration: 60,
        mute: false,
      };

      const recorded = await cameraRef.current.recordAsync(options);

      if (recorded?.uri) setVideo(recorded);
      else console.warn("No valid video recorded.");
    } catch (err) {
      console.error("Recording error:", err);
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      try {
        await cameraRef.current.stopRecording();
      } catch (e) {
        console.warn("Stop recording error:", e);
      } finally {
        setIsRecording(false);
      }
    }
  };

  // ─── Flip Camera ────────────────────────────────────────────────
  const toggleCameraFacing = async () => {
    if (isRecording) await stopRecording();

    setIsSwitching(true);
    setIsCameraReady(false);
    setFacing((prev) => (prev === "back" ? "front" : "back"));

    // Let the camera settle before re-enabling
    setTimeout(() => setIsSwitching(false), 700);
  };

  // ─── After Video Recorded ───────────────────────────────────────
  if (video) {
    const shareVideo = async () => {
      try {
        await shareAsync(video.uri);
      } catch (e) {
        console.error("Share error:", e);
      } finally {
        setVideo(null);
      }
    };

    const saveVideo = async () => {
      try {
        await MediaLibrary.saveToLibraryAsync(video.uri);
      } catch (e) {
        console.error("Save error:", e);
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

  // ─── Camera View ────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
        onCameraReady={() => setIsCameraReady(true)}
      >
        {!isCameraReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff" }}>Initializing Camera…</Text>
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

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  camera: { flex: 1, width: "100%" },
  controls: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  buttonRow: { flexDirection: "row", gap: 12 },
  video: { flex: 1, alignSelf: "stretch" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
