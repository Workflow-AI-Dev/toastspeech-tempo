import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  X,
  Check,
  Zap,
  Crown,
  Star,
  Mic,
  BarChart2,
  Award,
  Shield,
  Sparkles,
} from "lucide-react-native";

interface SubscriptionPageProps {
  onClose?: () => void;
  currentPlan?: "free" | "essential" | "pro";
}

export default function SubscriptionPage({
  onClose = () => {},
  currentPlan = "free",
}: SubscriptionPageProps) {
  const [selectedPlan, setSelectedPlan] = useState("essential");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const plans = [
    {
      id: "free",
      name: "Starter",
      description: "Perfect for trying out Echozi",
      price: { monthly: 0, yearly: 0 },
      icon: Mic,
      color: "#6b7280",
      bgColor: "#f9fafb",
      borderColor: "#e5e7eb",
      features: [
        "1 speech analysis per month",
        "Basic AI feedback",
        "Progress tracking",
        "Community access",
      ],
      limitations: [
        "No video analysis",
        "No detailed reports",
        "No evaluation tools",
      ],
    },
    {
      id: "essential",
      name: "Essential",
      description: "For regular speakers who want to improve",
      price: { monthly: 9, yearly: 84 },
      icon: Zap,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      borderColor: "#3b82f6",
      popular: true,
      features: [
        "5 speech analyses per month",
        "Advanced AI feedback",
        "Video + voice analysis",
        "Detailed progress reports",
        "Custom practice exercises",
        "Priority support",
      ],
      limitations: [],
    },
    {
      id: "pro",
      name: "Professional",
      description: "For serious speakers and coaches",
      price: { monthly: 29, yearly: 299 },
      icon: Crown,
      color: "#7c3aed",
      bgColor: "#faf5ff",
      borderColor: "#7c3aed",
      features: [
        "Unlimited speech analyses",
        "Premium AI coaching",
        "Evaluation tools access",
        "Advanced analytics",
        "Team collaboration",
        "White-label reports",
        "1-on-1 coaching sessions",
        "Priority support",
      ],
      limitations: [],
    },
  ];

  const benefits = [
    {
      icon: BarChart2,
      title: "Track Your Progress",
      description:
        "See detailed analytics of your speaking improvement over time",
    },
    {
      icon: Award,
      title: "AI-Powered Feedback",
      description:
        "Get instant, personalized feedback on pace, clarity, and confidence",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your speeches are processed securely and never shared",
    },
  ];

  const getYearlySavings = (monthlyPrice: number) => {
    const yearlyEquivalent = monthlyPrice * 12;
    const plan = plans.find((p) => p.price.monthly === monthlyPrice);
    if (!plan) return 0;
    return Math.round(
      ((yearlyEquivalent - plan.price.yearly) / yearlyEquivalent) * 100,
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
        <View>
          <Text className="text-2xl font-bold text-gray-900">
            Choose Your Plan
          </Text>
          <Text className="text-gray-600 mt-1">
            Unlock your speaking potential
          </Text>
        </View>
        <TouchableOpacity
          className="bg-gray-100 rounded-full p-2"
          onPress={onClose}
        >
          <X size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Billing Toggle */}
        <View className="px-6 py-6">
          <View className="bg-gray-100 rounded-2xl p-1 flex-row">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl ${
                billingCycle === "monthly" ? "bg-white shadow-sm" : ""
              }`}
              onPress={() => setBillingCycle("monthly")}
            >
              <Text
                className={`text-center font-semibold ${
                  billingCycle === "monthly" ? "text-gray-900" : "text-gray-600"
                }`}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl ${
                billingCycle === "yearly" ? "bg-white shadow-sm" : ""
              }`}
              onPress={() => setBillingCycle("yearly")}
            >
              <Text
                className={`text-center font-semibold ${
                  billingCycle === "yearly" ? "text-gray-900" : "text-gray-600"
                }`}
              >
                Yearly
              </Text>
              <View className="bg-green-100 rounded-full px-2 py-1 mt-1 self-center">
                <Text className="text-green-700 text-xs font-bold">
                  Save up to 30%
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plans */}
        <View className="px-6 space-y-4">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const isCurrent = currentPlan === plan.id;
            const price = plan.price[billingCycle];
            const savings =
              billingCycle === "yearly"
                ? getYearlySavings(plan.price.monthly)
                : 0;

            return (
              <TouchableOpacity
                key={plan.id}
                className={`rounded-3xl p-6 border-2 ${
                  isSelected ? `border-2` : "border-gray-200"
                }`}
                style={{
                  borderColor: isSelected ? plan.borderColor : "#e5e7eb",
                  backgroundColor: isSelected ? plan.bgColor : "#ffffff",
                }}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {/* Plan Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View
                      className="rounded-2xl p-3 mr-3"
                      style={{
                        backgroundColor: isSelected ? "#ffffff" : plan.bgColor,
                      }}
                    >
                      <IconComponent size={24} color={plan.color} />
                    </View>
                    <View>
                      <View className="flex-row items-center">
                        <Text className="text-xl font-bold text-gray-900">
                          {plan.name}
                        </Text>
                        {plan.popular && (
                          <View className="bg-blue-100 rounded-full px-3 py-1 ml-2">
                            <Text className="text-blue-700 text-xs font-bold">
                              POPULAR
                            </Text>
                          </View>
                        )}
                        {isCurrent && (
                          <View className="bg-green-100 rounded-full px-3 py-1 ml-2">
                            <Text className="text-green-700 text-xs font-bold">
                              CURRENT
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-gray-600 mt-1">
                        {plan.description}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-baseline">
                      <Text className="text-3xl font-bold text-gray-900">
                        ${price}
                      </Text>
                      {price > 0 && (
                        <Text className="text-gray-600 ml-1">
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </Text>
                      )}
                    </View>
                    {savings > 0 && (
                      <Text className="text-green-600 text-sm font-semibold">
                        Save {savings}%
                      </Text>
                    )}
                  </View>
                </View>

                {/* Features */}
                <View className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <View key={index} className="flex-row items-center">
                      <Check size={16} color="#10b981" />
                      <Text className="text-gray-700 ml-2">{feature}</Text>
                    </View>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <View key={index} className="flex-row items-center">
                      <X size={16} color="#ef4444" />
                      <Text className="text-gray-500 ml-2">{limitation}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Benefits */}
        <View className="px-6 py-8">
          <Text className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Echozi?
          </Text>
          <View className="space-y-4">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <View key={index} className="flex-row items-start">
                  <View className="bg-indigo-100 rounded-2xl p-3 mr-4">
                    <IconComponent size={24} color="#6366f1" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900 mb-1">
                      {benefit.title}
                    </Text>
                    <Text className="text-gray-600">{benefit.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* CTA */}
        <View className="px-6 pb-8">
          <TouchableOpacity className="bg-indigo-600 rounded-2xl py-4 px-6 mb-4">
            <Text className="text-white font-bold text-lg text-center">
              {selectedPlan === "free"
                ? "Continue with Free"
                : "Start Free Trial"}
            </Text>
            {selectedPlan !== "free" && (
              <Text className="text-indigo-200 text-sm text-center mt-1">
                7 days free, then $
                {plans.find((p) => p.id === selectedPlan)?.price[billingCycle]}/
                {billingCycle === "monthly" ? "month" : "year"}
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-gray-500 text-xs text-center leading-relaxed">
            Cancel anytime. No hidden fees. Your data is always secure and
            private.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
