# Process Control Assistant

## Overview

The Process Control Assistant is a React Native mobile application designed to operate offline, guiding users through complex, temperature-critical, and time-sensitive workflows such as brewing, cooking, or chemical processes. The app minimizes user error and ensures repeatability by providing real-time sensor feedback, configurable recipes, and critical alerts for manual control of heating and cooling elements.

## Features

- **Recipe Configuration**: Users can define and save process steps, including target temperatures, durations, and ingredient additions.
- **Active Batch Dashboard**: Displays real-time temperature, rate of change, and step-specific progress with a clear visual timeline.
- **Alerts & Notifications**:
  - **Critical Dialogs**: Loud, disruptive alerts with modals for major state changes (e.g., target temperature reached, step completion).
  - **Soft Reminders**: Non-disruptive notifications (vibration, toast) for repetitive tasks (e.g., stirring).
- **Real-Time Monitoring**: Visualizes temperature history and acceptable ranges, with dynamic indicators for out-of-bounds conditions.
- **Configurable Event Model**: Supports triggers based on temperature targets, elapsed time, intervals, and boundary violations.
- **Offline Functionality**: All features work without an internet connection, with recipes stored locally.

## Getting Started

```bash
yarn install
yarn start
```

To make things work on your local simulator, or on your phone, you need first to [run `eas build`](https://github.com/infinitered/ignite/blob/master/docs/expo/EAS.md). We have many shortcuts on `package.json` to make it easier:

```bash
yarn build:ios:sim # build for ios simulator
yarn build:ios:device # build for ios device
yarn build:ios:prod # build for ios device
```

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

## Running Maestro end-to-end tests

Follow our [Maestro Setup](https://ignitecookbook.com/docs/recipes/MaestroSetup) recipe.

## Next Steps

### Ignite Cookbook

[Ignite Cookbook](https://ignitecookbook.com/) is an easy way for developers to browse and share code snippets (or “recipes”) that actually work.

### Upgrade Ignite boilerplate

Read our [Upgrade Guide](https://ignitecookbook.com/docs/recipes/UpdatingIgnite) to learn how to upgrade your Ignite project.

## Community

⭐️ Help us out by [starring on GitHub](https://github.com/infinitered/ignite), filing bug reports in [issues](https://github.com/infinitered/ignite/issues) or [ask questions](https://github.com/infinitered/ignite/discussions).

💬 Join us on [Slack](https://join.slack.com/t/infiniteredcommunity/shared_invite/zt-1f137np4h-zPTq_CbaRFUOR_glUFs2UA) to discuss.

📰 Make our Editor-in-chief happy by [reading the React Native Newsletter](https://reactnativenewsletter.com/).
