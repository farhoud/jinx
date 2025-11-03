import { createContext, useContext, useState, useEffect, useRef, useReducer } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"
import { Audio } from "expo-av"

import { useTemperatureDevice } from "@/context/TemperatureDeviceContext"
import {
  Recipe,
  Step,
  Event as RecipeEvent,
  TemperatureTrigger,
  TimeIntervalTrigger,
  BoundaryTrigger,
  EventState,
  EventStates,
  EventStatus,
} from "@/types/recipeTypes"
import { loadRecipes } from "@/utils/storage/recipeStorage"

type EventAction =
  | { type: "ACTIVATE_EVENT"; eventId: string }
  | { type: "DEACTIVATE_EVENT"; eventId: string }
  | { type: "DISMISS_EVENT"; eventId: string }
  | { type: "DISMISS_TRIGGER"; eventId: string; triggerIndex: number }
  | { type: "RESET_EVENTS"; events: RecipeEvent[] }
  | { type: "UPDATE_ELAPSED_TIME"; eventId: string; elapsedTime: number }

const eventReducer = (state: EventStates, action: EventAction): EventStates => {
  const newState = new Map(state)
  switch (action.type) {
    case "ACTIVATE_EVENT":
      if (newState.has(action.eventId)) {
        const eventState = newState.get(action.eventId)!
        newState.set(action.eventId, { ...eventState, status: "active", activatedAt: Date.now() })
      }
      break
    case "DEACTIVATE_EVENT":
      if (newState.has(action.eventId)) {
        const eventState = newState.get(action.eventId)!
        newState.set(action.eventId, { ...eventState, status: "pending" })
      }
      break
    case "DISMISS_EVENT":
      if (newState.has(action.eventId)) {
        const eventState = newState.get(action.eventId)!
        newState.set(action.eventId, { ...eventState, status: "dismissed" })
      }
      break
    case "DISMISS_TRIGGER":
      if (newState.has(action.eventId)) {
        const eventState = newState.get(action.eventId)!
        if (eventState.dismissedTriggers && eventState.event.trigger.type === "TIME_INTERVAL") {
          const newDismissed = new Set(eventState.dismissedTriggers)
          newDismissed.add(action.triggerIndex)
          const trigger = eventState.event.trigger as TimeIntervalTrigger
          const repeatTimes = trigger.repeatTimes || 1
          newState.set(action.eventId, { ...eventState, dismissedTriggers: newDismissed })
          if (newDismissed.size >= repeatTimes) {
            newState.set(action.eventId, {
              ...eventState,
              status: "dismissed",
              dismissedTriggers: newDismissed,
            })
          }
        }
      }
      break
    case "RESET_EVENTS":
      const resetMap = new Map<string, EventState>()
      action.events.forEach((event) => {
        resetMap.set(event.eventId, {
          event,
          status: "pending",
          elapsedTime: 0,
          dismissedTriggers: event.trigger.type === "TIME_INTERVAL" ? new Set() : undefined,
        })
      })
      return resetMap
    case "UPDATE_ELAPSED_TIME":
      if (newState.has(action.eventId)) {
        const eventState = newState.get(action.eventId)!
        newState.set(action.eventId, { ...eventState, elapsedTime: action.elapsedTime })
      }
      break
  }
  return newState
}
type RecipeContextType = {
  recipes: Recipe[]
  currentRecipe: Recipe | null
  currentStepIndex: number
  isBrewing: boolean
  stepStartTime: number | null
  eventStates: EventStates
  getActiveEvents: () => RecipeEvent[]
  getPendingEvents: () => RecipeEvent[]
  getElapsedTime: (eventId: string) => number
  dismissEvent: (eventId: string) => void
  dismissTrigger: (eventId: string, triggerIndex: number) => void
  editRecipe: (recipeId: string) => void
  deleteRecipe: (recipeId: string) => void
  newRecipe: () => void
  loadRecipe: (recipe: Recipe) => void
  startBrewing: () => void
  stopBrewing: () => void
  nextStep: () => void
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined)

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()

  const [recipes, setRecipes] = useState(loadRecipes())
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(() => {
    if (recipes.length < 1) {
      return null
    }
    return recipes[0]
  })
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isBrewing, setIsBrewing] = useState(false)
  const [stepStartTime, setStepStartTime] = useState<number | null>(null)
  const [eventStates, dispatch] = useReducer(eventReducer, new Map())
  const { temperatureReading: currentTemp } = useTemperatureDevice()

  const [alarmSound, setAlarmSound] = useState<Audio.Sound | null>(null)
  const [reminderSound, setReminderSound] = useState<Audio.Sound | null>(null)

  const timersRef = useRef<number[]>([])
  const intervalTimersRef = useRef<number[]>([])
  const lastEventFireRef = useRef<Map<string, number>>(new Map())

  // Load sound files
  useEffect(() => {
    const loadSounds = async () => {
      try {
        const { sound: alarm } = await Audio.Sound.createAsync(require("assets/alarm.wav"))
        setAlarmSound(alarm)
        const { sound: reminder } = await Audio.Sound.createAsync(require("assets/reminder.wav"))
        setReminderSound(reminder)
      } catch (error) {
        console.error("Failed to load sounds:", error)
      }
    }
    loadSounds()
    return () => {
      alarmSound?.unloadAsync()
      reminderSound?.unloadAsync()
    }
  }, [])

  const playEventSound = (event: RecipeEvent) => {
    if (event.notification.type === "CRITICAL_DIALOG") {
      alarmSound?.replayAsync()
    } else if (event.notification.type === "SOFT_REMINDER") {
      reminderSound?.replayAsync()
    }
  }

  const editRecipe = (recipeId: string) => {
    router.push({ pathname: "/recipe-editor", params: { recipeId } })
  }

  const deleteRecipe = (recipeId: string) => {
    Alert.alert("Delete Recipe", "Are you sure you want to delete this recipe?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteRecipe(recipeId)
          setRecipes(loadRecipes()) // Refresh the list
        },
      },
    ])
  }

  const newRecipe = () => {
    router.push("/recipe-editor")
  }

  const loadRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe)
    setCurrentStepIndex(0)
    setIsBrewing(false)
    setStepStartTime(null)
    dispatch({ type: "RESET_EVENTS", events: recipe.steps[0]?.events || [] })
    lastEventFireRef.current.clear()
  }

  const startBrewing = () => {
    if (!currentRecipe) return
    setIsBrewing(true)
    setStepStartTime(Date.now())
    dispatch({ type: "RESET_EVENTS", events: currentRecipe.steps[0].events })
    lastEventFireRef.current.clear()
    setupStepTriggers(currentRecipe.steps[0])
  }

  const stopBrewing = () => {
    setIsBrewing(false)
    setStepStartTime(null)
    dispatch({ type: "RESET_EVENTS", events: [] })
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
    dispatch({ type: "RESET_EVENTS", events: currentRecipe.steps[currentStepIndex + 1].events })
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
              dispatch({ type: "ACTIVATE_EVENT", eventId: event.eventId })
              playEventSound(event)
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
        dispatch({ type: "ACTIVATE_EVENT", eventId: event.eventId })
        playEventSound(event)
        count++
      }, interval)
      intervalTimersRef.current.push(intervalTimer)
    }, startOffset)

    timersRef.current.push(startTimer)
  }

  const dismissEvent = (eventId: string) => {
    dispatch({ type: "DISMISS_EVENT", eventId })
  }

  const dismissTrigger = (eventId: string, triggerIndex: number) => {
    dispatch({ type: "DISMISS_TRIGGER", eventId, triggerIndex })
  }

  const getActiveEvents = (): RecipeEvent[] => {
    return Array.from(eventStates.values())
      .filter((state) => state.status === "active")
      .map((state) => state.event)
  }

  const getPendingEvents = (): RecipeEvent[] => {
    return Array.from(eventStates.values())
      .filter((state) => state.status === "pending")
      .map((state) => state.event)
  }

  const getElapsedTime = (eventId: string): number => {
    return eventStates.get(eventId)?.elapsedTime || 0
  }

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    intervalTimersRef.current.forEach(clearInterval)
    intervalTimersRef.current = []
  }

  // Monitor temperature-based triggers
  useEffect(() => {
    console.log("calling too many times")
    if (!isBrewing || !currentRecipe || !currentTemp) return

    const currentStep = currentRecipe.steps[currentStepIndex]
    const now = Date.now()

    currentStep.events.forEach((event) => {
      const { trigger } = event
      const eventKey = `${currentStep.stepId}-${event.eventId}`
      const lastFire = lastEventFireRef.current.get(eventKey) || 0
      const timeSinceLastFire = now - lastFire
      const eventState = eventStates.get(event.eventId)
      const isActive = eventState?.status === "active"

      let shouldFire = false
      let shouldDeactivate = false

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
          // Deactivate if condition no longer met
          if (isActive && !shouldFire) {
            shouldDeactivate = true
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
          // Deactivate if condition no longer met
          if (isActive && !shouldFire) {
            shouldDeactivate = true
          }
          break
        // Time-based events (TIME_INTERVAL, TIME_ELAPSED) are handled separately and stay active once triggered
      }

      if (shouldFire && timeSinceLastFire >= 60000) {
        // Prevent refiring within 1 minute
        lastEventFireRef.current.set(eventKey, now)
        dispatch({ type: "ACTIVATE_EVENT", eventId: event.eventId })
        playEventSound(event)
      }

      if (shouldDeactivate) {
        dispatch({ type: "DEACTIVATE_EVENT", eventId: event.eventId })
      }
    })
  }, [currentTemp, currentStepIndex, isBrewing, currentRecipe, eventStates])

  useEffect(() => { })

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
        eventStates,
        getActiveEvents,
        getPendingEvents,
        getElapsedTime,
        dismissEvent,
        dismissTrigger,
        recipes,
        newRecipe,
        deleteRecipe,
        editRecipe,
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
