import DetailedFeedbackEvalScreen from "./screens/DetailedFeedbackEvalScreen";
import { useLocalSearchParams, useRouter } from "expo-router";

export const navigationOptions = {
  headerShown: false,
};

export default function DetailedFeedbackEval() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let parsedFeedback = {};
  try {
    parsedFeedback = JSON.parse(params.feedback as string);
    console.log("Parsed feedback:", parsedFeedback);
  } catch (e) {
    console.error("Failed to parse feedback JSON.");
    console.error("Raw feedback input:", params.feedback);
    console.error("Parse error:", e instanceof Error ? e.message : e);
  }

  return (
    <DetailedFeedbackEvalScreen
      detailed={parsedFeedback}
      onBack={() => router.back()}
    />
  );
}
