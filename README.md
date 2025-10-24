# JinxApp - Brewing Control Assistant

## Overview

JinxApp is a React Native mobile application for offline brewing process control. It guides users through temperature-critical brewing workflows using real-time sensor feedback from an IoT device. The app ensures repeatability with configurable recipes, step-by-step instructions, and alerts for manual heating/cooling control.

The app connects via Bluetooth Low Energy (BLE) to an ESP32-based IoT device that monitors temperature and allows sending commands for process control.

## Features

- **BLE Connectivity**: Connects to ESP32 IoT device for real-time temperature monitoring and command sending.
- **Recipe Management**: Create, edit, and save brewing recipes with steps including target temperatures, time intervals, and boundary conditions.
- **Real-Time Dashboard**: Displays current temperature, rate of change, and recipe progress with visual indicators.
- **Automated Reconnection**: Automatically attempts to reconnect to the IoT device on disconnection.
- **Alerts & Notifications**:
  - **Critical Alerts**: Modal dialogs for temperature targets, step completion, and boundary violations.
  - **Soft Reminders**: Notifications for timed intervals and repetitive tasks.
- **Offline Operation**: Fully functional without internet, with local recipe storage.
- **Temperature Monitoring**: Smoothed temperature readings with rate calculations for precise control.

## Hardware Setup

The app requires an ESP32-based IoT device running the firmware in `esp32/jinx.ino`. The device provides BLE services for temperature reading and command execution.

- Service UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
- Temperature Characteristic: beb5483e-36e1-4688-b7f5-ea07361b26a8
- Command Characteristic: 1a7e8e50-9d0d-457e-97f6-68f447781f8f

Upload the firmware to your ESP32 and ensure it's advertising as "ESP32_TEMP_SERVER".

## Getting Started

```bash
npm install
npm start
```

For device builds, use EAS:

```bash
npm run build:android:device  # Android device
npm run build:ios:device      # iOS device
npm run build:android:sim     # Android emulator
npm run build:ios:sim         # iOS simulator
```

Grant location and Bluetooth permissions when prompted.

### `./assets` directory

This directory is designed to organize and store various assets, making it easy for you to manage and use them in your application. The assets are further categorized into subdirectories, including `icons` and `images`:

```tree
assets
├── icons
└── images
```

**icons**
This is where your icon assets will live. These icons can be used for buttons, navigation elements, or any other UI components. The recommended format for icons is PNG, but other formats can be used as well.

Ignite comes with a built-in `Icon` component. You can find detailed usage instructions in the [docs](https://github.com/infinitered/ignite/blob/master/docs/boilerplate/app/components/Icon.md).

**images**
This is where your images will live, such as background images, logos, or any other graphics. You can use various formats such as PNG, JPEG, or GIF for your images.

Another valuable built-in component within Ignite is the `AutoImage` component. You can find detailed usage instructions in the [docs](https://github.com/infinitered/ignite/blob/master/docs/Components-AutoImage.md).

How to use your `icon` or `image` assets:

```typescript
import { Image } from 'react-native';

const MyComponent = () => {
  return (
    <Image source={require('assets/images/my_image.png')} />
  );
};
```

## Testing

Run unit tests:

```bash
npm test
```

Run end-to-end tests with Maestro:

```bash
npm run test:maestro
```

Follow the [Maestro Setup](https://ignitecookbook.com/docs/recipes/MaestroSetup) recipe for E2E testing.

## Next Steps

### Ignite Cookbook

[Ignite Cookbook](https://ignitecookbook.com/) is an easy way for developers to browse and share code snippets (or “recipes”) that actually work.

### Upgrade Ignite boilerplate

Read our [Upgrade Guide](https://ignitecookbook.com/docs/recipes/UpdatingIgnite) to learn how to upgrade your Ignite project.

## Troubleshooting

- **BLE Connection Issues**: Ensure the ESP32 is powered and advertising. Check Bluetooth permissions.
- **App Crashes**: The app handles disconnections gracefully with automatic reconnection.
- **Temperature Not Updating**: Verify the IoT device is connected and sending data.

## Community

For support, file issues on GitHub or join the React Native community discussions.
