import { Platform } from 'react-native';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { Reminder } from '../types/reminder';

// Configure default notification handler behavior
try {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('Could not initialize notification handler:', e);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Notifications permissions error:', error);
    return false;
  }
}

export async function scheduleReminderNotification(reminder: Reminder): Promise<string | undefined> {
  if (Platform.OS === 'web' || !reminder.hasNotification || reminder.isCompleted) {
    return undefined;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return undefined;

    // Parse date and time into target Date object
    const [year, month, day] = reminder.date.split('-').map(Number);
    const [hours, minutes] = reminder.time.split(':').map(Number);

    const triggerDate = new Date(year, month - 1, day, hours, minutes, 0);

    // Only schedule if trigger date is in the future
    if (triggerDate.getTime() <= Date.now()) {
      return undefined;
    }

    const notificationId = await scheduleNotificationAsync({
      content: {
        title: `Reminder: ${reminder.title}`,
        body: reminder.notes || `Scheduled for ${reminder.time}`,
        sound: true,
        data: { reminderId: reminder.id },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return undefined;
  }
}

export async function cancelReminderNotification(notificationId?: string): Promise<void> {
  if (Platform.OS === 'web' || !notificationId) return;

  try {
    await cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}
