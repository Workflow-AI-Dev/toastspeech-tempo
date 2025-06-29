import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
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
} from "lucide-react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";

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
  };
}

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
  },
}: ProfileSettingsProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const colors = getThemeColors(theme);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);

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
          onPress: () => {},
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
      label: "Streak",
      value: `${user.streak} days`,
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
            <View className="bg-indigo-100 rounded-full w-24 h-24 items-center justify-center mb-4">
              <User size={40} color={colors.primary} />
            </View>

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
    </View>
  );
}
