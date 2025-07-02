import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme, getThemeColors } from "../context/ThemeContext";

interface ProgressIndicatorProps {
  steps: string[];
  stepLabels: string[];
  currentStep: string;
  onStepPress?: (step: string) => void;
  allowBackNavigation?: boolean;
}

export default function ProgressIndicator({
  steps,
  stepLabels,
  currentStep,
  onStepPress = () => {},
  allowBackNavigation = true,
}: ProgressIndicatorProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <View className="flex-row items-center justify-center">
      {steps.map((step, index) => {
        const isActive = currentStep === step;
        const isCompleted = steps.indexOf(currentStep) > index;
        const canNavigate =
          allowBackNavigation &&
          steps.indexOf(step) < steps.indexOf(currentStep);

        return (
          <View key={step} className="flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                if (canNavigate || isActive) {
                  onStepPress(step);
                }
              }}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: isActive
                  ? colors.primary
                  : isCompleted
                    ? colors.success
                    : colors.surface,
                borderColor: colors.border,
                borderWidth: isActive || isCompleted ? 0 : 1,
                opacity: canNavigate || isActive ? 1 : 0.5,
              }}
              disabled={!canNavigate && !isActive}
            >
              <Text
                className="font-bold text-xs"
                style={{
                  color:
                    isActive || isCompleted ? "white" : colors.textSecondary,
                }}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
            {index < steps.length - 1 && (
              <View
                className="w-6 h-0.5 mx-1"
                style={{
                  backgroundColor: isCompleted ? colors.success : colors.border,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
