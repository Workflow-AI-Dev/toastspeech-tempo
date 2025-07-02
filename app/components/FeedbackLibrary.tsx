import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Filter, Search, BarChart3, Mic } from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import SpeechLibrary from "./SpeechLibrary";
import EvaluationsLibrary from "./EvaluationsLibrary";

interface SpeechEntry {
  id: string;
  title: string;
  date: string;
  duration: string;
  score: number;
  transcription: string;
  feedback: string[];
  suggestions: string[];
  emoji: string;
  category: string;
  improvement: string;
}

interface FeedbackLibraryProps {
  speeches?: SpeechEntry[];
  onEditNotes?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
  onViewDetailedFeedback?: () => void;
  onViewDetailedFeedbackEval?: () => void;
}

export default function FeedbackLibrary({
  onViewDetailedFeedback = () => {},
  onViewDetailedFeedbackEval = () => {},
  speeches = [
    {
      id: "1",
      title: "My Leadership Journey",
      date: "2023-10-15",
      duration: "5:32",
      score: 85,
      emoji: <Mic size={24} color="#7c3aed" />,
      category: "Personal Story",
      improvement: "+12",
      transcription:
        "Hello everyone, my name is John and today I want to talk about effective communication...",
      feedback: [
        "🎯 Excellent eye contact throughout the speech",
        "📢 Clear and confident voice projection",
        '⚠️ Used too many filler words ("um", "like")',
        "💪 Strong opening but conclusion needs work",
      ],
      suggestions: [
        "Practice eliminating filler words with recording exercises",
        "Work on creating a more impactful conclusion with a call-to-action",
        "Consider using more vocal variety to maintain engagement",
      ],
    },
    {
      id: "2",
      title: "Why I Love Coffee",
      date: "2023-11-02",
      duration: "7:15",
      score: 92,
      emoji: <Mic size={24} color="#7c3aed" />,
      category: "Informative",
      improvement: "+18",
      transcription:
        "Today I want to convince you that investing in renewable energy is not just good for the environment...",
      feedback: [
        "🔥 Excellent use of persuasive techniques",
        "📋 Well-structured with clear arguments",
        "⏱️ Occasional pacing issues - spoke too quickly at times",
        "⏸️ Effective use of pauses for emphasis",
      ],
      suggestions: [
        "Work on consistent pacing throughout the speech",
        "Consider adding more concrete examples and statistics",
        "Practice smoother transitions between main points",
      ],
    },
    {
      id: "3",
      title: "Dream Vacation Plans",
      date: "2023-12-10",
      duration: "2:45",
      score: 78,
      emoji: <Mic size={24} color="#7c3aed" />,
      category: "Impromptu",
      improvement: "+5",
      transcription:
        "When asked about leadership, I believe the most important quality is empathy...",
      feedback: [
        "🧠 Good thinking on your feet",
        "🎯 Clear main point about empathy",
        "📝 Limited supporting examples",
        "😰 Some nervous gestures noticed",
      ],
      suggestions: [
        "Practice more impromptu speaking scenarios daily",
        "Work on body language awareness with video practice",
        "Develop technique for quickly generating examples",
      ],
    },
  ],
  evaluations = [
    {
      id: "eval1",
      date: "2024-01-22",
      score: 87,
      strengths: [
        "Strong vocal variety maintained audience attention",
        "Well-structured narrative with clear transitions",
        "Good use of pauses to emphasize key points",
      ],
      improvements: [
        "Occasional stumbles in word choice",
        "Could improve posture during storytelling",
        "Add more personal anecdotes for emotional impact",
      ],
    },
    {
      id: "eval2",
      date: "2024-03-11",
      score: 91,
      strengths: [
        "Confident tone throughout the presentation",
        "Excellent stage presence and eye contact",
        "Used humor effectively to engage listeners",
      ],
      improvements: [
        "Spoke slightly fast in the conclusion",
        "Consider using more varied examples",
        "Some filler words noted in the intro",
      ],
    },
    {
      id: "eval3",
      date: "2024-05-06",
      score: 79,
      strengths: [
        "Clear articulation and pronunciation",
        "Engaging intro with a thought-provoking hook",
        "Solid effort in vocal modulation",
      ],
      improvements: [
        "Lacked strong closing statement",
        "Gestures felt repetitive",
        "Some transitions felt abrupt",
      ],
    },
  ],

  onEditNotes = (id) => console.log(`Edit notes for speech ${id}`),
  onDeleteEntry = (id) => console.log(`Delete speech ${id}`),
}: FeedbackLibraryProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [activeTab, setActiveTab] = useState<"speech" | "evaluation">("speech");

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Enhanced Header */}
        <View
          className="px-6 py-8"
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 0.5,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text
                className="text-3xl font-bold"
                style={{ color: colors.text }}
              >
                {activeTab === "speech"
                  ? "Speech Library"
                  : "Evaluation Library"}
              </Text>

              <Text
                className="mt-1 text-base"
                style={{ color: colors.textSecondary }}
              >
                Track your past speeches and evaluations
              </Text>
            </View>

            <View
              className="rounded-2xl p-4"
              style={{
                backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
              }}
            >
              <BarChart3 size={28} color={colors.primary} />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="flex-row items-center rounded-2xl px-4 py-3 flex-1 mr-2"
              style={{
                backgroundColor: theme === "dark" ? colors.surface : "#ebedf0",
              }}
            >
              <Search size={18} color={colors.textSecondary} />
              <Text
                className="ml-2 font-medium"
                style={{ color: colors.textSecondary }}
              >
                Search
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center rounded-2xl px-4 py-3 ml-2"
              style={{
                backgroundColor: theme === "dark" ? colors.surface : "#ebedf0",
              }}
            >
              <Filter size={18} color={colors.textSecondary} />
              <Text
                className="ml-2 font-medium"
                style={{ color: colors.textSecondary }}
              >
                Filter
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*Toggle*/}
        <View
          className="flex-row mx-6 my-4 justify-center rounded-xl overflow-hidden border"
          style={{ borderColor: colors.border }}
        >
          <TouchableOpacity
            className={`flex-1 px-4 py-2 items-center ${activeTab === "speech" ? "bg-blue-500" : ""}`}
            style={{
              backgroundColor:
                activeTab === "speech" ? colors.primary : "transparent",
            }}
            onPress={() => setActiveTab("speech")}
          >
            <Text
              style={{ color: activeTab === "speech" ? "#fff" : colors.text }}
            >
              Speech Library
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 px-4 py-2 items-center ${activeTab === "evaluation" ? "bg-blue-500" : ""}`}
            style={{
              backgroundColor:
                activeTab === "evaluation" ? colors.primary : "transparent",
            }}
            onPress={() => setActiveTab("evaluation")}
          >
            <Text
              style={{
                color: activeTab === "evaluation" ? "#fff" : colors.text,
              }}
            >
              Evaluation Library
            </Text>
          </TouchableOpacity>
        </View>

        {/*Content based on selected option */}
        {activeTab === "speech" ? (
          <SpeechLibrary
            speeches={speeches}
            onEditNotes={onEditNotes}
            onDeleteEntry={onDeleteEntry}
            onViewDetailedFeedback={onViewDetailedFeedback}
          />
        ) : (
          <>
            <EvaluationsLibrary
              evaluations={evaluations}
              onViewDetailedFeedbackEval={onViewDetailedFeedbackEval}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
