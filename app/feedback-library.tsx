import FeedbackLibrary from "./components/FeedbackLibrary";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, TouchableOpacity, Text } from "react-native";
import { BarChart2, BookOpen, User, House } from "lucide-react-native";
import { useTheme, getThemeColors } from "./context/ThemeContext";

export default function FeedbackLibraryPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <FeedbackLibrary
        onViewDetailedFeedback={() => router.push("/detailed-feedback")}
        onViewDetailedFeedbackEval={() =>
          router.push("/detailed-feedback-eval")
        }
      />
      ;{/* Bottom Navigation */}
      <View
        className="flex-row justify-around items-center py-4 border-t"
        style={{ backgroundColor: colors.card, borderTopColor: colors.border }}
      >
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/")}
        >
          <View
            className="rounded-2xl p-3"
            style={{ backgroundColor: colors.surface }}
          >
            <House size={22} color={colors.textSecondary} />
          </View>
          <Text
            className="text-xs mt-2"
            style={{ color: colors.textSecondary }}
          >
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/performance-dashboard")}
        >
          <View
            className="rounded-2xl p-3"
            style={{ backgroundColor: colors.surface }}
          >
            <BarChart2 size={22} color={colors.textSecondary} />
          </View>
          <Text
            className="text-xs mt-2 font-semibold"
            style={{ color: colors.textSecondary }}
          >
            Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/feedback-library")}
        >
          <View
            className="rounded-2xl p-3"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <BookOpen size={22} color={colors.primary} />
          </View>
          <Text className="text-xs mt-2" style={{ color: colors.primary }}>
            Library
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/profile-settings")}
        >
          <View
            className="rounded-2xl p-3"
            style={{ backgroundColor: colors.surface + "20" }}
          >
            <User size={22} color={colors.textSecondary} />
          </View>
          <Text
            className="text-xs mt-2 font-semibold"
            style={{ color: colors.textSecondary }}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
