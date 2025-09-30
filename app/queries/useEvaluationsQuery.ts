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

export function useEvaluationsQuery() {
  return useQuery({
    queryKey: ["evaluations"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("No auth token");

      const response = await fetch(`${BASE_URL}/evaluator/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch evaluations");

      const data = await response.json();

      return data.evaluations.map((evaluation, idx, arr) => {
        const metadata = evaluation.summary?.Metadata || {};
        const currentScore = metadata.overall_score || 0;
        const previousScore =
          idx < arr.length - 1
            ? arr[idx + 1].summary?.Metadata?.overall_score || 0
            : null;

        const improvement =
          previousScore !== null
            ? `${currentScore - previousScore > 0 ? "+" : ""}${currentScore - previousScore}`
            : "0";

        return {
          id: evaluation.id || `evaluation-${idx}`,
          // date: 'Aug 17, 2025',
          date: formatDate(evaluation.created_at),
          speechTitle: evaluation.speech_title,
          duration: (() => {
            const totalSpeakingSeconds =
              evaluation.analytics?.speaker_analysis?.[0]
                ?.total_speaking_time_seconds || 0;
            const minutes = Math.floor(totalSpeakingSeconds / 60);
            const seconds = totalSpeakingSeconds % 60;
            return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
          })(),
          score: metadata.overall_score || 0,
          pace:
            evaluation.analytics?.speaker_analysis?.[0]?.words_per_minute || 0,
          pause:
            evaluation.analytics?.speaker_analysis?.[0]?.pause_frequency || 0,
          pausesData: evaluation.analytics?.pauses || [],
          fillerData: evaluation.analytics?.filler_words || [],
          crutchData: evaluation.analytics?.crutch_phrases || [],
          repeatedPhrases: evaluation.analytics?.repeated_words || [],
          grammarData: evaluation.analytics?.grammar_mistakes || [],
          environData: evaluation.analytics?.environmental_elements || [],
          pitchData: evaluation.pitch_track || [],
          emoji: { name: "mic", color: "#7c3aed" },
          improvement,
          summary: evaluation.summary,
          detailed: evaluation.detailed_evaluation,
        };
      });
    },
    staleTime: 1000 * 60 * 5, // 5 min
    cacheTime: 1000 * 60 * 30, // 30 min
  });
}
