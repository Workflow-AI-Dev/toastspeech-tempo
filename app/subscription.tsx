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
  Rocket,
  Trophy,
  Target,
  Heart,
  Users,
  TrendingUp,
} from "lucide-react-native";

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("essential");
  const [animatedValue] = useState(new Animated.Value(0));
  const [planAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);
  const [celebrationAnim] = useState(new Animated.Value(0));
  const [floatingElements] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  useEffect(() => {
    // Main entrance animation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Staggered plan animations
    const animatePlans = () => {
      planAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 700,
          delay: index * 250,
          useNativeDriver: true,
        }).start();
      });
    };

    // Floating elements animation
    const animateFloatingElements = () => {
      floatingElements.forEach((element, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(element, {
              toValue: 1,
              duration: 3000 + index * 800,
              useNativeDriver: true,
            }),
            Animated.timing(element, {
              toValue: 0,
              duration: 3000 + index * 800,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      });
    };

    setTimeout(animatePlans, 400);
    setTimeout(animateFloatingElements, 800);
  }, []);

  const plans = [
    {
      id: "free",
      name: "Try & Taste",
      tagline: "Perfect for getting started 🌱",
      price: "FREE",
      icon: Mic,
      emoji: "🎤",
      color: "#6b7280",
      bgColor: "#f9fafb",
      borderColor: "#e5e7eb",
      gradient: "from-gray-100 to-gray-200",
      features: [
        "1 speech analysis per month",
        "Basic AI feedback on pace & clarity",
        "Simple progress tracking",
        "Community forum access",
      ],
      limitations: [
        "No video analysis",
        "No detailed emotion tracking",
        "No evaluation tools",
      ],
      cta: "Start Free Journey 🚀",
      subtitle: "Dip your toes in!",
    },
    {
      id: "essential",
      name: "Practice & Improve",
      tagline: "For regular speakers 🚀",
      price: "$5",
      period: "/month",
      icon: Zap,
      emoji: "⚡",
      color: "#3b82f6",
      bgColor: "#eff6ff",
      borderColor: "#3b82f6",
      gradient: "from-blue-500 to-indigo-600",
      popular: true,
      features: [
        "5 speech analyses per month",
        "Video + voice analysis with emotions",
        "Detailed feedback & improvement tips",
        "Progress tracking with charts",
        "Custom practice exercises",
        "Weekly progress emails",
      ],
      limitations: [],
      cta: "Level Up Now! ⚡",
      subtitle: "Most popular choice!",
      savings: "Save $12/year vs monthly",
    },
    {
      id: "pro",
      name: "Coach & Analyze",
      tagline: "For serious speakers 👑",
      price: "$20",
      period: "/month",
      icon: Crown,
      emoji: "🏆",
      color: "#7c3aed",
      bgColor: "#faf5ff",
      borderColor: "#7c3aed",
      gradient: "from-purple-600 to-pink-600",
      features: [
        "Unlimited speech analyses",
        "Advanced evaluator mode",
        "Team collaboration tools",
        "Priority support & coaching",
        "Advanced analytics dashboard",
        "1-on-1 monthly coaching call",
        "Custom speech templates",
      ],
      limitations: [],
      cta: "Become a Pro! 👑",
      subtitle: "For the ambitious!",
      badge: "BEST VALUE",
    },
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);

    // Celebration micro-animation
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Main scale animation
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate subscription process with celebration
    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Floating Background Elements */}
        <View className="absolute inset-0 overflow-hidden">
          <Animated.View
            className="absolute top-20 right-8"
            style={{
              transform: [
                {
                  translateY: floatingElements[0].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -30],
                  }),
                },
              ],
              opacity: floatingElements[0].interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.6],
              }),
            }}
          >
            <View className="bg-yellow-100 rounded-full p-4">
              <Star size={28} color="#f59e0b" />
            </View>
          </Animated.View>

          <Animated.View
            className="absolute top-60 left-6"
            style={{
              transform: [
                {
                  translateY: floatingElements[1].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 25],
                  }),
                },
              ],
              opacity: floatingElements[1].interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              }),
            }}
          >
            <View className="bg-green-100 rounded-full p-3">
              <TrendingUp size={24} color="#10b981" />
            </View>
          </Animated.View>

          <Animated.View
            className="absolute bottom-96 right-12"
            style={{
              transform: [
                {
                  translateY: floatingElements[2].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
              ],
              opacity: floatingElements[2].interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 0.8],
              }),
            }}
          >
            <View className="bg-purple-100 rounded-full p-3">
              <Award size={22} color="#8b5cf6" />
            </View>
          </Animated.View>

          <Animated.View
            className="absolute bottom-40 left-8"
            style={{
              transform: [
                {
                  translateY: floatingElements[3].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15],
                  }),
                },
              ],
              opacity: floatingElements[3].interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6],
              }),
            }}
          >
            <View className="bg-pink-100 rounded-full p-2">
              <Heart size={20} color="#ec4899" />
            </View>
          </Animated.View>
        </View>

        {/* Header */}
        <Animated.View
          className="px-6 py-6 relative z-10"
          style={{
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          }}
        >
          <View className="items-center mb-10">
            <Animated.View
              className="relative mb-6"
              style={{
                transform: [
                  {
                    scale: celebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              }}
            >
              <View className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full p-8 shadow-2xl border-4 border-white">
                <Rocket size={64} color="#6366f1" />
              </View>
              <View className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-3 shadow-lg">
                <Sparkles size={24} color="white" />
              </View>
              <View className="absolute -bottom-2 -left-2 bg-pink-400 rounded-full p-2">
                <Heart size={16} color="white" />
              </View>
            </Animated.View>

            <Text className="text-5xl font-black text-gray-900 text-center mb-4 leading-tight">
              Choose Your
            </Text>
            <Text className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-center mb-6">
              Speaking Journey! 🚀
            </Text>
            <Text className="text-gray-600 text-center text-xl leading-relaxed px-4 mb-8">
              Every great speaker started with a single step.
              <Text className="font-bold text-indigo-600">
                {" "}
                Which step is yours?
              </Text>
            </Text>

            {/* Journey Pills */}
            <View className="flex-row flex-wrap justify-center gap-3 mb-4">
              <View className="bg-indigo-100 rounded-full px-5 py-3 border border-indigo-200">
                <Text className="text-indigo-700 font-bold text-sm">
                  🎯 Personalized AI
                </Text>
              </View>
              <View className="bg-purple-100 rounded-full px-5 py-3 border border-purple-200">
                <Text className="text-purple-700 font-bold text-sm">
                  ⚡ Instant Results
                </Text>
              </View>
              <View className="bg-pink-100 rounded-full px-5 py-3 border border-pink-200">
                <Text className="text-pink-700 font-bold text-sm">
                  🏆 Proven Growth
                </Text>
              </View>
            </View>

            {/* Social Proof */}
            <View className="flex-row items-center space-x-6 mt-4">
              <View className="items-center">
                <Text className="text-3xl font-black text-indigo-600">
                  10K+
                </Text>
                <Text className="text-gray-500 text-sm font-semibold">
                  Happy Speakers
                </Text>
              </View>
              <View className="w-px h-10 bg-gray-300" />
              <View className="items-center">
                <Text className="text-3xl font-black text-purple-600">
                  50K+
                </Text>
                <Text className="text-gray-500 text-sm font-semibold">
                  Speeches Analyzed
                </Text>
              </View>
              <View className="w-px h-10 bg-gray-300" />
              <View className="items-center">
                <Text className="text-3xl font-black text-green-600">95%</Text>
                <Text className="text-gray-500 text-sm font-semibold">
                  See Improvement
                </Text>
              </View>
            </View>
          </View>

          {/* Plans */}
          <View className="space-y-8">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              const isSelected = selectedPlan === plan.id;

              return (
                <Animated.View
                  key={plan.id}
                  style={{
                    opacity: planAnimations[index],
                    transform: [
                      {
                        translateY: planAnimations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [60, 0],
                        }),
                      },
                      {
                        scale: planAnimations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    className={`rounded-3xl p-8 border-3 relative overflow-hidden ${
                      isSelected ? "shadow-2xl" : "shadow-lg"
                    }`}
                    style={{
                      borderColor: isSelected ? plan.borderColor : "#e5e7eb",
                      backgroundColor: isSelected ? plan.bgColor : "#ffffff",
                      transform: [{ scale: isSelected ? 1.03 : 1 }],
                    }}
                    onPress={() => handlePlanSelect(plan.id)}
                    activeOpacity={0.9}
                  >
                    {/* Background Gradient Overlay */}
                    {isSelected && (
                      <View className="absolute inset-0 opacity-5">
                        <View
                          className={`flex-1 bg-gradient-to-br ${plan.gradient}`}
                        />
                      </View>
                    )}

                    {/* Popular Badge */}
                    {plan.popular && (
                      <View className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                        <View className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full px-8 py-3 shadow-xl border-2 border-white">
                          <View className="flex-row items-center">
                            <Star size={16} color="white" />
                            <Text className="text-white text-sm font-black ml-1">
                              MOST POPULAR
                            </Text>
                            <Sparkles
                              size={14}
                              color="white"
                              className="ml-1"
                            />
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Best Value Badge */}
                    {plan.badge && (
                      <View className="absolute -top-3 -right-3 z-10">
                        <View className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-4 py-2 shadow-lg">
                          <Text className="text-white text-xs font-black">
                            {plan.badge}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Plan Header */}
                    <View className="flex-row items-center justify-between mb-8">
                      <View className="flex-row items-center flex-1">
                        <View className="relative mr-5">
                          <View
                            className="rounded-3xl p-5 shadow-lg"
                            style={{
                              backgroundColor: isSelected
                                ? "#ffffff"
                                : plan.bgColor,
                            }}
                          >
                            <IconComponent size={36} color={plan.color} />
                          </View>
                          <View className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                            <Text className="text-2xl">{plan.emoji}</Text>
                          </View>
                        </View>
                        <View className="flex-1">
                          <Text className="text-2xl font-black text-gray-900 mb-1">
                            {plan.name}
                          </Text>
                          <Text className="text-gray-600 text-lg font-medium">
                            {plan.tagline}
                          </Text>
                          <Text className="text-gray-500 text-sm mt-1">
                            {plan.subtitle}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <View className="flex-row items-baseline">
                          <Text className="text-5xl font-black text-gray-900">
                            {plan.price}
                          </Text>
                          {plan.period && (
                            <Text className="text-gray-600 ml-1 text-xl font-semibold">
                              {plan.period}
                            </Text>
                          )}
                        </View>
                        {plan.savings && (
                          <Text className="text-green-600 text-sm font-bold mt-1">
                            {plan.savings}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Features */}
                    <View className="space-y-5 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <View
                          key={featureIndex}
                          className="flex-row items-center"
                        >
                          <View className="bg-green-100 rounded-full p-2 mr-4 shadow-sm">
                            <Check size={18} color="#10b981" />
                          </View>
                          <Text className="text-gray-700 flex-1 text-lg font-medium leading-relaxed">
                            {feature}
                          </Text>
                        </View>
                      ))}
                      {plan.limitations.map((limitation, limitIndex) => (
                        <View
                          key={limitIndex}
                          className="flex-row items-center"
                        >
                          <View className="bg-gray-100 rounded-full p-2 mr-4">
                            <X size={18} color="#6b7280" />
                          </View>
                          <Text className="text-gray-500 flex-1 text-lg">
                            {limitation}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* CTA Button */}
                    <TouchableOpacity
                      className={`rounded-3xl py-5 px-8 shadow-lg ${
                        plan.id === "free"
                          ? "bg-gray-100 border-2 border-gray-200"
                          : isSelected
                            ? `bg-gradient-to-r ${plan.gradient}`
                            : "bg-gray-50 border-2 border-gray-200"
                      }`}
                      onPress={() => handlePlanSelect(plan.id)}
                      activeOpacity={0.8}
                    >
                      <View className="flex-row items-center justify-center">
                        <Text
                          className={`font-black text-xl ${
                            plan.id === "free"
                              ? "text-gray-700"
                              : isSelected
                                ? "text-white"
                                : "text-gray-600"
                          }`}
                        >
                          {plan.cta}
                        </Text>
                        {isSelected && plan.id !== "free" && (
                          <Sparkles size={22} color="white" className="ml-2" />
                        )}
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* Benefits Section */}
          <View className="mt-16">
            <Text className="text-3xl font-black text-gray-900 mb-3 text-center">
              Why ToastSpeech? 🤔
            </Text>
            <Text className="text-xl text-gray-600 mb-10 text-center leading-relaxed">
              Join thousands who've transformed their speaking confidence
            </Text>

            <View className="space-y-6">
              <View className="flex-row items-start bg-white/80 rounded-3xl p-6 shadow-lg">
                <View className="bg-indigo-100 rounded-3xl p-4 mr-5">
                  <BarChart2 size={28} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <Text className="font-black text-gray-900 mb-2 text-xl">
                    Track Every Improvement 📈
                  </Text>
                  <Text className="text-gray-600 text-lg leading-relaxed">
                    Watch your confidence soar with detailed analytics showing
                    your pace, clarity, and emotional delivery improvements over
                    time.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start bg-white/80 rounded-3xl p-6 shadow-lg">
                <View className="bg-purple-100 rounded-3xl p-4 mr-5">
                  <Award size={28} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text className="font-black text-gray-900 mb-2 text-xl">
                    AI That Actually Helps 🤖✨
                  </Text>
                  <Text className="text-gray-600 text-lg leading-relaxed">
                    Get instant, personalized feedback that feels like having a
                    professional speaking coach in your pocket 24/7.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start bg-white/80 rounded-3xl p-6 shadow-lg">
                <View className="bg-cyan-100 rounded-3xl p-4 mr-5">
                  <Shield size={28} color="#06b6d4" />
                </View>
                <View className="flex-1">
                  <Text className="font-black text-gray-900 mb-2 text-xl">
                    Your Privacy Matters 🔒
                  </Text>
                  <Text className="text-gray-600 text-lg leading-relaxed">
                    Your speeches are processed securely and never shared. What
                    happens in ToastSpeech, stays in ToastSpeech.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start bg-white/80 rounded-3xl p-6 shadow-lg">
                <View className="bg-green-100 rounded-3xl p-4 mr-5">
                  <Users size={28} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="font-black text-gray-900 mb-2 text-xl">
                    Join the Community 👥
                  </Text>
                  <Text className="text-gray-600 text-lg leading-relaxed">
                    Connect with fellow speakers, share experiences, and
                    celebrate each other's victories in our supportive
                    community.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Testimonial */}
          <View className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
            <View className="items-center">
              <View className="flex-row mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} color="#f59e0b" fill="#f59e0b" />
                ))}
              </View>
              <Text className="text-xl font-bold text-gray-900 text-center mb-4 leading-relaxed">
                "ToastSpeech transformed my fear of public speaking into genuine
                excitement. The AI feedback is incredibly accurate!"
              </Text>
              <Text className="text-gray-600 font-semibold">
                - Sarah M., Marketing Director
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View className="mt-12 pt-8 border-t border-gray-200">
            <View className="items-center">
              <Text className="text-gray-500 text-lg text-center leading-relaxed mb-6">
                ✅ Cancel anytime • ✅ No hidden fees • ✅ 30-day money-back
                guarantee
              </Text>
              <TouchableOpacity
                className="bg-white/80 rounded-full px-8 py-4 border border-gray-200"
                onPress={() => router.push("/")}
              >
                <Text className="text-indigo-600 font-bold text-lg">
                  Maybe later 🤔
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
