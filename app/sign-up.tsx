import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    ageGroup: "",
    profession: "",
    purposes: [] as string[],
    customPurpose: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));
  const [celebrationAnim] = useState(new Animated.Value(0));

  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
  const ageGroups = ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"];
  const professions = [
    "Student",
    "Professional",
    "Manager",
    "Executive",
    "Entrepreneur",
    "Teacher",
    "Other",
  ];
  const purposeOptions = [
    "Improve public speaking",
    "Track performance",
    "Toastmasters prep",
    "Evaluate others",
    "Other",
  ];

  const handlePurposeToggle = (purpose: string) => {
    const newPurposes = formData.purposes.includes(purpose)
      ? formData.purposes.filter((p) => p !== purpose)
      : [...formData.purposes, purpose];
    setFormData({ ...formData, purposes: newPurposes });
  };

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: currentStep / 3,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Slide animation for step transitions
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < 3) {
      // Celebration micro-animation
      Animated.sequence([
        Animated.timing(celebrationAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignUp = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert(
        "Almost there! 🎯",
        "Please fill in all required fields to continue your journey",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Oops! 🔐", "Passwords don't match - let's fix that!");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert(
        "Security First! 🛡️",
        "Password needs at least 6 characters to keep your progress safe",
      );
      return;
    }

    setIsLoading(true);
    // Simulate API call with celebration
    setTimeout(() => {
      setIsLoading(false);
      router.push("/subscription");
    }, 1500);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Let's get started! 🚀";
      case 2:
        return "Tell us about you 👋";
      case 3:
        return "What's your goal? 🎯";
      default:
        return "Create Account";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Just the basics to create your speaker profile";
      case 2:
        return "Help us personalize your experience";
      case 3:
        return "We'll customize your journey based on this";
      default:
        return "";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-indigo-50 to-purple-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              className="bg-white/80 rounded-full p-2"
              onPress={currentStep === 1 ? () => router.back() : prevStep}
            >
              <ArrowLeft size={20} color="#6b7280" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Text className="text-sm font-semibold text-gray-600 mr-2">
                {currentStep} of 3
              </Text>
              <Animated.View
                className="bg-indigo-100 rounded-full p-1"
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
                <Star size={16} color="#6366f1" />
              </Animated.View>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="bg-gray-200 rounded-full h-2 mb-6">
            <Animated.View
              className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full h-2"
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>

          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {getStepTitle()}
          </Text>
          <Text className="text-gray-600 text-lg">{getStepSubtitle()}</Text>
        </View>

        <Animated.View
          className="px-6 py-4"
          style={{
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
            ],
            opacity: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.8],
            }),
          }}
        >
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <View className="space-y-6 mb-8">
              <View>
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  What should we call you? 👋
                </Text>
                <TextInput
                  className="bg-white/80 rounded-3xl px-6 py-5 text-gray-900 text-lg border border-gray-200"
                  placeholder="Your awesome name"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  Your email address 📧
                </Text>
                <TextInput
                  className="bg-white/80 rounded-3xl px-6 py-5 text-gray-900 text-lg border border-gray-200"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  Create a secure password 🔐
                </Text>
                <View className="relative">
                  <TextInput
                    className="bg-white/80 rounded-3xl px-6 py-5 pr-14 text-gray-900 text-lg border border-gray-200"
                    placeholder="Make it strong!"
                    value={formData.password}
                    onChangeText={(text) =>
                      setFormData({ ...formData, password: text })
                    }
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    className="absolute right-5 top-5"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={24} color="#6b7280" />
                    ) : (
                      <Eye size={24} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  Confirm your password ✅
                </Text>
                <View className="relative">
                  <TextInput
                    className="bg-white/80 rounded-3xl px-6 py-5 pr-14 text-gray-900 text-lg border border-gray-200"
                    placeholder="Type it again"
                    value={formData.confirmPassword}
                    onChangeText={(text) =>
                      setFormData({ ...formData, confirmPassword: text })
                    }
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    className="absolute right-5 top-5"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={24} color="#6b7280" />
                    ) : (
                      <Eye size={24} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Demographics */}
          {currentStep === 2 && (
            <View className="space-y-8 mb-8">
              <View>
                <Text className="text-xl font-bold text-gray-900 mb-4">
                  How do you identify? 🌟
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      className={`px-6 py-4 rounded-2xl border-2 ${
                        formData.gender === option
                          ? "bg-indigo-100 border-indigo-400"
                          : "bg-white/80 border-gray-200"
                      }`}
                      onPress={() =>
                        setFormData({ ...formData, gender: option })
                      }
                    >
                      <Text
                        className={`font-semibold ${
                          formData.gender === option
                            ? "text-indigo-700"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-xl font-bold text-gray-900 mb-4">
                  What's your age range? 🎂
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {ageGroups.map((option) => (
                    <TouchableOpacity
                      key={option}
                      className={`px-6 py-4 rounded-2xl border-2 ${
                        formData.ageGroup === option
                          ? "bg-purple-100 border-purple-400"
                          : "bg-white/80 border-gray-200"
                      }`}
                      onPress={() =>
                        setFormData({ ...formData, ageGroup: option })
                      }
                    >
                      <Text
                        className={`font-semibold ${
                          formData.ageGroup === option
                            ? "text-purple-700"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-xl font-bold text-gray-900 mb-4">
                  What do you do? 💼
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {professions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      className={`px-6 py-4 rounded-2xl border-2 ${
                        formData.profession === option
                          ? "bg-green-100 border-green-400"
                          : "bg-white/80 border-gray-200"
                      }`}
                      onPress={() =>
                        setFormData({ ...formData, profession: option })
                      }
                    >
                      <Text
                        className={`font-semibold ${
                          formData.profession === option
                            ? "text-green-700"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Step 3: Purpose */}
          {currentStep === 3 && (
            <View className="space-y-6 mb-8">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                What's your speaking goal? 🎯
              </Text>
              <Text className="text-gray-600 text-lg mb-6">
                Choose all that excite you!
              </Text>

              <View className="space-y-4">
                {purposeOptions.map((purpose, index) => {
                  const icons = ["🎤", "📊", "🏆", "👥", "✨"];
                  return (
                    <TouchableOpacity
                      key={purpose}
                      className={`flex-row items-center p-6 rounded-3xl border-2 ${
                        formData.purposes.includes(purpose)
                          ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300"
                          : "bg-white/80 border-gray-200"
                      }`}
                      onPress={() => handlePurposeToggle(purpose)}
                    >
                      <View className="mr-4">
                        <Text className="text-2xl">{icons[index]}</Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`text-lg font-bold ${
                            formData.purposes.includes(purpose)
                              ? "text-indigo-700"
                              : "text-gray-700"
                          }`}
                        >
                          {purpose}
                        </Text>
                      </View>
                      <View
                        className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                          formData.purposes.includes(purpose)
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.purposes.includes(purpose) && (
                          <Check size={18} color="white" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {formData.purposes.includes("Other") && (
                <View className="mt-6">
                  <Text className="text-lg font-bold text-gray-900 mb-3">
                    Tell us more! ✍️
                  </Text>
                  <TextInput
                    className="bg-white/80 rounded-3xl px-6 py-5 text-gray-900 text-lg border border-gray-200"
                    placeholder="What's your unique goal?"
                    value={formData.customPurpose}
                    onChangeText={(text) =>
                      setFormData({ ...formData, customPurpose: text })
                    }
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="space-y-4">
            {currentStep < 3 ? (
              <TouchableOpacity
                className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl py-5 px-8"
                onPress={nextStep}
              >
                <View className="flex-row items-center justify-center">
                  <Text className="text-white font-bold text-xl mr-2">
                    Continue
                  </Text>
                  <Sparkles size={20} color="white" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className={`rounded-3xl py-5 px-8 ${
                  isLoading
                    ? "bg-gray-400"
                    : "bg-gradient-to-r from-green-500 to-emerald-600"
                }`}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                <View className="flex-row items-center justify-center">
                  <Text className="text-white font-bold text-xl mr-2">
                    {isLoading ? "Creating Magic..." : "Start My Journey!"}
                  </Text>
                  {!isLoading && <Trophy size={20} color="white" />}
                </View>
              </TouchableOpacity>
            )}

            {/* Sign In Link */}
            <View className="flex-row justify-center pt-4">
              <Text className="text-gray-600 text-lg">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/sign-in")}>
                <Text className="text-indigo-600 font-bold text-lg">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
