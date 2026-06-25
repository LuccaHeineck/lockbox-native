# Lockbox Native

**Lockbox Native** is a secure and minimalist mobile application built with React Native and Expo SDK 55. The project is integrated with Supabase for real-time encrypted data management and reliable authentication.

---

## 📱 Screenshots

|                           Login & Authentication                           |                                Main Dashboard                               |                              Credentials Management                          |
| :------------------------------------------------------------------------: | :-------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
| <img src="./assets/screenshots/login.png" width="250" alt="Login Screen"/> | <img src="./assets/screenshots/dashboard.png" width="250" alt="Dashboard"/> | <img src="./assets/screenshots/credentials.png" width="250" alt="Settings"/> |

---

## Technologies Used

The project ecosystem was built using the following technologies and dependencies:

* **Core:** React Native (v0.83+) & Expo (v55.0+)
* **Database & Authentication:** Supabase JS
* **Security:** `expo-secure-store` & `expo-crypto` (encryption and secure token storage on the device)
* **Navigation:** React Navigation v7 (`@react-navigation/native` & `@react-navigation/stack`)
* **UI & Performance:** `react-native-safe-area-context` & `react-native-screens` (native screen optimization)

---

## Setup & Installation

### Prerequisites

Make sure you have Node.js installed and your Android/iOS development environment properly configured. Alternatively, you can use EAS CLI for cloud builds.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/lockbox-native.git
cd lockbox-native
```

### 2. Install Dependencies

Install the packages while preserving the project's stable dependency tree:

```bash
npm install --legacy-peer-deps
```

### 3. Environment Variables

Create a `.env` file in the root directory and configure your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

---

## Running the Project

### Local Development (Device or Emulator)

To generate the native Android project and start Metro locally:

```bash
# Clean and regenerate the native project
npx expo prebuild --clean

# Run on a connected Android device
npx expo run:android
```

### Standalone Build (Production APK via Cloud)

If you want to generate a production-ready APK that can be installed directly on a device without requiring a development machine:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account
eas login

# Run a production build in the cloud
eas build --platform android --profile production
```

---

## Security Features

* Secure authentication powered by Supabase Auth
* Encrypted token storage using Expo Secure Store
* Cryptographic utilities provided by Expo Crypto
* Secure environment variable management
* Native Android architecture using Kotlin and Gradle

---

## 📄 License

This project is available under the MIT License. Feel free to use, modify, and distribute it according to the license terms.
