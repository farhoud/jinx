import React from "react"
import { View, StyleProp, ViewStyle, TextStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Card } from "./Card"
import { Text } from "./Text"

interface TemperatureGaugeProps {
  /**
   * Current temperature value.
   */
  currentTemperature: number
  /**
   * High boundary temperature.
   */
  highBoundary: number
  /**
   * Low boundary temperature.
   */
  lowBoundary: number
  /**
   * Condition: ABOVE_HIGH or BELOW_LOW.
   */
  condition: "ABOVE_HIGH" | "BELOW_LOW"
  /**
   * Optional style override for the container.
   */
  style?: StyleProp<ViewStyle>
}

const TemperatureGauge: React.FC<TemperatureGaugeProps> = ({
  currentTemperature,
  highBoundary,
  lowBoundary,
  condition,
  style,
}) => {
  const { themed, theme } = useAppTheme()

  const range = highBoundary - lowBoundary
  const position = Math.min(100, Math.max(0, ((currentTemperature - lowBoundary) / range) * 100))

  const isOutOfBounds =
    (condition === "ABOVE_HIGH" && currentTemperature > highBoundary) ||
    (condition === "BELOW_LOW" && currentTemperature < lowBoundary)

  return (
    <Card
      style={themed([$container, style])}
      heading={`Boundary: ${lowBoundary}°C - ${highBoundary}°C`}
      content={`Condition: ${condition.replace("_", " ").toLowerCase()}`}
      ContentComponent={
        <View>
          <Text text={`Current: ${currentTemperature}°C`} style={themed($currentText)} />
          <View style={themed($gaugeContainer)}>
            <View style={themed($gaugeBar)}>
              {/* Low section (red) */}
              <View style={themed([$gaugeSection, $lowSection])} />
              {/* Mid section (green) */}
              <View style={themed([$gaugeSection, $midSection])} />
              {/* High section (red) */}
              <View style={themed([$gaugeSection, $highSection])} />
              {/* Indicator */}
              <View
                style={[
                  themed($indicator),
                  {
                    left: `${position}%`,
                    backgroundColor: isOutOfBounds
                      ? theme.colors.palette.angry500
                      : theme.colors.palette.neutral900,
                  },
                ]}
              />
            </View>
            <View style={themed($markers)}>
              <Text text={`${lowBoundary}°`} style={themed($markerText)} />
              <Text text={`${highBoundary}°`} style={themed([$markerText, $highMarker])} />
            </View>
          </View>
          {isOutOfBounds && <Text text="Out of bounds!" style={themed($warningText)} />}
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
  textAlign: "center",
})

const $gaugeContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.sm,
  alignItems: "center",
})

const $gaugeBar: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: 24,
  width: "100%",
  backgroundColor: "transparent",
  borderWidth: 2,
  borderColor: "gray",
  borderRadius: spacing.xs,
  overflow: "visible",
  position: "relative",
  flexDirection: "row",
})

const $gaugeSection: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  height: "100%",
})

const $lowSection: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.angry500,
  borderTopLeftRadius: 4,
  borderBottomLeftRadius: 4,
})

const $midSection: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.secondary500,
})

const $highSection: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.angry500,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 4,
})

const $indicator: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  top: -spacing.xs,
  width: 4,
  height: 24 + spacing.xs * 2,
  borderRadius: 2,
  transform: [{ translateX: -2 }],
})

const $markers: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  marginTop: spacing.xs,
})

const $markerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $highMarker: ThemedStyle<TextStyle> = () => ({
  textAlign: "right",
})

const $warningText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.angry500,
  textAlign: "center",
  marginTop: spacing.sm,
  fontWeight: "bold",
})

export { TemperatureGauge }
