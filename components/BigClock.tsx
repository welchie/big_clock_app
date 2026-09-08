import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, AppSettings } from '../types/reminder';
import { formatTimeComponents, getOrdinalDateString, getWeekNumber } from '../utils/dateFormatter';
import { getClockFontScale } from '../constants/fontSizes';

interface BigClockProps {
  currentTime: Date;
  theme: AppTheme;
  settings: AppSettings;
  onToggleNightMode: () => void;
  onOpenSettings: () => void;
  onCycleFontSize?: () => void;
}

export const BigClock: React.FC<BigClockProps> = ({
  currentTime,
  theme,
  settings,
  onToggleNightMode,
  onOpenSettings,
  onCycleFontSize,
}) => {
  const { hours, minutes, seconds, period } = formatTimeComponents(
    currentTime,
    settings.timeFormat12h
  );

  const ordinalDateStr = getOrdinalDateString(currentTime);
  const yearStr = currentTime.getFullYear().toString();
  const weekNum = getWeekNumber(currentTime);
  const fontScale = getClockFontScale(settings.clockFontSize);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Top Ambient Info Bar */}
      <View style={styles.topBar}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Ionicons name="calendar-outline" size={14} color={theme.accent} />
            <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
              Week {weekNum}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.badgeText, { color: theme.accent }]}>
              {settings.timeFormat12h ? '12H' : '24H'}
            </Text>
          </View>
          {onCycleFontSize ? (
            <TouchableOpacity
              style={[styles.badge, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              onPress={onCycleFontSize}
              activeOpacity={0.7}
              accessibilityLabel={`Clock font size: ${fontScale.label}. Tap to change.`}
            >
              <Ionicons name="text-outline" size={13} color={theme.accent} />
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                {fontScale.label}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.badge, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <Ionicons name="text-outline" size={13} color={theme.accent} />
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                {fontScale.label}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Action Icons */}
        <View style={styles.actionsRow}>
          {onCycleFontSize && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              onPress={onCycleFontSize}
              activeOpacity={0.7}
              accessibilityLabel="Cycle clock font size"
            >
              <Ionicons name="text-outline" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={onToggleNightMode}
            activeOpacity={0.7}
            accessibilityLabel="Toggle night mode"
          >
            <Ionicons
              name={settings.nightModeDim ? 'moon' : 'moon-outline'}
              size={18}
              color={settings.nightModeDim ? theme.accent : theme.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={onOpenSettings}
            activeOpacity={0.7}
            accessibilityLabel="Open settings"
          >
            <Ionicons name="settings-outline" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Digital Clock Container */}
      <View style={styles.clockSection}>
        <View style={styles.timeRow}>
          {/* Hours & Minutes */}
          <Text
            style={[
              styles.timeDigits,
              { color: theme.clockText, fontSize: fontScale.timeSize },
            ]}
          >
            {hours}:{minutes}
          </Text>

          {/* Seconds & AM/PM Column */}
          <View style={styles.metaColumn}>
            {settings.timeFormat12h && (
              <Text
                style={[
                  styles.periodText,
                  { color: theme.accent, fontSize: fontScale.periodSize },
                ]}
              >
                {period}
              </Text>
            )}
            {settings.showSeconds && (
              <Text
                style={[
                  styles.secondsText,
                  { color: theme.textSecondary, fontSize: fontScale.secondsSize },
                ]}
              >
                :{seconds}
              </Text>
            )}
          </View>
        </View>

        {/* Prominent Day & Date Display (e.g. Tuesday 8th September 2026) */}
        <View style={styles.dateContainer}>
          <Text
            style={[
              styles.ordinalDateText,
              { color: theme.textPrimary, fontSize: fontScale.dateSize },
            ]}
          >
            {ordinalDateStr}
          </Text>
          <Text
            style={[
              styles.yearText,
              { color: theme.textSecondary, fontSize: fontScale.yearSize },
            ]}
          >
            {yearStr}
          </Text>
        </View>
      </View>

      {/* Dim Overlay when Night Mode is enabled */}
      {settings.nightModeDim && (
        <View
          style={[styles.nightOverlay, { backgroundColor: theme.nightOverlay }]}
          pointerEvents="none"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    position: 'relative',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  timeDigits: {
    fontSize: 96,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  metaColumn: {
    marginLeft: 12,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  periodText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  secondsText: {
    fontSize: 32,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
    gap: 12,
  },
  ordinalDateText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  yearText: {
    fontSize: 26,
    fontWeight: '400',
  },
  nightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
