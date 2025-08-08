import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Modal,
  Dimensions,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Edit3,
  Crown,
  Flame,
  Trophy,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Moon,
  Sun,
  Camera,
  X,
  Shuffle,
  Check,
  BriefcaseIcon,
  MessageCircle,
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProfileSettingsProps {
  user?: {
    name: string;
    email: string;
    phone: string;
    joinDate: string;
    location: string;
    level: number;
    streak: number;
    totalSpeeches: number;
    avgScore: number;
    avatar?: string;
    avatarStyle?: string;
  };
}

// DiceBear avatar styles
const avatarStyles = [
    "avataaars",
    "adventurer",
    "big-smile",
    "lorelei",
    "micah",
    "personas",
  ];

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

// Generate random seeds for avatars
// const generateRandomSeeds = (count: number = 12): string[] => {
//   return Array.from({ length: count }, () =>
//     Math.random().toString(36).substring(2, 15),
//   );
// };

// Generate DiceBear avatar URL
const generateAvatarUrl = (
  seed: string,
  style: string = "avataaars",
): string => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=80&backgroundColor=transparent`;
};

export default function ProfileSettings({
  user = {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    joinDate: "March 2023",
    location: "San Francisco, CA",
    level: 7,
    streak: 12,
    totalSpeeches: 23,
    avgScore: 85,
    avatar: "felix",
  },
}: ProfileSettingsProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const colors = getThemeColors(theme);
  const { user: authUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || "felix");
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState(user.avatarStyle || "avataaars");
  const [avatarSeeds, setAvatarSeeds] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const { signOut } = useAuth();
  const [profileData, setProfileData] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedGender, setEditedGender] = useState("");
  const [editedAgeGroup, setEditedAgeGroup] = useState("");
  const [editedProfession, setEditedProfession] = useState("");
  const [emailError, setEmailError] = useState("");
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [audioConsent, setAudioConsent] = useState(false);
  const [videoConsent, setVideoConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize avatar seeds on component mount
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

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (!token) {
          console.warn("No access token found");
          return;
        }

        const response = await fetch(`${BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        console.log("✅ Profile fetched:", data);
        setProfileData(data);
        setSelectedAvatar(data.avatar || "felix");
        setSelectedAvatarStyle(data.avatar_style || "avataaars");
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      } finally{
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchMetrics = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (!token) {
          console.warn("No access token found");
          return;
        }

        const res = await fetch(`${BASE_URL}/user/user-metrics`, { 
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`, 
              'Content-Type': 'application/json',
            },
        });
        
        const data = await res.json();

        console.log("✅ Metrics fetched:", data);
        setMetrics(data);
      } catch (err) {
        console.error("❌ Error fetching metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };


  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleAvatarSelect = async (avatarSeed: string) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.warn("No access token found");
        return;
      }

      // Call API to update avatar
      const res = await axios.put(
        "http://127.0.0.1:8000/user/edit-profile",
        {
          avatar: avatarSeed,
          avatar_style: selectedAvatarStyle,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update UI
      setSelectedAvatar(avatarSeed);
      setProfileData((prev: any) => ({
        ...prev,
        avatar: avatarSeed,
        avatar_style: selectedAvatarStyle,
      }));

      setShowAvatarModal(false);
      console.log("✅ Avatar updated:", res.data);
    } catch (err) {
      console.error("❌ Failed to update avatar:", err);
    }
  };

  // const handleShuffleAvatars = () => {
  //   setIsShuffling(true);
  //   setTimeout(() => {
  //     setAvatarSeeds(generateRandomSeeds(12));
  //     setIsShuffling(false);
  //   }, 300);
  // };

  const handleStyleChange = (style: string) => {
    setSelectedAvatarStyle(style);
    // setAvatarSeeds(generateRandomSeeds(12));
  };
  

  const startEditing = () => {
    setIsEditing(true);
    setEditedName(profileData?.name || "");
    setEditedEmail(profileData?.email || "");
    setEditedGender(profileData?.gender || "");
    setEditedAgeGroup(profileData?.age_group || "");
    setEditedProfession(profileData?.profession || "");
    setEmailError("");
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const onSave = async () => {
    if (!validateEmail(editedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return;

      const res = await axios.put(
        "http://127.0.0.1:8000/user/edit-profile",
        {
          name: editedName,
          email: editedEmail,
          gender: editedGender,
          age_group: editedAgeGroup,
          profession: editedProfession,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProfileData(res.data);
      setIsEditing(false);
      setEmailError("");
      console.log("✅ Profile updated", res.data);
    } catch (err) {
      console.error("❌ Failed to update profile", err);
    }
  };

  const fetchPrivacySettings = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/user/privacy-settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAudioConsent(data.store_audio);
        setVideoConsent(data.store_video);
      } else {
        console.warn("Failed to load privacy settings", data.detail);
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (privacyVisible) {
      fetchPrivacySettings();
    }
  }, [privacyVisible]);

   if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 justify-center items-center mt-9" // Centers content both horizontally and vertically
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        {/* Provides clear visual separation and emphasis for the loading message */}
        <Text style={{ color: colors.text, marginTop: 16, fontSize: 16, fontWeight: '600' }}>
          Loading profile data...
        </Text>
      </SafeAreaView>
    );
  }


  const handlePrivacySave = async (audioConsent: boolean, videoConsent: boolean) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(`${BASE_URL}/user/update-privacy`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({
          store_audio: audioConsent,
          store_video: videoConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Privacy update failed", data);
        return;
      }

      await AsyncStorage.setItem("consent_audio", JSON.stringify(audioConsent));
      await AsyncStorage.setItem("consent_video", JSON.stringify(videoConsent));

      console.log("Privacy settings saved!");
      setPrivacyVisible(false)
    } catch (error) {
      console.error("Error saving privacy settings:", error);
    }
  };

  const settingsGroups = [
    {
      title: "Account",
      items: [
        {
          icon: Edit3,
          title: "Edit Profile",
          description: "Update your personal information",
          onPress: startEditing,
        },
        {
          icon: Crown,
          title: "Change Subscription",
          description: "Current Plan - " + `${profileData?.current_plan_id?.charAt(0).toUpperCase()}${profileData?.current_plan_id?.slice(1)}`,
          onPress: () => {
            router.push("/subscription");
          },
        },

        {
          icon: Shield,
          title: "Privacy & Security",
          description: "Manage your privacy settings",
          onPress: () => {setPrivacyVisible(true)},
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: isDark ? Sun : Moon,
          title: "Dark Mode",
          description: `Switch to ${isDark ? "light" : "dark"} mode`,
          hasSwitch: true,
          value: isDark,
          onToggle: toggleTheme,
        },
        {
          icon: Bell,
          title: "Notifications",
          description: "Push notifications and alerts",
          hasSwitch: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: Calendar,
          title: "Daily Reminders",
          description: "Remind me to practice daily",
          hasSwitch: true,
          value: dailyReminders,
          onToggle: setDailyReminders,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: MessageCircle,
          title: "Feedback",
          description: "Send feedback or suggest features",
          onPress: () => {
            router.push("/feedback");
          },
        },

        {
          icon: LogOut,
          title: "Sign Out",
          description: "Sign out of your account",
          onPress: handleLogout,
          isDestructive: true,
        },
      ],
    },
  ];

  const stats = [
    {
      icon: Crown,
      label: "Level",
      value: profileData?.level.toString(),
      color: "#f59e0b",
      bgColor: "#fef3c7",
    },
    {
      icon: Flame,
      label: "Days streak",
      value: metrics?.streak ? metrics.streak.toString() : "0",
      color: "#ea580c",
      bgColor: "#fed7aa",
    },
    {
      icon: Trophy,
      label: "Avg Score",
      value: metrics?.average_score ? Math.round(metrics.average_score).toString() : "0",
      color: "#10b981",
      bgColor: "#d1fae5",
    },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="px-6 py-8" style={{ backgroundColor: colors.surface }}>
          <View className="items-center">
            <TouchableOpacity
              className="rounded-full w-24 h-24 items-center justify-center mb-4 relative overflow-hidden border-4"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.primary + "30",
              }}
              onPress={() => setShowAvatarModal(true)}
            >
              <Image
                source={{
                  uri: generateAvatarUrl(
                    profileData?.avatar,
                    profileData?.avatar_style,
                  ),
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </TouchableOpacity>

            <View className="items-center">
              {isEditing ? (
                <TextInput
                  value={editedName}
                  onChangeText={setEditedName}
                  style={{
                    color: colors.text,
                    fontSize: 20,
                    fontWeight: "bold",
                    borderBottomWidth: 1,
                    borderColor: colors.border,
                    paddingVertical: 4,
                    minWidth: 200,
                  }}
                />
              ) : (
                <Text
                  className="text-2xl font-bold mb-1"
                  style={{ color: colors.text }}
                >
                  {profileData?.name || "Loading..."}
                </Text>
              )}

              <Text className="mb-4" style={{ color: colors.textSecondary }}>
                Member since{" "}
                {profileData?.created_at
                  ? new Date(profileData.created_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      },
                    )
                  : "Loading..."}
              </Text>
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-center space-x-4 mt-4">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <View key={index} className="items-center">
                    <View
                      className="rounded-2xl p-3 mb-2"
                      style={{ backgroundColor: stat.bgColor }}
                    >
                      <IconComponent size={20} color={stat.color} />
                    </View>
                    <Text
                      className="text-lg font-bold"
                      style={{ color: colors.text }}
                    >
                      {stat.value}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {stat.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View className="px-6 py-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Personal Information
            </Text>
            {!isEditing && (
              <TouchableOpacity
                onPress={startEditing}
                className="rounded-full p-2"
                style={{ backgroundColor: colors.surface }}
              >
                <Edit3 size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View
              className="rounded-3xl p-6 shadow-lg"
              style={{
                backgroundColor: colors.card,
                shadowColor: theme === "dark" ? "#000" : "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: theme === "dark" ? 0.3 : 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              {/* Name Field */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View
                    className="rounded-xl p-2 mr-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <User size={18} color={colors.primary} />
                  </View>
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Full Name
                  </Text>
                </View>
                <TextInput
                  value={editedName}
                  onChangeText={setEditedName}
                  className="rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Email Field */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View
                    className="rounded-xl p-2 mr-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Mail size={18} color={colors.primary} />
                  </View>
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Email Address
                  </Text>
                </View>
                <TextInput
                  value={editedEmail}
                  onChangeText={(text) => {
                    setEditedEmail(text);
                    if (!validateEmail(text)) {
                      setEmailError("Please enter a valid email address");
                    } else {
                      setEmailError("");
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: emailError ? colors.error : colors.border,
                    borderWidth: 1,
                  }}
                  placeholder="Enter your email address"
                  placeholderTextColor={colors.textSecondary}
                />
                {!!emailError && (
                  <Text
                    className="text-sm mt-2 ml-1"
                    style={{ color: colors.error }}
                  >
                    {emailError}
                  </Text>
                )}
              </View>

              {/* Gender Selection */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View
                    className="rounded-xl p-2 mr-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <User size={18} color={colors.primary} />
                  </View>
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Gender
                  </Text>
                </View>
                <View className="flex-row flex-wrap">
                  {genderOptions.map((option) => {
                    const selected = editedGender === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => setEditedGender(option)}
                        className="rounded-full px-4 py-2 mr-2 mb-2 border-2"
                        style={{
                          backgroundColor: selected
                            ? colors.primary + "20"
                            : colors.surface,
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                        }}
                      >
                        <Text
                          className="text-sm font-medium"
                          style={{
                            color: selected
                              ? colors.primary
                              : colors.textSecondary,
                          }}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Age Group Selection */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View
                    className="rounded-xl p-2 mr-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Calendar size={18} color={colors.primary} />
                  </View>
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Age Group
                  </Text>
                </View>
                <View className="flex-row flex-wrap">
                  {ageGroups.map((option) => {
                    const selected = editedAgeGroup === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => setEditedAgeGroup(option)}
                        className="rounded-full px-4 py-2 mr-2 mb-2 border-2"
                        style={{
                          backgroundColor: selected
                            ? colors.primary + "20"
                            : colors.surface,
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                        }}
                      >
                        <Text
                          className="text-sm font-medium"
                          style={{
                            color: selected
                              ? colors.primary
                              : colors.textSecondary,
                          }}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Profession Selection */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View
                    className="rounded-xl p-2 mr-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <BriefcaseIcon size={18} color={colors.primary} />
                  </View>
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text }}
                  >
                    Profession
                  </Text>
                </View>
                <View className="flex-row flex-wrap">
                  {professions.map((option) => {
                    const selected = editedProfession === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => setEditedProfession(option)}
                        className="rounded-full px-4 py-2 mr-2 mb-2 border-2"
                        style={{
                          backgroundColor: selected
                            ? colors.primary + "20"
                            : colors.surface,
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                        }}
                      >
                        <Text
                          className="text-sm font-medium"
                          style={{
                            color: selected
                              ? colors.primary
                              : colors.textSecondary,
                          }}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  className="flex-1 rounded-2xl py-4 px-6"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text
                    className="font-bold text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onSave}
                  className="flex-1 rounded-2xl py-4 px-6"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-bold text-center">
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              {/* Email Info Card */}
              <View
                className="rounded-2xl p-4"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center">
                  <View
                    className="rounded-xl p-2 mr-3"
                    style={{ backgroundColor: colors.card }}
                  >
                    <Mail size={18} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-medium"
                      style={{ color: colors.textSecondary }}
                    >
                      Email Address
                    </Text>
                    <Text
                      className="font-semibold mt-1"
                      style={{ color: colors.text }}
                    >
                      {profileData?.email || "Not set"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Gender Info Card */}
              <View
                className="rounded-2xl p-4"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center">
                  <View
                    className="rounded-xl p-2 mr-3"
                    style={{ backgroundColor: colors.card }}
                  >
                    <User size={18} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-medium"
                      style={{ color: colors.textSecondary }}
                    >
                      Gender
                    </Text>
                    <Text
                      className="font-semibold mt-1"
                      style={{ color: colors.text }}
                    >
                      {profileData?.gender || "Not specified"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Age Group Info Card */}
              <View
                className="rounded-2xl p-4"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center">
                  <View
                    className="rounded-xl p-2 mr-3"
                    style={{ backgroundColor: colors.card }}
                  >
                    <Calendar size={18} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-medium"
                      style={{ color: colors.textSecondary }}
                    >
                      Age Group
                    </Text>
                    <Text
                      className="font-semibold mt-1"
                      style={{ color: colors.text }}
                    >
                      {profileData?.age_group || "Not specified"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Profession Info Card */}
              <View
                className="rounded-2xl p-4"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center">
                  <View
                    className="rounded-xl p-2 mr-3"
                    style={{ backgroundColor: colors.card }}
                  >
                    <BriefcaseIcon size={18} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-medium"
                      style={{ color: colors.textSecondary }}
                    >
                      Profession
                    </Text>
                    <Text
                      className="font-semibold mt-1"
                      style={{ color: colors.text }}
                    >
                      {profileData?.profession || "Not specified"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View
            key={groupIndex}
            className="px-6 py-6 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <Text
              className="text-lg font-bold mb-4"
              style={{ color: colors.text }}
            >
              {group.title}
            </Text>
            <View className="space-y-1">
              {group.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    className="flex-row items-center justify-between py-3 px-4 rounded-2xl"
                    style={{ backgroundColor: colors.surface }}
                    onPress={item.onPress}
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className="rounded-xl p-2 mr-3"
                        style={{ backgroundColor: colors.card }}
                      >
                        <IconComponent
                          size={20}
                          color={
                            item.isDestructive
                              ? colors.error
                              : colors.textSecondary
                          }
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="font-semibold"
                          style={{
                            color: item.isDestructive
                              ? colors.error
                              : colors.text,
                          }}
                        >
                          {item.title}
                        </Text>
                        <Text
                          className="text-sm mt-1"
                          style={{ color: colors.textSecondary }}
                        >
                          {item.description}
                        </Text>
                      </View>
                    </View>
                    {item.hasSwitch ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{
                          false: colors.border,
                          true: colors.primary,
                        }}
                        thumbColor={item.value ? "#ffffff" : colors.surface}
                      />
                    ) : (
                      <ChevronRight size={20} color={colors.border} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {privacyVisible && (
          <Modal animationType="slide" transparent>
            <View
              className="flex-1 justify-end"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }} // Match backdrop style
            >
              <View
                className="rounded-t-3xl p-6 pb-8"
                style={{ backgroundColor: colors.card }} // Match modal background
              >
                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setPrivacyVisible(false)}
                  className="self-end p-2 -mt-2 -mr-2"
                >
                  <Text className="text-2xl font-bold" style={{ color: colors.textSecondary }}>
                    &times;
                  </Text>
                </TouchableOpacity>

                {/* Title + Icon (optional for aesthetics) */}
                <View className="flex-row items-center mb-4">
                  <View
                    className="rounded-full p-3 mr-3"
                    style={{ backgroundColor: colors.primary, opacity: 0.2 }}
                  >
                    <Shield size={24} color="#fff" />
                  </View>
                  <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                    Privacy & Security
                  </Text>
                </View>

                {/* Description */}
                <Text className="text-base mb-4" style={{ color: colors.textSecondary }}>
                  Your data is safe with us. We do not save any speech audio or video files in our database without your consent.
                  If you'd like to revisit speeches later, you can allow storage below.
                  For your privacy, saved files are automatically deleted after 30 days.
                </Text>

                {/* Toggles */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-base" style={{ color: colors.text }}>Allow Audio Storage</Text>
                  <Switch
                    value={audioConsent}
                    onValueChange={setAudioConsent}
                    thumbColor={audioConsent ? colors.primary : "#ccc"}
                  />
                </View>

                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-base" style={{ color: colors.text }}>Allow Video Storage</Text>
                  <Switch
                    value={videoConsent}
                    onValueChange={setVideoConsent}
                    thumbColor={videoConsent ? colors.primary : "#ccc"}
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={() => handlePrivacySave(audioConsent, videoConsent)}
                  className="mt-6 py-3 rounded-full items-center shadow-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-base font-bold" style={{ color: "#fff" }}>
                    Save Preferences
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}


        {/* App Version */}
        <View className="px-6 py-6">
          <Text
            className="text-center text-sm"
            style={{ color: colors.textSecondary }}
          >
            Echozi v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Avatar Selection Modal */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl px-6 py-8"
            style={{
              backgroundColor: colors.background,
              maxHeight: "70%",
            }}
          >
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                Choose Your Avatar
              </Text>
              <TouchableOpacity
                onPress={() => setShowAvatarModal(false)}
                className="rounded-full p-2"
                style={{ backgroundColor: colors.surface }}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Avatar Style Selector */}
            <View className="mb-6">
              <Text
                className="text-lg font-semibold mb-3"
                style={{ color: colors.text }}
              >
                Avatar Style
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-3">
                  {avatarStyles.slice(0, 6).map((style) => (
                    <TouchableOpacity
                      key={style}
                      className={`px-4 py-2 rounded-full border-2`}
                      style={{
                        backgroundColor:
                          selectedAvatarStyle === style
                            ? colors.primary + "20"
                            : colors.surface,
                        borderColor:
                          selectedAvatarStyle === style
                            ? colors.primary
                            : colors.border,
                      }}
                      onPress={() => handleStyleChange(style)}
                    >
                      <Text
                        className="text-sm font-medium capitalize"
                        style={{
                          color:
                            selectedAvatarStyle === style
                              ? colors.primary
                              : colors.textSecondary,
                        }}
                      >
                        {style.replace("-", " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Shuffle Button */}
            {/*<TouchableOpacity
              className="flex-row items-center justify-center p-4 rounded-2xl mb-6"
              style={{ backgroundColor: colors.primary }}
              onPress={handleShuffleAvatars}
              disabled={isShuffling}
            >
              <Shuffle
                size={20}
                color="white"
                style={{
                  transform: [{ rotate: isShuffling ? "180deg" : "0deg" }],
                }}
              />
              <Text className="text-white font-semibold ml-2">
                {isShuffling ? "Shuffling..." : "Shuffle New Avatars"}
              </Text>
            </TouchableOpacity>*/}

            {/* Avatar Grid */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between">
                {avatarSeeds.map((seed, index) => {
                  const isSelected = selectedAvatar === seed && selectedAvatarStyle === profileData?.avatar_style
                  const avatarSize = (width - 80) / 3 - 12;
                  return (
                    <TouchableOpacity
                      key={`${seed}-${index}`}
                      className={`rounded-2xl items-center justify-center mb-4 border-3 overflow-hidden relative`}
                      style={{
                        backgroundColor: isSelected
                          ? colors.primary + "20"
                          : colors.surface,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                        width: avatarSize,
                        height: avatarSize,
                        opacity: isShuffling ? 0.5 : 1,
                      }}
                      onPress={() => handleAvatarSelect(seed)}
                      disabled={isShuffling}
                    >
                      <Image
                        source={{
                          uri: generateAvatarUrl(seed, selectedAvatarStyle),
                        }}
                        style={{
                          width: avatarSize - 8,
                          height: avatarSize - 8,
                        }}
                        resizeMode="cover"
                      />
                      {isSelected && (
                        <View
                          className="absolute top-1 right-1 rounded-full w-6 h-6 items-center justify-center"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Check size={12} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Current Selection Preview */}
            <View
              className="mt-6 p-4 rounded-2xl flex-row items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="text-lg font-semibold mr-4"
                style={{ color: colors.text }}
              >
                Preview:
              </Text>
              <View
                className="rounded-full w-16 h-16 overflow-hidden border-2"
                style={{ borderColor: colors.primary }}
              >
                <Image
                  source={{
                    uri: generateAvatarUrl(
                      profileData?.avatar,
                      profileData?.avatar_style,
                    ),
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
