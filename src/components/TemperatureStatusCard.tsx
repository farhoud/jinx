import React, { useState, useEffect } from "react"
import { View, Animated } from "react-native"

import { useRecipe } from "@/context/RecipeContext"
import { useTemperatureDevice } from "@/context/TemperatureDeviceContext"
import { useAppTheme } from "@/theme/context"

import { Card } from "./Card"
import { Icon } from "./Icon"
import { Text } from "./Text"

const TemperatureStatusCard: React.FC = () => {
  const { status, temperatureReading } = useTemperatureDevice()
  const { currentRecipe, currentStepIndex, isBrewing, getActiveEvents, stepStartTime } = useRecipe()
  const { themed } = useAppTheme()
  const [elapsedTime, setElapsedTime] = useState("00:00")

  const activeEvents = getActiveEvents()

  useEffect(() => {
    if (!isBrewing || !stepStartTime) {
      setElapsedTime("00:00")
      return
    }

    const updateElapsed = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - stepStartTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      setElapsedTime(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [isBrewing, stepStartTime])

  const getStatusInfo = () => {
    switch (status) {
      case "connected":
        return { text: "Connected", icon: "check", color: "green" }
      case "connecting":
        return { text: "Connecting...", icon: "bell", color: "orange" }
      case "scanning":
        return { text: "Scanning...", icon: "settings", color: "blue" }
      case "disconnected":
        return { text: "Disconnected", icon: "x", color: "red" }
      case "reconnecting":
        return { text: "Reconnecting...", icon: "bell", color: "orange" }
      case "timeout":
        return { text: "Connection Timeout", icon: "x", color: "red" }
      case "error":
        return { text: "Connection Error", icon: "x", color: "red" }
      default:
        return { text: "Idle", icon: "bell", color: "gray" }
    }
  }

  const getTemperatureStyle = () => {
    if (!currentRecipe || !isBrewing || temperatureReading === null) return { color: "black" }

    const currentStep = currentRecipe.steps[currentStepIndex]
    const activeTempEvents = currentStep.events.filter(
      (event) =>
        (event.trigger.type === "TEMPERATURE_TARGET" ||
          event.trigger.type === "BOUNDARY_VIOLATION") &&
        activeEvents.some((e) => e.eventId === event.eventId),
    )

    if (activeTempEvents.length > 0) {
      const hasViolation = activeTempEvents.some((e) => e.trigger.type === "BOUNDARY_VIOLATION")
      return {
        color: hasViolation ? "red" : "green",
        fontWeight: 700 as const,
        textShadowColor: hasViolation ? "rgba(255,0,0,0.5)" : "rgba(0,255,0,0.5)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
      }
    }

    return { color: "black" }
  }

  const getTargetProgress = () => {
    if (!currentRecipe || !isBrewing || temperatureReading === null) return null

    const currentStep = currentRecipe.steps[currentStepIndex]
    const activeTarget = currentStep.events.find(
      (event) =>
        event.trigger.type === "TEMPERATURE_TARGET" &&
        activeEvents.some((e) => e.eventId === event.eventId),
    )

    if (activeTarget && activeTarget.trigger.type === "TEMPERATURE_TARGET") {
      const targetTemp = activeTarget.trigger.valueC
      const progress = Math.min(Math.max((temperatureReading / targetTemp) * 100, 0), 100)
      return { target: targetTemp, progress }
    }

    return null
  }

  const statusInfo = getStatusInfo()
  const targetProgress = getTargetProgress()

  const tempContent = (
    <View style={$tempContainer}>
      <Text text="Current Temperature:" style={$tempLabel} />
      <Text
        text={temperatureReading !== null ? `${temperatureReading.toFixed(1)}°C` : "--"}
        style={[getTemperatureStyle(), $tempValue]}
      />
      {isBrewing && <Text text={`Step Time: ${elapsedTime}`} style={$timeText} />}
      {targetProgress && (
        <View style={$progressContainer}>
          <Text text={`Target: ${targetProgress.target}°C`} style={$progressText} />
          <View style={$progressBar}>
            <Animated.View
              style={[
                $progressFill,
                {
                  width: `${targetProgress.progress}%`,
                  backgroundColor: targetProgress.progress >= 100 ? "green" : "blue",
                },
              ]}
            />
          </View>
          <Text text={`${targetProgress.progress.toFixed(0)}%`} style={$progressPercent} />
        </View>
      )}
    </View>
  )

  return (
    <Card
      preset="default"
      style={themed($cardStyle)}
      heading="Device Status"
      content={statusInfo.text}
      ContentComponent={tempContent}
      LeftComponent={<Icon icon={statusInfo.icon as any} size={20} color={statusInfo.color} />}
    />
  )
}

const $cardStyle = ({ spacing }: any) => ({
  margin: spacing.md,
})

const $tempContainer = {
  marginTop: 8,
  alignItems: "center" as const,
}

const $tempLabel = {
  fontSize: 14,
  marginBottom: 4,
}

const $tempValue = {
  fontSize: 28,
  fontWeight: 600 as const,
}

const $timeText = {
  fontSize: 16,
  marginTop: 4,
  color: "#666",
}

const $progressContainer = {
  marginTop: 12,
  alignItems: "center" as const,
  width: 250,
}

const $progressText = {
  fontSize: 12,
  marginBottom: 4,
}

const $progressBar = {
  height: 8,
  width: 200,
  backgroundColor: "#e0e0e0",
  borderRadius: 4,
  overflow: "hidden" as const,
}

const $progressFill = {
  height: 8,
  borderRadius: 4,
}

const $progressPercent = {
  fontSize: 12,
  marginTop: 4,
  fontWeight: 500 as const,
}

export default TemperatureStatusCard
