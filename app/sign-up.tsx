import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Alert,
  Modal,
  ActivityIndicator,
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
import { BASE_URL } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme, getThemeColors } from "./context/ThemeContext";

export default function SignUpScreen() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const router = useRouter();
  const { signUp, signUpWithGoogle, setUser } = useAuth();
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
    avatar_style: "avataaars",
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
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const genderOptions = ["Male", "Female", "Prefer not to say"];
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
        setSignedUpUser(user);
        setIsGoogleUser(true);
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
        const { error, userId } = await signUp(
          formData.email,
          formData.password,
          formData,
        );
        if (!error) {
          setShowVerificationModal(true);
          pollForVerification(userId!);
        }

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

      if (isGoogleUser) {
        const token = await AsyncStorage.getItem("auth_token");
        console.log(token);
        if (!token) throw new Error("No auth token found");

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

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to complete profile");
        }

        const meRes = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await meRes.json();
        setUser(userData);
        await AsyncStorage.setItem("just_signed_up", "true");
        router.push("/trial");
      }

      router.push("/trial");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const pollForVerification = async (userId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`${BASE_URL}/auth/check-email/${userId}`);
      const data = await res.json();

      if (data.verified) {
        clearInterval(interval);
        setIsVerified(true);
        await AsyncStorage.setItem("auth_token", data.access_token);
        setUser(data.user);
        const plan = data?.user?.current_plan_id || "aspiring";
        await AsyncStorage.setItem("plan", plan);
        router.push("/trial");
      }
    }, 1000);
  };

  const stepTitle = [
    "Create your account",
    "Select Avatar",
    "Tell us about you",
    "Your goals",
    "Your privacy preferences",
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            style={{
              padding: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={currentStep === 1 ? () => router.back() : prevStep}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Step {currentStep} of 5
          </Text>
        </View>

        {/* Step Title & Progress */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 4,
            }}
          >
            {stepTitle[currentStep - 1]}
          </Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 999,
              height: 8,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                height: 8,
                backgroundColor: colors.primary,
                borderRadius: 999,
              }}
            />
          </View>
        </View>

        {/* Step 1: Account Info */}
        {currentStep === 1 && (
          <View style={{ marginBottom: 24 }}>
            {[
              {
                placeholder: "Full Name",
                key: "name",
                icon: User,
                value: formData.name,
                error: errors.name,
              },
              {
                placeholder: "Email",
                key: "email",
                icon: Mail,
                value: formData.email,
                error: errors.email,
                keyboardType: "email-address",
                autoCapitalize: "none",
              },
              {
                placeholder: "Password",
                key: "password",
                icon: Lock,
                value: formData.password,
                error: errors.password,
                secure: !showPassword,
              },
              {
                placeholder: "Confirm Password",
                key: "confirmPassword",
                icon: Lock,
                value: formData.confirmPassword,
                error: errors.confirmPassword,
                secure: !showConfirmPassword,
              },
            ].map((field) => (
              <View key={field.key} style={{ marginBottom: 16 }}>
                <View style={{ position: "relative" }}>
                  <TextInput
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType={field.keyboardType || "default"}
                    autoCapitalize={field.autoCapitalize || "sentences"}
                    secureTextEntry={field.secure}
                    style={{
                      backgroundColor: colors.surface,
                      paddingVertical: 16,
                      paddingLeft: 48,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: field.error ? colors.error : colors.border,
                      color: colors.text,
                    }}
                    value={field.value}
                    onChangeText={(text) => {
                      setFormData({ ...formData, [field.key]: text });
                      if (field.error)
                        setErrors({ ...errors, [field.key]: "" });
                    }}
                  />
                  <field.icon
                    size={20}
                    color={colors.textSecondary}
                    style={{ position: "absolute", top: 18, left: 16 }}
                  />
                  {(field.key === "password" ||
                    field.key === "confirmPassword") && (
                    <TouchableOpacity
                      style={{ position: "absolute", right: 16, top: 16 }}
                      onPress={() =>
                        field.key === "password"
                          ? setShowPassword(!showPassword)
                          : setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {field.key === "password" ? (
                        showPassword ? (
                          <EyeOff size={20} color={colors.textSecondary} />
                        ) : (
                          <Eye size={20} color={colors.textSecondary} />
                        )
                      ) : showConfirmPassword ? (
                        <EyeOff size={20} color={colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                {field.error && (
                  <Text
                    style={{ color: colors.error, fontSize: 12, marginTop: 4 }}
                  >
                    {field.error}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Step 2: Avatar */}
        {currentStep === 2 && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{ color: colors.text, fontSize: 16, fontWeight: "500" }}
            >
              Pick your vibe
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              No pressure, you can always switch it up in your profile settings
              later!
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
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
                      selectedAvatarStyle === style
                        ? colors.primary
                        : colors.border,
                    backgroundColor:
                      selectedAvatarStyle === style
                        ? colors.primary
                        : colors.surface,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedAvatarStyle === style
                          ? colors.background
                          : colors.text,
                    }}
                  >
                    {style}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {avatarSeeds.map((seed) => (
                <TouchableOpacity
                  key={seed}
                  onPress={() => handleAvatarSelect(seed)}
                  style={{
                    margin: 4,
                    borderRadius: 40,
                    borderWidth: selectedAvatar === seed ? 2 : 0,
                    borderColor: colors.primary,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{
                      uri: generateAvatarUrl(seed, selectedAvatarStyle),
                    }}
                    style={{ width: 80, height: 80 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Profile Info */}
        {currentStep === 3 && (
          <View style={{ marginBottom: 24 }}>
            {[
              {
                title: "Gender",
                options: genderOptions,
                key: "gender",
                error: errors.gender,
              },
              {
                title: "Age Group",
                options: ageGroups,
                key: "ageGroup",
                error: errors.ageGroup,
              },
              {
                title: "Profession",
                options: professions,
                key: "profession",
                error: errors.profession,
              },
            ].map((section) => (
              <View key={section.key} style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  {section.title}
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {section.options.map((option) => {
                    const selected = formData[section.key] === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => {
                          setFormData({ ...formData, [section.key]: option });
                          if (section.error)
                            setErrors({ ...errors, [section.key]: "" });
                        }}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                          backgroundColor: selected
                            ? colors.surface
                            : colors.surface,
                        }}
                      >
                        <Text style={{ color: colors.text }}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {section.error && (
                  <Text
                    style={{ color: colors.error, fontSize: 12, marginTop: 4 }}
                  >
                    {section.error}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Step 4: Purposes */}
        {currentStep === 4 && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Purpose (select at least 1)
            </Text>
            {purposeOptions.map((purpose) => {
              const selected = formData.purposes.includes(purpose);
              return (
                <TouchableOpacity
                  key={purpose}
                  onPress={() => {
                    handlePurposeToggle(purpose);
                    if (errors.purposes) setErrors({ ...errors, purposes: "" });
                  }}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.surface : colors.surface,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ color: colors.text }}>{purpose}</Text>
                  {selected && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
            {formData.purposes.includes("Other") && (
              <TextInput
                placeholder="Custom purpose"
                placeholderTextColor={colors.textSecondary}
                value={formData.customPurpose}
                onChangeText={(text) => {
                  setFormData({ ...formData, customPurpose: text });
                  if (errors.customPurpose)
                    setErrors({ ...errors, customPurpose: "" });
                }}
                style={{
                  backgroundColor: colors.surface,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: errors.customPurpose
                    ? colors.error
                    : colors.border,
                  color: colors.text,
                  marginTop: 12,
                }}
              />
            )}
          </View>
        )}

        {/* Step 5: Privacy */}
        {currentStep === 5 && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 12,
              }}
            >
              Your data is safe with us.
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              We don’t store your audio or video without consent. You can allow
              storage to revisit speeches, which are deleted after 30 days.
            </Text>

            {["store_audio", "store_video"].map((key) => {
              const label =
                key === "store_audio"
                  ? "Allow audio storage"
                  : "Allow video storage";
              const selected = formData[key];
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.surface : colors.surface,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ color: colors.text }}>{label}</Text>
                  {selected && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}

            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              You can change these settings in the profile.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ marginTop: 40, gap: 16 }}>
          {/* Main Continue / Get Started Button */}
          <TouchableOpacity
            onPress={currentStep === 5 ? handleSignUp : nextStep}
            disabled={isLoading || isGoogleLoading}
            style={{
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",
              backgroundColor: isLoading ? colors.border : colors.primary,
            }}
          >
            <Text
              style={{
                color: colors.background,
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              {isLoading
                ? "Signing up..."
                : currentStep === 4
                  ? "Get Started"
                  : "Continue"}
            </Text>
          </TouchableOpacity>

          {/* Divider for "or" */}
          {currentStep === 1 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 8,
              }}
            >
              <View
                style={{ flex: 1, height: 1, backgroundColor: colors.border }}
              />
              <Text
                style={{
                  marginHorizontal: 16,
                  fontSize: 14,
                  color: colors.textSecondary,
                }}
              >
                or
              </Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: colors.border }}
              />
            </View>
          )}

          {/* Continue with Google */}
          {currentStep === 1 && (
            <TouchableOpacity
              onPress={handleGoogleSignUp}
              disabled={isLoading || isGoogleLoading}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: isGoogleLoading
                  ? colors.surface
                  : colors.background,
              }}
            >
              <Image
                source={GLogo}
                style={{ width: 20, height: 20, marginRight: 12 }}
                resizeMode="contain"
              />
              <Text
                style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}
              >
                {isGoogleLoading ? "Signing up..." : "Continue with Google"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Sign In Link */}
          {currentStep === 1 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingTop: 16,
              }}
            >
              <Text style={{ color: colors.textSecondary }}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/sign-in")}>
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      <Toast />

      <Modal visible={showVerificationModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 24,
              borderRadius: 20,
              alignItems: "center",
              width: "80%",
            }}
          >
            <Mail size={32} color={colors.primary} />
            <Text
              style={{
                marginTop: 16,
                fontSize: 18,
                fontWeight: "600",
                color: colors.text,
                textAlign: "center",
              }}
            >
              {isVerified ? "Email Verified" : "Check your email"}
            </Text>

            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: "center",
              }}
            >
              {!isVerified
                ? "We've sent you a verification link. Please confirm your email to continue."
                : "Great! Your email has been verified. You can now continue."}
            </Text>

            <View>
              {!isVerified ? (
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                  style={{ marginTop: 20 }}
                />
              ) : null}
            </View>

            {isVerified && (
              <TouchableOpacity
                style={{
                  marginTop: 24,
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                }}
                onPress={() => {
                  setShowVerificationModal(false);
                  router.push("/trial");
                }}
              >
                <Text style={{ color: colors.background, fontWeight: "600" }}>
                  Continue
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
