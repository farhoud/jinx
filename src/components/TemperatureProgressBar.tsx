import React from "react"
import { View, StyleProp, ViewStyle, TextStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Card } from "./Card"
import { Text } from "./Text"

interface TemperatureProgressBarProps {
  /**
   * Current temperature value.
   */
  currentTemperature: number
  /**
   * Target temperature value.
   */
  targetTemperature: number
  /**
   * Condition for the target: heating or cooling.
   */
  condition: "REACHED_OR_EXCEEDED" | "REACHED_OR_BELOW"
  /**
   * Optional style override for the container.
   */
  style?: StyleProp<ViewStyle>
}

const TemperatureProgressBar: React.FC<TemperatureProgressBarProps> = ({
  currentTemperature,
  targetTemperature,
  condition,
  style,
}) => {
  const { themed, theme } = useAppTheme()

  // Calculate progress percentage
  let progress = 0
  if (condition === "REACHED_OR_EXCEEDED") {
    // Heating: progress from 0 to target
    progress = Math.min(100, Math.max(0, (currentTemperature / targetTemperature) * 100))
  } else {
    // Cooling: assuming current starts above target, progress towards target
    if (currentTemperature <= targetTemperature) {
      progress = 100
    } else {
      // Simple inverse progress for cooling
      progress = Math.max(
        0,
        100 - ((currentTemperature - targetTemperature) / targetTemperature) * 100,
      )
    }
  }

  const isComplete = progress >= 100

  return (
    <Card
      style={themed([$container, style])}
      heading={`Temperature Target: ${targetTemperature}°C`}
      content={`${condition === "REACHED_OR_EXCEEDED" ? "Heating" : "Cooling"}`}
      ContentComponent={
        <View>
          <Text text={`Current: ${currentTemperature}°C`} style={themed($currentText)} />
          <View style={themed($progressContainer)}>
            <View
              style={themed([
                $progressBar,
                {
                  backgroundColor: theme.colors.palette.neutral300,
                },
              ])}
            >
              <View
                style={[
                  themed($progressFill),
                  {
                    width: `${progress}%`,
                    backgroundColor: isComplete
                      ? theme.colors.palette.secondary500
                      : theme.colors.palette.primary500,
                  },
                ]}
              />
            </View>
          </View>
          <Text text={`${Math.round(progress)}% Complete`} style={themed($progressText)} />
        </View>
      }
    />
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  margin: spacing.md,
})

const $currentText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $progressContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.sm,
})

const $progressBar: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: 24,
  borderRadius: spacing.xs,
  overflow: "hidden",
})

const $progressFill: ThemedStyle<ViewStyle> = () => ({
  height: "100%",
  borderRadius: 4,
})

const $progressText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginTop: spacing.xs,
})

export { TemperatureProgressBar }
