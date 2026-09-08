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

/**
 * Type guard to validate whether an unknown object conforms to the Reminder interface.
 */
export function isValidReminder(item: unknown): item is Reminder {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.title === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.time === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.isCompleted === 'boolean' &&
    typeof candidate.hasNotification === 'boolean' &&
    typeof candidate.createdAt === 'number'
  );
}

/**
 * Validates that an unknown input is an array and filters out any malformed reminders.
 */
export function validateRemindersArray(data: unknown): Reminder[] {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter(isValidReminder);
}

/**
 * Safely parses and validates settings, ensuring required keys and types exist.
 */
export function validateSettingsObject(data: unknown): AppSettings {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ...DEFAULT_SETTINGS };
  }
  const parsed = data as Partial<AppSettings>;
  const validFontSizes = ['small', 'medium', 'large', 'huge'];
  const clockFontSize = validFontSizes.includes(parsed.clockFontSize as string)
    ? (parsed.clockFontSize as AppSettings['clockFontSize'])
    : DEFAULT_SETTINGS.clockFontSize;

  return {
    timeFormat12h: typeof parsed.timeFormat12h === 'boolean' ? parsed.timeFormat12h : DEFAULT_SETTINGS.timeFormat12h,
    showSeconds: typeof parsed.showSeconds === 'boolean' ? parsed.showSeconds : DEFAULT_SETTINGS.showSeconds,
    keepAwake: typeof parsed.keepAwake === 'boolean' ? parsed.keepAwake : DEFAULT_SETTINGS.keepAwake,
    themeId: typeof parsed.themeId === 'string' && parsed.themeId.length > 0 ? parsed.themeId : DEFAULT_SETTINGS.themeId,
    nightModeDim: typeof parsed.nightModeDim === 'boolean' ? parsed.nightModeDim : DEFAULT_SETTINGS.nightModeDim,
    brightnessLevel:
      typeof parsed.brightnessLevel === 'number' && parsed.brightnessLevel >= 0 && parsed.brightnessLevel <= 1.0
        ? parsed.brightnessLevel
        : DEFAULT_SETTINGS.brightnessLevel,
    clockFontSize,
  };
}

export async function loadRemindersFromStorage(): Promise<Reminder[]> {
  try {
    const json = await AsyncStorage.getItem(REMINDERS_KEY);
    if (json !== null) {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          return parsed.filter(isValidReminder);
        }
        console.warn('Corrupted reminders in storage (not an array), recovering with initial sample.');
      } catch (parseError) {
        console.warn('Failed to parse reminders JSON from storage:', parseError);
      }
    }
    // Return sample reminders on first app launch or corrupted storage
    await saveRemindersToStorage(INITIAL_SAMPLE_REMINDERS);
    return INITIAL_SAMPLE_REMINDERS;
  } catch (error) {
    console.error('Error loading reminders from storage:', error);
    return INITIAL_SAMPLE_REMINDERS;
  }
}

export async function saveRemindersToStorage(reminders: Reminder[]): Promise<void> {
  try {
    const valid = validateRemindersArray(reminders);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(valid));
  } catch (error) {
    console.error('Error saving reminders to storage:', error);
  }
}

export async function loadSettingsFromStorage(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json !== null) {
      try {
        const parsed = JSON.parse(json);
        return validateSettingsObject(parsed);
      } catch (parseError) {
        console.warn('Failed to parse settings JSON from storage:', parseError);
      }
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings from storage:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettingsToStorage(settings: AppSettings): Promise<void> {
  try {
    const valid = validateSettingsObject(settings);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(valid));
  } catch (error) {
    console.error('Error saving settings to storage:', error);
  }
}
