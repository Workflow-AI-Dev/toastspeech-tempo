import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import {
  ChevronDown,
  TrendingUp,
  Clock,
  Mic,
  BarChart2,
  Trophy,
  Target,
  Zap,
  Award,
  Flame,
  Star,
  TrendingDown,
  Timer,
  CheckCircle,
  ThumbsUp,
  PauseCircle,
  Volume2,
  MessageCircle,
  Repeat,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_URL } from "../config/api";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday"; // Import the weekday plugin
dayjs.extend(weekday); // Extend dayjs with the weekday plugin

interface PerformanceDashboardProps {
  data?: {
    fillerWords: number[];
    emotionalDelivery: number[];
    overallScore: number[];
    speakingDuration: number[];
    grammarAccuracy: number[];
  };
  timeLabels?: string[];
  currentScore?: {
    fillerWords: number;
    emotionalDelivery: number;
    overallScore: number;
    speakingDuration: number;
    grammarAccuracy: number;
  };
  fillerWordsBreakdown?: {
    labels: string[];
    data: number[];
  };
  emotionalTonesBreakdown?: {
    labels: string[];
    data: number[];
  };
}

const PerformanceDashboard = ({
  fillerWordsBreakdown = {
    labels: ["um", "like", "you know", "uh", "so"],
    data: [8, 12, 5, 3, 7],
  },
}: PerformanceDashboardProps) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("Week");
  const [selectedMetric, setSelectedMetric] = useState("Overall Score");
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const router = useRouter();

  const [loadingCount, setLoadingCount] = useState(0);
  const isLoading = loadingCount > 0;
  const [isFilteringTime, setIsFilteringTime] = useState(true);


  const screenWidth = Dimensions.get("window").width - 32; // Accounting for padding
  const [avgScore, setAvgScore] = useState<number>(0);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [weeklyScores, setWeeklyScores] = useState<number[]>([]);
  const [monthlyScores, setMonthlyScores] = useState<number[]>([]);
  const [last6MonthsScores, setLast6MonthsScores] = useState<number[]>([]);

  const [weeklyFillerWords, setWeeklyFillerWords] = useState<number[]>([]);
  const [monthlyFillerWords, setMonthlyFillerWords] = useState<number[]>([]);
  const [last6MonthsFillerWords, setLast6MonthsFillerWords] = useState<
    number[]
  >([]);

  const [recentAchievements, setRecentAchievements] = useState([]);

  const achievementIcons = [
    { Icon: Flame, color: "#f97316" },      // Orange
    { Icon: TrendingUp, color: "#10b981" }, // Green
    { Icon: Star, color: "#eab308" },       // Yellow
    { Icon: Award, color: "#6366f1" },      // Indigo
    { Icon: ThumbsUp, color: "#3b82f6" },   // Blue
    { Icon: Trophy, color: "#d97706" },     // Amber
  ];

  // New states for breakdown charts (dynamic based on fetched data)
  const [dynamicFillerWordsBreakdown, setDynamicFillerWordsBreakdown] =
    useState<{ labels: string[]; data: number[] }>(fillerWordsBreakdown);
  const [dynamicCrutchPhrasesBreakdown, setDynamicCrutchPhrasesBreakdown] =
    useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [dynamicRepeatPhrasesBreakdown, setDynamicRepeatPhrasesBreakdown] =
    useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [dynamicPausesBreakdown, setDynamicPausesBreakdown] = useState<{
    labels: string[];
    data: number[];
  }>({ labels: [], data: [] });
  const [dynamicEnvironmentBreakdown, setDynamicEnvironmentBreakdown] =
    useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });

  const [currentOverallScore, setCurrentOverallScore] = useState<number | null>(
    null,
  );
  const [overallScoreImprovement, setOverallScoreImprovement] = useState<
    string | null
  >(null);

  const [currentFillerWordsCount, setCurrentFillerWordsCount] = useState<
    number | null
  >(null);
  const [fillerWordsImprovement, setFillerWordsImprovement] = useState<
    string | null
  >(null);

  const [currentCrutchPhrasesCount, setCurrentCrutchPhrasesCount] = useState<
    number | null
  >(null);
  const [crutchPhrasesImprovement, setCrutchPhrasesImprovement] = useState<
    string | null
  >(null);

  const [currentPausesCount, setCurrentPausesCount] = useState<number | null>(
    null,
  );
  const [pausesImprovement, setPausesImprovement] = useState<string | null>(
    null,
  );

  const timeFrames = ["Week", "Month", "Last 6 Months"];
  const metrics = [
    "Overall Score",
    "Fillers",
    "Crutches",
    "Repetitions",
    "Pauses",
    "Engagement",
  ];
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoadingCount((prev) => prev + 1);
      try {
        const plan = await AsyncStorage.getItem("plan");
        setPlan(plan);
      } catch (error) {
        console.error("Error fetching subscription plan", error);
      } finally {
        setLoadingCount((prev) => prev - 1);
      }
    };
    fetchPlan();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsFilteringTime(true);
      const token = await AsyncStorage.getItem("auth_token");
      try {
        const response = await fetch(`${BASE_URL}/dashboard/all`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { evaluations, speeches } = await response.json();
        const allSessions = []; // Combine speeches and evaluations, extracting relevant analytics

        evaluations.forEach((e) => {
          if (e?.summary?.Metadata) {
            allSessions.push({
              date: dayjs(e.created_at),
              overall_score: parseFloat(e.summary.Metadata.overall_score),
              filler_words: e.analytics?.filler_words || [],
              crutch_phrases: e.analytics?.crutch_phrases || [],
              repeat_phrases: e.analytics?.repeated_words || [],
              pauses: e.analytics?.pauses || [],
              environmental_elements: e.analytics?.environmental_elements || [],
            });
          }
        });
        speeches.forEach((s) => {
          if (s?.summary?.Metadata) {
            allSessions.push({
              date: dayjs(s.created_at),
              overall_score: parseFloat(s.summary.Metadata.overall_score),
              filler_words: s.analytics?.filler_words || [],
              crutch_phrases: s.analytics?.crutch_phrases || [],
              repeat_phrases: s.analytics?.repeated_words || [],
              pauses: s.analytics?.pauses || [],
              environmental_elements: s.analytics?.environmental_elements || [],
            });
          }
        }); // Helper to get average or sum by bucket

        const bucketProcessor = (
          items: any[],
          type: "average" | "sum",
          key?: string,
        ) => {
          if (items.length === 0) return 0;
          const values = key ? items.map((item) => item[key]) : items;
          const sum = values.reduce((a, b) => a + b, 0);
          return type === "average" ? Math.round(sum / values.length) : sum;
        };

        const today = dayjs();
        // Set Monday as the start of the week (dayjs weekday plugin: 0 for Sunday, 1 for Monday, etc.)
        const startOfWeek = today.weekday(1).startOf("day"); // Monday of the current week

        // --- Process for Overall Scores ---
        const daysInCurrentWeek = [];
        for (let i = 0; i <= today.weekday() - 1; i++) {
          // Loop from Monday (weekday 1) up to today's weekday
          daysInCurrentWeek.push(startOfWeek.add(i, "day"));
        }

        const weekScores = daysInCurrentWeek.map((d) => {
          const scores = allSessions
            .filter((s) => s.date.isSame(d, "day"))
            .map((s) => s.overall_score);
          return bucketProcessor(scores, "average");
        });
        setWeeklyScores(weekScores);

        const last4Weeks = Array.from({ length: 4 }).map((_, i) =>
          today.subtract(3 - i, "week"),
        );
        const monthScores = last4Weeks.map((startOfWeek) => {
          const scores = allSessions
            .filter(
              (s) =>
                s.date.isAfter(startOfWeek.startOf("week")) &&
                s.date.isBefore(startOfWeek.endOf("week")),
            )
            .map((s) => s.overall_score);
          return bucketProcessor(scores, "average");
        });
        setMonthlyScores(monthScores);

        const last6Months = Array.from({ length: 6 }).map((_, i) =>
          today.subtract(5 - i, "month"),
        );
        const sixMonthsScores = last6Months.map((monthStart) => {
          const scores = allSessions
            .filter((s) => s.date.isSame(monthStart, "month"))
            .map((s) => s.overall_score);
          return bucketProcessor(scores, "average");
        });
        setLast6MonthsScores(sixMonthsScores); // --- Process for Filler Word Trends (Counts) ---

        const weekFillerCounts = daysInCurrentWeek.map((d) => {
          const sessionsForDay = allSessions.filter((s) =>
            s.date.isSame(d, "day"),
          );
          const totalFillers = sessionsForDay.reduce(
            (sum, session) => sum + session.filler_words.length,
            0,
          );
          return totalFillers;
        });
        setWeeklyFillerWords(weekFillerCounts);
        console.log(weekFillerCounts);

        const monthFillerCounts = last4Weeks.map((startOfWeek) => {
          const sessionsForWeek = allSessions.filter(
            (s) =>
              s.date.isAfter(startOfWeek.startOf("week")) &&
              s.date.isBefore(startOfWeek.endOf("week")),
          );
          const totalFillers = sessionsForWeek.reduce(
            (sum, session) => sum + session.filler_words.length,
            0,
          );
          return totalFillers;
        });
        setMonthlyFillerWords(monthFillerCounts);

        const sixMonthsFillerCounts = last6Months.map((monthStart) => {
          const sessionsForMonth = allSessions.filter((s) =>
            s.date.isSame(monthStart, "month"),
          );
          const totalFillers = sessionsForMonth.reduce(
            (sum, session) => sum + session.filler_words.length,
            0,
          );
          return totalFillers;
        });
        setLast6MonthsFillerWords(sixMonthsFillerCounts);

        const filterSessionsByTimeFrame = (
          sessions: any[],
          timeframe: string,
        ) => {
          const now = dayjs();
          if (timeframe === "Week") {
            // Filter sessions from the start of the current week up to today
            return sessions.filter(
              (s) =>
                s.date.isAfter(
                  now.weekday(1).startOf("day").subtract(1, "day"),
                ) && s.date.isBefore(now.add(1, "day")),
            );
          } else if (timeframe === "Month") {
            return sessions.filter((s) =>
              s.date.isAfter(now.subtract(1, "month")),
            );
          } else if (timeframe === "Last 6 Months") {
            return sessions.filter((s) =>
              s.date.isAfter(now.subtract(6, "month")),
            );
          }
          return sessions; // Default to all if no filter
        };

        const aggregatedSessions = filterSessionsByTimeFrame(
          allSessions,
          selectedTimeFrame,
        ); 

        // Aggregate Filler Words Breakdown - MODIFIED TO SHOW TOP 5
        const fillerWordMap = new Map<string, number>();
        aggregatedSessions.forEach((session) => {
          session.filler_words.forEach((fw: { word: string }) => {
            // Ensure word is trimmed and lowercased for consistent counting
            const cleanWord = fw.word.trim().toLowerCase();
            fillerWordMap.set(
              cleanWord,
              (fillerWordMap.get(cleanWord) || 0) + 1,
            );
          });
        }); // Convert map to array, sort by count, and take the top 5

        const sortedFillerWords = Array.from(fillerWordMap.entries())
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 5); // Get top 5

        setDynamicFillerWordsBreakdown({
          labels: sortedFillerWords.map(([word]) => word),
          data: sortedFillerWords.map(([, count]) => count),
        }); 

        // Aggregate Crutch Phrases Breakdown
        const crutchPhraseMap = new Map<string, number>();
        aggregatedSessions.forEach((session) => {
          session.crutch_phrases.forEach((cp: { phrase: string }) => {
            const cleanPhrase = cp.phrase.trim().toLowerCase();
            crutchPhraseMap.set(
              cleanPhrase,
              (crutchPhraseMap.get(cleanPhrase) || 0) + 1,
            );
          });
        });
        // Sort and keep only top 5
        const sortedCrutchPhrases = Array.from(crutchPhraseMap.entries())
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 5); // 👈 Top 5 only

        setDynamicCrutchPhrasesBreakdown({
          labels: sortedCrutchPhrases.map(([phrase]) => phrase),
          data: sortedCrutchPhrases.map(([, count]) => count),
        }); 


        // Aggregate Repeated Phrases Breakdown
        const repeatedPhraseMap = new Map<string, number>();
        aggregatedSessions.forEach((session) => {
          session.repeat_phrases.forEach((cp: { word: string }) => {
            const cleanRepeat = cp.word.trim().toLowerCase();
            repeatedPhraseMap.set(
              cleanRepeat,
              (repeatedPhraseMap.get(cleanRepeat) || 0) + 1,
            );
          });
        });
        // Sort and keep only top 5
        const sortedRepeatPhrases = Array.from(repeatedPhraseMap.entries())
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 5); // 👈 Top 5 only

        console.log(sortedRepeatPhrases)

        setDynamicRepeatPhrasesBreakdown({
          labels: sortedRepeatPhrases.map(([word]) => word),
          data: sortedRepeatPhrases.map(([, count]) => count),
        }); 
        

        // Aggregate Pauses Breakdown
        const pauseTypeMap = new Map<string, number>();
        aggregatedSessions.forEach((session) => {
          session.pauses.forEach((p: { pause_type: string }) => {
            const cleanPauseType = p.pause_type.trim().toLowerCase();
            pauseTypeMap.set(
              cleanPauseType,
              (pauseTypeMap.get(cleanPauseType) || 0) + 1,
            );
          });
        });
        // Sort and slice for top 3 pause types
        const sortedPauses = Array.from(pauseTypeMap.entries())
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 3); // **CHANGED FROM 5 TO 3**
        setDynamicPausesBreakdown({
          labels: sortedPauses.map(([pauseType]) => pauseType),
          data: sortedPauses.map(([, count]) => count),
        }); // Aggregate Environmental Elements Breakdown

        const environmentElementMap = new Map<string, number>();
        aggregatedSessions.forEach((session) => {
          session.environmental_elements.forEach(
            (ee: { element_type: string }) => {
              const cleanElementType = ee.element_type.trim().toLowerCase();
              environmentElementMap.set(
                cleanElementType,
                (environmentElementMap.get(cleanElementType) || 0) + 1,
              );
            },
          );
        });
        // Sort and slice for top 5 environmental elements as well, if desired
        const sortedEnvironmentElements = Array.from(
          environmentElementMap.entries(),
        )
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 5);
        setDynamicEnvironmentBreakdown({
          labels: sortedEnvironmentElements.map(([elementType]) => elementType),
          data: sortedEnvironmentElements.map(([, count]) => count),
        }); // Calculate overall average and total sessions

        const total = allSessions.length;
        const avg =
          total > 0
            ? Math.round(
                allSessions.reduce((a, b) => a + b.overall_score, 0) / total,
              )
            : 0;

        setAvgScore(avg);
        setTotalSessions(total);

        allSessions.sort((a, b) => a.date.valueOf() - b.date.valueOf());

        const latestSession = allSessions[allSessions.length - 1];
        const previousSession = allSessions[allSessions.length - 2];

        if (latestSession) {
          // Set current scores
          setCurrentOverallScore(latestSession.overall_score);
          setCurrentFillerWordsCount(latestSession.filler_words.length);
          setCurrentCrutchPhrasesCount(latestSession.crutch_phrases.length);
          setCurrentPausesCount(latestSession.pauses.length);

          // Calculate improvement if a previous session exists
          if (previousSession) {
            // Overall Score Improvement
            const overallDiff =
              latestSession.overall_score - previousSession.overall_score;
            setOverallScoreImprovement(
              overallDiff > 0
                ? `+${overallDiff}%`
                : overallDiff < 0
                  ? `${overallDiff}%`
                  : "No change",
            );

            // Filler Words Improvement (lower is better)
            const fillerDiff =
              previousSession.filler_words.length -
              latestSession.filler_words.length; // Calculate reduction
            setFillerWordsImprovement(
              fillerDiff > 0
                ? `-${fillerDiff}`
                : fillerDiff < 0
                  ? `+${Math.abs(fillerDiff)}`
                  : "No change",
            );

            // Crutch Phrases Improvement (lower is better)
            const crutchDiff =
              previousSession.crutch_phrases.length -
              latestSession.crutch_phrases.length;
            setCrutchPhrasesImprovement(
              crutchDiff > 0
                ? `-${crutchDiff}`
                : crutchDiff < 0
                  ? `+${Math.abs(crutchDiff)}`
                  : "No change",
            );
          } else {
            // No previous session, so no improvement to show
            setOverallScoreImprovement("N/A");
            setFillerWordsImprovement("N/A");
            setCrutchPhrasesImprovement("N/A");
          }
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        setIsFilteringTime(false);
      }
    };

    fetchSessions();
  }, [selectedTimeFrame]); // Re-fetch when time frame changes for breakdown charts

  useEffect(() => {
  const fetchSessions = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    setLoadingCount((prev) => prev + 1);
    try {
      const response = await fetch(`${BASE_URL}/dashboard/recent`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { recent_sessions } = await response.json();
      const sessions = recent_sessions || [];

      // Extract up to 3 recent achievements (with tag + description)
      const achievements = sessions
      .slice(0, 3)
      .flatMap((s) => {
        const ach = s.analytics?.achievement;
        return ach && ach.tag && ach.description
          ? [{ 
              tag: ach.tag, 
              description: ach.description,
              iconIndex: Math.floor(Math.random() * achievementIcons.length)
            }]
          : [];
      })
      .filter(
        (item, index, self) =>
          self.findIndex((a) => a.tag === item.tag) === index
      );

      console.log("Achievements →", achievements);
      setRecentAchievements(achievements);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoadingCount((prev) => prev - 1);
    }
  };

  fetchSessions();
}, []);

const [showContent, setShowContent] = useState(false);
useEffect(() => {
  if (!isLoading) {
    const timeout = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timeout);
  } else {
    setShowContent(false);
  }
}, [isLoading]);



 if (!showContent) return (
  <SafeAreaView className="flex-1 justify-center items-center mt-9" style={{ backgroundColor: colors.background }}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={{ color: colors.text, marginTop: 16, fontSize: 16, fontWeight: '600' }}>
      Loading your progress...
    </Text>
  </SafeAreaView>
);


  const getChartData = () => {
    let chartData: number[] = [];
    let labels: string[] = [];

    switch (selectedTimeFrame) {
      case "Week":
        // Dynamically create labels from Monday up to today
        const today = dayjs();
        const startOfWeek = today.weekday(1).startOf("day"); // Monday of the current week
        const currentDayIndex = today.weekday() === 0 ? 6 : today.weekday() - 1; // 0 for Monday, 6 for Sunday (dayjs weekday: 0-Sunday, 1-Monday, ...)

        labels = [];
        for (let i = 0; i <= currentDayIndex; i++) {
          labels.push(startOfWeek.add(i, "day").format("ddd"));
        }

        if (selectedMetric === "Fillers") {
          chartData = weeklyFillerWords;
        } else {
          chartData = weeklyScores; // Default to overall score
        }
        break;
      case "Month":
        labels = ["W1", "W2", "W3", "W4"];
        if (selectedMetric === "Fillers") {
          chartData = monthlyFillerWords;
        } else {
          chartData = monthlyScores; // Default to overall score
        }
        break;
      case "Last 6 Months":
        labels = Array.from({ length: 6 }).map((_, i) =>
          dayjs()
            .subtract(5 - i, "month")
            .format("MMM"),
        );
        if (selectedMetric === "Fillers") {
          chartData = last6MonthsFillerWords;
        } else {
          chartData = last6MonthsScores; // Default to overall score
        }
        break;
    }

    // Handle other metrics if they also have trend lines
    // For now, only Overall Score and Fillers have trends in this logic
    if (
      selectedMetric === "Crutches" ||
      selectedMetric === "Repetitions" ||
      selectedMetric === "Pauses" ||
      selectedMetric === "Engagement"
    ) {
      // You'll need to implement logic to get trend data for these metrics
      // Similar to how weeklyFillerWords are calculated, you'd calculate weeklyCrutchCounts, etc.
      // For demonstration, we'll use placeholder data or keep them as bar charts only for breakdown
      chartData = []; // Or some default
    }

    return {
      labels,
      datasets: [
        {
          data: chartData.length ? chartData : [0], // Ensure there's always data for the chart
          color: (opacity = 1) => `rgba(72, 149, 239, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getBarChartData = () => {
    let breakdownData: { labels: string[]; data: number[] } = {
      labels: [],
      data: [],
    };

    if (selectedMetric === "Fillers") {
      breakdownData = dynamicFillerWordsBreakdown;
    } else if (selectedMetric === "Crutches") {
      breakdownData = dynamicCrutchPhrasesBreakdown;
    } else if (selectedMetric === "Repetitions") {
      breakdownData = dynamicRepeatPhrasesBreakdown;
    } else if (selectedMetric === "Pauses") {
      breakdownData = dynamicPausesBreakdown;
    } else if (selectedMetric === "Engagement") {
      breakdownData = dynamicEnvironmentBreakdown;
    } else {
      return {
        labels: [],
        datasets: [{ data: [] }],
      };
    }

    // Transform the breakdownData to the format expected by BarChart
    return {
      labels: breakdownData.labels,
      datasets: [
        {
          data: breakdownData.data,
        },
      ],
    };
  };

  const shouldShowBarChart = () => {
    return (
      selectedMetric === "Fillers" ||
      selectedMetric === "Crutches" ||
      selectedMetric === "Repetitions" ||
      selectedMetric === "Pauses" ||
      selectedMetric === "Engagement"
    );
  };

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(72, 149, 239, ${opacity})`,
    labelColor: (opacity = 1) =>
      theme === "dark"
        ? `rgba(241, 245, 249, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#4895ef",
    },
    barPercentage: 0.7, // Added for bar chart consistency
  };

  const renderScoreCard = (
    title: string,
    value: number | null, // Can be null now
    icon: React.ReactNode,
    bgColor: string,
    iconColor: string,
    improvement: string | null, // Can be null
    isHigherBetter: boolean = true, // New prop to determine trend icon
  ) => {
    let trendIcon = null;
    let trendColor = "";
    let trendBgColor = "";
    let improvementText = improvement; // Initialize with the original improvement text

    if (improvement === "No change") {
      improvementText = "±0"; // Change "No change" to "±0"
      trendColor = "text-gray-500"; // Set text color to grey
      trendBgColor = "bg-gray-100"; // Set background color for the icon to grey
    } else if (improvement && improvement !== "N/A") {
      const numericImprovement = parseFloat(improvement.replace(/[+%s]/g, ""));
      if (isHigherBetter) {
        if (numericImprovement > 0) {
          trendIcon = <TrendingUp size={10} color="#10b981" />; // Green for improvement
          trendColor = "text-green-600";
          trendBgColor = "bg-green-100";
        } else if (numericImprovement < 0) {
          trendIcon = <TrendingDown size={10} color="#ef4444" />; // Red for decline
          trendColor = "text-red-600";
          trendBgColor = "bg-red-100";
        }
      } else {
        // Lower is better (e.g., filler words)
        if (numericImprovement < 0) {
          // e.g., -5 filler words (good)
          trendIcon = <TrendingUp size={10} color="#10b981" />; // Green for reduction
          trendColor = "text-green-600";
          trendBgColor = "bg-green-100";
        } else if (numericImprovement > 0) {
          // e.g., +5 filler words (bad)
          trendIcon = <TrendingDown size={10} color="#ef4444" />; // Red for increase
          trendColor = "text-red-600";
          trendBgColor = "bg-red-100";
        }
      }
    }

    return (
      <View
        className="rounded-3xl p-5 mr-4 shadow-lg min-w-[140px]"
        style={{
          backgroundColor: colors.card,
          shadowColor: theme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === "dark" ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View
            className="rounded-full p-2"
            style={{ backgroundColor: bgColor }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              size: 20,
              color: iconColor,
            })}
          </View>
          <Text
            className="text-xs font-medium"
            style={{ color: colors.textSecondary }}
          >
            {title.toUpperCase()}
          </Text>
        </View>
        <Text className="text-3xl font-bold" style={{ color: colors.text }}>
          {value !== null ? value : "--"}
        </Text>
        {improvementText && (
          <View className="flex-row items-center mt-2">
            {trendIcon && (
              <View className={`rounded-full p-1 mr-2 ${trendBgColor}`}>
                {trendIcon}
              </View>
            )}
            <Text className={`text-xs font-bold ${trendColor}`}>
              {improvementText}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (plan === "casual") {
  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
      <Text className="text-2xl font-bold mb-4 text-center" style={{ color: colors.text }}>
        🚫 Feature Locked
      </Text>
      <Text className="text-base text-center mb-8" style={{ color: colors.textSecondary }}>
        This feature is only available on premium plans. Upgrade your subscription to unlock performance analytics and insights.
      </Text>

      <View className="flex-row space-x-4">
        <TouchableOpacity
          className="px-6 py-3 rounded-xl mr-2"
          style={{ backgroundColor: colors.card }}
          onPress={() => {
            // navigate to Home
            router.push("/")
          }}
        >
          <Text className="font-semibold" style={{ color: colors.text }}>
            Go Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="px-6 py-3 rounded-xl"
          style={{ backgroundColor: colors.primary }}
          onPress={() => {
            router.push("/subscription")
          }}
        >
          <Text className="text-white font-semibold">Upgrade</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1">
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
                Your Progress
              </Text>
              <Text
                className="mt-1 text-base"
                style={{ color: colors.textSecondary }}
              >
                Level 7 Speaker • 12-day streak
              </Text>
            </View>

            <View
              className="rounded-2xl p-4"
              style={{
                backgroundColor: theme === "dark" ? colors.card : "#fef3c7",
              }}
            >
              <Trophy size={28} color="#f59e0b" />
            </View>
          </View>

          {/* Quick Stats Cards */}
          <View className="flex-row justify-between">
            <View
              className="rounded-2xl p-4 flex-1 mr-2"
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-2xl font-bold">
                    {avgScore}
                  </Text>
                  <Text className="text-white/90 text-sm font-medium mt-1">
                    Avg Score
                  </Text>
                </View>
                <View className="bg-white/20 rounded-full p-2">
                  <TrendingUp size={18} color="white" />
                </View>
              </View>
            </View>
            <View
              className="rounded-2xl p-4 flex-1 ml-2"
              style={{
                backgroundColor: colors.success,
                shadowColor: colors.success,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-2xl font-bold">
                    {totalSessions}
                  </Text>
                  <Text className="text-white/90 text-sm font-medium mt-1">
                    Sessions
                  </Text>
                </View>
                <View className="bg-white/20 rounded-full p-2">
                  <Mic size={18} color="white" />
                </View>
              </View>
            </View>
          </View>
        </View>
        {/* Time Frame Selector */}
        <View className="px-6 py-4">
          <View
            className="flex-row rounded-2xl p-1"
            style={{
              backgroundColor: colors.card,
              shadowColor: theme === "dark" ? "#000" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === "dark" ? 0.3 : 0.08,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {timeFrames.map((timeFrame) => (
              <TouchableOpacity
                key={timeFrame}
                className="flex-1 py-3 rounded-xl"
                style={{
                  backgroundColor:
                    selectedTimeFrame === timeFrame
                      ? colors.primary
                      : "transparent",
                }}
                onPress={() => setSelectedTimeFrame(timeFrame)}
              >
                <Text
                  className="text-center font-semibold"
                  style={{
                    color:
                      selectedTimeFrame === timeFrame ? "white" : colors.text,
                  }}
                >
                  {timeFrame}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Main Chart */}
        <View className="px-6 py-4">
          <View
            className="rounded-3xl p-6 shadow-lg"
            style={{
              backgroundColor: colors.card,
              shadowColor: theme === "dark" ? "#000" : "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: theme === "dark" ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                {/* <View
                  className="rounded-full p-2 mr-3"
                  style={{
                    backgroundColor:
                      theme === "dark" ? colors.surface : "#f0f9ff",
                  }}
                >
                  <BarChart2 size={20} color={colors.primary} />
                </View> */}
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  {selectedMetric}
                </Text>
              </View>
              <View
                className="rounded-full px-3 py-1"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.surface : "#f3f4f6",
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.primary }}
                >
                  {selectedTimeFrame === "Last 6 Months"
                    ? selectedTimeFrame
                    : `This ${selectedTimeFrame}`}
                </Text>
              </View>
            </View>
              {isFilteringTime ? (
                <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
                  {/* You'll need to import ActivityIndicator from 'react-native' */}
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Loading data...</Text>
                </View>
              )  : shouldShowBarChart() ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }} // Optional spacing
              >
                <BarChart
                  data={getBarChartData()!}
                  width={Math.max(getBarChartData()!.labels.length * 100, screenWidth)} // Dynamically set width
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    barPercentage: 0.7,
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  showValuesOnTopOfBars
                />
              </ScrollView>
            ) : (
              <LineChart
                data={getChartData()}
                width={screenWidth - 80}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: colors.primary,
                    fill: colors.primary,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            )}
          </View>
        </View>
        {/* Metric Selector */}
        <View className="px-6 py-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {metrics.map((metric, index) => {
                const icons = [
                  BarChart2,
                  Mic,
                  MessageCircle,
                  Repeat,
                  PauseCircle,
                  Volume2,
                ];
                const IconComponent = icons[index];
                return (
                  <TouchableOpacity
                    key={metric}
                    className="mr-3 py-3 px-4 rounded-2xl flex-row items-center"
                    style={{
                      backgroundColor:
                        selectedMetric === metric
                          ? colors.primary
                          : colors.card,
                      shadowColor: theme === "dark" ? "#000" : "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: theme === "dark" ? 0.3 : 0.1,
                      shadowRadius: 6,
                      elevation: 3,
                    }}
                    onPress={() => setSelectedMetric(metric)}
                  >
                    <View
                      className="rounded-full p-1.5 mr-2"
                      style={{
                        backgroundColor:
                          selectedMetric === metric
                            ? "rgba(255, 255, 255, 0.2)"
                            : theme === "dark"
                              ? colors.surface
                              : "#f0f9ff",
                      }}
                    >
                      <IconComponent
                        size={14}
                        color={
                          selectedMetric === metric ? "white" : colors.primary
                        }
                      />
                    </View>
                    <Text
                      className="font-semibold text-sm"
                      style={{
                        color:
                          selectedMetric === metric ? "white" : colors.text,
                      }}
                    >
                      {metric}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
        {/* Current Performance Score Cards */}
        <View className="px-6 pb-4">
          <Text
            className="text-lg font-bold mb-3"
            style={{ color: colors.text }}
          >
            Current Performance
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {renderScoreCard(
                "Score",
                currentOverallScore,
                <Award />, // Or a more relevant icon for score
                theme === "dark" ? "#4c1d95" : "#ede9fe", // Purple
                theme === "dark" ? "#d8b4fe" : "#8b5cf6",
                overallScoreImprovement,
                true, // Higher is better
              )}
              {renderScoreCard(
                "Fillers",
                currentFillerWordsCount,
                <Mic />,
                theme === "dark" ? "#a16207" : "#fffbeb", // Amber
                theme === "dark" ? "#fcd34d" : "#fbbf24",
                fillerWordsImprovement,
                false, // Lower is better
              )}
              {renderScoreCard(
                "Crutches",
                currentCrutchPhrasesCount,
                <Zap />, // Represents quick, unnecessary words
                theme === "dark" ? "#be123c" : "#fef2f2", // Red
                theme === "dark" ? "#fda4af" : "#f87171",
                crutchPhrasesImprovement,
                false, // Lower is better
              )}
            </View>
          </ScrollView>
        </View>

        {/* Recent Improvements */}
        <View
          className="px-6 py-6 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Recent Wins
          </Text>

          <View className="space-y-1">
            {recentAchievements.map((achievement, index) => {
              const { Icon, color } = achievementIcons[achievement.iconIndex];

              return (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center justify-between py-3 px-4 rounded-2xl mb-3"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="rounded-xl p-2 mr-3"
                      style={{ backgroundColor: colors.card }}
                    >
                      <Icon size={20} color={color} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold" style={{ color: colors.text }}>
                        {achievement.tag}
                      </Text>
                      <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                        {achievement.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
        {/* Suggested Focus Areas */}
        <View className="px-6 py-6">
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Next Level Goals
          </Text>
          <View className="space-y-1">
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4 rounded-2xl mb-3"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="rounded-xl p-2 mr-3"
                  style={{ backgroundColor: colors.card }}
                >
                  <Target size={20} color={colors.warning} />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Master Strategic Pauses
                  </Text>
                  <Text
                    className="text-sm mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Use pauses to create impact and emphasis
                  </Text>
                </View>
              </View>
              <View className="bg-orange-100 rounded-full px-3 py-1">
                <Text className="text-orange-600 font-bold text-xs">FOCUS</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4 rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="rounded-xl p-2 mr-3"
                  style={{ backgroundColor: colors.card }}
                >
                  <Mic size={20} color={colors.warning} />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Vocal Variety
                  </Text>
                  <Text
                    className="text-sm mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Practice varying tone, pitch, and volume
                  </Text>
                </View>
              </View>
              <View className="bg-orange-100 rounded-full px-3 py-1">
                <Text className="text-orange-600 font-bold text-xs">FOCUS</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PerformanceDashboard;
