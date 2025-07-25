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

  // Default to 'aspiring' to highlight the trial, as per the requirement
  const [selectedPlan, setSelectedPlan] = useState("aspiring");
  const [planAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0), // Added for the 4th plan
  ]);

  // State to manage showing the trial message (could be set based on user's signup status)
  const [showTrialMessage, setShowTrialMessage] = useState(true); // Assuming new signups see this

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
      id: "casual",
      name: "Casual Speaker",
      price: "Free",
      description: "Perfect for light practice",
      features: [
        "2 AI Speech Feedbacks (audio only)",
        "3 Practice sessions (audio only)",
      ],
      limitations: ["No progress tracker or analytics", "Not storing speeches"],
      tag: null, // No special tag for this plan
    },
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
      tag: "14-Day Free Trial", // Special tag for the trial
    },
    {
      id: "committed",
      name: "Committed Speaker",
      price: "$12/month",
      description: "For serious growth and in-depth analysis",
      features: [
        "6 AI Speech Feedback (audio or video)",
        "2 AI Evaluation Feedback",
        "15 Practice sessions",
        "Progress tracker and store speech video",
      ],
      limitations: [],
      tag: "Most Popular",
    },
    {
      id: "coach",
      name: "Speech Coach",
      price: "$25/month",
      description: "Unleash your full speaking potential",
      features: [
        "10 AI Speech Feedbacks (audio or video)",
        "5 AI Evaluation Feedback",
        "30 Practice sessions",
        "Progress tracker and store speech video",
      ],
      limitations: [],
      tag: "Best Value",
    },
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    // In a real application, you would typically initiate a payment flow here
    // or set up the trial in your backend.
    // For now, we'll simulate going to the next screen.
    setTimeout(() => {
      router.push("/"); // Or to a confirmation/payment screen
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

          {/* Trial Information Banner */}
          {showTrialMessage && (
            <View className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg mt-6 w-full">
              <Text className="text-blue-800 text-sm font-semibold">
                New users get a 14-day free trial of the "Aspiring Speaker"
                plan, automatically downgrading to "Casual Speaker" (Free) after
                the trial period.
              </Text>
            </View>
          )}
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
                } ${plan.tag === "Most Popular" ? "border-purple-500" : ""}
                ${plan.tag === "Best Value" ? "border-green-500" : ""}`}
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
                <Text className="text-sm text-gray-500 mb-4">
                  {plan.description}
                </Text>

                {plan.tag && (
                  <View
                    className={`absolute -top-3 -right-3 px-3 py-1 rounded-full ${
                      plan.tag === "Most Popular"
                        ? "bg-purple-500"
                        : plan.tag === "Best Value"
                          ? "bg-green-500"
                          : "bg-blue-500"
                    }`}
                  >
                    <Text className="text-white text-xs font-bold uppercase">
                      {plan.tag}
                    </Text>
                  </View>
                )}

                <View className="space-y-2 mt-4">
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
            desc="Track improvement trends over time."
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
            desc="Join fellow speakers who care about leveling up."
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
