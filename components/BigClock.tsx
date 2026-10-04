import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent } from 'react-native';
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
  const [layoutDimensions, setLayoutDimensions] = useState<{ width: number; height: number } | null>(null);

  const { hours, minutes, seconds, period } = formatTimeComponents(
    currentTime,
    settings.timeFormat12h
  );

  const ordinalDateStr = getOrdinalDateString(currentTime);
  const yearStr = currentTime.getFullYear().toString();
  const weekNum = getWeekNumber(currentTime);
  const fontScale = getClockFontScale(settings.clockFontSize);

  const onClockLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setLayoutDimensions(prev => {
        if (prev && Math.abs(prev.width - width) < 2 && Math.abs(prev.height - height) < 2) {
          return prev;
        }
        return { width, height };
      });
    }
  };

  // Dynamic responsive scaling ensures full 180pt/216pt on tablets while gracefully adapting if column is compact
  let scale = 1.0;
  if (layoutDimensions && layoutDimensions.width > 0 && layoutDimensions.height > 0) {
    const timeWidth = 2.7 * fontScale.timeSize;
    const secondsWidth = settings.showSeconds ? 1.5 * fontScale.secondsSize + 4 : 0;
    const periodWidth = settings.timeFormat12h ? 1.4 * fontScale.periodSize + 12 : 0;
    const totalTimeRowWidth = timeWidth + secondsWidth + periodWidth + 16;

    const fullDateLen = ordinalDateStr.length + yearStr.length + 1;
    const totalDateWidth = fullDateLen * 0.52 * fontScale.dateSize + 16;

    const totalHeight = fontScale.timeSize * 1.1 + fontScale.dateSize * 1.2 + 20;

    const widthScale = layoutDimensions.width / Math.max(totalTimeRowWidth, totalDateWidth);
    const heightScale = layoutDimensions.height / totalHeight;

    scale = Math.min(1.0, widthScale, heightScale);
  }

  const effectiveTimeSize = Math.max(48, Math.round(fontScale.timeSize * scale));
  const effectiveSecondsSize = Math.max(16, Math.round(fontScale.secondsSize * scale));
  const effectivePeriodSize = Math.max(14, Math.round(fontScale.periodSize * scale));
  const effectiveDateSize = Math.max(16, Math.round(fontScale.dateSize * scale));
  const effectiveYearSize = Math.max(14, Math.round(fontScale.yearSize * scale));

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
      <View style={styles.clockSection} onLayout={onClockLayout}>
        <View style={styles.timeRow}>
          {/* Hours & Minutes */}
          <Text
            style={[
              styles.timeDigits,
              { color: theme.clockText, fontSize: effectiveTimeSize },
            ]}
            numberOfLines={1}
          >
            {hours}:{minutes}
          </Text>

          {/* Seconds */}
          {settings.showSeconds && (
            <Text
              style={[
                styles.secondsText,
                { color: theme.textSecondary, fontSize: effectiveSecondsSize },
              ]}
              numberOfLines={1}
            >
              :{seconds}
            </Text>
          )}

          {/* AM/PM */}
          {settings.timeFormat12h && (
            <Text
              style={[
                styles.periodText,
                { color: theme.accent, fontSize: effectivePeriodSize },
              ]}
              numberOfLines={1}
            >
              {period}
            </Text>
          )}
        </View>

        {/* Prominent Day & Date Display (e.g. Tuesday 8th September 2026) */}
        <View style={styles.dateContainer}>
          <Text
            style={[
              styles.ordinalDateText,
              { color: theme.textPrimary, fontSize: effectiveDateSize },
            ]}
            numberOfLines={1}
          >
            {ordinalDateStr}
          </Text>
          <Text
            style={[
              styles.yearText,
              { color: theme.textSecondary, fontSize: effectiveYearSize },
            ]}
            numberOfLines={1}
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
    padding: 20,
    paddingBottom: 24,
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
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    maxWidth: '100%',
  },
  timeDigits: {
    fontSize: 96,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  secondsText: {
    fontSize: 32,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginLeft: 2,
  },
  periodText: {
    fontSize: 28,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 1,
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
