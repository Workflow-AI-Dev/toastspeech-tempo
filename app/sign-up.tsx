import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
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
import GLogo from "../assets/images/glogo.webp";
import { Image } from "react-native";
import { BASE_URL } from "./config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, signUpWithGoogle, setUser } = useAuth(); // 👈 grab setUser
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [progressAnim] = useState(new Animated.Value(0));
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    ageGroup: "",
    profession: "",
    purposes: "",
    customPurpose: "",
  });
  const scrollViewRef = useRef<ScrollView>(null);
  const [signedUpUser, setSignedUpUser] = useState(null);
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

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
      toValue: (currentStep - 1) / 2, // range: 0 to 1
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = () => {
    const newErrors = { ...errors };
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Please enter your full name";
      isValid = false;
    } else {
      newErrors.name = "";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    } else {
      newErrors.email = "";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Please enter a password";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    } else {
      newErrors.password = "";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    } else {
      newErrors.confirmPassword = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateStep2 = () => {
    const newErrors = { ...errors };
    let isValid = true;

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
      isValid = false;
    } else {
      newErrors.gender = "";
    }

    // Age group validation
    if (!formData.ageGroup) {
      newErrors.ageGroup = "Please select your age group";
      isValid = false;
    } else {
      newErrors.ageGroup = "";
    }

    // Profession validation
    if (!formData.profession) {
      newErrors.profession = "Please select your profession";
      isValid = false;
    } else {
      newErrors.profession = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateStep3 = () => {
    const newErrors = { ...errors };
    let isValid = true;

    // Purpose validation
    if (formData.purposes.length === 0) {
      newErrors.purposes = "Please select at least one purpose";
      isValid = false;
    } else {
      newErrors.purposes = "";
    }

    // Custom purpose validation if "Other" is selected
    if (formData.purposes.includes("Other") && !formData.customPurpose.trim()) {
      newErrors.customPurpose = "Please specify your custom purpose";
      isValid = false;
    } else {
      newErrors.customPurpose = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateAllSteps = () => {
    const step1Valid = isGoogleUser ? true : validateStep1();
    const step2Valid = validateStep2();
    const step3Valid = validateStep3();

    if (!step1Valid) {
      setCurrentStep(1);
      return false;
    }
    if (!step2Valid) {
      setCurrentStep(2);
      return false;
    }
    if (!step3Valid) {
      setCurrentStep(3);
      return false;
    }

    return true;
  };

  const nextStep = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const { error, user } = await signUpWithGoogle();

      if (error) {
        Alert.alert(
          "Google Sign Up",
          typeof error === "string"
            ? error
            : error.message || "Please try again",
        );
      } else {
        setSignedUpUser(user); // we already have the user
        setIsGoogleUser(true); // flag this as a Google signup
        setCurrentStep(2);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Something went wrong with Google sign up. Try again.",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignUp = async () => {
    if (!validateAllSteps()) return;

    setIsLoading(true);

    try {
      if (!isGoogleUser) {
        // Normal signup
        const { error, user } = await signUp(
          formData.email,
          formData.password,
          formData,
        );

        if (error) {
          Toast.show({
            type: "error",
            text1: "Sign Up Failed",
            text2:
              typeof error === "string"
                ? error
                : error.message || "Please try again",
            position: "top",
            visibilityTime: 4000,
          });
          setIsLoading(false);
          return;
        }

        setSignedUpUser(user);
      }

      // Common path (normal + Google): Complete profile
      const token = await AsyncStorage.getItem("auth_token");

      const res = await fetch(`${BASE_URL}/auth/complete-profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gender: formData.gender,
          age_group: formData.ageGroup,
          profession: formData.profession,
          purposes: formData.purposes,
          custom_purpose: formData.customPurpose,
        }),
      });

      const resJson = await res.json();
      console.log("Response JSON:", resJson);

      if (!res.ok) throw new Error("Failed to complete profile");
      const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await meRes.json();
      setUser(userData);
      router.push("/subscription");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again.",
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitle = ["Create your account", "Tell us about you", "Your goals"];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView ref={scrollViewRef} className="flex-1 px-6 py-8">
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
          <View className="bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
            <Animated.View
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                height: 8,
                backgroundColor: "black",
                borderRadius: 999,
              }}
            />
          </View>
        </View>

        {currentStep === 1 && (
          <View className="space-y-5">
            <View>
              <View className="relative">
                <TextInput
                  placeholder="Full Name"
                  className={`bg-[#f6f7fb] px-12 py-4 rounded-xl border text-gray-900 ${
                    errors.name ? "border-red-500" : "border-gray-200"
                  }`}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) {
                      setErrors({ ...errors, name: "" });
                    }
                  }}
                />
                <User
                  size={20}
                  color="#999"
                  style={{ position: "absolute", top: 18, left: 16 }}
                />
              </View>
              {errors.name ? (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.name}
                </Text>
              ) : null}
            </View>

            <View>
              <View className="relative">
                <TextInput
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`bg-[#f6f7fb] px-12 py-4 rounded-xl border text-gray-900 ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  }`}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email) {
                      setErrors({ ...errors, email: "" });
                    }
                  }}
                />
                <Mail
                  size={20}
                  color="#999"
                  style={{ position: "absolute", top: 18, left: 16 }}
                />
              </View>
              {errors.email ? (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.email}
                </Text>
              ) : null}
            </View>

            <View>
              <View className="relative">
                <TextInput
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  className={`bg-[#f6f7fb] px-12 py-4 rounded-xl border text-gray-900 ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  }`}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
                    if (errors.password) {
                      setErrors({ ...errors, password: "" });
                    }
                  }}
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
              {errors.password ? (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.password}
                </Text>
              ) : null}
            </View>

            <View>
              <View className="relative">
                <TextInput
                  placeholder="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  className={`bg-[#f6f7fb] px-12 py-4 rounded-xl border text-gray-900 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, confirmPassword: text });
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: "" });
                    }
                  }}
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
              {errors.confirmPassword ? (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.confirmPassword}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <View className="space-y-6">
            <View>
              <Text className="text-base font-medium text-gray-800 mb-3">
                Gender
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium ${
                      formData.gender === option
                        ? "border-black bg-gray-100 text-black"
                        : "bg-[#f6f7fb] border-gray-200 text-gray-800"
                    }`}
                    onPress={() => {
                      setFormData({ ...formData, gender: option });
                      if (errors.gender) {
                        setErrors({ ...errors, gender: "" });
                      }
                    }}
                  >
                    <Text>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender ? (
                <Text className="text-red-500 text-sm mt-2 ml-1">
                  {errors.gender}
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="text-base font-medium text-gray-800 mb-3">
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
                    onPress={() => {
                      setFormData({ ...formData, ageGroup: option });
                      if (errors.ageGroup) {
                        setErrors({ ...errors, ageGroup: "" });
                      }
                    }}
                  >
                    <Text>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.ageGroup ? (
                <Text className="text-red-500 text-sm mt-2 ml-1">
                  {errors.ageGroup}
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="text-base font-medium text-gray-800 mb-3">
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
                    onPress={() => {
                      setFormData({ ...formData, profession: option });
                      if (errors.profession) {
                        setErrors({ ...errors, profession: "" });
                      }
                    }}
                  >
                    <Text>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.profession ? (
                <Text className="text-red-500 text-sm mt-2 ml-1">
                  {errors.profession}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View className="space-y-6">
            <View>
              <Text className="text-base font-medium text-gray-800 mb-3">
                Purpose (select atleast 1)
              </Text>

              {purposeOptions.map((purpose) => (
                <TouchableOpacity
                  key={purpose}
                  className={`flex-row items-center justify-between px-5 py-4 rounded-xl border text-sm font-medium mb-3 ${
                    formData.purposes.includes(purpose)
                      ? "border-black bg-gray-100 text-black"
                      : "bg-[#f6f7fb] border-gray-200 text-gray-800"
                  }`}
                  onPress={() => {
                    handlePurposeToggle(purpose);
                    if (errors.purposes) {
                      setErrors({ ...errors, purposes: "" });
                    }
                  }}
                >
                  <Text>{purpose}</Text>

                  {formData.purposes.includes(purpose) && (
                    <Check size={18} color="#111" />
                  )}
                </TouchableOpacity>
              ))}

              {errors.purposes ? (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.purposes}
                </Text>
              ) : null}
            </View>

            {formData.purposes.includes("Other") && (
              <View>
                <TextInput
                  placeholder="Custom purpose"
                  className={`bg-[#f6f7fb] px-5 py-4 rounded-xl border text-gray-900 ${
                    errors.customPurpose ? "border-red-500" : "border-gray-200"
                  }`}
                  value={formData.customPurpose}
                  onChangeText={(text) => {
                    setFormData({ ...formData, customPurpose: text });
                    if (errors.customPurpose) {
                      setErrors({ ...errors, customPurpose: "" });
                    }
                  }}
                />
                {errors.customPurpose ? (
                  <Text className="text-red-500 text-sm mt-1 ml-1">
                    {errors.customPurpose}
                  </Text>
                ) : null}
              </View>
            )}
          </View>
        )}

        <View className="mt-10 space-y-4">
          {currentStep === 1 && (
            <>
              {/* Google Sign Up Button */}
              <TouchableOpacity
                className={`rounded-xl py-4 items-center justify-center border border-gray-300 flex-row mb-4 ${
                  isGoogleLoading ? "bg-gray-100" : "bg-white"
                }`}
                onPress={handleGoogleSignUp}
                disabled={isLoading || isGoogleLoading}
              >
                <Image
                  source={GLogo}
                  style={{ width: 20, height: 20, marginRight: 12 }}
                  resizeMode="contain"
                />

                <Text className="text-gray-700 font-semibold text-lg">
                  {isGoogleLoading ? "Signing up..." : "Continue with Google"}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center mb-4">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500 text-sm">or</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>
            </>
          )}

          <TouchableOpacity
            className={`rounded-xl py-4 items-center justify-center ${
              isLoading ? "bg-gray-400" : "bg-black"
            }`}
            onPress={currentStep === 3 ? handleSignUp : nextStep}
            disabled={isLoading || isGoogleLoading}
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
      <Toast />
    </SafeAreaView>
  );
}
