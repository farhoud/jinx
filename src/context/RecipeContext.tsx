import { createContext, useContext, useState, useEffect, useRef } from "react"
import { Alert, AppState } from "react-native"
import { Audio } from "expo-av"
import * as Notifications from "expo-notifications"

import {
  Recipe,
  Step,
  Event as RecipeEvent,
  TemperatureTrigger,
  TimeIntervalTrigger,
  BoundaryTrigger,
} from "@/types/recipeTypes"
import { useBLE } from "@/hooks/useBLE"


type RecipeContextType = {
  currentRecipe: Recipe | null
  currentStepIndex: number
  isBrewing: boolean
  stepStartTime: number | null
  alarmActive: boolean
  loadRecipe: (recipe: Recipe) => void
  startBrewing: () => void
  stopBrewing: () => void
  nextStep: () => void
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined)

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isBrewing, setIsBrewing] = useState(false)
  const [stepStartTime, setStepStartTime] = useState<number | null>(null)
  const [alarmActive, setAlarmActive] = useState(false)
  const { temperature: currentTemp } = useBLE()

  const timersRef = useRef<number[]>([])
  const intervalTimersRef = useRef<number[]>([])
  const lastEventFireRef = useRef<Map<string, number>>(new Map())

  const loadRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe)
    setCurrentStepIndex(0)
    setIsBrewing(false)
    setStepStartTime(null)
    lastEventFireRef.current.clear()
  }

  const startBrewing = () => {
    if (!currentRecipe) return
    setIsBrewing(true)
    setStepStartTime(Date.now())
    lastEventFireRef.current.clear()
    setupStepTriggers(currentRecipe.steps[0])
  }

  const stopBrewing = () => {
    setIsBrewing(false)
    setStepStartTime(null)
    clearAllTimers()
  }

  const nextStep = () => {
    if (!currentRecipe || currentStepIndex >= currentRecipe.steps.length - 1) {
      stopBrewing()
      return
    }
    clearAllTimers()
    setCurrentStepIndex((prev) => prev + 1)
    setStepStartTime(Date.now())
    setupStepTriggers(currentRecipe.steps[currentStepIndex + 1])
  }

  const setupStepTriggers = (step: Step) => {
    clearAllTimers()

    step.events.forEach((event) => {
      const { trigger } = event
      switch (trigger.type) {
        case "TEMPERATURE_TARGET":
          // Monitor temp continuously
          break
        case "TIME_INTERVAL":
          setupTimeIntervalTrigger(trigger, event)
          break
        case "BOUNDARY_VIOLATION":
          // Monitor temp continuously
          break
        case "TIME_ELAPSED":
          const elapsedTimer = setTimeout(
            () => {
              fireEvent(event)
            },
            trigger.valueMinutes * 60 * 1000,
          )
          timersRef.current.push(elapsedTimer)
          break
      }
    })
  }

  const setupTimeIntervalTrigger = (trigger: TimeIntervalTrigger, event: RecipeEvent) => {
    const startOffset = (trigger.startOffsetMinutes || 0) * 60 * 1000
    const interval = trigger.intervalMinutes * 60 * 1000
    const repeatTimes = trigger.repeatTimes || Infinity

    let count = 0

    const startTimer = setTimeout(() => {
      const intervalTimer = setInterval(() => {
        if (count >= repeatTimes) {
          clearInterval(intervalTimer)
          return
        }
        fireEvent(event)
        count++
      }, interval)
      intervalTimersRef.current.push(intervalTimer)
    }, startOffset)

    timersRef.current.push(startTimer)
  }

  const fireEvent = async (event: RecipeEvent) => {
    const { notification } = event
    const isForeground = AppState.currentState === "active"

    // Play sound
    let sound: Audio.Sound | null = null
    try {
      const soundSource =
        notification.type === "CRITICAL_DIALOG"
          ? require("assets/alarm.wav")
          : require("assets/reminder.wav")
      const { sound: createdSound } = await Audio.Sound.createAsync(soundSource, {
        isLooping: true,
      })
      sound = createdSound
      await sound.playAsync()
      setAlarmActive(true)
    } catch (err) {
      console.error("Sound play error", err)
    }

    const stopSound = async () => {
      if (sound) {
        try {
          await sound.unloadAsync()
          setAlarmActive(false)
        } catch (err) {
          console.error("Sound unload error", err)
        }
      }
    }

    if (notification.type === "CRITICAL_DIALOG") {
      if (isForeground) {
        Alert.alert("Brewing Alert", notification.message, [
          {
            text: notification.actionButtonText || "OK",
            onPress: stopSound,
          },
        ])
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Brewing Alert",
            body: notification.message,
            sound: "default",
          },
          trigger: null,
        })
        await stopSound()
      }
    } else {
      // Soft reminder
      if (isForeground) {
        Alert.alert("Brewing Reminder", notification.message, [
          {
            text: "OK",
            onPress: stopSound,
          },
        ])
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Brewing Reminder",
            body: notification.message,
            sound: "default",
          },
          trigger: null,
        })
        await stopSound()
      }
    }
  }

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    intervalTimersRef.current.forEach(clearInterval)
    intervalTimersRef.current = []
  }

  // Monitor temperature-based triggers
  useEffect(() => {
    if (!isBrewing || !currentRecipe || !currentTemp) return

    const currentStep = currentRecipe.steps[currentStepIndex]
    const now = Date.now()

    currentStep.events.forEach((event) => {
      const { trigger } = event
      const eventKey = `${currentStep.stepId}-${event.eventId}`
      const lastFire = lastEventFireRef.current.get(eventKey) || 0
      const timeSinceLastFire = now - lastFire

      // Prevent refiring within 1 minute (60000 ms)
      if (timeSinceLastFire < 60000) return

      let shouldFire = false

      switch (trigger.type) {
        case "TEMPERATURE_TARGET":
          const tempTrigger = trigger as TemperatureTrigger
          if (
            tempTrigger.condition === "REACHED_OR_EXCEEDED" &&
            currentTemp >= tempTrigger.valueC
          ) {
            shouldFire = true
          } else if (
            tempTrigger.condition === "REACHED_OR_BELOW" &&
            currentTemp <= tempTrigger.valueC
          ) {
            shouldFire = true
          }
          break
        case "BOUNDARY_VIOLATION":
          const boundaryTrigger = trigger as BoundaryTrigger
          if (boundaryTrigger.condition === "ABOVE_HIGH" && currentTemp > boundaryTrigger.valueC) {
            shouldFire = true
          } else if (
            boundaryTrigger.condition === "BELOW_LOW" &&
            currentTemp < boundaryTrigger.valueC
          ) {
            shouldFire = true
          }
          break
      }

      if (shouldFire) {
        lastEventFireRef.current.set(eventKey, now)
        fireEvent(event)
      }
    })
  }, [currentTemp, currentStepIndex, isBrewing, currentRecipe])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers()
  }, [])

  return (
    <RecipeContext.Provider
      value={{
        currentRecipe,
        currentStepIndex,
        isBrewing,
        stepStartTime,
        alarmActive,
        loadRecipe,
        startBrewing,
        stopBrewing,
        nextStep,
      }}
    >
      {children}
    </RecipeContext.Provider>
  )
}

export const useRecipe = () => {
  const ctx = useContext(RecipeContext)
  if (!ctx) throw new Error("useRecipe must be used within a RecipeProvider")
  return ctx
}
