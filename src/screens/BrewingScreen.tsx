import { useState, useEffect } from "react"
import { View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"

import { Button } from "@/components/Button"
import { StepCard } from "@/components/StepCard"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { TemperatureChart } from "@/components/TemperatureChart"
import TemperatureStatusCard from "@/components/TemperatureStatusCard"
import { TemperatureGauge } from "@/components/TemperatureGauge"
import { TemperatureProgressBar } from "@/components/TemperatureProgressBar"
import { TimeElapsedProgress } from "@/components/TimeElapsedProgress"
import { TimeIntervalProgress } from "@/components/TimeIntervalProgress"
import { useRecipe } from "@/context/RecipeContext"
import { useTemperatureDevice } from "@/context/TemperatureDeviceContext"
import { DeviceConnectionStatus } from "@/components/DeviceConnectionStatus"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useBrewingEvents } from "@/hooks/useBrewingEvents"

export default function BrewingScreen() {
  const router = useRouter()
  const { themed } = useAppTheme()
  const {
    currentRecipe,
    currentStepIndex,
    isBrewing,
    startBrewing,
    stepStartTime,
    nextStep,
    deactivateEvent,
  } = useRecipe()
  const { temperatureReading } = useTemperatureDevice()
  const [viewingStepIndex, setViewingStepIndex] = useState(currentStepIndex)

  const {
    eventData,
    dismissEvent,
    dismissIntervalTrigger,
    dismissedIntervalTriggers,
    isEventDismissed,
  } = useBrewingEvents()

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
      {eventData.hasTempTarget && eventData.targetTemp && temperatureReading && (
        <TemperatureProgressBar
          currentTemperature={temperatureReading}
          targetTemperature={eventData.targetTemp}
          condition={eventData.targetCondition}
        />
      )}
      {eventData.hasBoundaryViolation && temperatureReading && (
        <TemperatureGauge
          currentTemperature={temperatureReading}
          highBoundary={eventData.highBoundary}
          lowBoundary={eventData.lowBoundary}
          condition={eventData.boundaryCondition}
        />
      )}
      {eventData.timeElapsedEvents.map((event) => (
        <TimeElapsedProgress
          key={event.eventId}
          totalMinutes={event.totalMinutes}
          currentElapsed={currentElapsedMinutes}
          eventName={event.name}
          eventMessage={event.message}
          onDismiss={() => dismissEvent(event.eventId)}
        />
      ))}
      {eventData.timeIntervalEvents.map((event) => (
        <TimeIntervalProgress
          key={event.eventId}
          event={event}
          currentElapsed={currentElapsedMinutes}
          dismissedTriggers={dismissedIntervalTriggers.get(event.eventId) || []}
          onDismissTrigger={(triggerIndex) => dismissIntervalTrigger(event.eventId, triggerIndex)}
        />
      ))}
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
  padding: spacing.sm,
  justifyContent: "space-between",
})

const $menuIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.sm,
})

const $connectionStatus: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "flex-end",
})

const $startButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})

const $nextButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})
