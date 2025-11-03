import React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Recipe } from "@/types/recipeTypes"

const { width } = Dimensions.get("window")

interface RecipeStepsListProps {
  recipe: Recipe
  currentStepIndex: number
  isBrewing: boolean
}

const RecipeStepsList: React.FC<RecipeStepsListProps> = ({
  recipe,
  currentStepIndex,
  isBrewing,
}) => {
  const getStepTypeIcon = (step: any) => {
    // Determine icon based on events in the step
    const hasTempTarget = step.events.some((e: any) => e.trigger.type === "TEMPERATURE_TARGET")
    const hasBoundary = step.events.some((e: any) => e.trigger.type === "BOUNDARY_VIOLATION")
    const hasTimeInterval = step.events.some((e: any) => e.trigger.type === "TIME_INTERVAL")
    const hasTimeElapsed = step.events.some((e: any) => e.trigger.type === "TIME_ELAPSED")

    if (hasTempTarget) return "thermometer"
    if (hasBoundary) return "shield-checkmark"
    if (hasTimeInterval) return "repeat"
    if (hasTimeElapsed) return "timer"
    return "help-circle"
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "TEMPERATURE_TARGET":
        return "thermometer"
      case "TIME_INTERVAL":
        return "repeat"
      case "BOUNDARY_VIOLATION":
        return "warning"
      case "TIME_ELAPSED":
        return "timer"
      default:
        return "notifications"
    }
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

  return (
    <View style={styles.stepsList}>
      <Text style={styles.stepsTitle}>Recipe Steps</Text>
      {recipe.steps.map((step, index) => (
        <View
          key={step.stepId}
          style={[styles.stepItem, index === currentStepIndex && isBrewing && styles.activeStep]}
        >
          <View style={styles.stepHeader}>
            <Text style={styles.stepName}>{step.name}</Text>
            <Ionicons name={getStepTypeIcon(step)} size={20} color="#4caf50" />
          </View>
          {step.events.length > 0 && (
            <View style={styles.eventsList}>
              {step.events.map((event, eIndex) => (
                <View key={eIndex} style={styles.eventItem}>
                  <Ionicons name={getEventTypeIcon(event.trigger.type)} size={16} color="#ff9800" />
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventText}>{event.notification.message}</Text>
                    <Text style={styles.triggerText}>{getTriggerDescription(event.trigger)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  activeStep: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  eventDetails: { flex: 1 },
  eventItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    marginVertical: 4,
  },
  eventText: { color: "#fff", fontSize: 14, marginBottom: 2 },
  eventsList: { marginTop: 8 },
  stepHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepItem: {
    backgroundColor: "#2a2a2a",
    borderColor: "#555",
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 4,
    padding: 12,
  },
  stepName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  stepsList: { marginTop: 16, width: width * 0.9 },
  stepsTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  triggerText: { color: "#aaa", fontSize: 12 },
})

export default RecipeStepsList
