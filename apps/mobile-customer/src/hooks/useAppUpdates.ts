import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

interface UpdateInfo {
  isUpdateAvailable: boolean;
  isUpdatePending: boolean;
  isChecking: boolean;
  isDownloading: boolean;
  error: string | null;
}

export const useAppUpdates = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    isUpdateAvailable: false,
    isUpdatePending: false,
    isChecking: false,
    isDownloading: false,
    error: null,
  });

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      if (!Updates.isEnabled) {
        console.log('Updates are not enabled');
        return;
      }

      setUpdateInfo((prev) => ({ ...prev, isChecking: true, error: null }));

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdateInfo((prev) => ({ ...prev, isUpdateAvailable: true, isChecking: false }));
        
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Would you like to download it now?',
          [
            {
              text: 'Later',
              style: 'cancel',
              onPress: () => setUpdateInfo((prev) => ({ ...prev, isChecking: false })),
            },
            {
              text: 'Update',
              onPress: () => downloadAndInstallUpdate(),
            },
          ],
          { cancelable: false }
        );
      } else {
        setUpdateInfo((prev) => ({ ...prev, isChecking: false }));
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateInfo((prev) => ({
        ...prev,
        isChecking: false,
        error: error instanceof Error ? error.message : 'Failed to check for updates',
      }));
    }
  };

  const downloadAndInstallUpdate = async () => {
    try {
      setUpdateInfo((prev) => ({ ...prev, isDownloading: true, error: null }));

      await Updates.fetchUpdateAsync();

      setUpdateInfo((prev) => ({ ...prev, isDownloading: false, isUpdatePending: true }));

      Alert.alert(
        'Update Downloaded',
        'The update has been downloaded. The app will restart to apply the update.',
        [
          {
            text: 'Restart Now',
            onPress: async () => {
              await Updates.reloadAsync();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error downloading update:', error);
      setUpdateInfo((prev) => ({
        ...prev,
        isDownloading: false,
        error: error instanceof Error ? error.message : 'Failed to download update',
      }));
      
      Alert.alert(
        'Update Failed',
        'Failed to download the update. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const manualCheckForUpdates = () => {
    checkForUpdates();
  };

  return {
    ...updateInfo,
    checkForUpdates: manualCheckForUpdates,
  };
};
