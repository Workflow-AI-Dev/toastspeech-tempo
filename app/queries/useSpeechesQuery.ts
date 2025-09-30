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

export function useSpeechesQuery() {
  return useQuery({
    queryKey: ["speeches"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("No auth token");

      const response = await fetch(`${BASE_URL}/speech/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch speeches");

      const data = await response.json();

      return data.speeches.map((speech, idx, arr) => {
        const metadata = speech.summary?.Metadata || {};
        const currentScore = metadata.overall_score || 0;
        const previousScore =
          idx < arr.length - 1
            ? arr[idx + 1].summary?.Metadata?.overall_score || 0
            : null;

        const improvement =
          previousScore !== null
            ? `${currentScore - previousScore > 0 ? "+" : ""}${currentScore - previousScore}`
            : "first speech";

        return {
          id: speech.id || `speech-${idx}`,
          title: speech.title || "Untitled",
          date: formatDate(speech.created_at),
          duration: (() => {
            const totalSpeakingSeconds =
              speech.analytics?.speaker_analysis?.[0]
                ?.total_speaking_time_seconds || 0;
            const minutes = Math.floor(totalSpeakingSeconds / 60);
            const seconds = Math.floor(totalSpeakingSeconds % 60);
            return `${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`;
          })(),
          score: currentScore,
          pace: speech.analytics?.speaker_analysis?.[0]?.words_per_minute || 0,
          pause: speech.analytics?.speaker_analysis?.[0]?.pause_frequency || 0,
          pausesData: speech.analytics?.pauses || [],
          fillerData: speech.analytics?.filler_words || [],
          crutchData: speech.analytics?.crutch_phrases || [],
          repeatedPhrases: speech.analytics?.repeated_words || [],
          grammarData: speech.analytics?.grammar_mistakes || [],
          environData: speech.analytics?.environmental_elements || [],
          pitchData: speech.pitch_track || [],
          emoji: { name: "mic", color: "#7c3aed" },
          category: speech.speech_type || "General",
          improvement,
          summary: speech.summary,
          detailed: speech.detailed_evaluation,
          url: speech.url,
        };
      });
    },
    staleTime: 1000 * 60 * 5, // 5 min
    cacheTime: 1000 * 60 * 30, // 30 min
  });
}
