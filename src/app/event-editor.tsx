import React, { useEffect, useState } from "react"
import { View, ScrollView } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"

import { Button } from "@/components/Button"
import { Header } from "@/components/Header"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useRecipeEditor } from "@/context/RecipeEditorContext"
import { useAppTheme } from "@/theme/context"
import {
  Event,
  TriggerType,
  NotificationType,
  TemperatureTrigger,
  TimeIntervalTrigger,
  BoundaryTrigger,
  TimeElapsedTrigger,
  CriticalDialog,
  SoftReminder,
} from "@/types/recipeTypes"

interface EventEditorScreenProps {}

export default function EventEditorScreen({}: EventEditorScreenProps) {
  const { theme } = useAppTheme()
  const router = useRouter()
  const params = useLocalSearchParams()
  const { editingRecipe, addEvent, updateEvent } = useRecipeEditor()

  const stepId = params.stepId as string
  const eventId = params.eventId as string | undefined
  const isEditing = !!eventId

  console.log(
    "EventEditor params:",
    params,
    "stepId:",
    stepId,
    "eventId:",
    eventId,
    "isEditing:",
    isEditing,
  )

  const [triggerType, setTriggerType] = useState<TriggerType>("TIME_ELAPSED")
  const [notificationType, setNotificationType] = useState<NotificationType>("SOFT_REMINDER")

  // Trigger fields
  const [tempCondition, setTempCondition] = useState<"REACHED_OR_EXCEEDED" | "REACHED_OR_BELOW">(
    "REACHED_OR_EXCEEDED",
  )
  const [tempValue, setTempValue] = useState("")
  const [timeInterval, setTimeInterval] = useState("")
  const [repeatTimes, setRepeatTimes] = useState("")
  const [startOffset, setStartOffset] = useState("")
  const [boundaryCondition, setBoundaryCondition] = useState<"ABOVE_HIGH" | "BELOW_LOW">(
    "ABOVE_HIGH",
  )
  const [boundaryValue, setBoundaryValue] = useState("")
  const [elapsedMinutes, setElapsedMinutes] = useState("")

  // Notification fields
  const [message, setMessage] = useState("")
  const [actionButtonText, setActionButtonText] = useState("")

  useEffect(() => {
    if (isEditing && editingRecipe) {
      const step = editingRecipe.steps.find((s) => s.stepId === stepId)
      const event = step?.events.find((e) => e.eventId === eventId)
      if (event) {
        setTriggerType(event.trigger.type)
        setNotificationType(event.notification.type)
        setMessage(event.notification.message)

        if (event.trigger.type === "TEMPERATURE_TARGET") {
          setTempCondition(event.trigger.condition)
          setTempValue(event.trigger.valueC.toString())
        } else if (event.trigger.type === "TIME_INTERVAL") {
          setTimeInterval(event.trigger.intervalMinutes.toString())
          setRepeatTimes(event.trigger.repeatTimes?.toString() || "")
          setStartOffset(event.trigger.startOffsetMinutes?.toString() || "")
        } else if (event.trigger.type === "BOUNDARY_VIOLATION") {
          setBoundaryCondition(event.trigger.condition)
          setBoundaryValue(event.trigger.valueC.toString())
        } else if (event.trigger.type === "TIME_ELAPSED") {
          setElapsedMinutes(event.trigger.valueMinutes.toString())
        }

        if (event.notification.type === "CRITICAL_DIALOG") {
          setActionButtonText(event.notification.actionButtonText)
        }
      }
    }
  }, [isEditing, stepId, eventId, editingRecipe])

  const handleSave = () => {
    let trigger: any
    if (triggerType === "TEMPERATURE_TARGET") {
      const value = parseFloat(tempValue)
      if (isNaN(value)) return
      trigger = { type: triggerType, condition: tempCondition, valueC: value } as TemperatureTrigger
    } else if (triggerType === "TIME_INTERVAL") {
      const interval = parseInt(timeInterval)
      if (isNaN(interval)) return
      trigger = {
        type: triggerType,
        intervalMinutes: interval,
        repeatTimes: repeatTimes ? parseInt(repeatTimes) : undefined,
        startOffsetMinutes: startOffset ? parseInt(startOffset) : undefined,
      } as TimeIntervalTrigger
    } else if (triggerType === "BOUNDARY_VIOLATION") {
      const value = parseFloat(boundaryValue)
      if (isNaN(value)) return
      trigger = {
        type: triggerType,
        condition: boundaryCondition,
        valueC: value,
      } as BoundaryTrigger
    } else if (triggerType === "TIME_ELAPSED") {
      const value = parseInt(elapsedMinutes)
      if (isNaN(value)) return
      trigger = { type: triggerType, valueMinutes: value } as TimeElapsedTrigger
    }

    let notification: any
    if (notificationType === "CRITICAL_DIALOG") {
      notification = { type: notificationType, message, actionButtonText } as CriticalDialog
    } else {
      notification = { type: notificationType, message } as SoftReminder
    }

    const event: Event = {
      eventId: isEditing ? eventId! : `event-${Date.now()}`,
      trigger,
      notification,
    }

    if (isEditing) {
      updateEvent(stepId, eventId!, event)
    } else {
      addEvent(stepId, event)
    }
    router.back()
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <Header
        title={isEditing ? "Edit Event" : "Add Event"}
        leftIcon="caretLeft"
        onLeftPress={handleCancel}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text text="Trigger Type" preset="formLabel" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
          {(
            [
              "TEMPERATURE_TARGET",
              "TIME_INTERVAL",
              "BOUNDARY_VIOLATION",
              "TIME_ELAPSED",
            ] as TriggerType[]
          ).map((t) => (
            <Button
              key={t}
              text={t.replace("_", " ").toLowerCase()}
              onPress={() => setTriggerType(t)}
              preset={triggerType === t ? "filled" : "default"}
              style={{ margin: 4 }}
            />
          ))}
        </View>

        {triggerType === "TEMPERATURE_TARGET" && (
          <>
            <View style={{ flexDirection: "row", marginVertical: 8 }}>
              <Button
                text="Reached or Exceeded"
                onPress={() => setTempCondition("REACHED_OR_EXCEEDED")}
                preset={tempCondition === "REACHED_OR_EXCEEDED" ? "filled" : "default"}
                style={{ marginRight: 8 }}
              />
              <Button
                text="Reached or Below"
                onPress={() => setTempCondition("REACHED_OR_BELOW")}
                preset={tempCondition === "REACHED_OR_BELOW" ? "filled" : "default"}
              />
            </View>
            <TextField
              label="Temperature (°C)"
              value={tempValue}
              onChangeText={setTempValue}
              placeholder="70"
              keyboardType="numeric"
            />
          </>
        )}

        {triggerType === "TIME_INTERVAL" && (
          <>
            <TextField
              label="Interval (minutes)"
              value={timeInterval}
              onChangeText={setTimeInterval}
              placeholder="10"
              keyboardType="numeric"
            />
            <TextField
              label="Repeat Times (optional)"
              value={repeatTimes}
              onChangeText={setRepeatTimes}
              placeholder="5"
              keyboardType="numeric"
            />
            <TextField
              label="Start Offset (minutes, optional)"
              value={startOffset}
              onChangeText={setStartOffset}
              placeholder="0"
              keyboardType="numeric"
            />
          </>
        )}

        {triggerType === "BOUNDARY_VIOLATION" && (
          <>
            <View style={{ flexDirection: "row", marginVertical: 8 }}>
              <Button
                text="Above High"
                onPress={() => setBoundaryCondition("ABOVE_HIGH")}
                preset={boundaryCondition === "ABOVE_HIGH" ? "filled" : "default"}
                style={{ marginRight: 8 }}
              />
              <Button
                text="Below Low"
                onPress={() => setBoundaryCondition("BELOW_LOW")}
                preset={boundaryCondition === "BELOW_LOW" ? "filled" : "default"}
              />
            </View>
            <TextField
              label="Boundary Value (°C)"
              value={boundaryValue}
              onChangeText={setBoundaryValue}
              placeholder="75"
              keyboardType="numeric"
            />
          </>
        )}

        {triggerType === "TIME_ELAPSED" && (
          <TextField
            label="Elapsed Minutes"
            value={elapsedMinutes}
            onChangeText={setElapsedMinutes}
            placeholder="30"
            keyboardType="numeric"
          />
        )}

        <Text text="Notification Type" preset="formLabel" />
        <View style={{ flexDirection: "row", marginVertical: 8 }}>
          <Button
            text="Soft Reminder"
            onPress={() => setNotificationType("SOFT_REMINDER")}
            preset={notificationType === "SOFT_REMINDER" ? "filled" : "default"}
            style={{ marginRight: 8 }}
          />
          <Button
            text="Critical Dialog"
            onPress={() => setNotificationType("CRITICAL_DIALOG")}
            preset={notificationType === "CRITICAL_DIALOG" ? "filled" : "default"}
          />
        </View>

        <TextField
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="Notification message"
          multiline
        />

        {notificationType === "CRITICAL_DIALOG" && (
          <TextField
            label="Action Button Text"
            value={actionButtonText}
            onChangeText={setActionButtonText}
            placeholder="OK"
          />
        )}

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
          <Button text="Cancel" onPress={handleCancel} />
          <Button text="Save" onPress={handleSave} />
        </View>
      </ScrollView>
    </Screen>
  )
}
