import SpeakerModeScreen from "./screens/SpeakerModeScreen";
import { useRouter } from "expo-router";

export default function SpeakerMode() {
  const router = useRouter();

  return (
    <SpeakerModeScreen
      onBack={() => router.back()}
      onViewDetailedFeedback={() => router.push("/detailed-feedback")}
    />
  );
}
