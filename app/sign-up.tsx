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
    avatar: "felix",
    avatar_style: "bottts",
    store_audio: false,
    store_video: false,
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

  // DiceBear avatar styles
  const avatarStyles = [
    "avataaars",
    "adventurer",
    "big-smile",
    "lorelei",
    "micah",
    "personas",
  ];

  const [selectedAvatar, setSelectedAvatar] = useState("felix");
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState("avataaars");
  const [avatarSeeds, setAvatarSeeds] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  // Generate DiceBear avatar URL
  const generateAvatarUrl = (
    seed: string,
    style: string = "avataaars",
  ): string => {
    return `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&size=80&backgroundColor=transparent`;
  };

  // Instead of generating randomly
  const curatedAvatarSeeds = [
    "felix",
    "luna",
    "maximus",
    "pixelpete",
    "nimbus",
    "echo",
    "blip",
    "zara",
    "orbit",
  ];

  useEffect(() => {
    setAvatarSeeds(curatedAvatarSeeds);
  }, []);

  const handleAvatarSelect = (avatarSeed: string) => {
    setSelectedAvatar(avatarSeed);
    console.log(selectedAvatar);
    setFormData({
      ...formData,
      avatar: avatarSeed,
      avatar_style: selectedAvatarStyle,
    });
  };

  const handleStyleChange = (style: string) => {
    setSelectedAvatarStyle(style);
    // setAvatarSeeds(generateRandomSeeds(12));
  };

  const handlePurposeToggle = (purpose: string) => {
    const newPurposes = formData.purposes.includes(purpose)
      ? formData.purposes.filter((p) => p !== purpose)
      : [...formData.purposes, purpose];
    setFormData({ ...formData, purposes: newPurposes });
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep - 1) / 4, // range: 0 to 1
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

  const validateStep3 = () => {
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

  const validateStep4 = () => {
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
    const step3Valid = validateStep3();
    const step4Valid = validateStep4();

    if (!step1Valid) {
      setCurrentStep(1);
      return false;
    }
    if (!step3Valid) {
      setCurrentStep(3);
      return false;
    }
    if (!step4Valid) {
      setCurrentStep(4);
      return false;
    }

    return true;
  };

  const nextStep = () => {
    let isValid = true;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        // step 2 or unknown step: no validation
        isValid = true;
    }

    if (isValid && currentStep < 5) {
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
    console.log(formData);

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
          avatar: formData.avatar,
          avatar_style: formData.avatar_style,
          store_audio: formData.store_audio ?? false,
          store_video: formData.store_video ?? false,
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
      // router.push("/subscription");
      router.push("/trial");
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

  const stepTitle = [
    "Create your account",
    "Select Avatar",
    "Tell us about you",
    "Your goals",
    "Your privacy preferences",
  ];

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
          <Text className="text-gray-500 text-sm">Step {currentStep} of 5</Text>
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

        {currentStep === 2 && (
          <View>
            <Text className="text-base font-medium text-gray-800">
              Pick your vibe
            </Text>
            <Text className="text-sm mb-3 text-gray-600">
              No pressure, you can always switch it up in your profile settings
              later!
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {avatarStyles.map((style) => (
                <TouchableOpacity
                  key={style}
                  onPress={() => handleStyleChange(style)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor:
                      selectedAvatarStyle === style ? "#000" : "#ccc",
                    backgroundColor:
                      selectedAvatarStyle === style ? "#000" : "#fff",
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: selectedAvatarStyle === style ? "#fff" : "#000",
                    }}
                  >
                    {style}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row flex-wrap justify-between">
              {avatarSeeds.map((seed) => (
                <TouchableOpacity
                  key={seed}
                  onPress={() => handleAvatarSelect(seed)}
                  style={{
                    margin: 4,
                    borderRadius: 40,
                    borderWidth: selectedAvatar === seed ? 2 : 0,
                    borderColor: "#000",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{
                      uri: generateAvatarUrl(seed, selectedAvatarStyle),
                    }}
                    style={{ width: 80, height: 80 }}
                  />
                  {selectedAvatar === seed && (
                    <View
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "black",
                        borderRadius: 8,
                        padding: 2,
                      }}
                    ></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2 */}
        {currentStep === 3 && (
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

        {currentStep === 4 && (
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

        {currentStep === 5 && (
          <View className="space-y-5">
            <Text className="text-base font-medium text-gray-800">
              Your data is safe with us.
            </Text>
            <Text className="text-sm text-gray-600">
              We do not save any speech audio or video files in our database
              without your consent. If you'd like to revisit speeches later, you
              can allow storage below. For your privacy, saved files are
              automatically deleted after 30 days.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setFormData((prev) => {
                  const newState = {
                    ...prev,
                    store_audio: !prev.store_audio,
                  };
                  console.log("store_audio toggled. New formData:", newState);
                  return newState;
                });
              }}
              className={`px-5 py-4 rounded-xl border flex-row justify-between items-center ${
                formData.store_audio
                  ? "border-black bg-gray-100"
                  : "border-gray-200 bg-[#f6f7fb]"
              }`}
            >
              <Text className="text-base text-gray-900">
                Allow audio storage
              </Text>
              {formData.store_audio && <Check size={18} color="#111" />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // Add curly braces here to allow multiple statements
                setFormData((prev) => {
                  const newState = {
                    ...prev,
                    store_video: !prev.store_video,
                  };
                  console.log("store_video toggled. New formData:", newState); // <-- Add this line
                  return newState;
                });
              }}
              className={`px-5 py-4 rounded-xl border flex-row justify-between items-center ${
                formData.store_video
                  ? "border-black bg-gray-100"
                  : "border-gray-200 bg-[#f6f7fb]"
              }`}
            >
              <Text className="text-base text-gray-900">
                Allow video storage
              </Text>
              {formData.store_video && <Check size={18} color="#111" />}
            </TouchableOpacity>

            <Text className="text-sm text-gray-500">
              You can change these settings in the profile.
            </Text>
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
            onPress={currentStep === 5 ? handleSignUp : nextStep}
            disabled={isLoading || isGoogleLoading}
          >
            <Text className="text-white font-semibold text-lg">
              {isLoading
                ? "Signing up..."
                : currentStep === 4
                  ? "Get Started"
                  : "Continue"}
            </Text>
          </TouchableOpacity>

          {currentStep === 1 ? (
            <View className="flex-row justify-center pt-4">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/sign-in")}>
                <Text className="text-black font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}
