import React, { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronRight,
  Star,
  Mic,
  CheckCircle,
  Zap,
  Beaker,
} from "lucide-react-native";

const LEVELS = [
  { level: 1, xp: 0, name: "Beginner", avg_required: 0, icon: "🌱" },
  { level: 2, xp: 300, name: "Ice Breaker", avg_required: 70, icon: "❄️" },
  { level: 3, xp: 700, name: "Storyteller", avg_required: 74, icon: "📖" },
  { level: 4, xp: 1200, name: "Persuader", avg_required: 78, icon: "🗣️" },
  { level: 5, xp: 2000, name: "Engager", avg_required: 80, icon: "🔥" },
  { level: 6, xp: 3200, name: "Connector", avg_required: 82, icon: "🔗" },
  { level: 7, xp: 5000, name: "Orator", avg_required: 84, icon: "🎤" },
  { level: 8, xp: 7500, name: "Influencer", avg_required: 86, icon: "🌍" },
  { level: 9, xp: 10000, name: "Master Speaker", avg_required: 88, icon: "🏆" },
  {
    level: 10,
    xp: 15000,
    name: "World-Class Communicator",
    avg_required: 90,
    icon: "👑",
  },
];

export default function LevelCard({ userLevel, colors }) {
  const [modalVisible, setModalVisible] = useState(false);

  const xpItems = [
    {
      icon: <Mic size={28} color="#fff" />,
      title: "Give a speech",
      desc: "Score = XP",
      gradient: ["#FFD966", "#FBBF24"], // polished yellow
    },
    {
      icon: <CheckCircle size={28} color="#fff" />,
      title: "Evaluate others",
      desc: "Half the score = XP",
      gradient: ["#60A5FA", "#2563EB"], // polished blue
    },
    {
      icon: <Zap size={28} color="#fff" />,
      title: "Keep monthly streak",
      desc: "+10% bonus XP",
      gradient: ["#FB7185", "#DC2626"], // modern pink/red
    },
    {
      icon: <Beaker size={28} color="#fff" />,
      title: "Practice",
      desc: "Improves skill (no XP)",
      gradient: ["#A78BFA", "#7C3AED"], // vibrant purple
    },
  ];

  return (
    <>
      {/* Card */}
      <Pressable
        className="px-6 mb-8"
        onPress={() => setModalVisible(true)}
        android_ripple={{ color: colors.border }}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      >
        <View
          className="rounded-3xl p-6 flex-col shadow-lg"
          style={{ backgroundColor: colors.surface }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Level {userLevel.current}: {userLevel.currentName}
            </Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </View>

          {/* Progress Bar with gradient */}
          <View
            className="rounded-full h-3 mb-3 overflow-hidden"
            style={{ backgroundColor: colors.border }}
          >
            <LinearGradient
              colors={["#FFD700", "#FF8C00", "#FF4500"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: `${userLevel.progress}%`,
                height: "100%",
                borderRadius: 999,
              }}
            />
          </View>

          {/* XP Needed */}
          <Text
            className="text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            {userLevel.xpRemaining} XP to reach Level {userLevel.nextLevel}:{" "}
            {userLevel.nextName}
          </Text>
        </View>
      </Pressable>

      {/* Modal Popup */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View
            className="rounded-t-3xl p-6 max-h-[85%] shadow-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            {/* Gradient Header */}
            <LinearGradient
              colors={["#3B82F6", "#9333EA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="p-4 rounded-2xl mb-4"
            >
              <Text className="text-center text-2xl font-extrabold text-white">
                Level {userLevel.current}: {userLevel.currentName}
              </Text>
              <Text className="text-center text-sm text-white/80 mt-1">
                {userLevel.totalXP} XP earned · {userLevel.xpRemaining} XP to
                next level
              </Text>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* How to Earn XP */}
              <Text
                className="text-lg font-bold mb-3"
                style={{ color: colors.text }}
              >
                🚀 How to Earn XP
              </Text>

              {/* 2x2 Grid */}
              <View className="flex-row flex-wrap -mx-2 mb-6">
                {xpItems.map((item, index) => (
                  <View key={index} className="w-1/2 px-2 mb-4">
                    <LinearGradient
                      colors={item.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="p-5 rounded-2xl shadow-lg flex-row items-center"
                      style={{ aspectRatio: 1.5 }} // width-to-height ratio, adjust as needed
                    >
                      <View className="mr-3">{item.icon}</View>
                      <View className="flex-1 justify-center">
                        <Text className="text-base font-semibold text-white">
                          {item.title}
                        </Text>
                        <Text className="text-sm text-white/80 mt-1">
                          {item.desc}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>

              {/* Level Roadmap */}
              <Text
                className="text-lg font-bold mb-2"
                style={{ color: colors.text }}
              >
                🏆 Level Roadmap
              </Text>
              {LEVELS.map((lvl) => (
                <View
                  key={lvl.level}
                  className="flex-row justify-between items-center py-3 px-4 rounded-2xl mb-2 shadow-sm"
                  style={{
                    backgroundColor:
                      lvl.level === userLevel.current
                        ? colors.primary + "30"
                        : colors.surface,
                  }}
                >
                  <Text
                    className="font-semibold"
                    style={{
                      color:
                        lvl.level <= userLevel.current
                          ? colors.text
                          : colors.textSecondary,
                    }}
                  >
                    {lvl.icon} {lvl.name}
                  </Text>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    {lvl.xp} XP · Avg ≥ {lvl.avg_required}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Close Button */}
            <Pressable
              onPress={() => setModalVisible(false)}
              className="mt-6 py-3 rounded-2xl shadow-md"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="text-center font-bold text-lg"
                style={{ color: colors.surface }}
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
