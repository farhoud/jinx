import React from "react"
import { View, StyleProp, ViewStyle, TextStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Button } from "./Button"
import { Card } from "./Card"
import { Text } from "./Text"

interface TimeElapsedProgressProps {
  /**
   * Total minutes for the event to trigger.
   */
  totalMinutes: number
  /**
   * Current elapsed minutes.
   */
  currentElapsed: number
  /**
   * Name of the event.
   */
  eventName?: string
  /**
   * Message of the event.
   */
  eventMessage?: string
  /**
   * Callback when user dismisses the completed event.
   */
  onDismiss?: () => void
  /**
   * Optional style override for the container.
   */
  style?: StyleProp<ViewStyle>
}

const TimeElapsedProgress: React.FC<TimeElapsedProgressProps> = ({
  totalMinutes,
  currentElapsed,
  eventName,
  eventMessage,
  onDismiss,
  style,
}) => {
  const { themed, theme } = useAppTheme()

  const progress = Math.min(100, (currentElapsed / totalMinutes) * 100)
  const remaining = Math.max(0, totalMinutes - currentElapsed)
  const isComplete = progress >= 100

  // Format time as MM:SS
  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes)
    const secs = Math.floor((minutes - mins) * 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card
      style={themed([$container, style])}
      heading={eventName}
      content={eventMessage}
      ContentComponent={
        <View style={themed($timerContainer)}>
          {!isComplete ? (
            <>
              <Text
                text={formatTime(remaining)}
                preset="heading"
                size="xxl"
                style={themed($timerText)}
              />
              <Text text="Time Remaining" style={themed($labelText)} />
              <View style={themed($progressContainer)}>
                <View style={themed($progressBar)}>
                  <View
                    style={[
                      themed($progressFill),
                      {
                        width: `${progress}%`,
                        backgroundColor: theme.colors.palette.primary500,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text text={`${Math.round(progress)}% Complete`} style={themed($progressText)} />
            </>
          ) : (
            <View style={themed($completedContainer)}>
              <Text text="⏰ Event Triggered!" preset="heading" style={themed($completedText)} />
              <Text text="Tap to dismiss and continue brewing." style={themed($dismissHint)} />
              <Button
                text="Dismiss Event"
                onPress={onDismiss}
                preset="filled"
                style={themed($dismissButton)}
              />
            </View>
          )}
        </View>
      }
    />
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  margin: spacing.md,
})

const $timerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.md,
})

const $timerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontWeight: "bold",
})

const $labelText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: spacing.sm,
  fontSize: 14,
})

const $progressContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  marginVertical: spacing.sm,
})

const $progressBar: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: 8,
  backgroundColor: "transparent",
  borderWidth: 1,
  borderColor: "gray",
  borderRadius: spacing.xs,
  overflow: "hidden",
})

const $progressFill: ThemedStyle<ViewStyle> = () => ({
  height: "100%",
  borderRadius: 4,
})

const $progressText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
})

const $completedContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.lg,
})

const $completedText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.secondary500,
  marginBottom: spacing.sm,
  textAlign: "center",
})

const $dismissHint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: spacing.md,
  textAlign: "center",
  fontSize: 14,
})

const $dismissButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minWidth: 120,
  paddingHorizontal: spacing.lg,
})

export { TimeElapsedProgress }
