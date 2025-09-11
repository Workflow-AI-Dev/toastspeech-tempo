import React, { useState, useEffect, useCallback } from "react";
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
import { BASE_URL } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [trialEndsInDays, setTrialEndsInDays] = useState(null);
  const [planStartsAt, setPlanStartsAt] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);


  const fetchStatus = useCallback(async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      console.warn("No auth token found.");
      return;
    }

    const res = await fetch(`${BASE_URL}/subscription/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok) {
      setSubscriptionStatus(data.subscription_status);

      if (data.plan_starts_at) {
        const planStartDate = new Date(data.plan_starts_at);
        setPlanStartsAt(planStartDate);

        const now = new Date();
        const minutesSinceStart = (now.getTime() - planStartDate.getTime()) / (1000 * 60);
        if (minutesSinceStart < 5) {
          setIsNewUser(true);
        }
      }

      if (data.subscription_status === "trialing" && data.trial_ends_at) {
        const endsAt = new Date(data.trial_ends_at);
        const now = new Date();
        const daysRemaining = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setTrialEndsInDays(daysRemaining);
      }
    } else {
      console.error("Subscription status fetch failed:", data);
    }
  } catch (error) {
    console.error("Error fetching subscription status", error);
  }
}, []);

  useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

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

  // Dynamically inject the trial tag if user is on a trial
  const updatedPlans = plans.map((plan) => {
    if (plan.id === "aspiring") {
      return {
        ...plan,
        tag: subscriptionStatus === "trialing" ? "14-Day Free Trial" : null,
      };
    }
    return plan;
  });


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
              {isNewUser ? (
                <Text className="text-blue-800 text-sm font-semibold">
                  🎉 Welcome! You’ve unlocked a 14-day free trial of *Aspiring Speaker*. After that, we’ll slide you into *Casual Speaker* (Free). Take a peek at the paid plans below — no pressure, you can decide later!
                </Text>
              ) : subscriptionStatus === "trialing" && trialEndsInDays !== null ? (
                <Text className="text-blue-800 text-sm font-semibold">
                  ⏳ {trialEndsInDays} day{trialEndsInDays !== 1 && "s"} left on your *Aspiring Speaker* trial! Then it’s back to *Casual Speaker* (Free) - or upgrade if you're loving it!
                </Text>
              ) : (
                <Text className="text-blue-800 text-sm font-semibold">
                  🚀 New here? Enjoy a 14-day free trial of *Aspiring Speaker*! We’ll drop you into *Casual Speaker* (Free) after.
                </Text>
              )}
            </View>
          )}

        </View>

        <View className="space-y-8">
          {updatedPlans.map((plan, i) => (
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
                }
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

        {/* Skip Button */}
        {!isFromProfile && (
          <View className="mt-10 mb-10 items-center">
            <TouchableOpacity
              className="bg-neutral-800 px-6 py-4 rounded-full"
              onPress={() => router.push("/")}
            >
              <Text className="text-white font-semibold text-lg">
                {isNewUser ? "Finish" : "Skip for now"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}