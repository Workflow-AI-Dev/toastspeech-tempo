import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Check,
  X,
  Rocket,
  BarChart2,
  Award,
  Shield,
  Users,
  ChevronLeft,
} from "lucide-react-native";

export default function SubscriptionScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams();
  const isFromProfile = Array.isArray(from)
    ? from.includes("profile-settings")
    : from === "profile-settings";

  const [selectedPlan, setSelectedPlan] = useState("free"); // Highlight Try & Taste by default
  const [planAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  useEffect(() => {
    planAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const plans = [
    {
      id: "free",
      name: "Try & Taste",
      price: "$0",
      usage: "1 evaluation/month",
      features: [
        "Basic voice-only AI evaluation",
        "Sandwich summary only",
        "Limited dashboard: filler words + pace",
        "Watermarked reports",
      ],
      limitations: [
        "No video uploads",
        "No evaluator tools",
        "No downloadable reports",
      ],
    },
    {
      id: "essential",
      name: "Practice & Improve",
      price: "$5/month",
      usage: "2 evaluations/month",
      features: [
        "Voice + video AI evaluations",
        "Full evaluation breakdown (grammar, tone, etc.)",
        "Improvement history",
        "Clean downloadable reports",
        "Email insights after each speech",
      ],
      limitations: [],
    },
    {
      id: "pro",
      name: "Coach & Analyze",
      price: "$20/month",
      usage: "10 evaluations/month",
      features: [
        "Everything in Essential",
        "Evaluator Mode (record your own eval)",
        "AI feedback on evaluations",
        "Long-term analytics history",
        "Team collaboration tools",
      ],
      limitations: [],
    },
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setTimeout(() => {
      router.push("/");
    }, 800);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1 px-6 pt-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        {isFromProfile && (
          <View className="absolute top-4 left-4 z-10">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <ChevronLeft size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>
        )}

        <View className="items-center mb-10">
          <View className="bg-neutral-200 rounded-full p-6 mb-4">
            <Rocket size={32} color="#0f172a" />
          </View>
          <Text className="text-3xl font-semibold text-gray-900 text-center">
            Choose your plan
          </Text>
          <Text className="text-base text-gray-500 mt-2 text-center">
            Flexible pricing to support your speaking goals.
          </Text>
        </View>

        <View className="space-y-8">
          {plans.map((plan, i) => (
            <Animated.View
              key={plan.id}
              style={{
                opacity: planAnimations[i],
                transform: [
                  {
                    translateY: planAnimations[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                className={`rounded-2xl p-6 border ${
                  selectedPlan === plan.id
                    ? "border-black bg-white shadow-xl"
                    : "border-neutral-200 bg-neutral-100"
                }`}
                onPress={() => handlePlanSelect(plan.id)}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xl font-medium text-gray-900">
                    {plan.name}
                  </Text>
                  <Text className="text-lg font-semibold text-gray-700">
                    {plan.price}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500 mb-4">{plan.usage}</Text>

                <View className="space-y-2">
                  {plan.features.map((feat, idx) => (
                    <View key={idx} className="flex-row items-center">
                      <Check size={18} color="#22c55e" className="mr-2" />
                      <Text className="text-gray-700 text-base">{feat}</Text>
                    </View>
                  ))}
                  {plan.limitations.map((lim, idx) => (
                    <View key={idx} className="flex-row items-center">
                      <X size={18} color="#9ca3af" className="mr-2" />
                      <Text className="text-gray-400 text-base line-through">
                        {lim}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View className="mt-16 px-6 py-8 bg-white rounded-2xl border border-gray-200 space-y-6 shadow-sm">
          <Benefit
            icon={BarChart2}
            title="Progress Analytics"
            desc="Track clarity, pacing, and improvement trends over time."
          />
          <Divider />
          <Benefit
            icon={Award}
            title="Feedback That Guides"
            desc="Useful suggestions to help you grow with each speech."
          />
          <Divider />
          <Benefit
            icon={Shield}
            title="Your Data is Yours"
            desc="We respect your privacy. Data is encrypted and secure."
          />
          <Divider />
          <Benefit
            icon={Users}
            title="Private, Growing Community"
            desc="Join fellow speakers who care about leveling up — quietly."
          />
        </View>

        {/* Skip Button */}
        {!isFromProfile && (
          <View className="mt-16 mb-10 items-center">
            <TouchableOpacity
              className="bg-neutral-800 px-6 py-4 rounded-full"
              onPress={() => router.push("/")}
            >
              <Text className="text-white font-semibold text-lg">
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const Benefit = ({ icon: Icon, title, desc }) => (
  <View className="flex-row items-start">
    <View className="w-8 h-8 mr-4 justify-center items-center">
      <Icon size={20} color="#0f172a" />
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-900 mb-1">
        {title}
      </Text>
      <Text className="text-sm text-gray-500 leading-relaxed">{desc}</Text>
    </View>
  </View>
);

const Divider = () => <View className="w-full h-px bg-gray-100" />;
