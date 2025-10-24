import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native"
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake"
import { useRouter, useFocusEffect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import RecipeStepsList from "@/components/RecipeStepsList"
import { Screen } from "@/components/Screen"
import TemperatureDisplayWidget from "@/components/TemperatureDisplayWidget"
import { useRecipe } from "@/context/RecipeContext"
import { useBLE } from "@/hooks/useBLE"
import { loadRecipes } from "@/utils/storage/recipeStorage"

const { width } = Dimensions.get("window")

const colors = {
  connected: "#4caf50",
  disconnected: "#f44336",
  primary: "#6200ea",
  secondary: "#03dac6",
  background: "#121212",
  surface: "#1e1e1e",
  error: "#cf6679",
  onPrimary: "#ffffff",
  onSecondary: "#000000",
  onBackground: "#ffffff",
  onSurface: "#ffffff",
  onError: "#000000",
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    elevation: 8,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: width * 0.9,
  },
  addButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  alarmBox: {
    alignItems: "center",
    backgroundColor: colors.error,
    borderRadius: 24,
    elevation: 8,
    marginTop: 32,
    padding: 20,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: width * 0.85,
  },
  alarmSub: { color: colors.onError, fontSize: 16, fontWeight: "400", marginTop: 8 },
  alarmText: { color: colors.onError, fontSize: 24, fontWeight: "800" },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  contentContainer: {
    alignItems: "center",
    padding: 20,
  },
  controlButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    elevation: 8,
    flexDirection: "row",
    marginHorizontal: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  controlText: { color: colors.onPrimary, fontSize: 16, fontWeight: "600", marginLeft: 8 },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  editButton: {
    padding: 8,
  },
  header: { alignItems: "center", marginBottom: 24 },

  innerContainer: {
    alignItems: "center",
    width: "100%",
  },

  label: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  recipeContent: {
    flex: 1,
  },
  recipeDescription: {
    color: colors.onSurface,
    fontSize: 14,
    opacity: 0.7,
  },
  recipeItem: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    elevation: 4,
    flexDirection: "row",
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: width * 0.9,
  },
  recipeName: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  status: { fontSize: 16, fontWeight: "500" },
  stepSection: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    elevation: 8,
    marginTop: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: width * 0.9,
  },
  stopButton: { backgroundColor: colors.error },
  targetText: { color: colors.onSurface, fontSize: 20, fontWeight: "500", textAlign: "center" },
  timeText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  title: { color: colors.onSurface, fontSize: 28, fontWeight: "700", marginBottom: 8 },
})

const BrewingScreen = () => {
  const router = useRouter()
  const { temperature: currentTemp, ratePerMinute, status } = useBLE()
  const [recipes, setRecipes] = useState(loadRecipes())

  const {
    currentRecipe,
    currentStepIndex,
    isBrewing,
    stepStartTime,
    alarmActive,
    loadRecipe,
    startBrewing,
    stopBrewing,
    nextStep,
  } = useRecipe()

  const flashAnim = new Animated.Value(0)

  // Refresh recipes when screen is focused
  useFocusEffect(
    useCallback(() => {
      setRecipes(loadRecipes())
    }, []),
  )

  // Animate flashing when alarm active
  useEffect(() => {
    if (alarmActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ]),
      ).start()
    } else {
      flashAnim.stopAnimation()
      flashAnim.setValue(0)
    }
  }, [alarmActive])

  useEffect(() => {
    if (isBrewing) {
      activateKeepAwakeAsync()
    } else {
      deactivateKeepAwake()
    }
  }, [isBrewing])

  const borderColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#222", "#f44336"],
  })

  const getCurrentStep = () => {
    if (!currentRecipe) return null
    return currentRecipe.steps[currentStepIndex]
  }

  const getStepDisplay = () => {
    const step = getCurrentStep()
    if (!step) return { label: "No recipe loaded", target: null, bounds: null }

    if (step.type === "TARGET_TEMPERATURE") {
      return {
        label: `${step.name} - ${step.direction}`,
        target: step.targetTemperatureC,
        bounds: null,
      }
    } else {
      return {
        label: step.name,
        target: null,
        bounds: { low: step.tempBoundaryLowC, high: step.tempBoundaryHighC },
      }
    }
  }

  const tempColor = alarmActive
    ? "#f44336"
    : currentTemp
      ? currentTemp < 25
        ? "#4fc3f7"
        : "#ffeb3b"
      : "#aaa"

  const stepDisplay = getStepDisplay()

  if (!currentRecipe) {
    return (
      <Screen
        preset="scroll"
        safeAreaEdges={["top", "bottom"]}
        backgroundColor={colors.background}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Ionicons name="beer" size={40} color={colors.secondary} />
          <Text style={styles.title}>Select Recipe</Text>
        </View>

        {recipes.map((recipe) => (
          <View key={recipe.recipeId} style={styles.recipeItem}>
            <TouchableOpacity style={styles.recipeContent} onPress={() => loadRecipe(recipe)}>
              <Text style={styles.recipeName}>{recipe.name}</Text>
              <Text style={styles.recipeDescription}>{recipe.description}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push({ pathname: "/recipe-editor", params: { recipeId: recipe.recipeId } })
              }
            >
              <Ionicons name="pencil" size={20} color={colors.onSurface} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/recipe-editor")}>
          <Ionicons name="add" size={24} color={colors.onPrimary} />
          <Text style={styles.addButtonText}>Add New Recipe</Text>
        </TouchableOpacity>
      </Screen>
    )
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      backgroundColor={colors.background}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View style={[styles.innerContainer, { borderColor }]}>
        <View style={styles.header}>
          <Ionicons name="beer" size={40} color={colors.secondary} />
          <Text style={styles.title}>Brewing Control</Text>
          <Text
            style={[
              styles.status,
              {
                color:
                  status === "connected" || status === "reconnecting"
                    ? colors.connected
                    : colors.disconnected,
              },
            ]}
          >
            {status === "connected"
              ? "Device Connected"
              : status === "reconnecting"
                ? "Reconnecting..."
                : status === "scanning"
                  ? "Scanning for device..."
                  : status === "disconnected"
                    ? "Device Disconnected"
                    : status === "timeout"
                      ? "Connection timeout"
                      : "Unknown status"}
          </Text>
        </View>

        <TemperatureDisplayWidget
          currentTemp={currentTemp}
          ratePerMinute={ratePerMinute}
          tempColor={tempColor}
        />

        <View style={styles.stepSection}>
          <Text style={styles.label}>{stepDisplay.label}</Text>
          {stepDisplay.target && (
            <Text style={styles.targetText}>Target: {stepDisplay.target}°C</Text>
          )}
          {stepDisplay.bounds && (
            <Text style={styles.targetText}>
              Maintain: {stepDisplay.bounds.low}°C - {stepDisplay.bounds.high}°C
            </Text>
          )}
          {isBrewing && stepStartTime && (
            <Text style={styles.timeText}>
              Step Time: {Math.floor((Date.now() - stepStartTime) / 1000 / 60)} min
            </Text>
          )}
        </View>

        <RecipeStepsList
          recipe={currentRecipe}
          currentStepIndex={currentStepIndex}
          isBrewing={isBrewing}
        />

        <View style={styles.controls}>
          {!isBrewing && (
            <TouchableOpacity style={styles.controlButton} onPress={startBrewing}>
              <Text style={styles.controlText}>Start Brewing</Text>
            </TouchableOpacity>
          )}
          {isBrewing && (
            <>
              <TouchableOpacity style={styles.controlButton} onPress={nextStep}>
                <Text style={styles.controlText}>Next Step</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={stopBrewing}
              >
                <Text style={styles.controlText}>Stop Brewing</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    </Screen>
  )
}

export default BrewingScreen
