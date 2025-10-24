import React, { useState, useEffect } from "react"
import { View, TouchableOpacity, Alert, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { Header } from "@/components/Header"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { useRecipe } from "@/context/RecipeContext"
import { loadRecipes, deleteRecipe } from "@/utils/storage/recipeStorage"

const { width } = Dimensions.get("window")

export default function RecipesScreen() {
  const { theme } = useAppTheme()
  const router = useRouter()
  const { loadRecipe } = useRecipe()

  const [recipes, setRecipes] = useState(loadRecipes())

  useEffect(() => {
    setRecipes(loadRecipes())
  }, [])

  const handleEditRecipe = (recipeId: string) => {
    router.push({ pathname: "/recipe-editor", params: { recipeId } })
  }

  const handleDeleteRecipe = (recipeId: string) => {
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

  const handleNewRecipe = () => {
    router.push("/recipe-editor")
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      backgroundColor={theme.colors.background}
    >
      <Header title="Recipes" />

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
        <TouchableOpacity
          onPress={handleNewRecipe}
          style={{
            alignItems: "center",
            backgroundColor: theme.colors.palette.primary500,
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 20,
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
            New Recipe
          </Text>
        </TouchableOpacity>

        {recipes.length === 0 ? (
          <Text style={{ color: theme.colors.text, textAlign: "center", fontSize: 16 }}>
            No recipes yet. Create your first recipe!
          </Text>
        ) : (
          recipes.map((recipe) => (
            <View
              key={recipe.recipeId}
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
                  {recipe.name}
                </Text>
                <Text style={{ color: theme.colors.textDim, fontSize: 14 }}>
                  {recipe.description}
                </Text>
                <Text style={{ color: theme.colors.textDim, fontSize: 12 }}>
                  {recipe.steps.length} steps
                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => {
                    loadRecipe(recipe)
                    router.back()
                  }}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="checkmark" size={20} color={theme.colors.palette.primary500} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleEditRecipe(recipe.recipeId)}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="pencil" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteRecipe(recipe.recipeId)}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="trash" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </Screen>
  )
}
