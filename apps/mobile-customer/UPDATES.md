# Pharmacy Customer App - In-App Updates

## Overview

This app supports Over-The-Air (OTA) updates using Expo Updates. Users receive automatic notifications when new updates are available and can install them without visiting the app store.

## Features

- ✅ Automatic update checking on app launch
- ✅ User-friendly update prompts
- ✅ Progress tracking during downloads
- ✅ Graceful error handling
- ✅ Manual update check option

## How Updates Work

1. **App Launch**: The app automatically checks for updates when opened
2. **Notification**: If an update is available, users see an alert
3. **User Choice**: Users can choose to update now or later
4. **Download**: The update downloads in the background
5. **Restart**: After download, the app restarts to apply the update

## Configuration

### app.json
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

### Update Channels

- **development**: For internal testing
- **preview**: For QA and beta testing
- **production**: For end users

## Publishing Updates

### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Publish to Production
```bash
cd apps/mobile-customer
eas update --branch production --message "Bug fixes and improvements"
```

### Publish to Preview
```bash
eas update --branch preview --message "New features for testing"
```

## Testing Updates Locally

1. Build a development app:
   ```bash
   eas build --profile development --platform android
   ```

2. Install the app on your device

3. Publish an update:
   ```bash
   eas update --branch development --message "Test update"
   ```

4. Close and reopen the app to receive the update

## Implementation Details

### useAppUpdates Hook

Location: `src/hooks/useAppUpdates.ts`

This custom hook manages all update functionality:

```typescript
const {
  isUpdateAvailable,    // Is an update available?
  isUpdatePending,      // Is an update downloaded and pending restart?
  isChecking,           // Currently checking for updates?
  isDownloading,        // Currently downloading an update?
  error,                // Any error that occurred
  checkForUpdates,      // Manually trigger update check
} = useAppUpdates();
```

### Integration in App.tsx

```typescript
import { useAppUpdates } from './src/hooks/useAppUpdates';

export default function App() {
  useAppUpdates(); // Initializes automatic update checking
  // ... rest of app
}
```

## What Can Be Updated

✅ **Yes - Can update via OTA:**
- JavaScript/TypeScript code changes
- React components
- Business logic
- UI styling
- Assets (images, fonts)
- Bug fixes
- Performance improvements

❌ **No - Requires new app store build:**
- Native code changes
- New native dependencies
- Permission changes
- Expo SDK upgrades
- Changes to app.json affecting native configuration

## Best Practices

1. **Test First**: Always test updates on preview channel before production
2. **Clear Messages**: Use descriptive update messages
3. **Small Changes**: Keep updates focused and manageable
4. **Monitor**: Watch for errors after deployment
5. **Rollback Ready**: Keep previous versions for quick rollback

## Troubleshooting

### Update Not Detected

1. Check the update channel matches your build
2. Verify `updates.enabled` is `true` in app.json
3. Ensure you're connected to the internet
4. Try clearing the app cache and restarting

### Download Fails

1. Check internet connection
2. Verify Expo services are accessible
3. Check console logs for specific errors
4. Try again later

### App Crashes After Update

1. Immediately rollback:
   ```bash
   eas update --branch production --republish [PREVIOUS_UPDATE_ID]
   ```
2. Review error logs
3. Test the fix locally
4. Republish when ready

## Security

- All updates are code-signed by Expo
- Updates are delivered over HTTPS
- Checksums verify update integrity
- Invalid updates are automatically rejected

## For More Information

See the main [IN-APP-UPDATES.md](../../../docs/IN-APP-UPDATES.md) documentation for comprehensive details.

## Support

For issues or questions:
- Review troubleshooting section above
- Check [Expo Updates documentation](https://docs.expo.dev/versions/latest/sdk/updates/)
- Create an issue in the GitHub repository
