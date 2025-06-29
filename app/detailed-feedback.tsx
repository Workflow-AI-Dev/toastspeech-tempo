import DetailedFeedbackScreen from "./screens/DetailedFeedbackScreen";
import { useRouter } from "expo-router";

export default function DetailedFeedback() {
  const router = useRouter();

  return <DetailedFeedbackScreen onBack={() => router.back()} />;
}
