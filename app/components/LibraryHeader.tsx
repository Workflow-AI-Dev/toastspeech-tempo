import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Search, Filter, X, BarChart3, Mic, Target, Star, Clock, Zap } from 'lucide-react-native';
import { useTheme, getThemeColors } from '../context/ThemeContext';

// Helper component for displaying stats
function StatCard({ colors, bgColor, icon, title, value, subtitle }) {
  return (
    <View
      className="rounded-3xl p-5 mr-4 shadow-lg min-w-[140px]"
      style={{
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="rounded-full p-2"
          style={{ backgroundColor: bgColor }}
        >
          {icon}
        </View>
      </View>
      <Text className="text-sm font-bold uppercase mb-1" style={{ color: colors.textSecondary }}>
        {title}
      </Text>
      <Text className="text-2xl font-bold" style={{ color: colors.text }}>
        {value}
      </Text>
      <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
        {subtitle}
      </Text>
    </View>
  );
}

// Main LibraryHeader component
function LibraryHeader({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isSearchActive,
  setIsSearchActive,
  setIsFilterModalVisible,
  hasActiveFilters,
  speechTypeFilter, 
  durationFilter,   
  scoreRange,       
  dateRange,        
  stats,
}) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const formatSecondsToDuration = (seconds) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const getTitleForActiveTab = () => {
    switch (activeTab) {
      case "speech":
        return "Speech Library";
      case "evaluation":
        return "Evaluation Library";
      case "practice":
        return "Practice Library";
      default:
        return "";
    }
  };

  const getPlaceholderForActiveTab = () => {
    switch (activeTab) {
      case "speech":
        return "Search speeches...";
      case "evaluation":
        return "Search evaluations...";
      case "practice":
        return "Search practice sessions...";
      default:
        return "Search...";
    }
  };

  return (
    <View>
      {/* Enhanced Header */}
      <View
        className="px-6 py-8"
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 0.5,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text
              className="text-3xl font-bold"
              style={{ color: colors.text }}
            >
              {getTitleForActiveTab()}
            </Text>
            <Text
              className="mt-1 text-base"
              style={{ color: colors.textSecondary }}
            >
              Explore your speeches, evaluations & practice
            </Text>
          </View>
          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: theme === "dark" ? colors.surface : "#f0f9ff",
            }}
          >
            <BarChart3 size={28} color={colors.primary} />
          </View>
        </View>

        {/* Search and Filter Section */}
        {isSearchActive ? (
          <View className="flex-row items-center">
            <View
              className="flex-1 flex-row items-center rounded-2xl px-4 py-3 mr-2 border"
              style={{
                backgroundColor: theme === "dark" ? colors.card : colors.surface,
                borderColor: colors.border,
              }}
            >
              <Search size={18} color={colors.textSecondary} />
              <TextInput
                className="flex-1 ml-2"
                placeholder={getPlaceholderForActiveTab()}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ color: colors.text }}
              />
            </View>
            <TouchableOpacity
              className="rounded-2xl px-4 py-3"
              style={{
                backgroundColor: theme === "dark" ? colors.card : "#ebedf0",
              }}
              onPress={() => {
                setIsSearchActive(false);
                setSearchQuery("");
              }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row justify-between">
            <TouchableOpacity
              className={`flex-row items-center rounded-2xl px-4 py-3 flex-1 mr-2`}
              style={{
                backgroundColor: theme === "dark" ? "#323232ff" : "#ebedf0",
              }}
              onPress={() => setIsSearchActive(true)}
            >
              <Search size={18} color={colors.textSecondary} />
              <Text
                className="ml-2 font-medium"
                style={{ color: colors.textSecondary }}
              >
                Search
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center rounded-2xl px-4 py-3 ml-2"
              style={{
                backgroundColor: hasActiveFilters
                  ? colors.primary
                  : theme === "dark"
                  ? "#323232ff"
                  : "#ebedf0",
              }}
              onPress={() => setIsFilterModalVisible(true)}
            >
              <Filter
                size={18}
                color={hasActiveFilters ? "white" : colors.textSecondary}
              />
              <Text
                className="ml-2 font-medium"
                style={{
                  color: hasActiveFilters ? "white" : colors.textSecondary,
                }}
              >
                Filter
              </Text>
              {hasActiveFilters && (
                <View
                  className="ml-2 rounded-full w-5 h-5 items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                >
                  <Text className="text-xs font-bold text-white">
                    {[
                      searchQuery,
                      speechTypeFilter,
                      durationFilter,
                      scoreRange,
                      dateRange,
                    ].filter(Boolean).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Toggle */}
      <View
        className="flex-row mx-6 my-4 justify-center rounded-xl overflow-hidden border"
        style={{ borderColor: colors.border }}
      >
        <TouchableOpacity
          className={`flex-1 px-4 py-2 items-center ${activeTab === "speech" ? "bg-blue-500" : ""}`}
          style={{
            backgroundColor:
              activeTab === "speech" ? colors.primary : "transparent",
          }}
          onPress={() => setActiveTab("speech")}
        >
          <Text
            style={{ color: activeTab === "speech" ? "#fff" : colors.text }}
          >
            Speech
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 px-4 py-2 items-center ${activeTab === "evaluation" ? "bg-blue-500" : ""}`}
          style={{
            backgroundColor:
              activeTab === "evaluation" ? colors.primary : "transparent",
          }}
          onPress={() => setActiveTab("evaluation")}
        >
          <Text
            style={{
              color: activeTab === "evaluation" ? "#fff" : colors.text,
            }}
          >
            Evaluation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 px-4 py-2 items-center ${activeTab === "practice" ? "bg-blue-500" : ""}`}
          style={{
            backgroundColor:
              activeTab === "practice" ? colors.primary : "transparent",
          }}
          onPress={() => setActiveTab("practice")}
        >
          <Text
            style={{
              color: activeTab === "practice" ? "#fff" : colors.text,
            }}
          >
            Practice
          </Text>
        </TouchableOpacity>
      </View>

      {/* Enhanced Stats Overview */}
      <View className="px-6 py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {/* Count */}
            <StatCard
              colors={colors}
              bgColor="#e0f2fe"
              icon={<Mic size={20} color="#0284c7" />}
              title="COUNT"
              value={stats.count}
              subtitle="Total Speeches"
            />

            {/* AVG Score */}
            <StatCard
              colors={colors}
              bgColor="#fef3c7"
              icon={<Target size={20} color="#f59e0b" />}
              title="AVG"
              value={stats.avgScore}
              subtitle="Average Score"
            />

            {/* Highest Score */}
            <StatCard
              colors={colors}
              bgColor="#dcfce7"
              icon={<Star size={20} color="#10b981" />}
              title="BEST"
              value={stats.highestScore}
              subtitle="Highest Score"
            />

            {/* Total Practice Time */}
            <StatCard
              colors={colors}
              bgColor="#dbeafe"
              icon={<Clock size={20} color="#3b82f6" />}
              title="TIME"
              value={formatSecondsToDuration(stats.totalPracticeSeconds)}
              subtitle="Total Practice"
            />

            {/* Streak */}
            {/* <StatCard
              colors={colors}
              bgColor="#f3e8ff"
              icon={<Zap size={20} color="#8b5cf6" />}
              title="STREAK"
              value={stats.streak}
              subtitle="Day Streak"
            /> */}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

export default React.memo(LibraryHeader);