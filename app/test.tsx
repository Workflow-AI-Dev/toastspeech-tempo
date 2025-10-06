import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Button, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Video } from "expo-av";

export default function App() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          We need your permission to show the camera
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    setIsRecording(true);
    const video = await cameraRef.current.recordAsync({
      maxDuration: 300, // 5 minutes
      quality: "480p",
    });
    setVideoUri(video.uri);
    setIsRecording(false);
  };

  const stopRecording = async () => {
    if (!cameraRef.current) return;
    cameraRef.current.stopRecording();
    setIsRecording(false);
  };

  return (
    <View style={styles.container}>
      {!videoUri ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          mode="video"
        >
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={toggleCameraFacing}
              style={styles.controlButton}
            >
              <Text style={styles.text}>Flip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={[
                styles.recordButton,
                { backgroundColor: isRecording ? "red" : "white" },
              ]}
            />

            <View style={{ width: 50 }} />
          </View>
        </CameraView>
      ) : (
        <View style={styles.preview}>
          <Video
            source={{ uri: videoUri }}
            useNativeControls
            resizeMode="contain"
            style={styles.video}
          />
          <Button title="Record Again" onPress={() => setVideoUri(null)} />
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
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  controlButton: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 8,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  preview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: 320,
    height: 480,
    borderRadius: 10,
    marginBottom: 20,
  },
  text: { color: "white", textAlign: "center" },
});
