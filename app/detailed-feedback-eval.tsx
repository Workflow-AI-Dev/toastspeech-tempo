import DetailedFeedbackEvalScreen from "./screens/DetailedFeedbackEvalScreen";
import { useRouter } from "expo-router";

export const navigationOptions = {
  headerShown: false,
};

export default function DetailedFeedbackEval() {
  const router = useRouter();

  return <DetailedFeedbackEvalScreen onBack={() => router.back()} />;
}
