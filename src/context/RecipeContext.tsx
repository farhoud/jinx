import { createContext, useContext, useState, useEffect, useRef } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"

import { useTemperatureDevice } from "@/context/TemperatureDeviceContext"
import {
  Recipe,
  Step,
  Event as RecipeEvent,
  TemperatureTrigger,
  TimeIntervalTrigger,
  BoundaryTrigger,
} from "@/types/recipeTypes"
import { loadRecipes } from "@/utils/storage/recipeStorage"

type RecipeContextType = {
  recipes: Recipe[]
  currentRecipe: Recipe | null
  currentStepIndex: number
  isBrewing: boolean
  stepStartTime: number | null
  activeEvents: Map<string, RecipeEvent>
  editRecipe: (recipeId: string) => void
  deleteRecipe: (recipeId: string) => void
  newRecipe: () => void
  loadRecipe: (recipe: Recipe) => void
  startBrewing: () => void
  stopBrewing: () => void
  nextStep: () => void
  deactivateEvent: (eventId: string) => void
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
  const [activeEvents, setActiveEvents] = useState<Map<string, RecipeEvent>>(new Map())
  const { temperatureReading: currentTemp } = useTemperatureDevice()

  const timersRef = useRef<number[]>([])
  const intervalTimersRef = useRef<number[]>([])
  const lastEventFireRef = useRef<Map<string, number>>(new Map())

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
    setActiveEvents(new Map())
    lastEventFireRef.current.clear()
  }

  const startBrewing = () => {
    if (!currentRecipe) return
    setIsBrewing(true)
    setStepStartTime(Date.now())
    setActiveEvents(new Map())
    lastEventFireRef.current.clear()
    setupStepTriggers(currentRecipe.steps[0])
  }

  const stopBrewing = () => {
    setIsBrewing(false)
    setStepStartTime(null)
    setActiveEvents(new Map())
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
    setActiveEvents(new Map())
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
              activateEvent(event)
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
        activateEvent(event)
        count++
      }, interval)
      intervalTimersRef.current.push(intervalTimer)
    }, startOffset)

    timersRef.current.push(startTimer)
  }

  const activateEvent = (event: RecipeEvent) => {
    setActiveEvents((prev) => new Map(prev.set(event.eventId, event)))
  }

  const deactivateEvent = (eventId: string) => {
    setActiveEvents((prev) => {
      const newMap = new Map(prev)
      newMap.delete(eventId)
      return newMap
    })
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
      const isActive = activeEvents.has(event.eventId)

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
        activateEvent(event)
      }

      if (shouldDeactivate) {
        deactivateEvent(event.eventId)
      }
    })
  }, [currentTemp, currentStepIndex, isBrewing, currentRecipe, activeEvents])

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
        activeEvents,
        recipes,
        newRecipe,
        deleteRecipe,
        editRecipe,
        loadRecipe,
        startBrewing,
        stopBrewing,
        nextStep,
        deactivateEvent,
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
