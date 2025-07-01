import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Check,
  X,
  Rocket,
  BarChart2,
  Award,
  Shield,
  Users,
} from "lucide-react-native";

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("essential");
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
      price: "Free",
      features: [
        "1 speech analysis/month",
        "Basic feedback",
        "Access to community forum",
      ],
      limitations: ["No video analysis", "No evaluator tools"],
    },
    {
      id: "essential",
      name: "Practice & Improve",
      price: "$5/mo",
      features: [
        "5 analyses/month",
        "Video + voice analysis",
        "Detailed feedback",
        "Progress tracking",
      ],
      limitations: [],
    },
    {
      id: "pro",
      name: "Coach & Analyze",
      price: "$20/mo",
      features: [
        "Unlimited analyses",
        "Evaluator mode",
        "Team collaboration",
        "1-on-1 coaching",
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
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-medium text-gray-900">
                    {plan.name}
                  </Text>
                  <Text className="text-lg font-semibold text-gray-700">
                    {plan.price}
                  </Text>
                </View>

                <View className="space-y-3">
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
          {/* Benefit Item */}
          <View className="flex-row items-start">
            <View className="w-8 h-8 mr-4 justify-center items-center">
              <BarChart2 size={20} color="#0f172a" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                Progress Analytics
              </Text>
              <Text className="text-sm text-gray-500 leading-relaxed">
                Track clarity, pacing, and improvement trends over time.
              </Text>
            </View>
          </View>

          <View className="w-full h-px bg-gray-100" />

          {/* Benefit Item */}
          <View className="flex-row items-start">
            <View className="w-8 h-8 mr-4 justify-center items-center">
              <Award size={20} color="#0f172a" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                Feedback That Guides
              </Text>
              <Text className="text-sm text-gray-500 leading-relaxed">
                Useful suggestions to help you grow with each speech.
              </Text>
            </View>
          </View>

          <View className="w-full h-px bg-gray-100" />

          {/* Benefit Item */}
          <View className="flex-row items-start">
            <View className="w-8 h-8 mr-4 justify-center items-center">
              <Shield size={20} color="#0f172a" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                Your Data is Yours
              </Text>
              <Text className="text-sm text-gray-500 leading-relaxed">
                We respect your privacy. Data is encrypted and secure.
              </Text>
            </View>
          </View>

          <View className="w-full h-px bg-gray-100" />

          {/* Benefit Item */}
          <View className="flex-row items-start">
            <View className="w-8 h-8 mr-4 justify-center items-center">
              <Users size={20} color="#0f172a" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                Private, Growing Community
              </Text>
              <Text className="text-sm text-gray-500 leading-relaxed">
                Join fellow speakers who care about leveling up — quietly.
              </Text>
            </View>
          </View>
        </View>

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
      </ScrollView>
    </SafeAreaView>
  );
}
