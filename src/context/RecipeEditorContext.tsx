import React, { createContext, useContext, useState, useCallback } from "react"
import { z } from "zod"

import { recipeSchema } from "@/schemas/recipeSchemas"
import { Recipe, Step, Event as RecipeEvent } from "@/types/recipeTypes"

type ValidationError = {
  field: string
  message: string
}

type RecipeEditorContextType = {
  editingRecipe: Recipe | null
  validationErrors: ValidationError[]
  isValid: boolean
  isNew: boolean
  loadRecipeForEditing: (recipe?: Recipe, isNew?: boolean) => void
  updateRecipe: (updates: Partial<Recipe>) => void
  addStep: (step: Step) => void
  updateStep: (stepId: string, step: Step) => void
  removeStep: (stepId: string) => void
  addEvent: (stepId: string, event: RecipeEvent) => void
  updateEvent: (stepId: string, eventId: string, event: RecipeEvent) => void
  removeEvent: (stepId: string, eventId: string) => void
  validateRecipe: () => boolean
  saveRecipe: () => Recipe | null
}

const RecipeEditorContext = createContext<RecipeEditorContextType | undefined>(undefined)

export const RecipeEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isNew, setIsNew] = useState(false)

  const loadRecipeForEditing = useCallback((recipe?: Recipe, isNew?: boolean) => {
    if (recipe) {
      setEditingRecipe(recipe)
      setIsNew(isNew ?? false)
    } else {
      // For new recipe, we'll set it later when creating
      setEditingRecipe(null)
      setIsNew(true)
    }
    setValidationErrors([])
  }, [])

  const updateRecipe = useCallback(
    (updates: Partial<Recipe>) => {
      if (!editingRecipe) return
      const updated = { ...editingRecipe, ...updates }
      setEditingRecipe(updated)
    },
    [editingRecipe],
  )

  const addStep = useCallback(
    (step: Step) => {
      if (!editingRecipe) return
      const updated = {
        ...editingRecipe,
        steps: [...editingRecipe.steps, step],
      }
      setEditingRecipe(updated)
    },
    [editingRecipe],
  )

  const updateStep = useCallback(
    (stepId: string, step: Step) => {
      if (!editingRecipe) return
      const updated = {
        ...editingRecipe,
        steps: editingRecipe.steps.map((s) => (s.stepId === stepId ? step : s)),
      }
      setEditingRecipe(updated)
    },
    [editingRecipe],
  )

  const removeStep = useCallback(
    (stepId: string) => {
      if (!editingRecipe) return
      const updated = {
        ...editingRecipe,
        steps: editingRecipe.steps.filter((step) => step.stepId !== stepId),
      }
      setEditingRecipe(updated)
    },
    [editingRecipe],
  )

  const addEvent = useCallback(
    (stepId: string, event: RecipeEvent) => {
      if (!editingRecipe) return
      const updated = {
        ...editingRecipe,
        steps: editingRecipe.steps.map((step) =>
          step.stepId === stepId ? { ...step, events: [...step.events, event] } : step,
        ),
      }
      setEditingRecipe(updated)
    },
    [editingRecipe],
  )

  const updateEvent = useCallback(
    (stepId: string, eventId: string, event: RecipeEvent) => {
      if (!editingRecipe) return
      const updated = {
        ...editingRecipe,
        steps: editingRecipe.steps.map((step) =>
          step.stepId === stepId
            ? {
              ...step,
              events: step.events.map((e) => (e.eventId === eventId ? event : e)),
            }
            : step,
        ),
      }
      setEditingRecipe(updated)
    },
    [editingRecipe],
  )

  const removeEvent = useCallback(
    (stepId: string, eventId: string) => {
      if (!editingRecipe) return
      const updated = {
        ...editingRecipe,
        steps: editingRecipe.steps.map((step) =>
          step.stepId === stepId
            ? { ...step, events: step.events.filter((event) => event.eventId !== eventId) }
            : step,
        ),
      }
      setEditingRecipe(updated)
    },
    [editingRecipe],
  )

  const validateRecipe = useCallback(() => {
    if (!editingRecipe) {
      setValidationErrors([{ field: "recipe", message: "No recipe loaded" }])
      return false
    }

    try {
      recipeSchema.parse(editingRecipe)
      setValidationErrors([])
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
        setValidationErrors(errors)
      }
      return false
    }
  }, [editingRecipe])

  const saveRecipe = useCallback(() => {
    if (validateRecipe()) {
      return editingRecipe
    }
    return null
  }, [editingRecipe, validateRecipe])

  const isValid = validationErrors.length === 0 && editingRecipe !== null

  return (
    <RecipeEditorContext.Provider
      value={{
        editingRecipe,
        validationErrors,
        isValid,
        isNew,
        loadRecipeForEditing,
        updateRecipe,
        addStep,
        updateStep,
        removeStep,
        addEvent,
        updateEvent,
        removeEvent,
        validateRecipe,
        saveRecipe,
      }}
    >
      {children}
    </RecipeEditorContext.Provider>
  )
}

export const useRecipeEditor = () => {
  const ctx = useContext(RecipeEditorContext)
  if (!ctx) throw new Error("useRecipeEditor must be used within a RecipeEditorProvider")
  return ctx
}
