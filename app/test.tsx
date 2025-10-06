import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { Camera, VideoQuality } from "expo-camera";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

// Safe default camera type for web or if CameraType isn't defined
const CameraTypeSafe = (Camera as any)?.Constants?.Type || {
  front: "front",
  back: "back",
};

export default function VideoRecorder() {
  const cameraRef = useRef<Camera | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [type, setType] = useState(CameraTypeSafe.back);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await Camera.requestCameraPermissionsAsync();
        const { status: audioStatus } =
          await Camera.requestMicrophonePermissionsAsync();
        setHasPermission(status === "granted" && audioStatus === "granted");
      } else {
        // Web: auto "granted" to show playback UI
        setHasPermission(true);
      }
    })();
  }, []);

  const startRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({
        maxDuration: 300, // 5 minutes
        quality: VideoQuality["480p"],
      });
      setVideoUri(video.uri);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const toggleCameraType = () => {
    setType((prev) =>
      prev === CameraTypeSafe.back ? CameraTypeSafe.front : CameraTypeSafe.back,
    );
  };

  if (hasPermission === null) {
    return (
      <Text style={styles.infoText}>Requesting camera permissions...</Text>
    );
  }

  if (hasPermission === false) {
    return (
      <Text style={[styles.infoText, { color: "red" }]}>
        Camera access denied
      </Text>
    );
  }

  // Web fallback
  if (Platform.OS === "web") {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          Video recording not supported on web in Expo Camera yet 😅
        </Text>
        {videoUri ? (
          <Video
            source={{ uri: videoUri }}
            useNativeControls
            style={styles.video}
          />
        ) : (
          <Text style={[styles.infoText, { marginTop: 10 }]}>
            Upload or use native app to record!
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!videoUri ? (
        <Camera ref={cameraRef} style={styles.camera} type={type}>
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={toggleCameraType}
              style={styles.iconButton}
            >
              <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={[
                styles.recordButton,
                { backgroundColor: isRecording ? "red" : "white" },
              ]}
            />

            <View style={{ width: 40 }} />
          </View>
        </Camera>
      ) : (
        <View style={styles.centered}>
          <Video
            source={{ uri: videoUri }}
            useNativeControls
            resizeMode="contain"
            style={styles.videoLarge}
          />
          <TouchableOpacity
            onPress={() => setVideoUri(null)}
            style={styles.recordAgainBtn}
          >
            <Text style={styles.recordAgainText}>Record Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  controls: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  iconButton: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 50,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
  },
  video: {
    width: 320,
    height: 240,
    borderRadius: 10,
    marginTop: 20,
  },
  videoLarge: {
    width: 320,
    height: 480,
    borderRadius: 10,
  },
  infoText: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
  },
  recordAgainBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1E90FF",
    borderRadius: 8,
  },
  recordAgainText: {
    color: "white",
    fontWeight: "bold",
  },
});
