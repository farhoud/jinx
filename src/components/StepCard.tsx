import React from "react"
import { View } from "react-native"

import { useRecipe } from "@/context/RecipeContext"
import { useAppTheme } from "@/theme/context"
import { Step } from "@/types/recipeTypes"

import { Card } from "./Card"
import { Icon } from "./Icon"
import { Text } from "./Text"

interface StepCardProps {
  step: Step
  stepIndex?: number
  totalSteps?: number
  isSelected?: boolean
  showEvents?: boolean
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  stepIndex,
  totalSteps,
  isSelected = false,
  showEvents = true,
}) => {
  const { activeEvents } = useRecipe()
  const { themed } = useAppTheme()

  const content =
    stepIndex !== undefined && totalSteps !== undefined
      ? `Step ${stepIndex + 1} of ${totalSteps}`
      : undefined

  console.log(showEvents)

  const eventsContent = showEvents ? (
    <View style={$eventsContainer}>
      {step.events.length === 0 ? (
        <Text text="No events for this step" />
      ) : (
        step.events.map((event) => {
          const isActive = activeEvents.has(event.eventId)
          return (
            <View key={event.eventId} style={$eventItem}>
              <Icon
                icon={isActive ? "check" : "x"}
                size={20}
                color={isActive ? "green" : "red"}
                containerStyle={$iconContainer}
              />
              <View style={$eventDetails}>
                <Text text={event.notification.message} style={$eventText} />
                <Text text={getTriggerDescription(event.trigger)} style={$eventText} />
              </View>
            </View>
          )
        })
      )}
    </View>
  ) : undefined

  return (
    <Card
      preset="default"
      style={[
        themed(({ spacing }) => ({ margin: spacing.md })),
        isSelected &&
        themed(({ colors }) => ({ borderColor: colors.palette.secondary500, borderWidth: 2 })),
      ]}
      heading={step.name}
      content={content}
      ContentComponent={eventsContent}
      LeftComponent={isSelected ? <Icon icon="check" size={20} color="green" /> : undefined}
    />
  )
}

const getTriggerDescription = (trigger: any) => {
  switch (trigger.type) {
    case "TEMPERATURE_TARGET":
      return trigger.condition === "REACHED_OR_EXCEEDED"
        ? `at ${trigger.valueC}°C or above`
        : `at ${trigger.valueC}°C or below`
    case "TIME_INTERVAL":
      return `every ${trigger.intervalMinutes} min${trigger.repeatTimes ? ` (${trigger.repeatTimes} times)` : ""}`
    case "BOUNDARY_VIOLATION":
      return trigger.condition === "ABOVE_HIGH"
        ? `above ${trigger.valueC}°C`
        : `below ${trigger.valueC}°C`
    case "TIME_ELAPSED":
      return `after ${trigger.valueMinutes} min`
    default:
      return ""
  }
}

const $cardStyle =
  (isSelected: boolean) =>
    ({ spacing, colors }: any) => ({
      margin: spacing.md,
      ...(isSelected && {
        borderColor: colors.palette.secondary500,
        borderWidth: 2,
      }),
    })

const $eventsContainer = {
  marginTop: 8,
}

const $eventItem = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginVertical: 4,
}

const $iconContainer = {
  marginRight: 8,
}

const $eventDetails = {
  flex: 1,
}

const $eventText = {
  fontSize: 14,
  fontWeight: 600 as const,
}

const $triggerText = {
  fontSize: 12,
  color: "#666",
}

export { StepCard }
