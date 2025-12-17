# In-App Updates Guide

This guide explains how Over-The-Air (OTA) updates work in the Multi-Vendor Pharmacy Platform mobile applications and how to use them.

## Overview

In-app updates allow you to push updates to your mobile apps without requiring users to download a new version from the App Store or Google Play Store. This feature is implemented using Expo's `expo-updates` package.

## How It Works

### Update Mechanism

1. **Automatic Check**: When users open the app, it automatically checks for available updates
2. **User Notification**: If an update is available, users are prompted with an alert
3. **Download**: Users can choose to download the update or skip it
4. **Installation**: After download, the app restarts to apply the update
5. **Seamless Experience**: Updates are applied without going through app stores

### Update Channels

The platform uses three update channels:

- **development**: For internal development builds
- **preview**: For testing and QA
- **production**: For production releases to end users

## Configuration

### App Configuration

Each mobile app has been configured with the following update settings in `app.json`:

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

**Configuration Options:**
- `enabled`: Enables OTA updates
- `checkAutomatically`: When to check for updates (`ON_LOAD`, `ON_ERROR_RECOVERY`, or `NEVER`)
- `fallbackToCacheTimeout`: Time to wait before falling back to cached bundle (0 = immediate)
- `runtimeVersion`: Determines update compatibility (using SDK version)

### EAS Configuration

Each app's `eas.json` has been updated with channel configurations:

```json
{
  "build": {
    "development": {
      "channel": "development"
    },
    "preview": {
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

## Implementation

### useAppUpdates Hook

A custom React hook has been created to manage app updates:

**Location:** `src/hooks/useAppUpdates.ts` (in each mobile app)

**Features:**
- Automatic update checking on app launch
- User-friendly alerts for available updates
- Progress tracking during download
- Error handling with user feedback
- Manual update check capability

**Usage Example:**

```typescript
import { useAppUpdates } from './src/hooks/useAppUpdates';

function MyComponent() {
  const { 
    isUpdateAvailable, 
    isChecking, 
    isDownloading,
    checkForUpdates 
  } = useAppUpdates();

  return (
    <View>
      {isChecking && <Text>Checking for updates...</Text>}
      {isDownloading && <Text>Downloading update...</Text>}
      <Button title="Check for Updates" onPress={checkForUpdates} />
    </View>
  );
}
```

### Integration in App.tsx

The update hook is integrated at the app's entry point:

```typescript
import { useAppUpdates } from './src/hooks/useAppUpdates';

export default function App() {
  useAppUpdates(); // Automatically checks for updates on launch

  return (
    // ... app content
  );
}
```

## Publishing Updates

### Prerequisites

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

### Publishing Process

#### 1. For Development

```bash
cd apps/mobile-customer  # or mobile-vendor, mobile-delivery
eas update --branch development --message "Bug fixes and improvements"
```

#### 2. For Preview/Testing

```bash
eas update --branch preview --message "New features for testing"
```

#### 3. For Production

```bash
eas update --branch production --message "Version 1.0.1 - Bug fixes"
```

### Publishing All Apps

To publish updates to all three mobile apps:

```bash
# Customer App
cd apps/mobile-customer
eas update --branch production --message "Update message"

# Vendor App
cd ../mobile-vendor
eas update --branch production --message "Update message"

# Delivery App
cd ../mobile-delivery
eas update --branch production --message "Update message"
```

## Update Limitations

### What Can Be Updated

✅ **JavaScript/TypeScript code changes**
✅ **Assets (images, fonts, etc.)**
✅ **Configuration changes**
✅ **Bug fixes**
✅ **UI/UX improvements**
✅ **Business logic updates**

### What Cannot Be Updated

❌ **Native code changes** (Java/Kotlin/Objective-C/Swift)
❌ **New native dependencies**
❌ **Permission changes**
❌ **Expo SDK version updates**
❌ **Changes to app.json that affect native configuration**

For these changes, you must publish a new binary to the app stores.

## Testing Updates

### Local Testing

1. **Build a development app**:
   ```bash
   eas build --profile development --platform android
   # or
   eas build --profile development --platform ios
   ```

2. **Install the development build on your device**

3. **Publish an update**:
   ```bash
   eas update --branch development --message "Test update"
   ```

4. **Open the app** - it should detect and download the update

### Testing in Preview

1. Build a preview version
2. Distribute to testers
3. Publish updates to the preview channel
4. Testers will receive updates automatically

## Monitoring Updates

### Check Update Status

```bash
# View recent updates
eas update:list --branch production

# View specific update details
eas update:view [UPDATE_ID]
```

### Analytics

Monitor update adoption through:
- Expo dashboard
- Custom analytics in your app
- User feedback

## Best Practices

### 1. Update Frequency
- **Don't over-update**: Users don't need updates every day
- **Group changes**: Bundle multiple fixes/features into one update
- **Communicate**: Use meaningful update messages

### 2. Update Timing
- **Off-peak hours**: Publish during low-traffic times
- **Test first**: Always test on preview channel before production
- **Staged rollout**: Consider phased rollouts for major updates

### 3. User Experience
- **Non-intrusive**: Current implementation only prompts on app launch
- **Clear messaging**: Update alerts explain what's being updated
- **Optional**: Users can skip updates if needed
- **Fast**: Keep bundle sizes small for quick downloads

### 4. Version Management
- **Track versions**: Maintain clear version history
- **Document changes**: Keep detailed changelogs
- **Test thoroughly**: Test all changes before publishing

### 5. Rollback Strategy
- **Keep backups**: Maintain previous working versions
- **Quick rollback**: Be prepared to rollback if issues arise
- **Monitor closely**: Watch for errors after deployment

## Troubleshooting

### Update Not Appearing

1. **Check update channel**:
   ```bash
   eas update:list --branch production
   ```

2. **Verify app configuration**:
   - Ensure `updates.enabled` is `true` in app.json
   - Check runtime version compatibility

3. **Clear cache**:
   ```bash
   expo start --clear
   ```

### Update Download Fails

- Check internet connection
- Verify Expo servers are accessible
- Check for errors in console logs
- Try manual update check

### App Crashes After Update

1. **Rollback immediately**:
   ```bash
   eas update --branch production --message "Rollback" --republish [PREVIOUS_UPDATE_ID]
   ```

2. **Investigate logs**:
   - Check crash reports
   - Review error logs
   - Test locally

3. **Fix and republish**

## Security Considerations

### Code Signing

- Expo automatically signs all updates
- Updates are verified before installation
- Prevents man-in-the-middle attacks

### Update Integrity

- Updates are delivered over HTTPS
- Checksums verify update integrity
- Invalid updates are rejected

### User Trust

- Clear communication about updates
- Privacy policy should mention OTA updates
- Users can choose to skip updates

## Advanced Features

### Manual Update Checks

Add a manual update check button in your app:

```typescript
import { useAppUpdates } from './hooks/useAppUpdates';

function SettingsScreen() {
  const { checkForUpdates, isChecking } = useAppUpdates();

  return (
    <Button 
      title={isChecking ? "Checking..." : "Check for Updates"}
      onPress={checkForUpdates}
      disabled={isChecking}
    />
  );
}
```

### Silent Updates

To download updates in the background without prompting:

```typescript
// Modify useAppUpdates.ts
const checkForUpdates = async () => {
  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
    // Update will be applied on next app launch
  }
};
```

### Update Notifications

Integrate with push notifications to notify users about critical updates:

```typescript
import * as Notifications from 'expo-notifications';

async function notifyUpdate() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Update Available",
      body: "A new version is ready to install",
    },
    trigger: null,
  });
}
```

## Resources

- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Expo Updates API Reference](https://docs.expo.dev/versions/latest/sdk/updates/)

## Support

For issues or questions about in-app updates:
- Check the [troubleshooting section](#troubleshooting)
- Review Expo Updates documentation
- Create an issue in the GitHub repository
- Contact the development team

---

**Last Updated**: December 17, 2025
