import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, getThemeColors } from "./context/ThemeContext";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    title: "Welcome to Echozi",
    description: "AI-powered coaching to boost your public speaking game.",
    image: require("../assets/images/public.jpg"),
    bgColor: "#f6f2ef",
  },
  {
    title: "AI-Powered Analysis",
    description: "Get instant feedback on pace, clarity, and confidence.",
    image: require("../assets/images/aimee.png"),
    bgColor: "#caddfe",
  },
  {
    title: "Track Your Progress",
    description: "Monitor improvement with detailed analytics.",
    image: require("../assets/images/progress.gif"),
    bgColor: "#f6d183",
  },
  {
    title: "Level Up Skills",
    description: "Structured practice with gamified achievements.",
    image: require("../assets/images/girl.gif"),
    bgColor: "#fd6356",
  },
  {
    title: "Start Free",
    description: "To unlock your speech journey.",
    image: require("../assets/images/skillssss.gif"),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({
        x: width * (activeIndex + 1),
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    scrollRef.current?.scrollTo({
      x: width * (slides.length - 1),
      animated: true,
    });
  };

  const handleGetStarted = () => router.push("/sign-up");
  const handleSignIn = () => router.push("/sign-in");

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => {
          const isFirst = index === 0;
          const isFourth = index === 3;

          return (
            <View
              key={index}
              style={{
                width,
                height,
                backgroundColor: slide.bgColor || colors.background,
              }}
              className="flex-1"
            >
              <View
                className="flex-1 items-center px-8"
                style={{
                  paddingTop: isFirst ? 100 : 0,
                  justifyContent: isFirst ? "flex-start" : "center",
                }}
              >
                {isFirst && (
                  <Image
                    source={require("../assets/images/logots.png")}
                    resizeMode="contain"
                    style={{
                      width: width * 0.35,
                      height: height * 0.08,
                      marginBottom: 16,
                    }}
                  />
                )}

                {slide.image && (
                  <Image
                    source={slide.image}
                    resizeMode="contain"
                    style={{
                      width: width * 1,
                      height: height * 0.35,
                      marginBottom: 30,
                    }}
                  />
                )}

                <Text
                  className="text-3xl font-bold text-center mb-4"
                  style={{
                    color: isFourth ? "#fff" : isFirst ? "#000" : colors.text,
                  }}
                >
                  {slide.title}
                </Text>

                <Text
                  className="text-base text-center leading-relaxed px-2"
                  style={{
                    color: isFourth
                      ? "#fff"
                      : isFirst
                        ? "#444"
                        : colors.textSecondary,
                  }}
                >
                  {slide.description}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Pagination + Actions */}
      <View className="px-8 py-8 items-center space-y-5">
        {/* Dots */}
        <View className="flex-row mb-2">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                activeIndex === index ? "w-6 bg-black/80" : "w-2 bg-black/30"
              }`}
            />
          ))}
        </View>

        {/* Buttons */}
        {activeIndex === slides.length - 1 ? (
          <>
            <TouchableOpacity
              onPress={handleGetStarted}
              className="w-full py-4 rounded-2xl"
              style={{ backgroundColor: "#000000" }}
            >
              <Text className="text-white text-center font-bold text-lg">
                Get Started
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSignIn}
              className="w-full py-4 rounded-2xl border"
              style={{ borderColor: colors.border }}
            >
              <Text className="text-center font-semibold text-lg">Sign In</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="flex-row justify-between w-full">
            <TouchableOpacity onPress={handleSkip}>
              <Text
                className="text-base font-medium"
                style={{ color: colors.textSecondary }}
              >
                Skip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext}>
              <Text
                className="text-base font-medium"
                style={{ color: colors.primary }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
