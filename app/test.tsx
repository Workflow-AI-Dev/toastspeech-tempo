import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";

const { width } = Dimensions.get("window");

const RealisticProgressLoader: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [nextStage, setNextStage] = useState<number | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const file = { name: "speech_demo.mp4" };

  // Define stages
  const stages = [
    {
      title: "Uploading your file...",
      detail: file ? `Uploading ${file.name}` : "Uploading audio",
      duration: 7000,
    },
    {
      title: "Analyzing waveform...",
      detail: "Detecting peaks, silences, and patterns",
      duration: 8000,
    },
    {
      title: "Extracting key segments...",
      detail: "Identifying highlights and sections",
      duration: 12000,
    },
    {
      title: "Calculating metrics...",
      detail: "Processing pitch, pace, and filler words",
      duration: 10000,
    },
    {
      title: "Finalizing results...",
      detail: "Preparing your evaluation",
      duration: 15000,
    },
  ];

  // One image per stage
  const stageImages = [
    require("../assets/images/processing/1.0.png"),
    require("../assets/images/processing/1.1.png"),
    require("../assets/images/processing/1.2.png"),
    require("../assets/images/processing/1.3.png"),
    require("../assets/images/processing/1.4.png"),
  ];

  // Handle staged animation flow
  useEffect(() => {
    if (!isProcessing) {
      progressAnim.setValue(0);
      setCurrentStage(0);
      setNextStage(null);
      return;
    }

    let elapsed = 0;
    stages.forEach((stage, index) => {
      setTimeout(() => {
        if (index > 0) {
          setNextStage(index);
          fadeAnim.setValue(0);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start(() => {
            setCurrentStage(index);
            setNextStage(null);
          });
        } else {
          setCurrentStage(index);
        }
      }, elapsed);
      elapsed += stage.duration;
    });

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: stages.reduce((acc, s) => acc + s.duration, 0),
      useNativeDriver: false,
    }).start();
  }, [isProcessing]);

  // Floating image pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {isProcessing ? (
        <View style={styles.container}>
          {/* Stage Image with smooth crossfade */}
          <View style={[styles.imageContainer, { backgroundColor: "#925ad1" }]}>
            <Animated.Image
              source={stageImages[currentStage]}
              style={[styles.image, { transform: [{ scale: scaleAnim }] }]}
              resizeMode="cover"
            />

            {nextStage !== null && (
              <Animated.Image
                source={stageImages[nextStage]}
                style={[styles.image, { opacity: fadeAnim }]}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Stage Text */}
          <Text style={styles.title}>{stages[currentStage]?.title}</Text>
          <Text style={styles.detail}>{stages[currentStage]?.detail}</Text>

          {/* Progress Bar */}
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>
      ) : (
        // Start button
        <View style={{ position: "absolute", bottom: 50, alignSelf: "center" }}>
          <TouchableOpacity
            onPress={() => setIsProcessing(true)}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Start Processing</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default RealisticProgressLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  imageContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 9999,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  detail: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  progressBackground: {
    width: width * 0.8,
    height: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#000",
    borderRadius: 4,
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: "#34d399",
  },
  startButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
