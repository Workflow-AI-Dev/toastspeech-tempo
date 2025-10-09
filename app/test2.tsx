import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { CameraView } from "expo-camera";

export default function VideoRecorder() {
  const cameraRef = useRef<CameraView>(null);
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const handleRecord = async () => {
    if (cameraRef.current) {
      if (recording) {
        cameraRef.current.stopRecording();
        setRecording(false);
      } else {
        try {
          const video = await cameraRef.current.recordAsync();
          setVideoUri(video.uri);
          Alert.alert("Video grabado", `URI: ${video.uri}`);
          setRecording(false);
        } catch (error) {
          console.error("Error al grabar video:", error);
        }
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        videoStabilizationMode="auto"
        facing="back"
        mode="video"
      />
      <TouchableOpacity
        onPress={handleRecord}
        style={{
          position: "absolute",
          bottom: 20,
          alignSelf: "center",
          backgroundColor: "red",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>
          {recording ? "Detener" : "Grabar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
