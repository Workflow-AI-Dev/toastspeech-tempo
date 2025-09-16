import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";
import {
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Star,
  TrendingDown,
  TrendingUp,
  ClipboardCheck,
  Mic,
  Zap,
  Clock,
  Flame,
  PauseCircle,
  Volume2,
  Type,
  Info,
  ScrollText,
  Unplug,
  Megaphone,
  Smile,
  VolumeX,
  MessageCircleQuestion,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

interface QuickFeedbackEvaluationsProps {
  evaluationResults: {
    overallScore: number;
    pace: number;
    fillerWords: number;
    emotionalDelivery: number;
    clarity: number;
    confidence: number;
    engagement: number;
    improvement: string;
    duration: string;
    avgPause: string;
    pausesData: {
      timestamp: string;
      pause_type: string;
      duration_seconds: number;
    }[];
    fillerData: {
      word: string;
      timestamp: string;
      sentence: string;
    }[];
    crutchData: {
      phrase: string;
      category: string;
      timestamp: string;
      sentence: string;
    }[];
    repeatedPhrases: {
      word: string;
      sentence: string;
      timestamp: string;
    }[];
    grammarData: {
      timestamp: string;
      mistake_type: string;
      correct_grammar: string;
      incorrect_grammar: string;
    }[];
    environData: {
      timestamp: string;
      element_type: string;
      duration_seconds: string;
      sentence: string;
    }[];
    pitchData: {
      time: number;
      pitch: number;
    }[];
  };
  feedback: {
    strengths: {
      timestamp: string;
      action: string;
      impact: string;
    }[];
    improvements: {
      timestamp: string;
      action: string;
      suggestion: string;
    }[];
    keyInsights: string[];
  };
  detailedFeedback: {
    Introduction: string;
    Conclusion: string;
    AnalysisQuality_commendations: string[];
    AnalysisQuality_recommendations: {
      point: string;
    };
    AnalysisQuality_score: number;
    Recommendations_commendations: {
      point_1: string;
      point_2: string;
    };
    Recommendations_recommendations: {
      point: string;
    };
    Recommendations_score: number;
    DeliveryTechnique_commendations: {
      point_1: string;
      point_2: string;
    };
    DeliveryTechnique_recommendations: {
      point: string;
    };
    DeliveryTechnique_score: number;
    OverallImpact_commendations: {
      point_1: string;
      point_2: string;
    };
    OverallImpact_recommendations: {
      point: string;
    };
    OverallImpact_score: number;
    OverallInsights: {
      type: string;
      title: string;
      description: string;
    }[];
  };
  onViewDetailedFeedback: (
    detailedFeedback: QuickFeedbackEvaluationsProps["detailedFeedback"],
  ) => void;
}

const QuickFeedbackEvaluations = ({
  evaluationResults,
  feedback,
  detailedFeedback,
  onViewDetailedFeedback,
}: QuickFeedbackEvaluationsProps) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";

  const [selectedTab, setSelectedTab] = useState("Key Insights");

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoContent, setInfoContent] = useState<
    (typeof infoModalContent)[keyof typeof infoModalContent] | null
  >(null);
  // State for managing tooltip visibility and content
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 }); // To position the tooltip

  const [showAllGrammarTypes, setShowAllGrammarTypes] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [animationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: showAllGrammarTypes ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showAllGrammarTypes]);

  const height = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  const [expandedWords, setExpandedWords] = useState<Record<string, boolean>>(
    {},
  );
  const toggleExpand = (word: string) => {
    setExpandedWords((prev) => ({
      ...prev,
      [word]: !prev[word],
    }));
  };

  const showTooltip = (content: string, event: any) => {
    setTooltipContent(content);
    setTooltipPosition({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
    setTooltipContent("");
  };

  const infoModalContent = {
    "Speech Patterns": {
      title: "Speech Patterns",
      description:
        "Speech patterns include common verbal habits like filler words, crutch phrases, and repeated words. While often unintentional, these can dilute the strength of your message.",
      bullets: [
        {
          icon: <PauseCircle size={18} color={colors.primary} />,
          text: "Reduce fillers by practicing with intentional pauses.",
        },
        {
          icon: <Mic size={18} color={colors.primary} />,
          text: "Record and review speeches to become aware of crutch patterns.",
        },
        {
          icon: <VolumeX size={18} color={colors.primary} />,
          text: "Replace with silence – it's more powerful than you think.",
        },
        {
          icon: <RefreshCcw size={18} color={colors.primary} />,
          text: "Avoid repeating words or phrases in quick succession (e.g., 'so so', 'I I') — it signals nervousness.",
        },
      ],
    },
    Grammar: {
      title: "Grammar Accuracy",
      description:
        "Grammar mistakes can distract your audience and reduce the effectiveness of your message.",
      bullets: [
        {
          icon: <ScrollText size={18} color={colors.primary} />,
          text: "Practice with scripts and grammar-checking tools.",
        },
        {
          icon: <Type size={18} color={colors.primary} />,
          text: "Keep sentence structures simple and clear.",
        },
        {
          icon: <Volume2 size={18} color={colors.primary} />,
          text: "Read out loud to catch errors in phrasing or tense.",
        },
      ],
    },
    Pauses: {
      title: "Understanding Pauses",
      description:
        "Pauses are essential for pacing and emotional impact. Not all pauses are bad!",
      sections: [
        {
          title: "Types of Pauses",
          content: [
            {
              icon: <Zap size={18} color={colors.primary} />,
              text: "Intentional – used for emphasis",
            },
            {
              icon: <Lightbulb size={18} color={colors.primary} />,
              text: "Reflective – to allow audience to absorb",
            },
            {
              icon: <Flame size={18} color={colors.primary} />,
              text: "Dramatic – creates suspense",
            },
            {
              icon: <AlertCircle size={18} color={colors.primary} />,
              text: "Unintentional – often from hesitation or lost thoughts",
            },
            {
              icon: <MessageCircleQuestion size={18} color={colors.primary} />,
              text: "Rhetorical – after a question to let it land",
            },
            {
              icon: <Smile size={18} color={colors.primary} />,
              text: "Emotional – natural in personal stories",
            },
          ],
        },
        {
          title: "Tip",
          content: [
            {
              icon: <Clock size={18} color={colors.primary} />,
              text: "Try recording your speech and note where unintentional pauses disrupt the flow.",
            },
          ],
        },
      ],
    },
    "Vocal Variety": {
      title: "Vocal Variety & Pitch Dynamics",
      description:
        "Using a varied tone keeps your speech engaging and expressive.",
      sections: [
        {
          title: "Pitch Deviation Guide:",
          content: [
            {
              icon: <TrendingDown size={18} color={colors.danger} />,
              text: "< 25: Flat, monotone",
            },
            {
              icon: <CheckCircle size={18} color={colors.success} />,
              text: "25-60: Balanced, conversational",
            },
            {
              icon: <TrendingUp size={18} color={colors.accent} />,
              text: "> 60: Expressive, dynamic",
            },
          ],
        },
        {
          title: "How It Helps",
          content: [
            {
              icon: <Megaphone size={18} color={colors.primary} />,
              text: "A dynamic voice conveys enthusiasm, emotion, and confidence — boosting listener engagement.",
            },
          ],
        },
      ],
    },
    Engagement: {
      title: "Audience Engagement",
      description:
        "The environment you speak in reflects both audience engagement and your control over distractions.",
      bullets: [
        {
          icon: <Smile size={18} color={colors.primary} />,
          text: "Laughter or Applause shows impact.",
        },
        {
          icon: <VolumeX size={18} color={colors.primary} />,
          text: "Silence can be intentional or signal disinterest.",
        },
        {
          icon: <Unplug size={18} color={colors.primary} />,
          text: "Background noise or cross-talk may affect clarity.",
        },
      ],
      sections: [
        {
          title: "Tip",
          content: [
            {
              icon: <Lightbulb size={18} color={colors.primary} />,
              text: "Try to acknowledge or incorporate spontaneous reactions gracefully.",
            },
          ],
        },
      ],
    },
  };

  const tabs = [
    "Key Insights",
    "Speech Patterns",
    "Grammar",
    "Pauses",
    "Vocal Variety",
    "Engagement",
  ];

  // Helper to get labels for LineChart to prevent overcrowding
  const getLineChartLabels = (pauses: { timestamp: string }[]) => {
    if (!pauses || pauses.length === 0) return [];
    if (pauses.length <= 6) return pauses.map((p) => p.timestamp); // Show all if few

    const labels = [];
    labels.push(pauses[0].timestamp); // First timestamp
    const step = Math.floor(pauses.length / 4); // Show approx 4-5 labels
    for (let i = step; i < pauses.length - 1; i += step) {
      labels.push(pauses[i].timestamp);
    }
    labels.push(pauses[pauses.length - 1].timestamp); // Last timestamp
    return [...new Set(labels)]; // Remove duplicates
  };

  const handleInfoPress = (tabName: string) => {
    setInfoContent(infoModalContent[tabName] || "No information available.");
    setShowInfoModal(true);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Key Insights":
        return (
          <View>
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View
                  className="rounded-full p-2 mr-3"
                  style={{
                    backgroundColor: theme === "dark" ? "#fbbf24" : "#fef3c7",
                  }}
                >
                  <Lightbulb
                    size={20}
                    color={theme === "dark" ? "#000" : "#d97706"}
                  />
                </View>
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Key Insights
                </Text>
              </View>
            </View>

            <View className="space-y-4">
              {feedback.keyInsights.map((insight, index) => (
                <View
                  key={index}
                  className="rounded-2xl p-2 mb-3"
                  style={{
                    backgroundColor: theme === "dark" ? "#0d0d0dff" : "#f8fafc",
                  }}
                >
                  <View className="flex-row items-start">
                    <View
                      className="rounded-full p-2 mr-3 mt-1"
                      style={{
                        backgroundColor:
                          theme === "dark" ? "#fbbf24" : "#fef3c7",
                      }}
                    >
                      <Star
                        size={14}
                        color={theme === "dark" ? "#000" : "#d97706"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="leading-6 font-medium"
                        style={{ color: colors.text }}
                      >
                        {insight}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case "Pauses":
        //pause
        const pausesData = evaluationResults.pausesData || [];

        // Calculate summary statistics
        const totalPauses = pausesData.length;
        const totalPauseDuration = pausesData.reduce(
          (sum, p) => sum + p.duration_seconds,
          0,
        );
        const avgPauseDuration =
          totalPauses > 0
            ? (totalPauseDuration / totalPauses).toFixed(2)
            : "0.00";

        // Prepare data for Bar Chart (Pause Types Distribution - Count)
        const aggregatedPauseTypes = pausesData.reduce(
          (acc, pause) => {
            acc[pause.pause_type] = (acc[pause.pause_type] || 0) + 1; // Count occurrences
            return acc;
          },
          {} as Record<string, number>,
        );

        const barChartLabels = Object.keys(aggregatedPauseTypes);
        const barChartDataValues = Object.values(aggregatedPauseTypes);

        const barChartData = {
          labels: barChartLabels,
          datasets: [
            {
              data: barChartDataValues,
              colors: barChartLabels.map((_, i) => (opacity = 1) => {
                const hue = (i * 137.508) % 360;
                return `hsla(${hue}, 70%, ${theme === "dark" ? "60%" : "50%"}, ${opacity})`;
              }),
            },
          ],
        };

        // Chart configuration for both charts
        const chartConfig = {
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          labelColor: (opacity = 1) => colors.textSecondary,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: colors.primary,
          },
          axisLabelColor: colors.textSecondary,
          axisLineColor: theme === "dark" ? colors.borderDark : colors.border,
          gridLineColor: theme === "dark" ? colors.borderDark : colors.border,
        };

        return (
          <View>
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View
                  className="rounded-full p-2 mr-3"
                  style={{
                    backgroundColor: theme === "dark" ? "#1e40af" : "#dbeafe",
                  }}
                >
                  <PauseCircle
                    size={20}
                    color={theme === "dark" ? "#fff" : "#1d4ed8"}
                  />
                </View>
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Pauses Analysis
                </Text>
              </View>

              <TouchableOpacity onPress={() => handleInfoPress("Pauses")}>
                <View
                  className="rounded-full p-2"
                  style={{
                    backgroundColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                  }}
                >
                  <Info size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>

            {pausesData.length === 0 ? (
              <View className="items-center py-8">
                <View
                  className="rounded-full p-4 mb-4"
                  style={{
                    backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6",
                  }}
                >
                  <PauseCircle size={32} color={colors.textSecondary} />
                </View>
                <Text
                  className="text-lg font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  No Pause Data
                </Text>
                <Text
                  className="text-center"
                  style={{ color: colors.textSecondary }}
                >
                  No pause data available for this speech.
                </Text>
              </View>
            ) : (
              <>
                {/* Statistics Cards */}
                <View className="flex-row justify-between mb-6">
                  <View
                    className="flex-1 rounded-2xl p-4 mr-2"
                    style={{
                      backgroundColor: theme === "dark" ? "#1e40af" : "#eff6ff",
                    }}
                  >
                    <Text
                      className="text-lg font-bold mb-1"
                      style={{
                        color: theme === "dark" ? "#60a5fa" : "#1d4ed8",
                      }}
                    >
                      {totalPauses}
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme === "dark" ? "#93c5fd" : "#3b82f6",
                      }}
                    >
                      Total Pauses
                    </Text>
                  </View>

                  <View
                    className="flex-1 rounded-2xl p-4 mx-1"
                    style={{
                      backgroundColor: theme === "dark" ? "#047857" : "#ecfdf5",
                    }}
                  >
                    <Text
                      className="text-lg font-bold mb-1"
                      style={{
                        color: theme === "dark" ? "#6ee7b7" : "#047857",
                      }}
                    >
                      {avgPauseDuration}s
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme === "dark" ? "#a7f3d0" : "#065f46",
                      }}
                    >
                      Avg Duration
                    </Text>
                  </View>

                  <View
                    className="flex-1 rounded-2xl p-4 ml-2"
                    style={{
                      backgroundColor: theme === "dark" ? "#dc2626" : "#fef2f2",
                    }}
                  >
                    <Text
                      className="text-lg font-bold mb-1"
                      style={{
                        color: theme === "dark" ? "#f87171" : "#dc2626",
                      }}
                    >
                      {evaluationResults.avgPause}
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme === "dark" ? "#fca5a5" : "#991b1b",
                      }}
                    >
                      Per Minute
                    </Text>
                  </View>
                </View>

                {/* Bar Chart: Pause Types Distribution */}
                {barChartLabels.length > 0 && (
                  <View>
                    <Text
                      className="text-lg font-bold mb-3"
                      style={{ color: colors.text }}
                    >
                      Pause Types Breakdown
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <BarChart
                        data={barChartData}
                        width={Math.max(
                          screenWidth - 48,
                          barChartLabels.length * 100,
                        )} // Dynamic width for bars
                        height={200}
                        chartConfig={{
                          ...chartConfig,
                          color: (opacity = 1) =>
                            `rgba(16, 185, 129, ${opacity})`,
                          backgroundGradientFrom: colors.card,
                          backgroundGradientTo: colors.card,
                        }}
                        style={{
                          marginVertical: 8,
                          borderRadius: 16,
                        }}
                        fromZero // Start Y-axis from zero
                        showValuesOnTopOfBars // Show values on top of bars
                      />
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </View>
        );

      case "Vocal Variety":
        //pitch
        const pitchData = evaluationResults.pitchData || [];

        const labelInterval = 10; // in seconds
        const shownLabels = new Set();

        const pitchLabels = pitchData.map((p) => {
          const roundedTime = Math.round(p.time);

          if (
            roundedTime % labelInterval === 0 &&
            !shownLabels.has(roundedTime)
          ) {
            shownLabels.add(roundedTime);
            return `${roundedTime}s`;
          } else {
            return "";
          }
        });

        const pitchValues = pitchData.map((p) => p.pitch); // just the pitch in Hz

        // Chart configuration for both charts
        const chartConfig2 = {
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 1,
          color: (opacity = 1) => colors.primary, // Default color for lines/bars
          labelColor: (opacity = 1) => colors.textSecondary,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6", // Radius of dots
            strokeWidth: "2", // Stroke width of dots
            stroke: colors.primary, // Stroke color of dots
          },
          // Custom axis styles
          axisLabelColor: colors.textSecondary,
          axisLineColor: colors.border,
          gridLineColor: colors.border,
        };

        // Calculate pitch stats
        const validPitches = pitchValues.filter((p) => p > 0); // sanity filter
        const hasValidPitches = validPitches.length > 0;
        const minPitch = hasValidPitches ? Math.min(...validPitches) : 0;
        const maxPitch = hasValidPitches ? Math.max(...validPitches) : 0;
        const meanPitch = hasValidPitches
          ? validPitches.reduce((a, b) => a + b, 0) / validPitches.length
          : 0;
        const stdPitch = hasValidPitches
          ? Math.sqrt(
              validPitches.reduce(
                (acc, p) => acc + Math.pow(p - meanPitch, 2),
                0,
              ) / validPitches.length,
            )
          : 0;

        // Format values
        const pitchRangeText = `${minPitch.toFixed(1)} – ${maxPitch.toFixed(1)}`;
        const stdPitchText = `${stdPitch.toFixed(1)}`;

        let vocalLabel = "";
        let labelColor = "";

        if (stdPitch < 25) {
          vocalLabel = "😐 Flat";
          labelColor = theme === "dark" ? "#f87171" : "#b91c1c"; // red-ish
        } else if (stdPitch < 60) {
          vocalLabel = "🙂 Balanced";
          labelColor = theme === "dark" ? "#fbbf24" : "#b45309"; // amber-ish
        } else {
          vocalLabel = "🎭 Expressive";
          labelColor = theme === "dark" ? "#34d399" : "#047857"; // green-ish
        }

        return (
          <View>
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View
                  className="rounded-full p-2 mr-3"
                  style={{
                    backgroundColor: theme === "dark" ? "#3b82f6" : "#dbeafe",
                  }}
                >
                  <Star
                    size={20}
                    color={theme === "dark" ? "#fff" : "#1d4ed8"}
                  />
                </View>
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Vocal Variety
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleInfoPress("Vocal Variety")}
              >
                <View
                  className="rounded-full p-2"
                  style={{
                    backgroundColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                  }}
                >
                  <Info size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>

            {pitchData.length === 0 ? (
              <View className="items-center py-8">
                <View
                  className="rounded-full p-4 mb-4"
                  style={{
                    backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6",
                  }}
                >
                  <PauseCircle size={32} color={colors.textSecondary} />
                </View>
                <Text
                  className="text-lg font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  No Pitch Data
                </Text>
                <Text
                  className="text-center"
                  style={{ color: colors.textSecondary }}
                >
                  No pitch data available for this speech.
                </Text>
              </View>
            ) : (
              <>
                {/* Statistics Cards */}
                <View className="flex-row justify-between mb-6">
                  <View
                    className="flex-1 rounded-2xl p-4 mr-2"
                    style={{
                      backgroundColor: theme === "dark" ? "#1e40af" : "#eff6ff",
                    }}
                  >
                    <Text
                      className="text-lg font-bold mb-1"
                      style={{
                        color: theme === "dark" ? "#60a5fa" : "#1d4ed8",
                      }}
                    >
                      {pitchRangeText}
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme === "dark" ? "#93c5fd" : "#3730a3",
                      }}
                    >
                      Pitch Range(Hz)
                    </Text>
                  </View>

                  <View
                    className="flex-1 rounded-2xl p-4 mx-1"
                    style={{
                      backgroundColor: theme === "dark" ? "#059669" : "#ecfdf5",
                    }}
                  >
                    <Text
                      className="text-lg font-bold mb-1"
                      style={{
                        color: theme === "dark" ? "#34d399" : "#047857",
                      }}
                    >
                      {stdPitchText}
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme === "dark" ? "#6ee7b7" : "#065f46",
                      }}
                    >
                      Pitch Deviation
                    </Text>

                    <Text
                      className="text-sm font-semibold mt-2"
                      style={{ color: labelColor }}
                    >
                      {vocalLabel}
                    </Text>
                  </View>
                </View>

                {/* Line Chart: Pause Duration Over Time */}
                <View className="mb-6">
                  <Text
                    className="text-lg font-bold mb-3"
                    style={{ color: colors.text }}
                  >
                    Pitch Over Time (Hz)
                  </Text>
                  <View className="flex-row" style={{ marginLeft: -20 }}>
                    {/* Fake Y-axis */}
                    <View
                      style={{ width: 40, justifyContent: "space-between" }}
                    >
                      {[...Array(5)].map((_, i) => {
                        const yVal = Math.round(
                          maxPitch - (i * (maxPitch - minPitch)) / 4,
                        );
                        return (
                          <Text
                            key={i}
                            style={{
                              color: colors.textSecondary,
                              fontSize: 12,
                              height: 40,
                              textAlign: "right",
                            }}
                          >
                            {yVal}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Scrollable Chart */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={{ marginLeft: -55 }}>
                        <LineChart
                          data={{
                            labels: pitchLabels,
                            datasets: [
                              {
                                data: pitchData.map((p) => p.pitch),
                                color: (opacity = 1) =>
                                  `rgba(59,130,246,${opacity})`, // blue pitch line
                                strokeWidth: 2,
                              },
                              {
                                data: pitchData.map(() => meanPitch), // flat line
                                color: (opacity = 1) =>
                                  `rgba(234, 179, 8, ${opacity})`, // yellow
                                strokeWidth: 2,
                                withDots: false,
                              },
                            ],
                          }}
                          width={Math.max(
                            screenWidth - 48 + 40,
                            pitchData.length * 12,
                          )} // add back what you clipped
                          height={200}
                          chartConfig={{
                            ...chartConfig2,
                            color: (opacity = 1) =>
                              `rgba(59,130,246,${opacity})`,
                            propsForDots: {
                              r: "2",
                              strokeWidth: "1",
                              stroke: `rgba(59,130,246,1)`,
                            },
                            formatYLabel: () => "", // hide text
                          }}
                          bezier
                          style={{
                            marginVertical: 8,
                            borderRadius: 16,
                          }}
                        />
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </>
            )}
          </View>
        );

      case "Speech Patterns":
        // Merge data
        const fillerWords = (evaluationResults.fillerData ?? []).map(
          (item) => item.word,
        );
        const crutchWords = (evaluationResults.crutchData ?? []).map(
          (item) => item.phrase,
        );
        const repeatedPhrases = (evaluationResults.repeatedPhrases ?? []).map(
          (item) => item.word,
        );

        // Count occurrences
        const countOccurrences = (arr: string[]) =>
          arr.reduce((acc: Record<string, number>, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
          }, {});

        const fillerCounts = countOccurrences(fillerWords);
        const crutchCounts = countOccurrences(crutchWords);
        const repeatCounts = countOccurrences(repeatedPhrases);

        // Assign colors
        const fillerColorBase = "#60a5fa"; // Light Blue
        const crutchColorBase = "#c084fc"; // Light Purple
        const repeatColorBase = "#fabbecff"; // Light Pink

        const lighten = (hex: string, factor: number) => {
          const f = parseInt(hex.slice(1), 16);
          const R = Math.min(255, Math.floor((f >> 16) + factor * 255));
          const G = Math.min(
            255,
            Math.floor(((f >> 8) & 0x00ff) + factor * 255),
          );
          const B = Math.min(255, Math.floor((f & 0x0000ff) + factor * 255));
          return `rgb(${R}, ${G}, ${B})`;
        };

        let pieData: {
          name: string;
          wordType: "filler" | "crutch";
          count: number;
          color: string;
          legendFontColor: string;
          legendFontSize: number;
        }[] = [];

        Object.entries(fillerCounts).forEach(([word, count], idx) => {
          pieData.push({
            name: word,
            wordType: "filler",
            count,
            color: lighten(fillerColorBase, idx * 0.1),
            legendFontColor: colors.text,
            legendFontSize: 12,
          });
        });

        Object.entries(crutchCounts).forEach(([phrase, count], idx) => {
          pieData.push({
            name: phrase,
            wordType: "crutch",
            count,
            color: lighten(crutchColorBase, idx * 0.1),
            legendFontColor: colors.text,
            legendFontSize: 12,
          });
        });

        const totalFillers = Object.values(fillerCounts).reduce(
          (a, b) => a + b,
          0,
        );
        const totalCrutch = Object.values(crutchCounts).reduce(
          (a, b) => a + b,
          0,
        );
        const totalRepeat = Object.values(repeatCounts).reduce(
          (a, b) => a + b,
          0,
        );

        return (
          <View>
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View
                  className="rounded-full p-2 mr-3"
                  style={{
                    backgroundColor: theme === "dark" ? "#581c87" : "#ede9fe",
                  }}
                >
                  <Mic
                    size={20}
                    color={theme === "dark" ? "#fff" : "#7c3aed"}
                  />
                </View>
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Speech Patterns
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleInfoPress("Speech Patterns")}
              >
                <View
                  className="rounded-full p-2"
                  style={{
                    backgroundColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                  }}
                >
                  <Info size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>

            {pieData.length === 0 ? (
              <View className="items-center py-8">
                <View
                  className="rounded-full p-4 mb-4"
                  style={{
                    backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6",
                  }}
                >
                  <Mic size={32} color={colors.textSecondary} />
                </View>
                <Text
                  className="text-lg font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  Clean Speech!
                </Text>
                <Text
                  className="text-center"
                  style={{ color: colors.textSecondary }}
                >
                  No filler or crutch words detected.
                </Text>
              </View>
            ) : (
              <>
                {/* Word Lists */}
                <View className="space-y-4">
                  {Object.keys(fillerCounts).length > 0 && (
                    <View
                      className="rounded-2xl p-4 mb-2"
                      style={{
                        backgroundColor:
                          theme === "dark" ? "#1e3a8a" : "#eff6ff",
                      }}
                    >
                      <Text
                        className="text-base font-bold mb-3"
                        style={{
                          color: theme === "dark" ? "#60a5fa" : "#1d4ed8",
                        }}
                      >
                        🔵 Filler Words ({totalFillers})
                      </Text>
                      <View className="flex-row flex-wrap">
                        {Object.entries(fillerCounts).map(([word, count]) => {
                          const matchingEntries =
                            evaluationResults.fillerData.filter(
                              (item) => item.word === word,
                            );
                          const isExpanded = expandedWords[word];

                          return (
                            <View key={word} className="mb-2 max-w-full">
                              {/* Word chip */}
                              <TouchableOpacity
                                onPress={() => toggleExpand(word)}
                                className="rounded-full px-3 py-1 mr-2 mb-1 flex-row items-center"
                                style={{
                                  backgroundColor:
                                    theme === "dark" ? "#3b82f6" : "#dbeafe",
                                  maxWidth: "100%",
                                  flexWrap: "wrap",
                                }}
                              >
                                <Text
                                  className="text-sm font-medium mr-2 flex-shrink"
                                  style={{
                                    color:
                                      theme === "dark" ? "#fff" : "#1e40af",
                                  }}
                                >
                                  {word} ({count})
                                </Text>
                                {isExpanded ? (
                                  <ChevronUp
                                    size={14}
                                    color={
                                      theme === "dark" ? "#fff" : "#1e40af"
                                    }
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    color={
                                      theme === "dark" ? "#fff" : "#1e40af"
                                    }
                                  />
                                )}
                              </TouchableOpacity>

                              {/* Expanded detail */}
                              {isExpanded && (
                                <View
                                  className="ml-4 mt-1 space-y-1 pr-2"
                                  style={{ maxWidth: "95%" }}
                                >
                                  {matchingEntries.map((entry, idx) => (
                                    <Text
                                      key={idx}
                                      style={{
                                        color: colors.textSecondary,
                                        fontSize: 12,
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      ⏱ {entry.timestamp}: {entry.sentence}
                                    </Text>
                                  ))}
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {Object.keys(crutchCounts).length > 0 && (
                    <View
                      className="rounded-2xl p-4 mb-2"
                      style={{
                        backgroundColor:
                          theme === "dark" ? "#581c87" : "#faf5ff",
                      }}
                    >
                      <Text
                        className="text-base font-bold mb-3"
                        style={{
                          color: theme === "dark" ? "#c084fc" : "#7c3aed",
                        }}
                      >
                        🟣 Crutch Phrases ({totalCrutch})
                      </Text>
                      <View className="flex-row flex-wrap">
                        {Object.entries(crutchCounts).map(([phrase, count]) => {
                          const matchingEntries =
                            evaluationResults.crutchData.filter(
                              (item) => item.phrase === phrase,
                            );
                          const isExpanded = expandedWords[phrase];

                          return (
                            <View key={phrase} className="mb-2 max-w-full">
                              {/* Phrase chip */}
                              <TouchableOpacity
                                onPress={() => toggleExpand(phrase)}
                                className="rounded-full px-3 py-1 mr-2 mb-1 flex-row items-center"
                                style={{
                                  backgroundColor:
                                    theme === "dark" ? "#8b5cf6" : "#ede9fe",
                                  maxWidth: "100%",
                                  flexWrap: "wrap",
                                }}
                              >
                                <Text
                                  className="text-sm font-medium mr-2"
                                  style={{
                                    color:
                                      theme === "dark" ? "#fff" : "#6b21a8",
                                  }}
                                >
                                  {phrase} ({count})
                                </Text>
                                {isExpanded ? (
                                  <ChevronUp
                                    size={14}
                                    color={
                                      theme === "dark" ? "#fff" : "#6b21a8"
                                    }
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    color={
                                      theme === "dark" ? "#fff" : "#6b21a8"
                                    }
                                  />
                                )}
                              </TouchableOpacity>

                              {/* Expanded detail */}
                              {isExpanded && (
                                <View
                                  className="ml-4 mt-1 space-y-1 pr-2"
                                  style={{ maxWidth: "95%" }}
                                >
                                  {matchingEntries.map((entry, idx) => (
                                    <Text
                                      key={idx}
                                      style={{
                                        color: colors.textSecondary,
                                        fontSize: 12,
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      ⏱ {entry.timestamp}: {entry.sentence}
                                    </Text>
                                  ))}
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {Object.keys(repeatCounts).length > 0 && (
                    <View
                      className="rounded-2xl p-4 mb-2"
                      style={{
                        backgroundColor:
                          theme === "dark" ? "#1e3a8a" : "#eff6ff",
                      }}
                    >
                      <Text
                        className="text-base font-bold mb-3"
                        style={{
                          color: theme === "dark" ? "#60a5fa" : "#1d4ed8",
                        }}
                      >
                        🔵 Repeated Phrases ({totalRepeat})
                      </Text>
                      <View className="flex-row flex-wrap">
                        {Object.entries(repeatCounts).map(([word, count]) => {
                          const matchingEntries =
                            evaluationResults.repeatedPhrases.filter(
                              (item) => item.word === word,
                            );
                          const isExpanded = expandedWords[word];

                          return (
                            <View key={word} className="mb-2 max-w-full">
                              {/* Word chip */}
                              <TouchableOpacity
                                onPress={() => toggleExpand(word)}
                                className="rounded-full px-3 py-1 mr-2 mb-1 flex-row items-center"
                                style={{
                                  backgroundColor:
                                    theme === "dark" ? "#3b82f6" : "#dbeafe",
                                  maxWidth: "100%",
                                  flexWrap: "wrap",
                                }}
                              >
                                <Text
                                  className="text-sm font-medium mr-2 flex-shrink"
                                  style={{
                                    color:
                                      theme === "dark" ? "#fff" : "#1e40af",
                                  }}
                                >
                                  {word} ({count})
                                </Text>
                                {isExpanded ? (
                                  <ChevronUp
                                    size={14}
                                    color={
                                      theme === "dark" ? "#fff" : "#1e40af"
                                    }
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    color={
                                      theme === "dark" ? "#fff" : "#1e40af"
                                    }
                                  />
                                )}
                              </TouchableOpacity>

                              {/* Expanded detail */}
                              {isExpanded && (
                                <View
                                  className="ml-4 mt-1 space-y-1 pr-2"
                                  style={{ maxWidth: "95%" }}
                                >
                                  {matchingEntries.map((entry, idx) => (
                                    <Text
                                      key={idx}
                                      style={{
                                        color: colors.textSecondary,
                                        fontSize: 12,
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      ⏱ {entry.timestamp}: {entry.sentence}
                                    </Text>
                                  ))}
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        );

      case "Grammar":
        const grammarMistakes = evaluationResults.grammarData || [];

        const formatMistakeType = (type: string): string => {
          return type
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        };

        // Grouping logic is still useful for total counts, but not for direct rendering order here
        const groupedMistakes: Record<string, typeof grammarMistakes> = {};
        grammarMistakes.forEach((mistake) => {
          if (!groupedMistakes[mistake.mistake_type]) {
            groupedMistakes[mistake.mistake_type] = [];
          }
          groupedMistakes[mistake.mistake_type].push(mistake);
        });

        const totalMistakes = grammarMistakes.length;
        const mistakeTypes = Object.keys(groupedMistakes).length;

        const renderMistakeTypeCard = (
          type: string,
          mistakes: typeof grammarMistakes,
        ) => (
          <>
            <Text
              className="text-base font-bold mb-3"
              style={{ color: colors.text }}
            >
              {formatMistakeType(type)}
            </Text>

            {mistakes.map((mistake, index) => (
              <View
                key={index}
                className="rounded-2xl p-2 mb-4"
                style={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#f9fafb",
                }}
              >
                <View style={{ marginRight: 20 }}>
                  <View className="mb-3 flex-row items-start">
                    <X
                      size={16}
                      color={colors.error}
                      style={{ marginRight: 8, marginTop: 2 }}
                    />
                    <Text
                      className="font-semibold text-sm flex-1"
                      style={{ color: colors.error }}
                      numberOfLines={0}
                    >
                      {mistake.incorrect_grammar}
                    </Text>
                  </View>

                  <View className="mb-3 flex-row items-start">
                    <Check
                      size={16}
                      color={colors.success}
                      style={{ marginRight: 8, marginTop: 2 }}
                    />
                    <Text
                      className="font-semibold text-sm flex-1"
                      style={{
                        color: theme === "dark" ? "#6ee7b7" : "#047857",
                      }}
                      numberOfLines={0}
                    >
                      {mistake.correct_grammar}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        );

        return (
          <View>
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View
                  className="rounded-full p-2 mr-3"
                  style={{
                    backgroundColor: theme === "dark" ? "#dc2626" : "#fef2f2",
                  }}
                >
                  <Type
                    size={20}
                    color={theme === "dark" ? "#fff" : "#dc2626"}
                  />
                </View>
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Grammar Check
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleInfoPress("Grammar")}>
                <View
                  className="rounded-full p-2"
                  style={{
                    backgroundColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                  }}
                >
                  <Info size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>

            {totalMistakes === 0 ? ( // Use totalMistakes for the condition
              <View className="items-center py-8">
                <View
                  className="rounded-full p-4 mb-4"
                  style={{
                    backgroundColor: theme === "dark" ? "#065f46" : "#ecfdf5",
                  }}
                >
                  <CheckCircle size={32} color={colors.success} />
                </View>
                <Text
                  className="text-lg font-medium mb-2"
                  style={{ color: colors.success }}
                >
                  Perfect Grammar!
                </Text>
                <Text
                  className="text-center"
                  style={{ color: colors.textSecondary }}
                >
                  No grammar mistakes were found in this speech.
                </Text>
              </View>
            ) : (
              <>
                {/* Summary Stats */}
                <View className="flex-row justify-between mb-6">
                  <View
                    className="flex-1 rounded-2xl p-4 mr-2"
                    style={{
                      backgroundColor: theme === "dark" ? "#7f1d1d" : "#fef2f2",
                    }}
                  >
                    <Text
                      className="text-2xl font-bold mb-1"
                      style={{
                        color: theme === "dark" ? "#f87171" : "#dc2626",
                      }}
                    >
                      {totalMistakes}
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme === "dark" ? "#fca5a5" : "#991b1b",
                      }}
                    >
                      Total Issues
                    </Text>
                  </View>

                  <View
                    className="flex-1 rounded-2xl p-4 ml-2"
                    style={{
                      backgroundColor: theme === "dark" ? "#92400e" : "#fef3c7",
                    }}
                  >
                    <Text
                      className="text-2xl font-bold mb-1"
                      style={{
                        color: theme === "dark" ? "#fbbf24" : "#d97706",
                      }}
                    >
                      {mistakeTypes}
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme === "dark" ? "#fcd34d" : "#92400e",
                      }}
                    >
                      Categories
                    </Text>
                  </View>
                </View>

                {/* Grammar Issues as Cards */}
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                  {/* First 3 types (always visible) */}
                  {Object.entries(groupedMistakes)
                    .slice(0, 3)
                    .map(([type, mistakes], groupIndex) => (
                      <View key={type} className="mb-2">
                        {renderMistakeTypeCard(type, mistakes)}
                      </View>
                    ))}

                  {/* Expandable section */}
                  {Object.entries(groupedMistakes).length > 3 && (
                    <>
                      <Animated.View style={{ height, overflow: "hidden" }}>
                        <View
                          onLayout={(e) =>
                            setContentHeight(e.nativeEvent.layout.height)
                          }
                        >
                          {Object.entries(groupedMistakes)
                            .slice(3)
                            .map(([type, mistakes]) => (
                              <View key={type} className="mb-2">
                                {renderMistakeTypeCard(type, mistakes)}
                              </View>
                            ))}
                        </View>
                      </Animated.View>

                      <TouchableOpacity
                        onPress={() => setShowAllGrammarTypes((prev) => !prev)}
                        className="self-center px-4 py-2 rounded-full"
                        style={{
                          backgroundColor:
                            theme === "dark" ? "#374151" : "#f3f4f6",
                        }}
                        activeOpacity={0.8}
                      >
                        <View className="flex-row items-center">
                          <Text
                            className="text-sm font-semibold mr-2"
                            style={{
                              color: theme === "dark" ? "#e5e7eb" : "#374151",
                            }}
                          >
                            {showAllGrammarTypes ? "Show Less" : "View All"}
                          </Text>
                          {showAllGrammarTypes ? (
                            <ChevronUp
                              size={18}
                              color={theme === "dark" ? "#e5e7eb" : "#6b7280"}
                            />
                          ) : (
                            <ChevronDown
                              size={18}
                              color={theme === "dark" ? "#e5e7eb" : "#6b7280"}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    </>
                  )}
                </ScrollView>
              </>
            )}

            {/* Tooltip Modal - Ensure this is outside the conditional rendering and at the end */}
            {tooltipVisible && ( // Only render modal if visible to avoid unnecessary overhead
              <Modal
                transparent={true}
                visible={tooltipVisible}
                onRequestClose={hideTooltip}
              >
                <TouchableOpacity
                  style={StyleSheet.absoluteFillObject} // Occupy entire screen for dismissing
                  onPress={hideTooltip}
                  activeOpacity={1} // Prevents opacity change on press
                >
                  <View
                    style={[
                      styles.tooltipContainer,
                      {
                        // Adjust these values based on actual visual testing for optimal placement
                        top: tooltipPosition.y + 10,
                        // Dynamically adjust left to attempt to center the tooltip over the touch point
                        // This assumes styles.tooltipContainer.maxWidth is 200 (200 / 2 = 100)
                        left:
                          tooltipPosition.x -
                          (styles.tooltipContainer.maxWidth / 2 || 100),
                        backgroundColor:
                          theme === "dark" ? "#334155" : "#fefefe",
                        borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      style={{ color: colors.text, fontSize: 13, padding: 8 }}
                    >
                      {tooltipContent}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Modal>
            )}
          </View>
        );

      case "Engagement":
        const expectedElements = [
          "applause",
          "laughter",
          "background_noise",
          "pure_silence",
          "cross_talk",
        ];

        const elementCounts: Record<string, number> = {};
        const elementDurations: Record<string, number> = {};

        expectedElements.forEach((el) => {
          elementCounts[el] = 0;
          elementDurations[el] = 0;
        });

        const environDataRaw = evaluationResults.environData;
        const environData = Array.isArray(environDataRaw)
          ? environDataRaw
          : environDataRaw
            ? [environDataRaw]
            : [];

        // Group sentences by element type
        const elementSentences: Record<
          string,
          { timestamp: string; sentence: string }[]
        > = {};

        environData.forEach((item) => {
          const rawKey = item.element_type || "";
          const key = rawKey.trim().toLowerCase().replace(/[\s-]/g, "_");

          if (!elementSentences[key]) {
            elementSentences[key] = [];
          }

          elementSentences[key].push({
            timestamp: item.timestamp,
            sentence: item.sentence,
          });
        });

        // Override with actual data
        environData.forEach((item) => {
          const rawKey = item.element_type || "";
          const key = rawKey.trim().toLowerCase().replace(/[\s-]/g, "_");

          const duration = parseFloat(item.duration_seconds || "0");

          if (expectedElements.includes(key)) {
            elementCounts[key] += 1;
            elementDurations[key] += duration;
          }
        });

        const environLabels = expectedElements; // All 5 labels
        const elementCountValues = environLabels.map(
          (el) => elementCounts[el] || 0,
        );

        const totalEnvironDuration = Object.values(elementDurations).reduce(
          (a, b) => a + b,
          0,
        );

        // Step 1: Combine labels and values into one array
        const combined = environLabels.map((label, index) => ({
          label,
          count: elementCountValues[index],
        }));

        // Step 2: Sort by count descending
        const sorted = combined.sort((a, b) => b.count - a.count);

        // Step 3: Rebuild chart data from sorted array
        const barChartData2 = {
          labels: sorted.map((item) =>
            item.label
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
          ),
          datasets: [
            {
              data: sorted.map((item) => item.count),
              colors: sorted.map((_, i) => (opacity = 1) => {
                const hue = (i * 137.5) % 360;
                return `hsla(${hue}, 70%, 50%, ${opacity})`;
              }),
            },
          ],
        };

        const maxCount = Math.max(...barChartData2.datasets[0].data);
        const yAxisMax = Math.ceil(maxCount * 1.2); // add buffer so bars don’t touch top

        return (
          <View>
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View
                  className="rounded-full p-2 mr-3"
                  style={{
                    backgroundColor: theme === "dark" ? "#f59e0b" : "#fef3c7",
                  }}
                >
                  <Volume2
                    size={20}
                    color={theme === "dark" ? "#000" : "#d97706"}
                  />
                </View>
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Engagement
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleInfoPress("Engagement")}>
                <View
                  className="rounded-full p-2"
                  style={{
                    backgroundColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                  }}
                >
                  <Info size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>

            {environLabels.length === 0 ? (
              <View className="items-center py-8">
                <View
                  className="rounded-full p-4 mb-4"
                  style={{
                    backgroundColor: theme === "dark" ? "#065f46" : "#ecfdf5",
                  }}
                >
                  <CheckCircle size={32} color={colors.success} />
                </View>
                <Text
                  className="text-lg font-medium mb-2"
                  style={{ color: colors.success }}
                >
                  No Engagement
                </Text>
                <Text
                  className="text-center"
                  style={{ color: colors.textSecondary }}
                >
                  No audience engagement detected.
                </Text>
              </View>
            ) : (
              <>
                {/* 📊 Bar Chart */}
                <View className="mb-6">
                  <Text
                    className="text-lg font-bold mb-3"
                    style={{ color: colors.text }}
                  >
                    Frequency by Element Type
                  </Text>
                  <View style={{ marginLeft: -23 }}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <BarChart
                        data={barChartData2}
                        width={Math.max(
                          screenWidth - 48,
                          environLabels.length * 100,
                        )}
                        height={200}
                        fromZero
                        segments={3} // or 4 if your data is higher
                        formatYLabel={(value) => {
                          const num = Number(value);
                          return Number.isInteger(num) ? `${num}` : ""; // only show whole numbers
                        }}
                        chartConfig={{
                          backgroundColor: colors.card,
                          backgroundGradientFrom: colors.card,
                          backgroundGradientTo: colors.card,
                          color: (opacity = 1) =>
                            `rgba(245, 158, 11, ${opacity})`,
                          labelColor: (opacity = 1) => colors.textSecondary,
                          style: { borderRadius: 16 },
                          propsForBackgroundLines: {
                            stroke: colors.border,
                          },
                          decimalPlaces: 0,
                        }}
                        style={{
                          marginVertical: 8,
                          borderRadius: 16,
                        }}
                      />
                    </ScrollView>
                  </View>
                </View>

                {/* 🧾 Element List with durations */}
                <View className="space-y-3">
                  <Text
                    className="text-lg font-bold mb-3"
                    style={{ color: colors.text }}
                  >
                    Detected Elements
                  </Text>
                  {Object.entries(elementDurations)
                    .filter(([, duration]) => duration > 0)
                    .map(([element, duration], index) => {
                      const percentage = (
                        (duration / totalEnvironDuration) *
                        100
                      ).toFixed(1);
                      return (
                        <View
                          key={element}
                          className="rounded-2xl p-4 mb-2"
                          style={{
                            backgroundColor:
                              theme === "dark" ? "#1f2937" : "#f9fafb",
                            borderLeftWidth: 4,
                            borderLeftColor: `hsla(${(index * 137.5) % 360}, 70%, 50%, 1)`,
                          }}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <Text
                                className="text-base font-bold mb-1"
                                style={{ color: colors.text }}
                              >
                                {element.charAt(0).toUpperCase() +
                                  element.slice(1).replace(/_/g, " ")}
                              </Text>
                              <Text
                                className="text-sm mb-2"
                                style={{ color: colors.textSecondary }}
                              >
                                {duration.toFixed(1)} seconds
                              </Text>

                              {/* Timestamped Sentences */}
                              {elementSentences[element]?.map((entry, idx) => (
                                <Text
                                  key={idx}
                                  className="text-sm"
                                  style={{ color: colors.text }}
                                >
                                  <Text style={{ fontWeight: "bold" }}>
                                    [{entry.timestamp}]
                                  </Text>{" "}
                                  {entry.sentence}
                                </Text>
                              ))}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                </View>
              </>
            )}
          </View>
        );
    }
  };

  const getScoreStyle = (score: number, theme: "light" | "dark") => {
    if (score >= 90) {
      return {
        bg: theme === "dark" ? "#14532d" : "#dcfce7",
        scoreColor: theme === "dark" ? "#4ade80" : "#10b981",
        text: "#ffffff",
        msg: "Excellent Performance!",
      };
    }
    if (score >= 80) {
      return {
        bg: theme === "dark" ? "#1e3a8a" : "#dbeafe",
        scoreColor: theme === "dark" ? "#60a5fa" : "#3b82f6",
        text: "#ffffff",
        msg: "Great Effort!",
      };
    }
    if (score >= 70) {
      return {
        bg: theme === "dark" ? "#78350f" : "#fef3c7",
        scoreColor: theme === "dark" ? "#fbbf24" : "#f59e0b",
        text: "#ffffff",
        msg: "Good Progress!",
      };
    }
    return {
      bg: theme === "dark" ? "#7f1d1d" : "#fee2e2",
      scoreColor: theme === "dark" ? "#f87171" : "#ef4444",
      text: "#ffffff",
      msg: "Keep Growing!",
    };
  };

  const s = getScoreStyle(evaluationResults.overallScore, theme);

  return (
    <View className="p-3">
      {/* Overall Score */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{
          backgroundColor: colors.card,
          shadowColor: theme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === "dark" ? 0.6 : 0.1,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View className="items-center mb-6">
          <View
            className="rounded-full w-24 h-24 items-center justify-center mb-4"
            style={{ backgroundColor: s.bg }}
          >
            <Text
              className="text-4xl font-bold"
              style={{ color: s.scoreColor }}
            >
              {evaluationResults.overallScore}
            </Text>
          </View>

          <Text className="text-2xl font-bold mb-2" style={{ color: s.text }}>
            {s.msg}
          </Text>

          {evaluationResults.improvement?.trim().toLowerCase() !== "n/a" &&
            evaluationResults.improvement &&
            (() => {
              const isNegative = evaluationResults.improvement.includes("-");
              const Icon = isNegative ? TrendingDown : TrendingUp;
              const color = isNegative ? "#f87171" : "#4ade80";

              return (
                <View className="flex-row items-center">
                  <Icon size={16} color={color} />
                  <Text className="font-bold ml-1" style={{ color }}>
                    {evaluationResults.improvement} from last speech
                  </Text>
                </View>
              );
            })()}
        </View>

        <View className="flex-row justify-between">
          <View className="items-center">
            <Clock size={20} color={colors.textSecondary} />
            <Text
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              Duration
            </Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              {evaluationResults.duration}
            </Text>
          </View>
          <View className="items-center">
            <Mic size={20} color={colors.textSecondary} />
            <Text
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              Pace(WPM)
            </Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              {evaluationResults.pace}
            </Text>
          </View>
          <View className="items-center">
            <Zap size={20} color={colors.textSecondary} />
            <Text
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              Pauses /min
            </Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              {evaluationResults.avgPause}
            </Text>
          </View>
        </View>
      </View>

      {/* Metrics Tabs */}
      <View className="px-3 py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {tabs.map((tab, index) => {
              const icons = [
                Lightbulb, // Key Insights
                Mic, // Speech Patterns
                Type, // Grammar
                PauseCircle, // Pauses & Variety
                Star, // Vocal
                Volume2, // Engagement
              ];
              const IconComponent = icons[index];
              return (
                <TouchableOpacity
                  key={tab}
                  className="mr-3 py-3 px-4 rounded-2xl flex-row items-center"
                  style={{
                    backgroundColor:
                      selectedTab === tab ? colors.primary : colors.card,
                    shadowColor: theme === "dark" ? "#000" : "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: theme === "dark" ? 0.3 : 0.1,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                  onPress={() => setSelectedTab(tab)}
                >
                  <View
                    className="rounded-full p-1.5 mr-2"
                    style={{
                      backgroundColor:
                        selectedTab === tab
                          ? "rgba(255, 255, 255, 0.2)"
                          : theme === "dark"
                            ? colors.surface
                            : "#f0f9ff",
                    }}
                  >
                    <IconComponent
                      size={14}
                      color={selectedTab === tab ? "white" : colors.primary}
                    />
                  </View>
                  <Text
                    className="font-semibold text-sm"
                    style={{
                      color: selectedTab === tab ? "white" : colors.text,
                    }}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Render content based on selected tab */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{
          backgroundColor: colors.card,
          shadowColor: theme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === "dark" ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {renderTabContent()}
      </View>

      {/* Commendations Section */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{
          backgroundColor: colors.card,
          shadowColor: theme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === "dark" ? 0.6 : 0.1,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center mb-4">
          <CheckCircle size={24} color={colors.success} />
          <Text
            className="text-xl font-bold ml-2"
            style={{ color: colors.text }}
          >
            Strengths ({feedback.strengths.length})
          </Text>
        </View>

        <View className="space-y-4">
          {feedback.strengths.slice(0, 3).map((item, index) => (
            <View
              key={index}
              className="rounded-2xl p-4 mb-3"
              style={{
                backgroundColor: isDark ? "#1f2a24" : "#ecfdf5",
              }}
            >
              <Text
                className="font-semibold"
                style={{ color: isDark ? "#a7f3d0" : "#065f46" }}
              >
                {item.action}
              </Text>
              <View className="flex-row items-center mb-2">
                <Clock size={14} color={isDark ? "#a7f3d0" : "#065f46"} />
                <Text
                  className="text-sm ml-1"
                  style={{ color: isDark ? "#a7f3d0" : "#065f46" }}
                >
                  {item.timestamp}
                </Text>
              </View>
              <View
                className="rounded-xl p-3"
                style={{
                  backgroundColor: isDark ? colors.surface : "#fff",
                }}
              >
                <View className="flex-row items-center mb-1">
                  <Flame
                    size={16}
                    color={isDark ? colors.success : "#22c55e"}
                  />
                  <Text
                    className="font-semibold ml-2"
                    style={{ color: isDark ? colors.textSecondary : "#065f46" }}
                  >
                    Impact
                  </Text>
                </View>
                <Text
                  style={{ color: isDark ? colors.textSecondary : "#4b5563" }}
                >
                  {item.impact}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recommendations Section */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{
          backgroundColor: colors.card,
          shadowColor: theme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === "dark" ? 0.6 : 0.1,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center mb-4">
          <AlertCircle size={24} color={colors.warning} />
          <Text
            className="text-xl font-bold ml-2"
            style={{ color: colors.text }}
          >
            Recommendations ({feedback.improvements.length})
          </Text>
        </View>

        <View className="space-y-4">
          {feedback.improvements.slice(0, 3).map((item, index) => (
            <View
              key={index}
              className="rounded-2xl p-4 mb-3"
              style={{
                backgroundColor: isDark ? "#2a241f" : "#fff7ed",
              }}
            >
              <Text
                className="font-semibold"
                style={{ color: isDark ? "#fcd34d" : "#92400e" }}
              >
                {item.action}
              </Text>
              <View className="flex-row items-center mb-2">
                <Clock size={14} color={isDark ? "#fcd34d" : "#92400e"} />
                <Text
                  className="text-sm ml-1"
                  style={{ color: isDark ? "#fcd34d" : "#92400e" }}
                >
                  {item.timestamp}
                </Text>
              </View>
              <View
                className="rounded-xl p-3"
                style={{
                  backgroundColor: isDark ? colors.surface : "#fff",
                }}
              >
                <View className="flex-row items-center mb-1">
                  <Lightbulb
                    size={16}
                    color={isDark ? colors.warning : "#f97316"}
                  />
                  <Text
                    className="font-semibold ml-2"
                    style={{ color: isDark ? colors.textSecondary : "#92400e" }}
                  >
                    Suggestion
                  </Text>
                </View>
                <Text
                  style={{ color: isDark ? colors.textSecondary : "#4b5563" }}
                >
                  {item.suggestion}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="space-y-3 mb-8">
        <TouchableOpacity
          onPress={() => onViewDetailedFeedback(detailedFeedback)}
          className="rounded-2xl py-4 px-6"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-bold text-lg text-center">
            View Detailed Feedback
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showInfoModal}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <View
            className="rounded-t-3xl p-6 pb-8"
            style={{ backgroundColor: colors.card }}
          >
            <TouchableOpacity
              onPress={() => setShowInfoModal(false)}
              className="self-end p-2 -mt-2 -mr-2"
            >
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.textSecondary }}
              >
                &times;
              </Text>
            </TouchableOpacity>

            {infoContent && (
              <>
                <View className="flex-row items-center mb-4">
                  <View
                    className="rounded-full p-3 mr-3"
                    style={{ backgroundColor: colors.primary, opacity: 0.2 }}
                  >
                    <Info size={24} color="#ffff" />
                  </View>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: colors.text }}
                  >
                    {infoContent.title}
                  </Text>
                </View>
                <Text
                  className="text-base mb-4"
                  style={{ color: colors.textSecondary }}
                >
                  {infoContent.description}
                </Text>

                {infoContent.bullets?.map((bullet, index) => (
                  <View key={index} className="flex-row items-start mb-3">
                    <View className="mr-3 mt-1">{bullet.icon}</View>
                    <Text
                      className="flex-1 text-base"
                      style={{ color: colors.text }}
                    >
                      {bullet.text}
                    </Text>
                  </View>
                ))}

                {infoContent.sections?.map((section, sectionIndex) => (
                  <View key={sectionIndex} className="mb-4">
                    <Text
                      className="font-semibold text-lg mb-2"
                      style={{ color: colors.text }}
                    >
                      {section.title}
                    </Text>
                    {Array.isArray(section.content) ? (
                      section.content.map((item, itemIndex) => (
                        <View
                          key={itemIndex}
                          className="flex-row items-start mb-2"
                        >
                          <View className="mr-3 mt-1">{item.icon}</View>
                          <Text
                            className="flex-1 text-base"
                            style={{ color: colors.textSecondary }}
                          >
                            {item.text}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text
                        className="text-base"
                        style={{ color: colors.textSecondary }}
                      >
                        {section.content}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}

            <TouchableOpacity
              onPress={() => setShowInfoModal(false)}
              className="mt-6 py-3 rounded-full items-center shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-base font-bold" style={{ color: "#fff" }}>
                Got It!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default QuickFeedbackEvaluations;

const styles = StyleSheet.create({
  tooltipContainer: {
    position: "absolute",
    borderRadius: 8,
    maxWidth: 200, // Important for the 'left' calculation
    zIndex: 1000,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
