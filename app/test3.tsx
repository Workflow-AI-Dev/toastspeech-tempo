import {
  CameraView,
  CameraType,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { Video } from "expo-av";
import { useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

const VIDEO_QUALITY = "720p"; // Use a consistent quality setting

export default function VideoRecorderAndPlayer() {
  // Camera State
  const [facing, setFacing] = useState<CameraType>("back");
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const videoRef = useRef<Video>(null);

  // Permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  // --- Permission Handling ---

  if (!cameraPermission || !microphonePermission) {
    // Permissions are still loading
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!cameraPermission.granted || !microphonePermission.granted) {
    // Permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to access both the camera and microphone to
          record video.
        </Text>
        <Button
          onPress={async () => {
            await requestCameraPermission();
            await requestMicrophonePermission();
          }}
          title="Grant Permissions"
        />
      </View>
    );
  }

  // --- Camera Controls ---

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const startRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      setVideoUri(null); // Clear previous video
      setIsLoading(true);

      try {
        const video = await cameraRef.current.recordAsync({
          quality: VIDEO_QUALITY,
          // Optional: maxDuration: 60, // Limit to 60 seconds
        });
        setVideoUri(video.uri);
      } catch (error) {
        console.error("Recording error:", error);
      } finally {
        setIsRecording(false);
        setIsLoading(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  // --- Render Functions ---

  const renderCameraView = () => (
    <View style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        videoQuality={VIDEO_QUALITY}
        // mute is false by default, but explicitly setting for clarity on mic permission
        mute={!microphonePermission.granted}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={toggleCameraFacing}
          disabled={isRecording}
        >
          <Text style={styles.text}>Flip Cam</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.recordButton,
            { backgroundColor: isRecording ? "red" : "green" },
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
        >
          {isLoading && !isRecording ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.recordText}>
              {isRecording ? "STOP" : "RECORD"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setVideoUri(null)}
          disabled={!videoUri}
        >
          <Text style={[styles.text, { color: videoUri ? "white" : "gray" }]}>
            Discard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVideoPlayer = () => (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: videoUri! }}
        useNativeControls
        resizeMode="contain"
        isLooping
        onPlaybackStatusUpdate={(status) => {
          if (
            "didJustFinish" in status &&
            status.didJustFinish &&
            videoRef.current
          ) {
            // Optional: Replay the video once it finishes
            videoRef.current.replayAsync();
          }
        }}
      />
      <Button
        title="Record New Video"
        onPress={() => setVideoUri(null)}
        color="#841584"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {videoUri ? renderVideoPlayer() : renderCameraView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  message: {
    textAlign: "center",
    color: "white",
    paddingBottom: 20,
    marginHorizontal: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    backgroundColor: "transparent",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  button: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 8,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "white",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  recordText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  videoContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  video: {
    alignSelf: "stretch",
    width: "100%",
    aspectRatio: 16 / 9,
    marginBottom: 20,
  },
});
