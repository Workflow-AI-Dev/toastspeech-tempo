import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useTheme, getThemeColors } from "../context/ThemeContext";
import { styles } from "../styles/circular-progress-styles";

interface CircularProgressProps {
  progress: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  animate?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 12,
  color,
  backgroundColor,
  animate = true,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const primaryColor = color || colors.primary;
  const bgColor = backgroundColor || colors.border;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate progress fill
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: animate ? 900 : 0,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Gentle pulse loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Svg width={size} height={size}>
        {/* Gradient for a modern look */}
        <Defs>
          <LinearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <Stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.accent} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          stroke={bgColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Foreground (animated) progress circle */}
        <AnimatedCircle
          stroke="url(#progressGradient)"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Centered text */}
      <View style={styles.textWrapper}>
        <Text
          style={[
            styles.text,
            {
              color: primaryColor,
            },
          ]}
        >
          {progress < 100 ? `${Math.round(progress)}%` : "Done"}
        </Text>
      </View>
    </Animated.View>
  );
};

export default CircularProgress;
