export type ReminderCategory = 'work' | 'personal' | 'health' | 'event' | 'other';

export interface Reminder {
  id: string;
  title: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: ReminderCategory;
  color?: string;
  isCompleted: boolean;
  hasNotification: boolean;
  notificationId?: string;
  createdAt: number;
}

export interface AppTheme {
  id: string;
  name: string;
  bg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  clockText: string;
  border: string;
  nightOverlay: string;
}

export type ClockFontSize = 'small' | 'medium' | 'large' | 'huge';

export interface AppSettings {
  timeFormat12h: boolean;
  showSeconds: boolean;
  keepAwake: boolean;
  themeId: string;
  nightModeDim: boolean;
  brightnessLevel: number; // 0.1 to 1.0
  clockFontSize: ClockFontSize;
}

