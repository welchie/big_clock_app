import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, Reminder } from '../types/reminder';
import { CATEGORY_COLORS } from '../constants/themes';
import { getISODateString } from '../utils/dateFormatter';

interface ReminderListProps {
  theme: AppTheme;
  reminders: Reminder[];
  selectedDate: string | null;
  onToggleComplete: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onEditReminder: (reminder: Reminder) => void;
  onAddNewPress: () => void;
}

type FilterTab = 'today' | 'upcoming' | 'all' | 'completed';

export const ReminderList: React.FC<ReminderListProps> = ({
  theme,
  reminders,
  selectedDate,
  onToggleComplete,
  onDeleteReminder,
  onEditReminder,
  onAddNewPress,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('today');
  const todayStr = getISODateString(new Date());

  // Filter logic based on active tab and selected date from calendar
  const filteredReminders = reminders.filter(item => {
    // If a specific calendar date was selected, override tab filter for dates
    if (selectedDate !== null) {
      return item.date === selectedDate;
    }

    if (activeTab === 'completed') {
      return item.isCompleted;
    }

    if (item.isCompleted) return false;

    if (activeTab === 'today') {
      return item.date === todayStr;
    }

    if (activeTab === 'upcoming') {
      return item.date >= todayStr;
    }

    return true; // 'all' tab
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      {/* Header & Tabs */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {selectedDate !== null ? `Reminders for ${selectedDate}` : 'Agenda & Reminders'}
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.accent }]}
            onPress={onAddNewPress}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs Bar (Only when specific date is not selected) */}
        {selectedDate === null && (
          <View style={[styles.tabsRow, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            {(['today', 'upcoming', 'all', 'completed'] as FilterTab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  activeTab === tab && [styles.activeTabItem, { backgroundColor: theme.cardBg }],
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === tab ? theme.accent : theme.textSecondary,
                      fontWeight: activeTab === tab ? '700' : '500',
                    },
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Reminder Items List */}
      <ScrollView style={styles.listScrollView} contentContainerStyle={styles.listContent}>
        {filteredReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>
              No Reminders
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: theme.textSecondary }]}>
              {selectedDate !== null
                ? 'No events scheduled for this day.'
                : 'All caught up! Tap Add to create a new reminder.'}
            </Text>
          </View>
        ) : (
          filteredReminders.map(item => {
            const categoryColor = CATEGORY_COLORS[item.category] || theme.accent;

            return (
              <View
                key={item.id}
                style={[
                  styles.reminderCard,
                  { backgroundColor: theme.bg, borderColor: theme.border },
                  item.isCompleted && styles.completedCard,
                ]}
              >
                {/* Completion Checkbox */}
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { borderColor: item.isCompleted ? theme.accent : theme.border },
                    item.isCompleted && { backgroundColor: theme.accent },
                  ]}
                  onPress={() => onToggleComplete(item.id)}
                >
                  {item.isCompleted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </TouchableOpacity>

                {/* Main Details */}
                <View style={styles.detailsColumn}>
                  <View style={styles.itemHeader}>
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: theme.textPrimary },
                        item.isCompleted && styles.completedTitle,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>

                    {/* Category Tag */}
                    <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                      <Text style={[styles.categoryText, { color: categoryColor }]}>
                        {item.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {item.notes ? (
                    <Text style={[styles.itemNotes, { color: theme.textSecondary }]} numberOfLines={2}>
                      {item.notes}
                    </Text>
                  ) : null}

                  {/* Time & Date Meta */}
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                      {item.time} ({item.date})
                    </Text>

                    {item.hasNotification && (
                      <Ionicons name="notifications" size={12} color={theme.accent} style={{ marginLeft: 6 }} />
                    )}
                  </View>
                </View>

                {/* Edit & Delete Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => onEditReminder(item)}
                  >
                    <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => onDeleteReminder(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabItem: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 12,
  },
  listScrollView: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 10,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyStateSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  completedCard: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  detailsColumn: {
    flex: 1,
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '800',
  },
  itemNotes: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  actionIcon: {
    padding: 4,
  },
});
