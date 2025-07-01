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
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

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
  "adventurer",
  "avataaars",
  "big-ears",
  "big-smile",
  "bottts",
  "croodles",
  "fun-emoji",
  "icons",
  "identicon",
  "initials",
  "lorelei",
  "micah",
  "miniavs",
  "open-peeps",
  "personas",
  "pixel-art",
];

// Generate random seeds for avatars
const generateRandomSeeds = (count: number = 12): string[] => {
  return Array.from({ length: count }, () =>
    Math.random().toString(36).substring(2, 15),
  );
};

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || "felix");
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState("avataaars");
  const [avatarSeeds, setAvatarSeeds] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const router = useRouter();
  const { width } = Dimensions.get("window");

  // Initialize avatar seeds on component mount
  useEffect(() => {
    setAvatarSeeds(generateRandomSeeds(12));
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      return;
    }
    router.push("/sign-in");
  };

  const handleAvatarSelect = async (avatarSeed: string) => {
    setSelectedAvatar(avatarSeed);
    setShowAvatarModal(false);

    // Save avatar to user profile in Supabase
    if (authUser) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            avatar: avatarSeed,
            avatar_style: selectedAvatarStyle,
          },
        });

        if (error) {
          console.error("Error updating avatar:", error.message);
        } else {
          console.log("Avatar updated successfully");
        }
      } catch (error) {
        console.error("Error updating avatar:", error);
      }
    }
  };

  const handleShuffleAvatars = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setAvatarSeeds(generateRandomSeeds(12));
      setIsShuffling(false);
    }, 300);
  };

  const handleStyleChange = (style: string) => {
    setSelectedAvatarStyle(style);
    setAvatarSeeds(generateRandomSeeds(12));
  };

  const settingsGroups = [
    {
      title: "Account",
      items: [
        {
          icon: Edit3,
          title: "Edit Profile",
          description: "Update your personal information",
          onPress: () => setIsEditing(true),
        },
        {
          icon: Shield,
          title: "Privacy & Security",
          description: "Manage your privacy settings",
          onPress: () => {},
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
        {
          icon: Mail,
          title: "Weekly Reports",
          description: "Email summary of your progress",
          hasSwitch: true,
          value: weeklyReports,
          onToggle: setWeeklyReports,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          title: "Help & Support",
          description: "Get help and contact support",
          onPress: () => {},
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
      value: user.level.toString(),
      color: "#f59e0b",
      bgColor: "#fef3c7",
    },
    {
      icon: Flame,
      label: "Days streak",
      value: `${user.streak}`,
      color: "#ea580c",
      bgColor: "#fed7aa",
    },
    {
      icon: Trophy,
      label: "Avg Score",
      value: user.avgScore.toString(),
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
                  uri: generateAvatarUrl(selectedAvatar, selectedAvatarStyle),
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View
                className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Camera size={16} color="white" />
              </View>
            </TouchableOpacity>

            {isEditing ? (
              <View className="items-center">
                <TextInput
                  className="text-2xl font-bold text-center rounded-xl px-4 py-2 mb-2 border"
                  style={{
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  }}
                  value={editedName}
                  onChangeText={setEditedName}
                  autoFocus
                  placeholderTextColor={colors.textSecondary}
                />
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    className="rounded-xl px-4 py-2"
                    style={{ backgroundColor: colors.primary }}
                    onPress={() => {
                      setIsEditing(false);
                      // Save name logic here
                    }}
                  >
                    <Text className="text-white font-semibold">Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded-xl px-4 py-2"
                    style={{ backgroundColor: colors.surface }}
                    onPress={() => {
                      setIsEditing(false);
                      setEditedName(user.name);
                    }}
                  >
                    <Text
                      className="font-semibold"
                      style={{ color: colors.text }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="items-center">
                <Text
                  className="text-2xl font-bold mb-1"
                  style={{ color: colors.text }}
                >
                  {user.name}
                </Text>
                <Text className="mb-4" style={{ color: colors.textSecondary }}>
                  Member since {user.joinDate}
                </Text>
              </View>
            )}

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

        {/* Contact Info */}
        <View
          className="px-6 py-6 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Contact Information
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Mail size={20} color={colors.textSecondary} />
              <Text className="ml-3" style={{ color: colors.text }}>
                {user.email}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Phone size={20} color={colors.textSecondary} />
              <Text className="ml-3" style={{ color: colors.text }}>
                {user.phone}
              </Text>
            </View>
            <View className="flex-row items-center">
              <MapPin size={20} color={colors.textSecondary} />
              <Text className="ml-3" style={{ color: colors.text }}>
                {user.location}
              </Text>
            </View>
          </View>
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

        {/* App Version */}
        <View className="px-6 py-6">
          <Text
            className="text-center text-sm"
            style={{ color: colors.textSecondary }}
          >
            ToastSpeech v1.0.0
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
            <TouchableOpacity
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
            </TouchableOpacity>

            {/* Avatar Grid */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between">
                {avatarSeeds.map((seed, index) => {
                  const isSelected = selectedAvatar === seed;
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
                    uri: generateAvatarUrl(selectedAvatar, selectedAvatarStyle),
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
