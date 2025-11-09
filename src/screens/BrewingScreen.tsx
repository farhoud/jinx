import { useState, useEffect, useMemo } from "react"
import { View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"

import { Button } from "@/components/Button"
import { DeviceConnectionStatus } from "@/components/DeviceConnectionStatus"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { StepCard } from "@/components/StepCard"
import { TemperatureChart } from "@/components/TemperatureChart"
import { TemperatureGauge } from "@/components/TemperatureGauge"
import { TemperatureProgressBar } from "@/components/TemperatureProgressBar"
import { TimeElapsedProgress } from "@/components/TimeElapsedProgress"
import { TimeIntervalProgress } from "@/components/TimeIntervalProgress"
import { useRecipe } from "@/context/RecipeContext"
import { useTemperatureDevice } from "@/context/TemperatureDeviceContext"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"
import { CustomGauge } from "@/components/CustomGauge"

export default function BrewingScreen() {
  const router = useRouter()
  const { themed } = useAppTheme()
  const {
    currentRecipe,
    currentStepIndex,
    isBrewing,
    stepStartTime,
    nextStep,
    startBrewing,
    eventStates,
    dismissEvent,
    dismissTrigger,
  } = useRecipe()
  const { temperatureReading } = useTemperatureDevice()
  const [viewingStepIndex, setViewingStepIndex] = useState(currentStepIndex)

  const eventData = useMemo(() => {
    if (!currentRecipe)
      return {
        hasTempTarget: false,
        targetTemp: 0,
        targetCondition: "REACHED_OR_EXCEEDED" as const,
        hasBoundaryViolation: false,
        highBoundary: 100,
        lowBoundary: 0,
        boundaryCondition: "ABOVE_HIGH" as const,
        timeElapsedEvents: [],
        timeIntervalEvents: [],
      }

    const currentStep = currentRecipe.steps[currentStepIndex]

    const hasTempTarget = currentStep.events.some((e) => e.trigger.type === "TEMPERATURE_TARGET")
    const tempTargetEvent = currentStep.events.find(
      (e) => e.trigger.type === "TEMPERATURE_TARGET",
    ) as any
    const targetTemp = tempTargetEvent?.trigger.valueC || 0
    const targetCondition = tempTargetEvent?.trigger.condition || "REACHED_OR_EXCEEDED"

    const hasBoundaryViolation = currentStep.events.some(
      (e) => e.trigger.type === "BOUNDARY_VIOLATION",
    )
    const boundaryEvents = currentStep.events.filter(
      (e) => e.trigger.type === "BOUNDARY_VIOLATION",
    ) as any[]
    const highBoundaryEvent = boundaryEvents.find((e) => e.trigger.condition === "ABOVE_HIGH")
    const lowBoundaryEvent = boundaryEvents.find((e) => e.trigger.condition === "BELOW_LOW")
    const highBoundary = highBoundaryEvent?.trigger.valueC || 100
    const lowBoundary = lowBoundaryEvent?.trigger.valueC || 0
    const boundaryCondition = highBoundaryEvent
      ? "ABOVE_HIGH"
      : lowBoundaryEvent
        ? "BELOW_LOW"
        : ("ABOVE_HIGH" as "ABOVE_HIGH" | "BELOW_LOW")

    const timeElapsedEvents = currentStep.events
      .filter((e) => e.trigger.type === "TIME_ELAPSED")
      .map((e: any) => ({
        eventId: e.eventId,
        name: e.notification?.message || "Time Elapsed Event",
        message: e.notification?.message || `After ${e.trigger.valueMinutes} minutes`,
        totalMinutes: e.trigger.valueMinutes || 0,
      }))
      .sort((a, b) => a.totalMinutes - b.totalMinutes)

    const timeIntervalEvents = currentStep.events
      .filter((e) => e.trigger.type === "TIME_INTERVAL")
      .map((e: any) => ({
        eventId: e.eventId,
        name: e.notification?.message || "Time Interval Event",
        message: e.notification?.message || `Every ${e.trigger.intervalMinutes} minutes`,
        intervalMinutes: e.trigger.intervalMinutes || 0,
        repeatTimes: e.trigger.repeatTimes || 1,
        startOffsetMinutes: e.trigger.startOffsetMinutes || 0,
      }))

    return {
      hasTempTarget,
      targetTemp,
      targetCondition,
      hasBoundaryViolation,
      highBoundary,
      lowBoundary,
      boundaryCondition,
      timeElapsedEvents,
      timeIntervalEvents,
    }
  }, [currentRecipe, currentStepIndex])

  const isEventDismissed = (eventId: string) => eventStates.get(eventId)?.status === "dismissed"

  const dismissedIntervalTriggers = useMemo(
    () => (eventId: string) => Array.from(eventStates.get(eventId)?.dismissedTriggers || []),
    [eventStates],
  )

  const dismissIntervalTrigger = dismissTrigger

  useEffect(() => {
    setViewingStepIndex(currentStepIndex)
  }, [currentStepIndex])

  const handleStart = () => {
    startBrewing()
  }

  const handlePreviousStep = () => {
    setViewingStepIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextStep = () => {
    if (currentRecipe) {
      nextStep()
    }
  }

  if (!currentRecipe) return null

  const viewingStep = currentRecipe.steps[viewingStepIndex]
  const currentStep = currentRecipe.steps[currentStepIndex]

  const currentElapsedMinutes =
    isBrewing && stepStartTime ? (Date.now() - stepStartTime) / (1000 * 60) : 0

  return (
    <Screen
      style={themed($root)}
      safeAreaEdges={["top", "right", "left", "bottom"]}
      preset="scroll"
    >
      <View style={themed($header)}>
        <PressableIcon
          disabled={isBrewing}
          containerStyle={themed($menuIcon)}
          icon="menu"
          onPress={() => router.push("/")}
        />
        <DeviceConnectionStatus style={themed($connectionStatus)} showText={false} />
      </View>
      <TemperatureChart />
      <CustomGauge value={20} min={10} max={120} tickLabels={[10, 20, 45, 60]}>
      </CustomGauge>
      <TemperatureGauge
        temperature={50}
        minTemp={0}
        maxTemp={120}
      />
      {eventData.hasTempTarget && eventData.targetTemp && temperatureReading && (
        <TemperatureProgressBar
          currentTemperature={temperatureReading}
          targetTemperature={eventData.targetTemp}
          condition={eventData.targetCondition}
        />
      )}
      {eventData.hasBoundaryViolation && temperatureReading && (
        <TemperatureGauge
          temperature={temperatureReading}
          minTemp={eventData.lowBoundary}
          maxTemp={eventData.highBoundary}
        />
      )}
      {eventData.timeElapsedEvents.map((event) => {
        const status = eventStates.get(event.eventId)?.status
        if (status === "dismissed") return null
        return (
          <TimeElapsedProgress
            key={event.eventId}
            totalMinutes={event.totalMinutes}
            currentElapsed={currentElapsedMinutes}
            eventName={event.name}
            eventMessage={event.message}
            isPending={status === "pending"}
            onDismiss={status === "active" ? () => dismissEvent(event.eventId) : undefined}
          />
        )
      })}
      {eventData.timeIntervalEvents.map((event) => {
        const status = eventStates.get(event.eventId)?.status
        if (status === "dismissed") return null
        return (
          <TimeIntervalProgress
            key={event.eventId}
            event={event}
            currentElapsed={currentElapsedMinutes}
            isPending={status === "pending"}
            dismissedTriggers={dismissedIntervalTriggers(event.eventId)}
            onDismissTrigger={(triggerIndex) => dismissTrigger(event.eventId, triggerIndex)}
          />
        )
      })}
      <StepCard
        step={viewingStep}
        stepIndex={viewingStepIndex}
        totalSteps={currentRecipe.steps.length}
        isSelected={viewingStepIndex === currentStepIndex}
        showEvents
      />
      {!isBrewing ? (
        <Button text="Start" onPress={handleStart} style={themed($startButton)} />
      ) : (
        <Button
          text="Next"
          onPress={handleNextStep}
          disabled={viewingStepIndex === currentRecipe.steps.length - 1}
          style={themed($nextButton)}
        />
      )}
    </Screen>
  )
}

const $root: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
})

const $menuIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.sm,
})

const $connectionStatus: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "flex-end",
  padding: spacing.sm,
})

const $startButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})

const $nextButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})
