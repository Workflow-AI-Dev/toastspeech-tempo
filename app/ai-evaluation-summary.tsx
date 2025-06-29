import AIEvaluationSummaryScreen from "./screens/AIEvaluationSummaryScreen";
import { useRouter } from "expo-router";

export default function AIEvaluationSummary() {
  const router = useRouter();

  return (
    <AIEvaluationSummaryScreen
      onBack={() => router.back()}
      onViewDetailedFeedback={() => router.push("/detailed-feedback")}
    />
  );
}
