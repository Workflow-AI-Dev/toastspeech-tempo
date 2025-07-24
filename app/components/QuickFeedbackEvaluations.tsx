import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
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
    }[];
    crutchData: {
      phrase: string;
      category: string;
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
  const [selectedTab, setSelectedTab] = useState("Key Insights");

  const tabs = [
    "Key Insights",
    "Fillers & Crutches",
    "Grammar",
    // "Vocal Variety",
    "Pauses & Variety",
    "Environment",
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
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#f8fafc",
                    borderLeftWidth: 4,
                    borderLeftColor: colors.warning,
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
                        className="text-base leading-6 font-medium"
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
      case "Pauses & Variety":
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

        // Prepare data for Line Chart (Pause Duration Over Time)
        const lineChartLabels = getLineChartLabels(pausesData);
        const lineChartDataValues = pausesData.map((p) => p.duration_seconds);

        const lineChartData = {
          labels: lineChartLabels,
          datasets: [
            {
              data: lineChartDataValues,
            },
          ],
        };

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
              // Dynamic colors for bars (optional, but makes chart more visually appealing)
              colors: barChartLabels.map((_, i) => (opacity = 1) => {
                const hue = (i * 137.508) % 360; // Use golden angle approximation for distinct colors
                return `hsla(${hue}, 70%, 50%, ${opacity})`;
              }),
            },
          ],
        };

        // Chart configuration for both charts
        const chartConfig = {
          backgroundColor: colors.card, // Should match card background for seamless look
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 1, // optional, defaults to 2dp
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
                        color: theme === "dark" ? "#93c5fd" : "#3730a3",
                      }}
                    >
                      Total Pauses
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
                      {avgPauseDuration}s
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme === "dark" ? "#6ee7b7" : "#065f46",
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
                            `rgba(16, 185, 129, ${opacity})`, // Green primary color for bars
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

                {/* Line Chart: Pause Duration Over Time */}
                <View className="mb-6">
                  <Text
                    className="text-lg font-bold mb-3"
                    style={{ color: colors.text }}
                  >
                    Vocal Variety
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                      data={lineChartData}
                      // Dynamically adjust width based on number of data points
                      width={Math.max(
                        screenWidth - 48,
                        lineChartDataValues.length * 60,
                      )}
                      height={200}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) =>
                          `rgba(59, 130, 246, ${opacity})`, // Blue primary color for line
                        propsForDots: {
                          r: "5",
                          strokeWidth: "2",
                          stroke: `rgba(59, 130, 246, 1)`,
                        },
                        backgroundGradientFrom: colors.card,
                        backgroundGradientTo: colors.card,
                      }}
                      bezier // Smooth line
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                      }}
                    />
                  </ScrollView>
                </View>
              </>
            )}
          </View>
        );
      case "Fillers & Crutches":
        // Merge data
        const fillerWords = evaluationResults.fillerData.map(
          (item) => item.word,
        );
        const crutchWords = evaluationResults.crutchData.map(
          (item) => item.phrase,
        );

        // Count occurrences
        const countOccurrences = (arr: string[]) =>
          arr.reduce((acc: Record<string, number>, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
          }, {});

        const fillerCounts = countOccurrences(fillerWords);
        const crutchCounts = countOccurrences(crutchWords);

        // Assign colors
        const fillerColorBase = "#60a5fa"; // Light Blue
        const crutchColorBase = "#c084fc"; // Light Purple

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
        const totalWords = totalFillers + totalCrutch;

        return (
          <View>
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View
                  className="rounded-full p-2 mr-3"
                  style={{
                    backgroundColor: theme === "dark" ? "#8b5cf6" : "#ede9fe",
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
                {/* Summary Cards */}
                {/*<View className="flex-row justify-between mb-6">
                  <View
                    className="flex-1 rounded-2xl p-4 mr-2"
                    style={{
                      backgroundColor: theme === "dark" ? "#1e3a8a" : "#dbeafe",
                    }}
                  >
                    <Text
                      className="text-2xl font-bold mb-1"
                      style={{
                        color: theme === "dark" ? "#60a5fa" : "#1d4ed8",
                      }}
                    >
                      {totalFillers}
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme === "dark" ? "#93c5fd" : "#3730a3",
                      }}
                    >
                      Filler Words
                    </Text>
                  </View>

                  <View
                    className="flex-1 rounded-2xl p-4 ml-2"
                    style={{
                      backgroundColor: theme === "dark" ? "#581c87" : "#faf5ff",
                    }}
                  >
                    <Text
                      className="text-2xl font-bold mb-1"
                      style={{
                        color: theme === "dark" ? "#c084fc" : "#7c3aed",
                      }}
                    >
                      {totalCrutch}
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme === "dark" ? "#d8b4fe" : "#5b21b6",
                      }}
                    >
                      Crutch Phrases
                    </Text>
                  </View>
                </View>
                */}
                {/* Pie Chart */}
                <View className="mb-4">
                  {/*<View className="items-center mb-4">
                    <PieChart
                      data={pieData.map((entry) => ({
                        name: entry.name,
                        population: entry.count,
                        color: entry.color,
                        legendFontColor: entry.legendFontColor,
                        legendFontSize: entry.legendFontSize,
                      }))}
                      width={screenWidth - 80}
                      height={220}
                      chartConfig={{
                        backgroundColor: "transparent",
                        backgroundGradientFrom: "transparent",
                        backgroundGradientTo: "transparent",
                        color: () => colors.primary,
                        labelColor: () => colors.text,
                      }}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="70"
                      center={[10, 0]}
                      absolute
                      hasLegend={false}
                    />
                  </View>*/}

                  {/*
                  <View
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: theme === "dark" ? "#1f2937" : "#f8fafc",
                      borderWidth: 1,
                      borderColor: theme === "dark" ? "#374151" : "#e2e8f0",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {pieData.map((entry, index) => (
                        <View
                          key={entry.name}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            minWidth: "45%",
                            marginBottom: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 6,
                            borderRadius: 8,
                            backgroundColor:
                              theme === "dark" ? "#374151" : "#ffffff",
                            shadowColor: theme === "dark" ? "#000" : "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 1,
                          }}
                        >
                          <View
                            style={{
                              width: 14,
                              height: 14,
                              backgroundColor: entry.color,
                              borderRadius: 7,
                              marginRight: 8,
                              borderWidth: 1,
                              borderColor:
                                theme === "dark" ? "#4b5563" : "#d1d5db",
                            }}
                          />
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 13,
                              fontWeight: "500",
                              flex: 1,
                            }}
                            numberOfLines={1}
                          >
                            {entry.name}
                          </Text>
                          <View
                            className="rounded-full px-2 py-1 ml-2"
                            style={{
                              backgroundColor:
                                entry.wordType === "filler"
                                  ? theme === "dark"
                                    ? "#1e3a8a"
                                    : "#dbeafe"
                                  : theme === "dark"
                                    ? "#581c87"
                                    : "#faf5ff",
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  entry.wordType === "filler"
                                    ? theme === "dark"
                                      ? "#60a5fa"
                                      : "#1d4ed8"
                                    : theme === "dark"
                                      ? "#c084fc"
                                      : "#7c3aed",
                                fontSize: 11,
                                fontWeight: "600",
                              }}
                            >
                              {entry.count}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                */}
                </View>

                {/* Word Lists */}
                <View className="space-y-4">
                  {Object.keys(fillerCounts).length > 0 && (
                    <View
                      className="rounded-2xl p-4"
                      style={{
                        backgroundColor:
                          theme === "dark" ? "#1e3a8a" : "#eff6ff",
                      }}
                    >
                      <Text
                        className="text-lg font-bold mb-3"
                        style={{
                          color: theme === "dark" ? "#60a5fa" : "#1d4ed8",
                        }}
                      >
                        🔵 Filler Words ({totalFillers})
                      </Text>
                      <View className="flex-row flex-wrap">
                        {Object.entries(fillerCounts).map(([word, count]) => (
                          <View
                            key={word}
                            className="rounded-full px-3 py-1 mr-2 mb-2"
                            style={{
                              backgroundColor:
                                theme === "dark" ? "#3b82f6" : "#dbeafe",
                            }}
                          >
                            <Text
                              className="text-sm font-medium"
                              style={{
                                color: theme === "dark" ? "#fff" : "#1e40af",
                              }}
                            >
                              {word} ({count})
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {Object.keys(crutchCounts).length > 0 && (
                    <View
                      className="rounded-2xl p-4"
                      style={{
                        backgroundColor:
                          theme === "dark" ? "#581c87" : "#faf5ff",
                      }}
                    >
                      <Text
                        className="text-lg font-bold mb-3"
                        style={{
                          color: theme === "dark" ? "#c084fc" : "#7c3aed",
                        }}
                      >
                        🟣 Crutch Phrases ({totalCrutch})
                      </Text>
                      <View className="flex-row flex-wrap">
                        {Object.entries(crutchCounts).map(([phrase, count]) => (
                          <View
                            key={phrase}
                            className="rounded-full px-3 py-1 mr-2 mb-2"
                            style={{
                              backgroundColor:
                                theme === "dark" ? "#8b5cf6" : "#ede9fe",
                            }}
                          >
                            <Text
                              className="text-sm font-medium"
                              style={{
                                color: theme === "dark" ? "#fff" : "#6b21a8",
                              }}
                            >
                              {phrase} ({count})
                            </Text>
                          </View>
                        ))}
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

        // Group by mistake_type
        const groupedMistakes: Record<string, typeof grammarMistakes> = {};
        grammarMistakes.forEach((mistake) => {
          if (!groupedMistakes[mistake.mistake_type]) {
            groupedMistakes[mistake.mistake_type] = [];
          }
          groupedMistakes[mistake.mistake_type].push(mistake);
        });

        const totalMistakes = grammarMistakes.length;
        const mistakeTypes = Object.keys(groupedMistakes).length;

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
            </View>

            {grammarMistakes.length === 0 ? (
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

                {/* Grammar Issues by Category */}
                <ScrollView>
                  {Object.entries(groupedMistakes).map(
                    ([type, mistakes], idx) => (
                      <View key={idx} className="mb-6">
                        <View className="flex-row items-center mb-3">
                          <View
                            className="rounded-full p-2 mr-3"
                            style={{
                              backgroundColor:
                                theme === "dark" ? "#dc2626" : "#fef2f2",
                            }}
                          >
                            <AlertCircle
                              size={16}
                              color={theme === "dark" ? "#fff" : "#dc2626"}
                            />
                          </View>
                          <Text
                            className="text-lg font-bold flex-1"
                            style={{ color: colors.text }}
                          >
                            {formatMistakeType(type)}
                          </Text>
                        </View>

                        <View className="space-y-3">
                          {mistakes.map((mistake, index) => (
                            <View
                              key={index}
                              className="rounded-2xl p-4"
                              style={{
                                backgroundColor:
                                  theme === "dark" ? "#1f2937" : "#f9fafb",
                                borderLeftWidth: 4,
                                borderLeftColor: colors.error,
                              }}
                            >
                              <View className="mb-3">
                                <View className="flex-row items-center mb-2">
                                  <View
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: colors.error }}
                                  />
                                  <Text
                                    className="text-sm font-bold"
                                    style={{ color: colors.error }}
                                  >
                                    INCORRECT
                                  </Text>
                                </View>
                                <Text
                                  className="text-base font-medium"
                                  style={{ color: colors.text }}
                                >
                                  {mistake.incorrect_grammar}
                                </Text>
                              </View>

                              <View
                                className="rounded-xl p-3"
                                style={{
                                  backgroundColor:
                                    theme === "dark" ? "#065f46" : "#ecfdf5",
                                }}
                              >
                                <View className="flex-row items-center mb-2">
                                  <View
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: colors.success }}
                                  />
                                  <Text
                                    className="text-sm font-bold"
                                    style={{ color: colors.success }}
                                  >
                                    CORRECT
                                  </Text>
                                </View>
                                <Text
                                  className="text-base font-medium"
                                  style={{
                                    color:
                                      theme === "dark" ? "#6ee7b7" : "#047857",
                                  }}
                                >
                                  {mistake.correct_grammar}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    ),
                  )}
                </ScrollView>
              </>
            )}
          </View>
        );

      case "Environment":
        const environDataRaw = evaluationResults.environData;
        const environData = Array.isArray(environDataRaw)
          ? environDataRaw
          : environDataRaw
            ? [environDataRaw]
            : [];

        // 🔁 Count occurrences and sum durations
        const elementCounts: Record<string, number> = {};
        const elementDurations: Record<string, number> = {};

        environData.forEach((item) => {
          const key = item.element_type;
          const duration = parseFloat(item.duration_seconds || "0");

          elementCounts[key] = (elementCounts[key] || 0) + 1;
          elementDurations[key] = (elementDurations[key] || 0) + duration;
        });

        const environLabels = Object.keys(elementCounts);
        const elementCountValues = Object.values(elementCounts);
        const totalEnvironDuration = Object.values(elementDurations).reduce(
          (a, b) => a + b,
          0,
        );

        const barChartData2 = {
          labels: environLabels,
          datasets: [
            {
              data: elementCountValues,
              colors: environLabels.map((_, i) => (opacity = 1) => {
                const hue = (i * 137.5) % 360;
                return `hsla(${hue}, 70%, 50%, ${opacity})`;
              }),
            },
          ],
        };

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
                  Environment
                </Text>
              </View>
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
                  Clean Environment!
                </Text>
                <Text
                  className="text-center"
                  style={{ color: colors.textSecondary }}
                >
                  No environmental distractions detected.
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
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                      data={barChartData2}
                      width={Math.max(
                        screenWidth - 48,
                        environLabels.length * 100,
                      )}
                      height={200}
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
                      formatYLabel={(val) => parseInt(val).toString()}
                      fromZero
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                      }}
                    />
                  </ScrollView>
                </View>

                {/* 🧾 Element List with durations */}
                <View className="space-y-3">
                  <Text
                    className="text-lg font-bold mb-3"
                    style={{ color: colors.text }}
                  >
                    Detected Elements
                  </Text>
                  {Object.entries(elementDurations).map(
                    ([element, duration], index) => {
                      const percentage = (
                        (duration / totalEnvironDuration) *
                        100
                      ).toFixed(1);
                      return (
                        <View
                          key={element}
                          className="rounded-2xl p-4"
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
                                  element.slice(1)}
                              </Text>
                              <Text
                                className="text-sm"
                                style={{ color: colors.textSecondary }}
                              >
                                {duration.toFixed(1)} seconds • {percentage}% of
                                total
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    },
                  )}
                </View>
              </>
            )}
          </View>
        );

        {
          /*case "Vocal Variety":
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
                  Vocal Variety
                </Text>
              </View>
            </View>
          </View>
        );*/
        }
    }
  };

  return (
    <View className="p-6">
      {/* Overall Score */}
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{ backgroundColor: colors.card }}
      >
        <View className="items-center mb-6">
          <View
            className="rounded-full w-24 h-24 items-center justify-center mb-4"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#dcfce7",
            }}
          >
            <Text
              className="text-4xl font-bold"
              style={{ color: colors.success }}
            >
              {evaluationResults.overallScore}
            </Text>
          </View>
          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Strong Evaluation!
          </Text>
          {evaluationResults.improvement?.trim().toLowerCase() !== "n/a" &&
            (() => {
              const isNegative = evaluationResults.improvement.includes("-");
              const Icon = isNegative ? TrendingDown : TrendingUp;
              const color = isNegative ? "#ef4444" : "#10b981";

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
              Avg Pause
            </Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              {evaluationResults.avgPause}
            </Text>
          </View>
        </View>
      </View>

      {/*
      <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{ backgroundColor: colors.card }}
      >
        <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>
          Evaluation Breakdown
        </Text>
        <View className="space-y-4">
          {[
            {
              label: "Content Insight",
              value: evaluationResults.contentInsight,
              color: "#6366f1",
            },
            {
              label: "Speaking Quality",
              value: evaluationResults.speakingQuality,
              color: "#3b82f6",
            },
            {
              label: "Clarity",
              value: evaluationResults.clarity,
              color: "#10b981",
            },
            {
              label: "Confidence",
              value: evaluationResults.confidence,
              color: "#f59e0b",
            },
          ].map((metric, index) => (
            <View key={index} className="flex-row items-center justify-between">
              <Text className="font-medium" style={{ color: colors.text }}>
                {metric.label}
              </Text>
              <View className="flex-row items-center">
                <View
                  className="rounded-full h-2 w-20 mr-3"
                  style={{ backgroundColor: colors.border }}
                >
                  <View
                    className="rounded-full h-2"
                    style={{
                      width: `${metric.value}%`,
                      backgroundColor: metric.color,
                    }}
                  />
                </View>
                <Text className="font-bold w-8" style={{ color: colors.text }}>
                  {metric.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>/*}

      {/* Key Insights */}
      {/* <View
        className="rounded-3xl p-6 mb-6 shadow-lg"
        style={{ backgroundColor: colors.card }}
      >
        <View className="flex-row items-center mb-4">
          <Lightbulb size={24} color={colors.warning} />
          <Text
            className="text-xl font-bold ml-2"
            style={{ color: colors.text }}
          >
            Key Insights
          </Text>
        </View>
        <View className="space-y-3">
          {feedback.keyInsights.map((insight, index) => (
            <View key={index} className="flex-row items-start">
              <View
                className="rounded-full p-1 mr-3 mt-1"
                style={{ backgroundColor: colors.surface }}
              >
                <Star size={12} color={colors.warning} />
              </View>
              <Text
                className="flex-1 text-base"
                style={{ color: colors.textSecondary }}
              >
                {insight}
              </Text>
            </View>
          ))}
        </View>
      </View>*/}

      {/* Metrics Tabs */}
      <View className="px-3 py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {tabs.map((tab, index) => {
              const icons = [
                Lightbulb, // Key Insights
                Mic, // Fillers & Crutches
                Type, // Grammar
                // Star, // Vocal
                PauseCircle, // Pauses & Variety
                Volume2, // Environment
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
          shadowOpacity: theme === "dark" ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 8,
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
              className="rounded-2xl p-4"
              style={{
                backgroundColor: theme === "dark" ? "#052e16" : "#dcfce7",
              }}
            >
              <Text className="font-semibold text-green-900 mb-1">
                {item.action}
              </Text>
              <View className="flex-row items-center mb-2">
                <Clock size={14} color="#15803d" />
                <Text className="text-green-700 text-sm ml-1">
                  {item.timestamp}
                </Text>
              </View>
              <View className="bg-white rounded-xl p-3">
                <View className="flex-row items-center mb-1">
                  <Flame size={16} color="#22c55e" />
                  <Text className="text-green-800 font-semibold ml-2">
                    Impact
                  </Text>
                </View>
                <Text className="text-gray-700">{item.impact}</Text>
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
          shadowOpacity: theme === "dark" ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 8,
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
              className="rounded-2xl p-4"
              style={{
                backgroundColor: theme === "dark" ? "#7c2d12" : "#fef3c7",
              }}
            >
              <Text className="font-semibold text-orange-900 mb-1">
                {item.action}
              </Text>
              <View className="flex-row items-center mb-2">
                <Clock size={14} color="#c2410c" />
                <Text className="text-orange-700 text-sm ml-1">
                  {item.timestamp}
                </Text>
              </View>
              <View className="bg-white rounded-xl p-3">
                <View className="flex-row items-center mb-1">
                  <Lightbulb size={16} color="#f97316" />
                  <Text className="text-orange-800 font-semibold ml-2">
                    Suggestion
                  </Text>
                </View>
                <Text className="text-gray-700">{item.suggestion}</Text>
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
    </View>
  );
};

export default QuickFeedbackEvaluations;
