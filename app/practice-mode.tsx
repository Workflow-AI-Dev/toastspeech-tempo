import PracticeModeScreen from "./screens/PracticeModeScreen";
import { useRouter } from "expo-router";

export default function PracticeMode() {
  const router = useRouter();

  return <PracticeModeScreen onBack={() => router.back()} />;
}
