import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function usePracticeQuery() {
  return useQuery({
    queryKey: ["practice"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("No auth token");

      const response = await fetch(`${BASE_URL}/practice/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch speeches");

      const data = await response.json();

      return data.practices.map((practice, idx, arr) => {
        const currentScore = practice.evaluation.OverallScore || 0;
        const previousScore =
          idx < arr.length - 1
            ? arr[idx + 1].evaluation.OverallScore || 0
            : null;

        const improvement =
          previousScore !== null
            ? `${currentScore - previousScore > 0 ? "+" : ""}${currentScore - previousScore}`
            : "first practice session";

        return {
          id: practice.id || `practice-${idx}`,
          // date: 'Aug 17, 2025',
          date: formatDate(practice.created_at),
          title: practice.speech_title,
          category: practice.speech_type,
          duration: practice.speech_target_duration || "N/A",
          score: practice.evaluation.OverallScore || 0,
          pace: 0,
          pause: 0,
          emoji: { name: "mic", color: "#7c3aed" },
          improvement,
          evaluation: practice.evaluation,
        };
      });
    },
    staleTime: 1000 * 60 * 5, // 5 min
    cacheTime: 1000 * 60 * 30, // 30 min
  });
}
