import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Dimensions, StyleSheet } from "react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

interface RealisticProgressLoaderProps {
  isProcessing: boolean;
  file?: { name: string };
}

const RealisticProgressLoader: React.FC<RealisticProgressLoaderProps> = ({
  isProcessing,
  file,
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [nextStage, setNextStage] = useState<number | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const processingToasts = [
    {
      text1: "Your speech is almost ready 🚀",
      text2:
        "Stick around to watch it finish… or head to your Library to check it later!",
    },
    {
      text1: "Hang tight… ⏳",
      text2:
        "You can stay here and see the magic happen, or peek at it later in your Library!",
    },
    {
      text1: "Still wrapping things up 🎁",
      text2: "Want to stay? Cool. Prefer to explore the Library? Also cool!",
    },
    {
      text1: "Patience, young grasshopper 🐢",
      text2:
        "You can watch the final touches or come back later in your Library!",
    },
    {
      text1: "Cooking your speech to perfection 🍳",
      text2: "Stay and watch or check it later in the Library — your call!",
    },
    {
      text1: "Almost there… ✨",
      text2: "Hang out and see it finish, or visit it later in your Library!",
    },
  ];

  // Show one randomly after 1 min

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isProcessing) {
      timer = setTimeout(() => {
        const toast =
          processingToasts[Math.floor(Math.random() * processingToasts.length)];
        Toast.show({
          type: "info",
          text1: toast.text1,
          text2: toast.text2,
        });
      }, 60000); // 1 min
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isProcessing]);

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

  const stageImages = [
    require("../../assets/images/processing/1.0.png"),
    require("../../assets/images/processing/1.1.png"),
    require("../../assets/images/processing/1.2.png"),
    require("../../assets/images/processing/1.3.png"),
    require("../../assets/images/processing/1.4.png"),
  ];

  // Stage progression
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

  // Floating pulse
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

  if (!isProcessing) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.centerWrapper]}>
        {/* Stage Image */}
        <View
          style={[styles.imageContainer, { backgroundColor: colors.accent }]}
        >
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
        <Text style={[styles.title, { color: colors.text }]}>
          {stages[currentStage]?.title}
        </Text>
        <Text style={[styles.detail, { color: colors.textSecondary }]}>
          {stages[currentStage]?.detail}
        </Text>

        {/* Progress Bar */}
        <View
          style={[
            styles.progressBackground,
            { backgroundColor: colors.border },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.primary,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export default RealisticProgressLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  centerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: height * 0.6, // keeps content vertically centered
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
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});
