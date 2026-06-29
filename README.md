# Recipe Keeper

Android recipe app that stores recipes locally on your phone and scales ingredient amounts (half, double, or custom).

## Features

- Save recipes with title, servings, ingredients, and instructions
- All data stays on device using AsyncStorage
- Scale recipes with one tap: Half, Original, Double, or a custom multiplier
- Ingredient amounts are recalculated automatically (e.g. 2 cups flour → 1 cup at half scale)

## Run on your Android phone (no Android Studio needed)

1. Install **Expo Go** from the Google Play Store on your phone.
2. On your Mac, start the dev server:

```bash
npm install
npm run android
```

3. Scan the QR code shown in the terminal with Expo Go.

Your phone and Mac must be on the same Wi‑Fi network.

This project uses **Expo SDK 54**, which works with the Expo Go app from the Play Store. If you still see a version mismatch, update Expo Go from the Play Store or reinstall it.

## Build an APK

Building an APK requires the Android SDK. If you see `SDK location not found` or `spawn adb ENOENT`, install [Android Studio](https://developer.android.com/studio) first, then open it once so it downloads the SDK.

After Android Studio is installed, add this to your `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Then restart the terminal and run:

```bash
npm run prebuild:android
npm run build:apk
```

The APK will be at:

`android/app/build/outputs/apk/release/app-release.apk`

To run a native build on an emulator or connected device (after Android Studio is set up):

```bash
npm run android:native
```

### Cloud build (no Android Studio on your Mac)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

EAS produces a downloadable APK you can install on your phone.

## Example: Chocolate Cake

1. Tap **Add** and enter "Chocolate Cake" with 8 servings
2. Add ingredients like `2` `cups` `flour`, `1` `cup` `sugar`, `3` `` `eggs`
3. Open the recipe and tap **Half** — amounts become 1 cup flour, 1/2 cup sugar, 1 1/2 eggs
