import EvaluatorModeScreen from "./screens/EvaluatorModeScreen";
import { useRouter } from "expo-router";

export default function EvaluatorMode() {
  const router = useRouter();

  return <EvaluatorModeScreen onBack={() => router.back()} />;
}
