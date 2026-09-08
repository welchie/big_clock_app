import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, Reminder } from '../types/reminder';
import { getMonthCalendarMatrix, getISODateString, CalendarDay } from '../utils/dateFormatter';

interface CalendarWidgetProps {
  theme: AppTheme;
  reminders: Reminder[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  theme,
  reminders,
  selectedDate,
  onSelectDate,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

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
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      {/* Calendar Header with Navigation */}
      <View style={styles.header}>
        <Text style={[styles.monthYearTitle, { color: theme.textPrimary }]}>
          {monthsList[currentMonth]} {currentYear}
        </Text>

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

          <TouchableOpacity style={styles.arrowButton} onPress={handlePrevMonth}>
            <Ionicons name="chevron-back" size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.arrowButton} onPress={handleNextMonth}>
            <Ionicons name="chevron-forward" size={18} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday Labels Header */}
      <View style={styles.weekHeadersRow}>
        {weekDayHeaders.map((day, idx) => (
          <Text key={idx} style={[styles.weekHeaderCell, { color: theme.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthYearTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  allButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  allButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  arrowButton: {
    padding: 4,
  },
  weekHeadersRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  todayCell: {
    borderWidth: 1.5,
  },
  selectedCell: {
    borderRadius: 8,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  todayDayText: {
    fontWeight: '700',
  },
  selectedDayText: {
    fontWeight: '700',
  },
  dotMarker: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 3,
  },
});
