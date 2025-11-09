import React from "react"
import { View, StyleProp, ViewStyle, TextStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Button } from "./Button"
import { Card } from "./Card"
import { Text } from "./Text"

interface TimeIntervalEvent {
  eventId: string
  name: string
  message: string
  intervalMinutes: number
  repeatTimes: number
  startOffsetMinutes: number
}

interface TimeIntervalProgressProps {
  /**
   * The time interval event data.
   */
  event: TimeIntervalEvent
  /**
   * Current elapsed minutes in the step.
   */
  currentElapsed: number
  /**
   * Whether the event is pending.
   */
  isPending?: boolean
  /**
   * Array of dismissed trigger indices.
   */
  dismissedTriggers: number[]
  /**
   * Callback when user dismisses a trigger.
   */
  onDismissTrigger: (triggerIndex: number) => void
  /**
   * Optional style override for the container.
   */
  style?: StyleProp<ViewStyle>
}

const TimeIntervalProgress: React.FC<TimeIntervalProgressProps> = ({
  event,
  currentElapsed,
  isPending = false,
  dismissedTriggers,
  onDismissTrigger,
  style,
}) => {
  const { themed, theme } = useAppTheme()

  const { intervalMinutes, repeatTimes, startOffsetMinutes } = event

  // Calculate all trigger times
  const triggerTimes = []
  for (let n = 0; n < repeatTimes; n++) {
    triggerTimes.push(startOffsetMinutes + n * intervalMinutes)
  }

  // Find the next trigger index that is not dismissed and time >= currentElapsed
  let nextTriggerIndex = -1
  let nextTrigger: number | null = null
  for (let i = 0; i < triggerTimes.length; i++) {
    if (!dismissedTriggers.includes(i) && triggerTimes[i] >= currentElapsed) {
      nextTriggerIndex = i
      nextTrigger = triggerTimes[i]
      break
    }
  }

  const isTriggered = nextTrigger !== null && Math.abs(nextTrigger - currentElapsed) < 0.1 // small epsilon

  if (isPending) {
    const timeToStart = startOffsetMinutes - currentElapsed
    if (timeToStart > 0) {
      return (
        <Card
          style={themed([$container, style])}
          heading={event.name}
          content={`Starts in ${Math.round(timeToStart)} min`}
        />
      )
    }
  }

  const remaining = nextTrigger ? nextTrigger - currentElapsed : 0
  const progress = nextTrigger ? (currentElapsed / nextTrigger) * 100 : 100

  // Format time as MM:SS
  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes)
    const secs = Math.floor((minutes - mins) * 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!nextTrigger && !isTriggered) {
    // All intervals completed
    return null
  }

  return (
    <Card
      style={themed([$container, style])}
      heading={event.name}
      content={event.message}
      ContentComponent={
        <View style={themed($timerContainer)}>
          {!isTriggered ? (
            <>
              <Text
                text={formatTime(remaining)}
                preset="heading"
                size="xxl"
                style={themed($timerText)}
              />
              <Text text="Until Next Trigger" style={themed($labelText)} />
              <View style={themed($progressContainer)}>
                <View style={themed($progressBar)}>
                  <View
                    style={[
                      themed($progressFill),
                      {
                        width: `${Math.min(100, progress)}%`,
                        backgroundColor: theme.colors.palette.primary500,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text text={`${Math.round(progress)}% to Next`} style={themed($progressText)} />
            </>
          ) : (
            <View style={themed($completedContainer)}>
              <Text text="⏰ Interval Triggered!" preset="heading" style={themed($completedText)} />
              <Text text="Tap to dismiss and continue brewing." style={themed($dismissHint)} />
              <Button
                text="Dismiss Trigger"
                onPress={() => onDismissTrigger(nextTriggerIndex)}
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

export { TimeIntervalProgress }
