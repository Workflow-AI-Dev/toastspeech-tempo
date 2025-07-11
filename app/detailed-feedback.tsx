import DetailedFeedbackScreen from "./screens/DetailedFeedbackScreen";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function DetailedFeedback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let parsedFeedback = {};
  try {
    parsedFeedback = JSON.parse(params.feedback as string);
  } catch (e) {
    console.error("Invalid feedback data passed");
  }

  return (
    <DetailedFeedbackScreen
      detailed={parsedFeedback}
      onBack={() => router.back()}
    />
  );
}
