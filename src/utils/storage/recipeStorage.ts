import { sampleRecipe } from "@/data/sampleRecipe"
import { Recipe } from "@/types/recipeTypes"

import { load, save } from "./index"

const RECIPES_KEY = "recipes"

/**
 * Load the list of recipes from storage.
 * If none exist, initialize with the sample recipe.
 */
export function loadRecipes(): Recipe[] {
  const recipes = load<Recipe[]>(RECIPES_KEY)
  if (!recipes || recipes.length === 0) {
    const initialRecipes = [sampleRecipe]
    saveRecipes(initialRecipes)
    return initialRecipes
  }
  return recipes
}

/**
 * Save the list of recipes to storage.
 */
export function saveRecipes(recipes: Recipe[]): void {
  save(RECIPES_KEY, recipes)
}

/**
 * Add a new recipe to the list and save.
 */
export function addRecipe(recipe: Recipe): void {
  const recipes = loadRecipes()
  recipes.push(recipe)
  saveRecipes(recipes)
}

/**
 * Update an existing recipe in the list and save.
 */
export function updateRecipe(recipeId: string, updatedRecipe: Recipe): void {
  const recipes = loadRecipes()
  const index = recipes.findIndex((r) => r.recipeId === recipeId)
  if (index !== -1) {
    recipes[index] = updatedRecipe
    saveRecipes(recipes)
  }
}

/**
 * Delete a recipe from the list and save.
 */
export function deleteRecipe(recipeId: string): void {
  const recipes = loadRecipes()
  const filtered = recipes.filter((r) => r.recipeId !== recipeId)
  saveRecipes(filtered)
}

/**
 * Get the sample recipe.
 */
export function getSampleRecipe(): Recipe {
  return sampleRecipe
}

/**
 * Create a new recipe based on the sample.
 * Generates a new recipeId and updates name/description.
 */
export function createNewRecipe(name?: string, description?: string): Recipe {
  const sample = getSampleRecipe()
  const newRecipe: Recipe = {
    ...sample,
    recipeId: `recipe-${Date.now()}`,
    name: name || "New Recipe",
    description: description || "A new brewing recipe",
    createdAt: new Date().toISOString(),
  }
  return newRecipe
}
