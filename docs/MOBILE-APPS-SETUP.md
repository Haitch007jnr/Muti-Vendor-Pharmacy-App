# Mobile Applications Setup Guide

This guide covers the setup and development of the three mobile applications in the Multi-Vendor Pharmacy Platform.

## Overview

The platform includes three React Native mobile applications:

1. **Customer App** (`mobile-customer`) - For customers to browse and purchase medicines
2. **Vendor App** (`mobile-vendor`) - For vendors to manage their stores
3. **Delivery App** (`mobile-delivery`) - For delivery personnel to manage deliveries

All apps are built with:
- React Native 0.73
- Expo SDK 50
- TypeScript
- React Navigation v6

## Prerequisites

### Required Software

1. **Node.js** >= 18.0.0
2. **npm** >= 9.0.0
3. **Expo CLI** (install globally)
   ```bash
   npm install -g expo-cli
   ```

### For iOS Development (macOS only)
- Xcode (latest version)
- iOS Simulator
- CocoaPods
  ```bash
  sudo gem install cocoapods
  ```

### For Android Development
- Android Studio
- Android SDK (API level 31+)
- Android Emulator or physical device

### For Testing on Physical Devices
- **Expo Go** app installed on your device
  - iOS: Download from App Store
  - Android: Download from Google Play Store

## Installation

### 1. Install Root Dependencies

From the project root:
```bash
npm install
```

### 2. Install Mobile App Dependencies

Install dependencies for each mobile app:

```bash
# Customer App
cd apps/mobile-customer
npm install

# Vendor App
cd ../mobile-vendor
npm install

# Delivery App
cd ../mobile-delivery
npm install
```

## Running the Apps

### Development Mode

Each app can be run independently:

#### Customer App
```bash
cd apps/mobile-customer
npm start
# or
npm run dev
```

#### Vendor App
```bash
cd apps/mobile-vendor
npm start
```

#### Delivery App
```bash
cd apps/mobile-delivery
npm start
```

### Running on Specific Platforms

After starting the development server, you can:

1. **Press 'i'** - Open in iOS Simulator (macOS only)
2. **Press 'a'** - Open in Android Emulator
3. **Press 'w'** - Open in web browser
4. **Scan QR code** - Open in Expo Go app on physical device

Or use these commands directly:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

Each mobile app follows this structure:

```
mobile-[app-name]/
├── App.tsx                    # App entry point
├── app.json                   # Expo configuration
├── babel.config.js            # Babel configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── .eslintrc.json            # ESLint config
├── assets/                    # Images, fonts, etc.
└── src/
    ├── screens/               # Screen components
    │   ├── auth/             # Authentication screens
    │   └── ...               # Other screen folders
    ├── navigation/           # Navigation setup
    ├── contexts/             # React contexts
    ├── components/           # Reusable components
    ├── services/             # API services
    ├── utils/                # Utility functions
    └── types/                # TypeScript types
```

## Features by App

### Customer App Features
- ✅ User authentication (login/register)
- ✅ Product browsing and search
- ✅ Shopping cart management
- ✅ Checkout and payment
- ✅ Order tracking
- ✅ User profile management
- 🔄 Prescription upload (configured, needs implementation)
- 🔄 Push notifications (configured, needs implementation)

### Vendor App Features
- ✅ Vendor authentication
- ✅ Dashboard with sales metrics
- ✅ Inventory management
- ✅ Order fulfillment
- ✅ Sales analytics
- ✅ Profile management
- 🔄 Staff management (placeholder)
- 🔄 Financial reports (placeholder)

### Delivery App Features
- ✅ Delivery personnel authentication
- ✅ Active deliveries list
- ✅ Delivery details
- ✅ Status updates
- ✅ Performance metrics
- 🔄 GPS navigation (configured, needs implementation)
- 🔄 Route optimization (future)

## Configuration

### Environment Variables

Create a `.env` file in each mobile app directory:

```env
API_URL=http://localhost:4000/api/v1
PAYSTACK_PUBLIC_KEY=pk_test_xxx
```

For connecting to API on physical device, use your computer's IP:
```env
API_URL=http://192.168.1.100:4000/api/v1
```

### App Configuration

Each app has an `app.json` file for Expo configuration:

- Bundle identifiers
- App names
- Icons and splash screens
- Permissions
- Plugins (notifications, location, etc.)

## Development Workflow

### 1. Hot Reloading

Expo provides hot reloading by default. Changes to code will automatically refresh the app.

### 2. Debugging

#### React Developer Tools
```bash
# In the Expo dev tools, click "Run in web browser"
# Then use Chrome DevTools
```

#### React Native Debugger
```bash
# Install React Native Debugger
brew install --cask react-native-debugger

# Start debugging
# Shake device or press Cmd+D (iOS) / Cmd+M (Android)
# Select "Debug JS Remotely"
```

#### Logging
```javascript
console.log('Debug info');
console.warn('Warning message');
console.error('Error message');
```

### 3. Code Quality

```bash
# Lint code
npm run lint

# Type check
npm run type-check
```

## Building for Production

### Development Builds

For testing before app store submission:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Production Builds

```bash
# iOS (requires Apple Developer account)
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

Tests should cover:
- Navigation flows
- API integration
- State management
- User interactions

### Testing on Devices

#### iOS Simulator (macOS)
1. Open Xcode
2. Start simulator: `open -a Simulator`
3. Run: `npm run ios`

#### Android Emulator
1. Open Android Studio
2. Start AVD Manager
3. Start an emulator
4. Run: `npm run android`

#### Physical Devices
1. Install Expo Go app
2. Scan QR code from terminal
3. App will load on device

## Common Issues and Solutions

### Issue: "Metro bundler not found"
**Solution:**
```bash
npm install
expo start -c
```

### Issue: "Cannot connect to API"
**Solution:**
- Check API_URL in .env
- Use computer's IP address, not localhost
- Ensure API server is running
- Check firewall settings

### Issue: "Build failed"
**Solution:**
```bash
# Clear cache
expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: "Expo Go not connecting"
**Solution:**
- Ensure device and computer are on same network
- Disable VPN
- Check firewall settings
- Try tunnel mode: `expo start --tunnel`

## API Integration

### Base URL Configuration

The mobile apps connect to the backend API. Configure the base URL in each app's environment:

```typescript
// src/services/api.ts
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### Authentication

JWT tokens are stored in AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store token
await AsyncStorage.setItem('authToken', token);

// Retrieve token
const token = await AsyncStorage.getItem('authToken');

// Remove token
await AsyncStorage.removeItem('authToken');
```

## In-App Updates (OTA Updates)

### Overview

All mobile apps support Over-The-Air (OTA) updates via `expo-updates`, allowing you to push updates without requiring users to download from app stores.

### Configuration

Each app is configured with automatic update checking:

```json
{
  "updates": {
    "enabled": true,
    "checkAutomatically": "ON_LOAD",
    "fallbackToCacheTimeout": 0
  },
  "runtimeVersion": {
    "policy": "sdkVersion"
  }
}
```

### How It Works

1. **Automatic Check**: App checks for updates on launch
2. **User Prompt**: Alert shown if update is available
3. **Download & Install**: User can download and apply update
4. **Restart**: App restarts to apply the update

### Publishing Updates

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Publish update to production
cd apps/mobile-customer
eas update --branch production --message "Bug fixes"

# For other apps
cd apps/mobile-vendor
eas update --branch production --message "Bug fixes"

cd apps/mobile-delivery
eas update --branch production --message "Bug fixes"
```

### Update Channels

- **development**: Development builds
- **preview**: Testing and QA
- **production**: Production releases

### What Can Be Updated

✅ JavaScript/TypeScript code
✅ Assets (images, fonts)
✅ Configuration
✅ Bug fixes
✅ UI changes

❌ Native code changes (requires new app store build)
❌ New native dependencies
❌ Permission changes

### Testing Updates

1. Build a development app: `eas build --profile development`
2. Install on device
3. Publish update: `eas update --branch development`
4. Reopen app to receive update

For detailed information, see [IN-APP-UPDATES.md](./IN-APP-UPDATES.md).

## Push Notifications

### Setup (Future Implementation)

1. Configure Firebase project
2. Add Firebase configuration to app.json
3. Install Firebase SDK
4. Implement notification handlers

```bash
# Install dependencies
expo install expo-notifications expo-device expo-constants
```

## Performance Optimization

### Best Practices

1. **Use FlatList for long lists**
   ```typescript
   <FlatList
     data={items}
     renderItem={renderItem}
     keyExtractor={(item) => item.id}
     initialNumToRender={10}
     maxToRenderPerBatch={10}
   />
   ```

2. **Optimize images**
   - Use appropriate image sizes
   - Compress images
   - Use cached images

3. **Minimize re-renders**
   - Use React.memo for components
   - Use useMemo and useCallback hooks
   - Avoid inline functions in render

4. **Code splitting**
   - Lazy load screens
   - Split large components

## Deployment

### App Store (iOS)

1. Create App Store Connect account
2. Configure app.json with correct bundle ID
3. Build production app with EAS
4. Submit through App Store Connect

### Google Play Store (Android)

1. Create Google Play Console account
2. Configure app.json with correct package name
3. Build production APK/AAB with EAS
4. Submit through Play Console

## Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## Support

For issues or questions:
- Check existing issues in GitHub
- Create a new issue with detailed description
- Include error logs and screenshots

## Next Steps

1. Install dependencies for all mobile apps
2. Start the API backend
3. Run each mobile app in development mode
4. Test basic functionality
5. Configure push notifications
6. Implement payment integration
7. Test on physical devices
8. Prepare for app store submission
