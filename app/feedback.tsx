import FeedbackScreen from "./screens/FeedbackScreen";
import { useRouter } from "expo-router";

export default function PracticeMode() {
  const router = useRouter();

  return <FeedbackScreen/>;
}
