import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Check,
  X,
  ChevronLeft,
  PartyPopper,
  Clock4,
  Mail,
  BadgeDollarSign,
  Sparkles,
  Mic2,
  BookOpenCheck,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const plans = [
{
    id: "aspiring",
    name: "Aspiring Speaker",
    price: "$5/month",
    description: "Boost your foundational skills",
    features: [
      "3 AI Speech Feedbacks (audio or video)",
      "7 Practice sessions (audio or video)",
      "Progress tracker and store speech audio",
    ],
    limitations: [],
    tag: "14-Day Free Trial",
    icon: <Sparkles size={20} color="#a855f7" />,
  },
  {
    id: "casual",
    name: "Casual Speaker",
    price: "Free",
    description: "Perfect for light practice",
    features: [
      "2 AI Speech Feedbacks (audio only)",
      "3 Practice sessions (audio only)",
    ],
    limitations: ["No progress tracker or analytics", "Not storing speeches"],
    tag: null,
    icon: <Mic2 size={20} color="#2563eb" />,
  },
];

export default function TrialIntroScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams();
  const isFromProfile = Array.isArray(from)
    ? from.includes("profile-settings")
    : from === "profile-settings";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>

        {/* Back Button */}
        {isFromProfile && (
          <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-4 z-10 p-2">
            <ChevronLeft size={24} color="#0f172a" />
          </TouchableOpacity>
        )}

        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-neutral-900 text-3xl font-semibold text-center">
            Welcome to Echozi!
          </Text>
          <Text className="text-neutral-600 text-base text-center mt-2">
            You’re starting with a 14-day free trial.
          </Text>
        </View>

        {/* Trial Info Bullets */}
        <View className="space-y-6 mb-12">
          <InfoItem
            icon={<PartyPopper size={20} color="#10b981" />}
            title="No credit card required"
            description="Enjoy the trial with zero commitment — no billing info needed!"
          />
          <InfoItem
            icon={<Clock4 size={20} color="#f59e0b" />}
            title="After 14 days"
            description="You’ll be prompted to subscribe or continue with the free Casual plan."
          />
        </View>

        {/* Plans Preview */}
        <View className="space-y-8">
          {plans.map((plan) => (
            <View
              key={plan.id}
              className="rounded-2xl p-6 border border-gray-200 bg-gray-50"
            >
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center space-x-2">
                  {plan.icon}
                  <Text className="text-xl font-semibold text-neutral-900">{plan.name}</Text>
                </View>
                <Text className="text-lg font-semibold text-neutral-700">{plan.price}</Text>
              </View>
              <Text className="text-sm text-neutral-500 mb-4">{plan.description}</Text>

              {plan.tag && (
                <View className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-blue-500">
                  <Text className="text-white text-xs font-bold uppercase">
                    {plan.tag}
                  </Text>
                </View>
              )}

              <View className="space-y-2 mt-4">
                {plan.features.map((feat, idx) => (
                  <View key={idx} className="flex-row items-center">
                    <Check size={18} color="#10b981" />
                    <Text className="text-neutral-800 text-base ml-2">{feat}</Text>
                  </View>
                ))}
                {plan.limitations.map((lim, idx) => (
                  <View key={idx} className="flex-row items-center">
                    <X size={18} color="#9ca3af" />
                    <Text className="text-neutral-400 text-base line-through ml-2">{lim}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Finish Button */}
        <View className="mt-14 mb-10 items-center">
          <TouchableOpacity
            className="bg-indigo-600 px-6 py-4 rounded-full"
            onPress={() => router.push("/")}
          >
            <Text className="text-white font-semibold text-lg">Finish →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoItem = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <View className="flex-row items-start space-x-4">
    <View className="mt-1">{icon}</View>
    <View className="flex-1">
      <Text className="text-neutral-900 font-semibold text-base">{title}</Text>
      <Text className="text-neutral-600 text-sm mt-1">{description}</Text>
    </View>
  </View>
);
