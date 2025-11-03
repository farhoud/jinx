import { useState, useEffect, useMemo } from "react"

import { useRecipe } from "@/context/RecipeContext"

interface TimeElapsedEvent {
  eventId: string
  name: string
  message: string
  totalMinutes: number
}

interface TimeIntervalEvent {
  eventId: string
  name: string
  message: string
  intervalMinutes: number
  repeatTimes: number
  startOffsetMinutes: number
}

interface EventData {
  hasTempTarget: boolean
  targetTemp: number
  targetCondition: "REACHED_OR_EXCEEDED" | "REACHED_OR_BELOW"
  hasBoundaryViolation: boolean
  highBoundary: number
  lowBoundary: number
  boundaryCondition: "ABOVE_HIGH" | "BELOW_LOW"
  timeElapsedEvents: TimeElapsedEvent[]
  timeIntervalEvents: TimeIntervalEvent[]
}

export const useBrewingEvents = () => {
  const { currentRecipe, currentStepIndex, deactivateEvent } = useRecipe()
  const [eventData, setEventData] = useState<EventData>({
    hasTempTarget: false,
    targetTemp: 0,
    targetCondition: "REACHED_OR_EXCEEDED",
    hasBoundaryViolation: false,
    highBoundary: 100,
    lowBoundary: 0,
    boundaryCondition: "ABOVE_HIGH",
    timeElapsedEvents: [],
    timeIntervalEvents: [],
  })

  const [dismissedEvents, setDismissedEvents] = useState<Set<string>>(new Set())
  const [dismissedIntervalTriggers, setDismissedIntervalTriggers] = useState<Map<string, number[]>>(
    new Map(),
  )

  // Update event data when currentStepIndex changes
  useEffect(() => {
    if (!currentRecipe) return

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
        : "ABOVE_HIGH"

    // Get time elapsed events
    const timeElapsedEvents = currentStep.events
      .filter((e) => e.trigger.type === "TIME_ELAPSED")
      .map((e: any) => ({
        eventId: e.eventId,
        name: e.notification?.message || "Time Elapsed Event",
        message: e.notification?.message || `After ${e.trigger.valueMinutes} minutes`,
        totalMinutes: e.trigger.valueMinutes || 0,
      }))
      .sort((a, b) => a.totalMinutes - b.totalMinutes)

    // Get time interval events
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

    console.log(
      "time elapsed events",
      timeElapsedEvents.length,
      "time interval events",
      timeIntervalEvents.length,
    )

    setEventData({
      hasTempTarget,
      targetTemp,
      targetCondition,
      hasBoundaryViolation,
      highBoundary,
      lowBoundary,
      boundaryCondition,
      timeElapsedEvents,
      timeIntervalEvents,
    })

    // Reset dismissed events when step changes
    // setDismissedEvents(new Set())
  }, [currentRecipe, currentStepIndex])

  const dismissEvent = (eventId: string) => {
    deactivateEvent(eventId)
    setDismissedEvents((prev) => new Set(prev).add(eventId))
  }

  const dismissIntervalTrigger = (eventId: string, triggerIndex: number) => {
    setDismissedIntervalTriggers((prev) => {
      const newMap = new Map(prev)
      const dismissed = newMap.get(eventId) || []
      if (!dismissed.includes(triggerIndex)) {
        dismissed.push(triggerIndex)
      }
      newMap.set(eventId, dismissed)
      return newMap
    })
  }

  const isEventDismissed = (eventId: string): boolean => {
    return dismissedEvents.has(eventId)
  }

  return {
    eventData,
    dismissEvent,
    dismissIntervalTrigger,
    dismissedIntervalTriggers,
    isEventDismissed,
  }
}
