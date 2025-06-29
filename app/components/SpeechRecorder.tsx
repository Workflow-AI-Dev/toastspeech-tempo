import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import {
  Mic,
  Pause,
  Square,
  Loader,
  CheckCircle,
  Zap,
  Target,
  Award,
  TrendingUp,
} from "lucide-react-native";

import * as Haptics from "expo-haptics";

interface SpeechRecorderProps {
  onRecordingComplete?: (recordingData: any) => void;
  isProcessing?: boolean;
  analysisResults?: {
    pace: number;
    fillerWords: number;
    emotionalDelivery: number;
    overallScore: number;
  };
}

const SpeechRecorder = ({
  onRecordingComplete = () => {},
  isProcessing = false,
  analysisResults = {
    pace: 85,
    fillerWords: 12,
    emotionalDelivery: 78,
    overallScore: 82,
  },
}: SpeechRecorderProps) => {
  const [recordingState, setRecordingState] = useState<
    "idle" | "recording" | "paused" | "completed"
  >("idle");
  const [timer, setTimer] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(30).fill(5));

  // Animation value for audio visualization
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (recordingState === "recording") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);

        // Simulate audio levels
        setAudioLevels((prev) => {
          const newLevels = [...prev];
          newLevels.shift();
          newLevels.push(Math.floor(Math.random() * 50) + 5);
          return newLevels;
        });
      }, 1000);

      // Start pulsing animation
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
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState, pulseAnim]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRecordingState("recording");
  };

  const handlePauseRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRecordingState((prev) =>
      prev === "recording" ? "paused" : "recording",
    );
  };

  const handleStopRecording = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRecordingState("completed");
    // Simulate sending recording data
    setTimeout(() => {
      onRecordingComplete({ duration: timer, timestamp: new Date() });
    }, 1000);
  };

  const resetRecording = () => {
    setRecordingState("idle");
    setTimer(0);
    setAudioLevels(Array(30).fill(5));
  };

  return (
    <View className="bg-gradient-to-b from-purple-50 to-indigo-50 w-full h-[500px] rounded-2xl overflow-hidden">
      {/* Header */}
      <View className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 items-center">
        <View className="flex-row items-center">
          <Zap size={24} color="white" />
          <Text className="text-white text-xl font-bold ml-2">
            AI Speech Coach
          </Text>
        </View>
        {recordingState !== "idle" && (
          <View className="flex-row items-center mt-2">
            <Text className="text-white text-2xl font-bold">
              {formatTime(timer)}
            </Text>
            <View className="bg-white/20 rounded-full px-2 py-1 ml-3">
              <Text className="text-white text-sm font-semibold">LIVE</Text>
            </View>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center p-6">
        {recordingState === "idle" && (
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
              Ready to Practice?
            </Text>
            <Text className="text-gray-600 mb-8 text-center">
              Tap the mic to start recording and get instant AI feedback!
            </Text>

            <TouchableOpacity
              onPress={handleStartRecording}
              className="bg-gradient-to-r from-red-500 to-pink-500 w-24 h-24 rounded-full items-center justify-center shadow-lg"
            >
              <Mic size={40} color="white" />
            </TouchableOpacity>

            <View className="flex-row items-center mt-6 bg-white/50 rounded-full px-4 py-2">
              <Target size={16} color="#6366f1" />
              <Text className="text-indigo-600 text-sm font-semibold ml-2">
                Aim for 2-5 minutes
              </Text>
            </View>
          </View>
        )}

        {(recordingState === "recording" || recordingState === "paused") && (
          <View className="w-full items-center">
            {/* Audio visualization */}
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

            <View className="mt-8 bg-white/50 rounded-2xl p-4 items-center">
              <Text className="text-lg font-bold text-gray-800">
                {recordingState === "recording"
                  ? "🔴 Recording..."
                  : "⏸️ Paused"}
              </Text>
              <Text className="text-gray-600 text-center mt-1">
                {recordingState === "recording"
                  ? "Speak clearly and confidently!"
                  : "Tap mic to resume recording"}
              </Text>
            </View>
          </View>
        )}

        {recordingState === "completed" && !isProcessing && (
          <View className="items-center">
            <View className="bg-green-100 rounded-full p-6 mb-4">
              <CheckCircle size={60} color="#16a34a" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Amazing! 🎉
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Your speech has been recorded successfully.
            </Text>

            <TouchableOpacity
              onPress={resetRecording}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 rounded-2xl shadow-lg"
            >
              <Text className="text-white font-bold text-lg">
                🎤 Record Another
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isProcessing && (
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
              🤖 AI is Analyzing...
            </Text>
            <Text className="text-gray-600 text-center">
              Hang tight! We're processing your speech to give you personalized
              feedback.
            </Text>

            <View className="flex-row mt-4 space-x-2">
              <View className="bg-white/50 rounded-full px-3 py-1">
                <Text className="text-sm text-gray-700">📊 Analyzing pace</Text>
              </View>
              <View className="bg-white/50 rounded-full px-3 py-1">
                <Text className="text-sm text-gray-700">
                  🎯 Checking clarity
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Analysis Results (if available) */}
      {recordingState === "completed" && !isProcessing && analysisResults && (
        <View className="bg-white/90 backdrop-blur-sm p-4 rounded-t-2xl border-t border-gray-200">
          <View className="flex-row items-center mb-3">
            <Award size={20} color="#7c3aed" />
            <Text className="text-lg font-bold ml-2">Your Results</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-700">🏃‍♂️ Pace:</Text>
                <Text className="font-bold text-purple-600">
                  {analysisResults.pace}/100
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-700">🚫 Filler Words:</Text>
                <Text className="font-bold text-orange-600">
                  {analysisResults.fillerWords}
                </Text>
              </View>
            </View>

            <View className="ml-6 items-center">
              <View className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full w-16 h-16 items-center justify-center">
                <Text className="font-bold text-xl text-purple-600">
                  {analysisResults.overallScore}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">Overall</Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl py-3 mt-4"
            onPress={() => {
              // This would typically be handled by the parent component
              // For now, we'll just show an alert
              alert("Navigate to detailed feedback");
            }}
          >
            <Text className="text-white font-bold text-center">
              📋 View Detailed Feedback
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SpeechRecorder;
