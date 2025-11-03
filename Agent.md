# Agent Knowledge: JinxApp Codebase

## Overview

JinxApp is a React Native brewing application that manages recipes with temperature-triggered events, connected to an ESP32 device for real-time temperature monitoring. It uses Ignite CLI boilerplate with TypeScript, theming, and BLE integration.

## Key Components (src/components/)

### Button

- **Props**: tx, text, txOptions, style, pressedStyle, textStyle, pressedTextStyle, disabledTextStyle, preset ("default"|"filled"|"reversed"), RightAccessory, LeftAccessory, children, disabled, disabledStyle
- Customizable button with presets, supports i18n, accessories, theming.

### Card

- **Props**: preset ("default"|"reversed"), verticalAlignment ("top"|"center"|"space-between"|"force-footer-bottom"), LeftComponent, RightComponent, heading, headingTx, headingTxOptions, headingStyle, HeadingTextProps, HeadingComponent, content, contentTx, contentTxOptions, contentStyle, ContentTextProps, ContentComponent, footer, footerTx, footerTxOptions, footerStyle, FooterTextProps, FooterComponent
- Displays content vertically with optional sections and custom components.

### Text

- **Props**: tx, text, txOptions, style, preset ("default"|"bold"|"heading"|"subheading"|"formLabel"|"formHelper"), weight (typography.primary keys), size ("xxl"|"xl"|"lg"|"md"|"sm"|"xs"|"xxs"), children
- Text with presets, sizes, weights, i18n, RTL.

### Screen

- **Props**: preset ("fixed"|"scroll"|"auto"), children, style, contentContainerStyle, safeAreaEdges, backgroundColor, systemBarStyle, keyboardOffset, keyboardBottomOffset, keyboardShouldPersistTaps, ScrollViewProps, SystemBarsProps, KeyboardAvoidingViewProps
- Screen wrapper with scrolling, safe areas, keyboard handling.

### Header

- **Props**: titleMode ("center"|"flex"), titleStyle, titleContainerStyle, style, containerStyle, backgroundColor, title, titleTx, titleTxOptions, leftIcon, leftIconColor, leftText, leftTx, LeftActionComponent, leftTxOptions, onLeftPress, rightIcon, rightIconColor, rightText, rightTx, RightActionComponent, rightTxOptions, onRightPress, safeAreaEdges
- Header with title and actions.

### Icon

- **Props**: icon (IconTypes from registry), lucideIcon (string), color, size, style, containerStyle
- Icon with tinting, sizing; supports local PNG icons or Lucide icons; PressableIcon adds onPress, etc.

### Other Components

- **AutoImage**: Image with auto-sizing, source, style, etc.
- **DeviceConnectionStatus**: style, showText, iconSize - Displays BLE device connection status with Lucide icons and optional text.
- **EmptyState**: heading, content, preset, button, image, ImageProps, style
- **ListItem**: title, subtitle, leftIcon, rightIcon, onPress, style, etc.
- **RecipeStepsList**: steps, currentStepIndex, onStepPress, style - Determines step icons from events (thermometer for temp targets, shield for boundaries, timer for time elapsed, repeat for intervals).
- **StepCard**: step, stepIndex, totalSteps, isSelected, showEvents, style - Displays step info with optional event list.
- **TemperatureChart**: style - Live temperature chart with raw/smooth toggle, themed colors, icons, and stats display.
- **TemperatureDisplayWidget**: temperature, style
- **TemperatureGauge**: currentTemperature, highBoundary, lowBoundary, condition, style - Shows boundary violation status with gauge.
- **TemperatureProgressBar**: currentTemperature, targetTemperature, condition, style - Progress bar to temperature target.
- **TemperatureStatusCard**: temperature, targetTemp, style
- **TextField**: value, onChangeText, placeholder, style, etc.
- **TimeElapsedProgress**: totalMinutes, currentElapsed, eventName, eventMessage, onDismiss, style - Countdown for time-elapsed events with dismiss.
- **TimeIntervalProgress**: event, currentElapsed, dismissedTriggers, onDismissTrigger, style - Handles repeating time intervals, dismisses individual triggers.
- **Toggle components**: Checkbox, Radio, Switch, Toggle (base)
- **ErrorBoundary**: Wraps children, shows error details.

## Context Providers (src/context/)

- **RecipeContext**: Manages recipes list, current recipe, brewing state, steps, events, timers, and temperature monitoring.
- **RecipeEditorContext**: Handles recipe editing, adding/updating steps/events, validation with Zod schema.
- **TemperatureDeviceContext**: BLE connection to ESP32 (SERVICE_UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b), monitors temperature, sends commands.

## Theming (src/theme/)

- Light/dark themes with colors (palette: neutral, primary, secondary, accent, angry), spacing, typography, timing.
- ThemeProvider: Provides theme context, navigation theme, and `themed` function for dynamic styling.
- Types: Theme interface, ThemedStyle functions for theme-aware styles.

## App Structure

- **Screens**: BrewingScreen, RecipesScreen, etc. (in src/screens/)
- **Types**: Recipe types (Recipe, Step {stepId, name, durationMinutes, events: Event[]}, Event {eventId, trigger, notification}, triggers: TemperatureTarget, TimeInterval, BoundaryViolation, TimeElapsed)
- **Utils**: Storage (recipe persistence), permissions, gesture handlers, etc.
- **Services**: API problems, crash reporting.
- **Config**: Base/dev/prod configs.
- **I18n**: Multi-language support (en, es, fr, etc.)
- **Hooks**: useTemperatureMonitor for temp data.

## Key Features

- Recipe management: Create/edit recipes with steps and events.
- Brewing workflow: Start/stop brewing, navigate steps, activate events based on temp/time. Event state machine manages pending/active/dismissed states, with visible upcoming timers and dismissible notifications. Supports multiple time-elapsed and repeating time-interval events per step.
- BLE integration: Scan/connect to ESP32_TEMP_SERVER, read temp, send control commands.
- Theming: Dynamic light/dark mode with MMKV persistence.
- Validation: Zod schemas for recipes.

## Dependencies

- React Native, Expo Router, BLE-PLX, MMKV, i18next, Zod, etc.

## Notes

- Follows Ignite conventions: No comments in code, use semantic theming, prefer existing libs.
- Security: No secrets in code, use permissions.
- Build: Supports EAS, has APK builds.
- Recent refactoring: Simplified Step type to flat interface with events array, removed discriminated unions for better flexibility in event handling. Implemented centralized event state machine in RecipeContext for unified event lifecycle management (pending → active → dismissed).
