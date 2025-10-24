import React, { useEffect, useState } from "react"
import { View, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useForm, Controller } from "react-hook-form"

import { Button } from "@/components/Button"
import { Header } from "@/components/Header"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { Radio } from "@/components/Toggle/Radio"
import { useRecipeEditor } from "@/context/RecipeEditorContext"
import { useAppTheme } from "@/theme/context"
import {
  Step,
  StepType,
  TemperatureTargetStep,
  TemperatureMaintenanceStep,
  Event,
} from "@/types/recipeTypes"

const { width } = Dimensions.get("window")

interface StepEditorScreenProps {}

export default function StepEditorScreen({}: StepEditorScreenProps) {
  const { theme } = useAppTheme()
  const router = useRouter()
  const params = useLocalSearchParams()
  const { editingRecipe, addStep, updateStep, removeEvent, validationErrors } = useRecipeEditor()

  const stepId = params.stepId as string | undefined
  const isEditing = !!stepId

  console.log("StepEditor params:", params, "stepId:", stepId, "isEditing:", isEditing)

  const [type, setType] = useState<StepType>("TARGET_TEMPERATURE")
  const [name, setName] = useState("New Step")
  const [durationMinutes, setDurationMinutes] = useState("60")
  const [direction, setDirection] = useState<"HEATING" | "COOLING" | "BOILING">("HEATING")
  const [targetTemperatureC, setTargetTemperatureC] = useState("70")
  const [tempBoundaryHighC, setTempBoundaryHighC] = useState("75")
  const [tempBoundaryLowC, setTempBoundaryLowC] = useState("65")

  useEffect(() => {
    if (isEditing && editingRecipe) {
      const step = editingRecipe.steps.find((s) => s.stepId === stepId)
      if (step) {
        setType(step.type)
        setName(step.name)
        setDurationMinutes(step.durationMinutes.toString())
        if (step.type === "TARGET_TEMPERATURE") {
          setDirection(step.direction)
          setTargetTemperatureC(step.targetTemperatureC.toString())
        } else {
          setTempBoundaryHighC(step.tempBoundaryHighC.toString())
          setTempBoundaryLowC(step.tempBoundaryLowC.toString())
        }
      }
    }
  }, [isEditing, stepId, editingRecipe])

  const handleSave = () => {
    console.log("handleSave called")
    const duration = parseInt(durationMinutes)
    if (isNaN(duration)) {
      console.log("Invalid duration:", durationMinutes)
      return
    }

    let step: Step
    if (type === "TARGET_TEMPERATURE") {
      const targetTemp = parseFloat(targetTemperatureC)
      if (isNaN(targetTemp)) {
        console.log("Invalid target temperature:", targetTemperatureC)
        return
      }
      step = {
        stepId: isEditing ? stepId! : `step-${Date.now()}`,
        type,
        name,
        durationMinutes: duration,
        direction,
        targetTemperatureC: targetTemp,
        events: isEditing ? editingRecipe!.steps.find((s) => s.stepId === stepId)!.events : [],
      } as TemperatureTargetStep
    } else {
      const high = parseFloat(tempBoundaryHighC)
      const low = parseFloat(tempBoundaryLowC)
      if (isNaN(high) || isNaN(low)) {
        console.log("Invalid boundaries:", tempBoundaryHighC, tempBoundaryLowC)
        return
      }
      step = {
        stepId: isEditing ? stepId! : `step-${Date.now()}`,
        type,
        name,
        durationMinutes: duration,
        tempBoundaryHighC: high,
        tempBoundaryLowC: low,
        events: isEditing ? editingRecipe!.steps.find((s) => s.stepId === stepId)!.events : [],
      } as TemperatureMaintenanceStep
    }

    console.log("Saving step:", step)
    if (isEditing) {
      updateStep(stepId!, step)
    } else {
      addStep(step)
    }
    router.back()
  }

  const handleCancel = () => {
    router.back()
  }

  const handleDeleteEvent = (eventId: string) => {
    if (stepId) {
      removeEvent(stepId, eventId)
    }
  }

  const durationError = validationErrors.find((e) => e.field.includes("durationMinutes"))?.message

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} backgroundColor={theme.colors.background}>
      <Header
        title={isEditing ? "Edit Step" : "Add Step"}
        leftIcon="caretLeft"
        onLeftPress={handleCancel}
      />
      <ScrollView contentContainerStyle={{ alignItems: "center", padding: 20 }}>
        <View
          style={{
            backgroundColor: theme.colors.palette.neutral200,
            borderRadius: 24,
            elevation: 8,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            width: width * 0.9,
          }}
        >
          <TextField label="Name" value={name} onChangeText={setName} placeholder="Step name" />

          <TextField
            label="Duration (minutes)"
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            placeholder="60"
            keyboardType="numeric"
            status={durationError ? "error" : undefined}
            helper={durationError}
          />

          <Text text="Type" preset="formLabel" />
          <View style={{ flexDirection: "row", marginVertical: 8 }}>
            <Button
              text="Target Temperature"
              onPress={() => setType("TARGET_TEMPERATURE")}
              preset={type === "TARGET_TEMPERATURE" ? "filled" : "default"}
              style={{ marginRight: 8 }}
            />
            <Button
              text="Temperature Maintenance"
              onPress={() => setType("TEMPERATURE_MAINTENANCE")}
              preset={type === "TEMPERATURE_MAINTENANCE" ? "filled" : "default"}
            />
          </View>

          {type === "TARGET_TEMPERATURE" && (
            <>
              <Text text="Direction" preset="formLabel" />
              <View style={{ flexDirection: "row", marginVertical: 8 }}>
                <Button
                  text="Heating"
                  onPress={() => setDirection("HEATING")}
                  preset={direction === "HEATING" ? "filled" : "default"}
                  style={{ marginRight: 8 }}
                />
                <Button
                  text="Cooling"
                  onPress={() => setDirection("COOLING")}
                  preset={direction === "COOLING" ? "filled" : "default"}
                  style={{ marginRight: 8 }}
                />
                <Button
                  text="Boiling"
                  onPress={() => setDirection("BOILING")}
                  preset={direction === "BOILING" ? "filled" : "default"}
                />
              </View>

              <TextField
                label="Target Temperature (°C)"
                value={targetTemperatureC}
                onChangeText={setTargetTemperatureC}
                placeholder="70"
                keyboardType="numeric"
              />
            </>
          )}

          {type === "TEMPERATURE_MAINTENANCE" && (
            <>
              <TextField
                label="High Boundary (°C)"
                value={tempBoundaryHighC}
                onChangeText={setTempBoundaryHighC}
                placeholder="75"
                keyboardType="numeric"
              />

              <TextField
                label="Low Boundary (°C)"
                value={tempBoundaryLowC}
                onChangeText={setTempBoundaryLowC}
                placeholder="65"
                keyboardType="numeric"
              />
            </>
          )}

          <Text
            style={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: "600",
              marginTop: 24,
              marginBottom: 16,
            }}
          >
            Events
          </Text>

          {editingRecipe?.steps
            .find((s) => s.stepId === stepId)
            ?.events.map((event, index) => (
              <View
                key={event.eventId}
                style={{
                  backgroundColor: theme.colors.palette.neutral100,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "500" }}>
                      {index + 1}. {event.notification.message}
                    </Text>
                    <Text style={{ color: theme.colors.textDim, fontSize: 14 }}>
                      {event.trigger.type} - {event.notification.type}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/event-editor",
                          params: { stepId: stepId!, eventId: event.eventId },
                        })
                      }
                      style={{ padding: 8 }}
                    >
                      <Ionicons name="pencil" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteEvent(event.eventId)}
                      style={{ padding: 8 }}
                    >
                      <Ionicons name="trash" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

          <TouchableOpacity
            onPress={() => router.push({ pathname: "/event-editor", params: { stepId: stepId! } })}
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
              Add Event
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
            <Button text="Cancel" onPress={handleCancel} />
            <Button text="Save" onPress={handleSave} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  )
}
