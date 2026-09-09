import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, Reminder } from '../types/reminder';
import { getMonthCalendarMatrix, getISODateString, CalendarDay } from '../utils/dateFormatter';

interface CalendarWidgetProps {
  theme: AppTheme;
  reminders: Reminder[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  theme,
  reminders,
  selectedDate,
  onSelectDate,
  isCollapsed: isCollapsedProp,
  onToggleCollapse,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = isCollapsedProp !== undefined ? isCollapsedProp : internalCollapsed;

  const toggleCollapse = () => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(prev => !prev);
    }
  };

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map dates with active reminders to quickly render dot indicators
  const datesWithReminders = new Set(
    reminders.filter(r => !r.isCompleted).map(r => r.date)
  );

  const matrix = getMonthCalendarMatrix(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleResetToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    onSelectDate(getISODateString(today));
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
        isCollapsed && styles.cardCollapsed,
      ]}
    >
      {/* Calendar Header with Navigation & Collapse Toggle */}
      <View style={[styles.header, isCollapsed && styles.headerCollapsed]}>
        <TouchableOpacity
          style={styles.titleClickable}
          onPress={toggleCollapse}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={isCollapsed ? 'Expand calendar' : 'Collapse calendar'}
          accessibilityRole="button"
        >
          <Text style={[styles.monthYearTitle, { color: theme.textPrimary }]}>
            {monthsList[currentMonth]} {currentYear}
          </Text>
          <Ionicons
            name={isCollapsed ? 'chevron-down' : 'chevron-up'}
            size={14}
            color={theme.accent}
          />
        </TouchableOpacity>

        <View style={styles.navRow}>
          {selectedDate !== null && (
            <TouchableOpacity
              style={[styles.allButton, { backgroundColor: theme.bg, borderColor: theme.border }]}
              onPress={() => onSelectDate(null)}
            >
              <Text style={[styles.allButtonText, { color: theme.accent }]}>All</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.todayButton, { backgroundColor: theme.bg, borderColor: theme.border }]}
            onPress={handleResetToToday}
          >
            <Text style={[styles.todayButtonText, { color: theme.textSecondary }]}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={handlePrevMonth}
            accessibilityLabel="Previous month"
          >
            <Ionicons name="chevron-back" size={16} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={handleNextMonth}
            accessibilityLabel="Next month"
          >
            <Ionicons name="chevron-forward" size={16} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.collapseToggleBtn,
              { backgroundColor: theme.bg, borderColor: theme.border },
            ]}
            onPress={toggleCollapse}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={isCollapsed ? 'Expand calendar' : 'Collapse calendar'}
          >
            <Ionicons
              name={isCollapsed ? 'chevron-down' : 'chevron-up'}
              size={13}
              color={theme.accent}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday Labels Header & Days Grid (Only rendered when expanded) */}
      {!isCollapsed && (
        <>
          <View style={styles.weekHeadersRow}>
            {weekDayHeaders.map((day, idx) => (
              <Text key={idx} style={[styles.weekHeaderCell, { color: theme.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {matrix.map((week, wIdx) => (
              <View key={wIdx} style={styles.weekRow}>
            {week.map((cell: CalendarDay, cIdx: number) => {
              const isSelected = selectedDate === cell.dateString;
              const hasReminder = datesWithReminders.has(cell.dateString);

              return (
                <TouchableOpacity
                  key={cIdx}
                  style={[
                    styles.dayCell,
                    cell.isToday && [styles.todayCell, { borderColor: theme.accent }],
                    isSelected && [styles.selectedCell, { backgroundColor: theme.accent }],
                  ]}
                  onPress={() => onSelectDate(isSelected ? null : cell.dateString)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: !cell.isCurrentMonth
                          ? theme.textSecondary + '50'
                          : isSelected
                          ? '#FFFFFF'
                          : cell.isToday
                          ? theme.accent
                          : theme.textPrimary,
                      },
                      cell.isToday && styles.todayDayText,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {cell.dayNumber}
                  </Text>

                  {/* Reminder Marker Dot */}
                  {hasReminder && (
                    <View
                      style={[
                        styles.dotMarker,
                        { backgroundColor: isSelected ? '#FFFFFF' : theme.accent },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
  },
  cardCollapsed: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerCollapsed: {
    marginBottom: 0,
  },
  titleClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  collapseToggleBtn: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  allButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  allButtonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  arrowButton: {
    padding: 2,
  },
  weekHeadersRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
  },
  grid: {
    gap: 2,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 2,
  },
  dayCell: {
    flex: 1,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    position: 'relative',
  },
  todayCell: {
    borderWidth: 1.5,
  },
  selectedCell: {
    borderRadius: 6,
  },
  dayText: {
    fontSize: 11,
    fontWeight: '500',
  },
  todayDayText: {
    fontWeight: '700',
  },
  selectedDayText: {
    fontWeight: '700',
  },
  dotMarker: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
    bottom: 1,
  },
});
