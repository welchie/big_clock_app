import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder, AppSettings } from '../types/reminder';
import { getISODateString } from '../utils/dateFormatter';

const REMINDERS_KEY = '@big_clock_reminders_v1';
const SETTINGS_KEY = '@big_clock_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  timeFormat12h: true,
  showSeconds: true,
  keepAwake: true,
  themeId: 'oled-dark',
  nightModeDim: false,
  brightnessLevel: 1.0,
  clockFontSize: 'medium',
};

export const INITIAL_SAMPLE_REMINDERS: Reminder[] = [
  {
    id: 'sample-1',
    title: 'Morning Team Standup',
    notes: 'Discuss big clock app progress',
    date: getISODateString(new Date()),
    time: '10:30',
    category: 'work',
    isCompleted: false,
    hasNotification: true,
    createdAt: Date.now(),
  },
  {
    id: 'sample-2',
    title: 'Hydration & Stretch Break',
    notes: 'Take 5 minutes to rest eyes',
    date: getISODateString(new Date()),
    time: '14:00',
    category: 'health',
    isCompleted: false,
    hasNotification: false,
    createdAt: Date.now() - 1000,
  },
  {
    id: 'sample-3',
    title: 'Project Planning Sync',
    notes: 'Review calendar reminder features',
    date: getISODateString(new Date(Date.now() + 86400000)),
    time: '15:30',
    category: 'event',
    isCompleted: false,
    hasNotification: true,
    createdAt: Date.now() - 2000,
  },
];

export async function loadRemindersFromStorage(): Promise<Reminder[]> {
  try {
    const json = await AsyncStorage.getItem(REMINDERS_KEY);
    if (json !== null) {
      return JSON.parse(json);
    }
    // Return sample reminders on first app launch
    await saveRemindersToStorage(INITIAL_SAMPLE_REMINDERS);
    return INITIAL_SAMPLE_REMINDERS;
  } catch (error) {
    console.error('Error loading reminders from storage:', error);
    return INITIAL_SAMPLE_REMINDERS;
  }
}

export async function saveRemindersToStorage(reminders: Reminder[]): Promise<void> {
  try {
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error('Error saving reminders to storage:', error);
  }
}

export async function loadSettingsFromStorage(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json !== null) {
      const parsed = JSON.parse(json);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        clockFontSize: parsed.clockFontSize || DEFAULT_SETTINGS.clockFontSize,
      };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings from storage:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettingsToStorage(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to storage:', error);
  }
}
