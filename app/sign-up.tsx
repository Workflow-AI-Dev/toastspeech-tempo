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
import { useAuth } from "./context/AuthContext";
import {
  ArrowLeft,
  Check,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
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
  const [progressAnim] = useState(new Animated.Value(0));

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
    Animated.timing(progressAnim, {
      toValue: currentStep / 3,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < 3) {
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
      Alert.alert("Missing fields", "Please fill all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData,
      );

      if (error) {
        Alert.alert("Sign Up Failed", error.message);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Try again.");
      setIsLoading(false);
    }
  };

  const stepTitle = ["Create your account", "Tell us about you", "Your goals"];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 py-8">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            className="p-2 rounded-full border border-gray-300"
            onPress={currentStep === 1 ? () => router.back() : prevStep}
          >
            <ArrowLeft size={20} color="#111" />
          </TouchableOpacity>
          <Text className="text-gray-500 text-sm">Step {currentStep} of 3</Text>
        </View>

        <View className="mb-6">
          <Text className="text-2xl font-semibold text-gray-900 mb-1">
            {stepTitle[currentStep - 1]}
          </Text>
          <View className="bg-gray-200 rounded-full h-2 mt-3">
            <Animated.View
              className="bg-black rounded-full h-2"
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
        </View>

        {currentStep === 1 && (
          <View className="space-y-5">
            <View className="relative">
              <TextInput
                placeholder="Full Name"
                className="bg-[#f6f7fb] px-12 py-4 rounded-xl border border-gray-200 text-gray-900"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
              <User
                size={20}
                color="#999"
                style={{ position: "absolute", top: 18, left: 16 }}
              />
            </View>

            <View className="relative">
              <TextInput
                placeholder="Email"
                keyboardType="email-address"
                className="bg-[#f6f7fb] px-12 py-4 rounded-xl border border-gray-200 text-gray-900"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
              />
              <Mail
                size={20}
                color="#999"
                style={{ position: "absolute", top: 18, left: 16 }}
              />
            </View>

            <View className="relative">
              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                className="bg-[#f6f7fb] px-12 py-4 rounded-xl border border-gray-200 text-gray-900"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
              />
              <Lock
                size={20}
                color="#999"
                style={{ position: "absolute", top: 18, left: 16 }}
              />
              <TouchableOpacity
                style={{ position: "absolute", right: 16, top: 16 }}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>

            <View className="relative">
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                className="bg-[#f6f7fb] px-12 py-4 rounded-xl border border-gray-200 text-gray-900"
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
              />
              <Lock
                size={20}
                color="#999"
                style={{ position: "absolute", top: 18, left: 16 }}
              />
              <TouchableOpacity
                style={{ position: "absolute", right: 16, top: 16 }}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <View className="space-y-6">
            <Text className="text-base font-medium text-gray-800">Gender</Text>
            <View className="flex-row flex-wrap gap-2">
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium ${
                    formData.gender === option
                      ? "border-black bg-gray-100 text-black"
                      : "bg-[#f6f7fb] border-gray-200 text-gray-800"
                  }`}
                  onPress={() => setFormData({ ...formData, gender: option })}
                >
                  <Text>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-base font-medium text-gray-800">
              Age Group
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {ageGroups.map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium ${
                    formData.ageGroup === option
                      ? "border-black bg-gray-100 text-black"
                      : "bg-[#f6f7fb] border-gray-200 text-gray-800"
                  }`}
                  onPress={() => setFormData({ ...formData, ageGroup: option })}
                >
                  <Text>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-base font-medium text-gray-800">
              Profession
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {professions.map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium ${
                    formData.profession === option
                      ? "border-black bg-gray-100 text-black"
                      : "bg-[#f6f7fb] border-gray-200 text-gray-800"
                  }`}
                  onPress={() =>
                    setFormData({ ...formData, profession: option })
                  }
                >
                  <Text>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View className="space-y-6">
            <Text className="text-base font-medium text-gray-800">Purpose</Text>

            {purposeOptions.map((purpose) => (
              <TouchableOpacity
                key={purpose}
                className={`flex-row items-center justify-between px-5 py-4 rounded-xl border text-sm font-medium ${
                  formData.purposes.includes(purpose)
                    ? "border-black bg-gray-100 text-black"
                    : "bg-[#f6f7fb] border-gray-200 text-gray-800"
                }`}
                onPress={() => handlePurposeToggle(purpose)}
              >
                <Text>{purpose}</Text>

                {formData.purposes.includes(purpose) && (
                  <Check size={18} color="#111" />
                )}
              </TouchableOpacity>
            ))}

            {formData.purposes.includes("Other") && (
              <TextInput
                placeholder="Custom purpose"
                className="bg-[#f6f7fb] px-5 py-4 rounded-xl border border-gray-200 text-gray-900"
                value={formData.customPurpose}
                onChangeText={(text) =>
                  setFormData({ ...formData, customPurpose: text })
                }
              />
            )}
          </View>
        )}

        <View className="mt-10 space-y-4">
          <TouchableOpacity
            className={`rounded-xl py-4 items-center justify-center ${
              isLoading ? "bg-gray-400" : "bg-black"
            }`}
            onPress={currentStep === 3 ? handleSignUp : nextStep}
            disabled={isLoading}
          >
            <Text className="text-white font-semibold text-lg">
              {isLoading
                ? "Signing up..."
                : currentStep === 3
                  ? "Get Started"
                  : "Continue"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center pt-4">
            <Text className="text-gray-600">Already have an account? </Text>

            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text className="text-black font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
