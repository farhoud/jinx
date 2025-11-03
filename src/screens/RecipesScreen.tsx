import { useState } from "react"
import { ViewStyle, TextStyle, Alert } from "react-native"
import { useRouter } from "expo-router"

import { Button } from "@/components/Button"
import { ListItem } from "@/components/ListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useRecipe } from "@/context/RecipeContext"
import { sampleRecipe } from "@/data/sampleRecipe"
import { Recipe } from "@/types/recipeTypes"

export default function RecipesScreen() {
  const { currentRecipe, loadRecipe, startBrewing, isBrewing, recipes, newRecipe } = useRecipe()
  const router = useRouter()

  const handleSelectRecipe = (recipe: Recipe) => {
    loadRecipe(recipe)
    router.push("/brewing")
  }

  const handleStartBrewing = () => {
    if (currentRecipe) {
      startBrewing()
      Alert.alert("Brewing Started", `Started: ${currentRecipe.name}`)
    }
  }

  const handleAddRecipe = () => {
    newRecipe()
  }

  return (
    <Screen style={$root} safeAreaEdges={["right", "top", "left", "bottom"]} preset="scroll">
      <Text preset="heading" text="Recipes" style={$title} />
      {recipes.map((recipe) => (
        <ListItem
          key={recipe.recipeId}
          text={recipe.name}
          bottomSeparator
          onPress={() => handleSelectRecipe(recipe)}
        />
      ))}
      <Button text="Add New Recipe" onPress={handleAddRecipe} style={$button} />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
  padding: 5,
}

const $title: TextStyle = {
  marginBottom: 16,
}

const $selectedText: TextStyle = {
  color: "green",
  fontWeight: "bold",
}

const $button: ViewStyle = {
  marginTop: 16,
}
