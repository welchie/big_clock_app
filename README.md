# Big Clock & Calendar Reminders (React Native Tablet App)

A full-screen ambient room/desk digital clock and calendar reminders application built with React Native and Expo, specifically designed for **Tablet displays in landscape orientation**.

![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo_SDK-57.0-000000?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)

---

## 🌟 Key Features

- 🕒 **Ambient High-Visibility Digital Clock**: Configurable digital clock font sizes (Small 72pt, Medium 96pt, Large 120pt, Huge 144pt) with live seconds ticker, and AM/PM / 24-hour toggles. Quick font size cycle button right on the clock face and in display preferences with live preview.
- 📅 **Ordinal Date Header**: Displays the full day and ordinal date string (e.g. **`Tuesday 8th September`**), year, and ISO week number.
- 📱 **Tablet Landscape Optimized**: Built specifically for tablet aspect ratios with locked landscape orientation (`expo-screen-orientation`).
- 💡 **Keep Screen Awake**: Integrated `expo-keep-awake` service prevents the tablet screen from dimming or turning off while in clock mode.
- 🌙 **Night Mode & Brightness Dimming**: Quick toggleable dimming overlay for bedside or dark room desk usage.
- 🎨 **Multi-Theme Engine**: 6 built-in aesthetic themes (OLED Midnight, Modern Slate, Warm Amber Glow, Emerald Forest, Neon Crimson, Minimal Light).
- 📆 **Calendar & Agenda Panel**:
  - Interactive mini month calendar matrix with reminder indicator dots.
  - Agenda view with filtering by Today, Upcoming, All, and Completed.
  - Category badges: Work, Personal, Health, Event, and Other.
- 🔔 **Offline Persistence & Scheduled Alerts**:
  - Local storage using `@react-native-async-storage/async-storage`.
  - Local scheduled push notifications using `expo-notifications`.

---

## 🏗️ Technical Architecture

### Component Architecture

The app uses a dual-pane responsive landscape architecture:

```
                      +---------------------------------------+
                      |               App.tsx                 |
                      |   (State, Storage, Orientation Lock)  |
                      +-------------------+-------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
      +---------v---------+                               +---------v---------+
      |    Left Column    |                               |   Right Column    |
      |   (Ambient Clock) |                               | (Calendar Agenda) |
      +---------+---------+                               +---------+---------+
                |                                                   |
        +-------v-------+                           +---------------+---------------+
        |  BigClock.tsx |                           |                               |
        +---------------+                 +---------v---------+           +---------v---------+
                                          |CalendarWidget.tsx |           |  ReminderList.tsx |
                                          +-------------------+           +-------------------+
```

### Data Flow & Services Layer

1. **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`) manage live time updates (1000ms ticker), reminder list mutations, date filters, and active settings.
2. **Persistence (`services/storage.ts`)**: Loads and saves reminders and display preferences to device storage via `@react-native-async-storage/async-storage`.
3. **Notification System (`services/notifications.ts`)**: Handles permission requests and schedules local notifications with `expo-notifications` when reminders with alert times are created or edited.
4. **Date Formatting (`utils/dateFormatter.ts`)**: Converts Date objects into ordinal strings (e.g. `Tuesday 8th September`), generates calendar matrices, and handles 12h/24h time formatting.

---

## 📂 Project Structure

```
big_clock_app/
├── assets/                  # App icons, favicon, adaptive launcher assets
├── components/              # Modular UI Components
│   ├── AddReminderModal.tsx # Form modal for creating/editing reminders
│   ├── BigClock.tsx         # Large digital clock & ordinal date display
│   ├── CalendarWidget.tsx   # Interactive month matrix with reminder dots
│   ├── ReminderList.tsx     # Agenda list with category tags & checkboxes
│   └── SettingsModal.tsx    # Theme selector & display preferences
├── constants/
│   ├── fontSizes.ts         # Clock font size scale presets & proportions
│   └── themes.ts            # Aesthetic theme color presets & category colors
├── services/
│   ├── notifications.ts     # Local notification scheduler service
│   └── storage.ts           # Persistent storage service (AsyncStorage)
├── tests/                   # Security, validation, and storage unit tests
├── types/
│   └── reminder.ts          # TypeScript interfaces for reminders & settings
├── utils/
│   └── dateFormatter.ts     # Ordinal date, 12h/24h, & calendar matrix helpers
├── App.tsx                  # Main landscape layout & application shell
├── app.json                 # Expo orientation & tablet configuration
├── index.ts                 # Expo root entry point
├── package.json             # Dependencies and build scripts
└── tsconfig.json            # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **Expo Go** app installed on your tablet (iOS/Android) if testing on physical hardware.

### Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd /Users/chriswelch/workspace/big_clock_app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 💻 Running the Application

### 1. Run in Web Browser (Quick Preview)
To preview the landscape tablet interface directly in your browser:
```bash
npm run web
```

### 2. Run on Expo Go / Physical Tablet
Start the Expo development server:
```bash
npm run start
```
Scan the displayed QR code using the Expo Go app on your iPad or Android Tablet.

### 3. Run on Simulators / Emulators
```bash
# iOS Simulator (iPad)
npm run ios

# Android Emulator (Tablet profile)
npm run android
```

---

## 📦 Building Standalone Binaries (APK & iOS)

To distribute or install the app directly on physical hardware without relying on Expo Go, you can build standalone binaries:
- **Android**: An **APK (`.apk`)** file can be directly sideloaded onto any Android tablet via USB (`adb install`), Google Drive, or local download. For the Google Play Store, an **AAB (`.aab`)** bundle is used.
- **iOS**: An **IPA (`.ipa`)** is the iOS standalone equivalent. Testing on physical iOS devices requires signing via an Apple Developer account (TestFlight or Ad-Hoc provisioning). For Mac testing, an **iOS Simulator build** can be generated without an Apple Developer account.

---

### Step 1: Set Package & Bundle Identifiers in `app.json`

Before generating native builds, specify your unique package name and bundle identifier in [`app.json`](app.json):

```json
{
  "expo": {
    "name": "Big Clock & Reminders",
    "slug": "big-clock-reminders",
    "version": "1.0.0",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.bigclock"
    },
    "android": {
      "package": "com.yourname.bigclock"
    }
  }
}
```

---

### Method A: EAS Build (Recommended & Cloud-Based)

EAS (Expo Application Services) compiles the app in the cloud, removing the need to manage local native build tools, Android NDKs, or macOS Xcode installations.

1. **Install EAS CLI & Log In**:
   ```bash
   npx eas-cli login
   ```

2. **Initialize Configuration**:
   ```bash
   npx eas-cli build:configure
   ```

3. **Configure `eas.json` for APK & Simulator Builds**:
   Set `buildType: "apk"` under the `preview` profile to output a direct `.apk` file instead of an `.aab`:
   ```json
   {
     "cli": {
       "version": ">= 15.0.0"
     },
     "build": {
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         },
         "ios": {
           "simulator": true
         }
       },
       "production": {}
     }
   }
   ```

4. **Trigger Cloud Builds**:
   - **Android Installable APK**:
     ```bash
     npx eas-cli build -p android --profile preview
     ```
     *(EAS will provide a download URL to the `.apk` upon completion).*

   - **iOS Simulator Build** *(no Apple Developer account required)*:
     ```bash
     npx eas-cli build -p ios --profile preview
     ```

   - **iOS TestFlight / Production** *(requires Apple Developer account)*:
     ```bash
     npx eas-cli build -p ios --profile production
     ```

---

### Method B: Local Native Build (Offline on Mac)

If you prefer to build locally on your development machine:

#### 1. Generate Native Directories (`android/` and `ios/`):
```bash
npx expo prebuild
```

#### 2. Build Android APK via Gradle:
*Requires Java and Android SDK configured in your shell (`$ANDROID_HOME`).*

- **Debug APK** (Immediately installable & testable):
  ```bash
  cd android && ./gradlew assembleDebug
  ```
  - **Output binary**: `android/app/build/outputs/apk/debug/app-debug.apk`
  - **Install to connected tablet**:
    ```bash
    adb install -r android/app/build/outputs/apk/debug/app-debug.apk
    ```

- **Release APK**:
  ```bash
  cd android && ./gradlew assembleRelease
  ```
  - **Output binary**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

#### 3. Build iOS via Xcode:
*Requires the full Xcode application installed from the Mac App Store.*

- **Run in Release Mode**:
  ```bash
  npx expo run:ios --configuration Release
  ```
- **Archive `.ipa` in Xcode**:
  Open `ios/bigclockreminders.xcworkspace` in Xcode, select **Product > Destination > Any iOS Device**, and select **Product > Archive** to export for Ad-Hoc or App Store distribution.

---

## 🧪 Testing & Code Coverage

Unit tests are executed using Node.js's native test runner with `tsx` for TypeScript support:

- **Run unit tests**:
  ```bash
  npm test
  ```
- **Run unit tests with coverage report**:
  ```bash
  npm run test:coverage
  ```
  *(Or directly via `node --import tsx --test --experimental-test-coverage tests/**/*.test.ts`)*

---

## 🛠️ Verification & Diagnostic Commands

- **TypeScript Compilation Check**:
  ```bash
  npx tsc --noEmit
  ```
- **Export Static Web Production Bundle**:
  ```bash
  npx expo export --platform web
  ```
- **Export Native JavaScript Bundle**:
  ```bash
  npx expo export --platform android
  ```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
