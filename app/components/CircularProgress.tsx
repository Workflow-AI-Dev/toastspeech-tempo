import React from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

const CircularProgress = ({
  size = 120,
  strokeWidth = 12,
  progress = 0, // 0 to 100
  color = "#6C63FF",
  backgroundColor = "#E6E6E6",
}: {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
  backgroundColor?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProgress = circumference * ((100 - progress) / 100);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          stroke={backgroundColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Foreground progress */}
        <Circle
          stroke={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={animatedProgress}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Progress text in the center */}
      <View
        style={
          (StyleSheet.absoluteFillObject,
          { alignItems: "center", justifyContent: "center" })
        }
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: color }}>
          {progress < 100 ? `${progress}%` : "Done"}
        </Text>
      </View>
    </View>
  );
};

export default CircularProgress;
