import React, { useEffect, useState } from "react"
import { View, ScrollView, Dimensions, TouchableOpacity } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/Button"
import { Header } from "@/components/Header"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useRecipeEditor } from "@/context/RecipeEditorContext"
import { useAppTheme } from "@/theme/context"
import {
  createNewRecipe,
  addRecipe,
  updateRecipe as updateRecipeInStorage,
  loadRecipes,
} from "@/utils/storage/recipeStorage"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
})

type FormData = z.infer<typeof formSchema>

const { width } = Dimensions.get("window")

const colors = {
  background: "#121212",
  surface: "#1e1e1e",
  primary: "#6200ea",
  secondary: "#03dac6",
  onSurface: "#ffffff",
  onPrimary: "#ffffff",
  separator: "#3C3836",
  text: "#ffffff",
  textDim: "#B6ACA6",
  error: "#C03403",
  tint: "#E8C1B4",
}

export default function RecipeEditorScreen() {
  const { theme } = useAppTheme()
  const router = useRouter()
  const params = useLocalSearchParams()

  const {
    editingRecipe,
    loadRecipeForEditing,
    updateRecipe,
    saveRecipe,
    removeStep,
    isNew,
    validationErrors,
  } = useRecipeEditor()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  })

  useEffect(() => {
    const recipeId = params.recipeId as string | undefined
    if (recipeId) {
      // Load existing recipe for editing
      const recipes = loadRecipes()
      const recipe = recipes.find((r) => r.recipeId === recipeId)
      if (recipe) {
        loadRecipeForEditing(recipe)
        reset({ name: recipe.name, description: recipe.description })
      }
    } else {
      // For new recipe, create based on sample
      const newRecipe = createNewRecipe()
      loadRecipeForEditing(newRecipe, true)
      reset({ name: newRecipe.name, description: newRecipe.description })
    }
  }, [params.recipeId, loadRecipeForEditing, reset])

  const onSubmit = handleSubmit((data) => {
    updateRecipe(data)
    const saved = saveRecipe()
    if (saved) {
      if (isNew) {
        addRecipe(saved)
      } else {
        updateRecipeInStorage(saved.recipeId, saved)
      }
      router.back()
    } else {
      console.log("Recipe not saved due to validation errors")
    }
  })

  const handleCancel = () => {
    router.back()
  }

  const handleDeleteStep = (stepId: string) => {
    removeStep(stepId)
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      backgroundColor={theme.colors.background}
    >
      <Header
        title={isNew ? "Create Recipe" : "Edit Recipe"}
        leftIcon="caretLeft"
        onLeftPress={handleCancel}
      />

      {validationErrors.length > 0 && (
        <View
          style={{
            backgroundColor: theme.colors.error,
            padding: 10,
            marginHorizontal: 20,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: theme.colors.palette.neutral100, fontWeight: "600" }}>
            Validation Errors:
          </Text>
          {validationErrors.map((error, index) => (
            <Text key={index} style={{ color: theme.colors.palette.neutral100, fontSize: 14 }}>
              • {error.field}: {error.message}
            </Text>
          ))}
        </View>
      )}

      <View
        style={{
          backgroundColor: theme.colors.palette.neutral300,
          borderRadius: 24,
          elevation: 8,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          width: width * 0.9,
          alignSelf: "center",
        }}
      >
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Name"
              value={value}
              onChangeText={onChange}
              placeholder="Recipe name"
              status={errors.name ? "error" : undefined}
              helper={errors.name?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Description"
              value={value}
              onChangeText={onChange}
              placeholder="Recipe description"
              multiline
              status={errors.description ? "error" : undefined}
              helper={errors.description?.message}
            />
          )}
        />

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: "600",
            marginTop: 24,
            marginBottom: 16,
          }}
        >
          Steps
        </Text>

        {editingRecipe?.steps.map((step, index) => (
          <View
            key={step.stepId}
            style={{
              backgroundColor: theme.colors.palette.neutral100,
              borderRadius: 12,
              padding: 12,
              marginBottom: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "500" }}>
                {index + 1}. {step.name}
              </Text>
              <Text style={{ color: theme.colors.textDim, fontSize: 14 }}>
                {step.type === "TARGET_TEMPERATURE"
                  ? `Target: ${step.targetTemperatureC}°C`
                  : `Maintain: ${step.tempBoundaryLowC}°C - ${step.tempBoundaryHighC}°C`}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() =>
                  router.push({ pathname: "/step-editor", params: { stepId: step.stepId } })
                }
                style={{ padding: 8 }}
              >
                <Ionicons name="pencil" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteStep(step.stepId)}
                style={{ padding: 8 }}
              >
                <Ionicons name="trash" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => router.push("/step-editor")}
          style={{
            alignItems: "center",
            backgroundColor: theme.colors.palette.primary500,
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
            padding: 12,
          }}
        >
          <Ionicons name="add" size={20} color={theme.colors.palette.neutral900} />
          <Text
            style={{
              color: theme.colors.palette.neutral900,
              fontSize: 16,
              fontWeight: "600",
              marginLeft: 8,
            }}
          >
            Add Step
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 24 }}>
          <Button text="Cancel" onPress={handleCancel} />
          <Button text="Save" onPress={onSubmit} disabled={!isValid} />
        </View>
      </View>
    </Screen>
  )
}
