import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';

import { Reminder, AppSettings, AppTheme, ClockFontSize } from './types/reminder';
import { THEMES, DEFAULT_THEME } from './constants/themes';
import {
  loadRemindersFromStorage,
  saveRemindersToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  DEFAULT_SETTINGS,
} from './services/storage';
import {
  scheduleReminderNotification,
  cancelReminderNotification,
  requestNotificationPermissions,
} from './services/notifications';
import { generateUniqueId } from './utils/idGenerator';

import { BigClock } from './components/BigClock';
import { CalendarWidget } from './components/CalendarWidget';
import { ReminderList } from './components/ReminderList';
import { AddReminderModal } from './components/AddReminderModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Modals & Panels UI State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // 1. Lock Screen Orientation to Landscape on mount
  useEffect(() => {
    async function lockLandscape() {
      if (Platform.OS !== 'web') {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } catch (err) {
          console.warn('Could not lock landscape orientation:', err);
        }
      }
    }
    lockLandscape();
  }, []);

  // 2. Handle Keep Awake according to settings
  useEffect(() => {
    if (settings.keepAwake) {
      activateKeepAwakeAsync('big-clock-keepawake').catch(e => console.warn(e));
    } else {
      deactivateKeepAwake('big-clock-keepawake').catch(e => console.warn(e));
    }
  }, [settings.keepAwake]);

  // 3. Live 1-Second Timer Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. Initial Load from Persistent Storage & Notifications Setup
  useEffect(() => {
    async function initData() {
      const storedSettings = await loadSettingsFromStorage();
      const storedReminders = await loadRemindersFromStorage();

      setSettings(storedSettings);
      setReminders(storedReminders);

      if (Platform.OS !== 'web') {
        await requestNotificationPermissions();
      }
    }
    initData();
  }, []);

  // 5. Save Reminders helper
  const handleUpdateReminders = async (newReminders: Reminder[]) => {
    setReminders(newReminders);
    await saveRemindersToStorage(newReminders);
  };

  // 6. Save Settings helper
  const handleUpdateSettings = async (partialSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...partialSettings };
    setSettings(updated);
    await saveSettingsToStorage(updated);
  };

  const handleCycleFontSize = () => {
    const order: ClockFontSize[] = ['small', 'medium', 'large', 'huge'];
    const currentIndex = order.indexOf(settings.clockFontSize || 'medium');
    const nextIndex = (currentIndex + 1) % order.length;
    handleUpdateSettings({ clockFontSize: order[nextIndex] });
  };

  // Reminder Actions
  const handleToggleComplete = async (id: string) => {
    const updated = reminders.map(r => {
      if (r.id === id) {
        const nextCompleted = !r.isCompleted;
        if (nextCompleted && r.notificationId) {
          cancelReminderNotification(r.notificationId);
        }
        return { ...r, isCompleted: nextCompleted };
      }
      return r;
    });
    await handleUpdateReminders(updated);
  };

  const handleDeleteReminder = async (id: string) => {
    const target = reminders.find(r => r.id === id);
    if (target?.notificationId) {
      await cancelReminderNotification(target.notificationId);
    }
    const updated = reminders.filter(r => r.id !== id);
    await handleUpdateReminders(updated);
  };

  const handleSaveReminder = async (
    reminderData: Omit<Reminder, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    let updatedReminders: Reminder[] = [];

    if (editingId) {
      // Edit existing
      const existing = reminders.find(r => r.id === editingId);
      if (existing?.notificationId) {
        await cancelReminderNotification(existing.notificationId);
      }

      const updatedObj: Reminder = {
        ...reminderData,
        id: editingId,
        createdAt: existing ? existing.createdAt : Date.now(),
      };

      if (updatedObj.hasNotification && !updatedObj.isCompleted) {
        const notifId = await scheduleReminderNotification(updatedObj);
        updatedObj.notificationId = notifId;
      }

      updatedReminders = reminders.map(r => (r.id === editingId ? updatedObj : r));
    } else {
      // Create new
      const newObj: Reminder = {
        ...reminderData,
        id: generateUniqueId('rem'),
        createdAt: Date.now(),
      };

      if (newObj.hasNotification) {
        const notifId = await scheduleReminderNotification(newObj);
        newObj.notificationId = notifId;
      }

      updatedReminders = [newObj, ...reminders];
    }

    await handleUpdateReminders(updatedReminders);
  };

  const activeTheme: AppTheme = THEMES[settings.themeId] || DEFAULT_THEME;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: activeTheme.bg }]}>
      <StatusBar style={activeTheme.id === 'soft-pastel' ? 'dark' : 'light'} hidden={false} />

      {/* Tablet Landscape Container */}
      <View style={styles.landscapeLayout}>
        {/* Left Column: Ambient Big Clock */}
        <View style={styles.leftColumn}>
          <BigClock
            currentTime={currentTime}
            theme={activeTheme}
            settings={settings}
            onToggleNightMode={() =>
              handleUpdateSettings({ nightModeDim: !settings.nightModeDim })
            }
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onCycleFontSize={handleCycleFontSize}
          />

          {/* Toggle Panel Floating Action Button */}
          <TouchableOpacity
            style={[
              styles.sidebarToggleBtn,
              { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border },
            ]}
            onPress={() => setIsSidebarVisible(prev => !prev)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSidebarVisible ? 'chevron-forward' : 'calendar'}
              size={18}
              color={activeTheme.accent}
            />
            <Text style={[styles.sidebarToggleText, { color: activeTheme.textPrimary }]}>
              {isSidebarVisible ? 'Hide Calendar' : 'Show Calendar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Column: Calendar & Reminders Dashboard */}
        {isSidebarVisible && (
          <View style={styles.rightColumn}>
            {/* Top: Mini Month Calendar Matrix */}
            <CalendarWidget
              theme={activeTheme}
              reminders={reminders}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* Bottom: Reminders & Agenda List */}
            <ReminderList
              theme={activeTheme}
              reminders={reminders}
              selectedDate={selectedDate}
              onToggleComplete={handleToggleComplete}
              onDeleteReminder={handleDeleteReminder}
              onEditReminder={item => {
                setEditingReminder(item);
                setIsAddModalOpen(true);
              }}
              onAddNewPress={() => {
                setEditingReminder(null);
                setIsAddModalOpen(true);
              }}
            />
          </View>
        )}
      </View>

      {/* Add / Edit Reminder Modal */}
      <AddReminderModal
        visible={isAddModalOpen}
        theme={activeTheme}
        editingReminder={editingReminder}
        initialDate={selectedDate}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingReminder(null);
        }}
        onSave={handleSaveReminder}
      />

      {/* Settings Preferences Modal */}
      <SettingsModal
        visible={isSettingsModalOpen}
        theme={activeTheme}
        settings={settings}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateSettings={handleUpdateSettings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  landscapeLayout: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  leftColumn: {
    flex: 1.2,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  rightColumn: {
    flex: 1,
    gap: 12,
  },
  sidebarToggleBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    zIndex: 20,
    elevation: 4,
  },
  sidebarToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
