import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, Reminder, ReminderCategory } from '../types/reminder';
import { CATEGORY_COLORS } from '../constants/themes';
import { getISODateString } from '../utils/dateFormatter';
import { isValidISODate, isValidTime24 } from '../utils/validators';
import { INPUT_LIMITS, sanitizeInputLength } from '../constants/inputLimits';

interface AddReminderModalProps {
  visible: boolean;
  theme: AppTheme;
  editingReminder?: Reminder | null;
  initialDate?: string | null;
  onClose: () => void;
  onSave: (reminderData: Omit<Reminder, 'id' | 'createdAt'>, editingId?: string) => void;
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  visible,
  theme,
  editingReminder,
  initialDate,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(initialDate || getISODateString(new Date()));
  const [time, setTime] = useState('12:00');
  const [category, setCategory] = useState<ReminderCategory>('work');
  const [hasNotification, setHasNotification] = useState(true);

  useEffect(() => {
    if (editingReminder) {
      setTitle(editingReminder.title);
      setNotes(editingReminder.notes || '');
      setDate(editingReminder.date);
      setTime(editingReminder.time);
      setCategory(editingReminder.category);
      setHasNotification(editingReminder.hasNotification);
    } else {
      setTitle('');
      setNotes('');
      setDate(initialDate || getISODateString(new Date()));

      // Default time: next upcoming rounded hour
      const now = new Date();
      const currentHour = (now.getHours() + 1) % 24;
      setTime(`${currentHour.toString().padStart(2, '0')}:00`);

      setCategory('work');
      setHasNotification(true);
    }
  }, [editingReminder, initialDate, visible]);

  const categories: ReminderCategory[] = ['work', 'personal', 'health', 'event', 'other'];

  const isDateValid = isValidISODate(date.trim());
  const isTimeValid = isValidTime24(time.trim());
  const isFormValid = title.trim().length > 0 && isDateValid && isTimeValid;

  const handleSave = () => {
    if (!isFormValid) return;

    onSave(
      {
        title: sanitizeInputLength(title.trim(), INPUT_LIMITS.TITLE_MAX_LENGTH),
        notes: notes.trim()
          ? sanitizeInputLength(notes.trim(), INPUT_LIMITS.NOTES_MAX_LENGTH)
          : undefined,
        date: sanitizeInputLength(date.trim(), INPUT_LIMITS.DATE_MAX_LENGTH),
        time: sanitizeInputLength(time.trim(), INPUT_LIMITS.TIME_MAX_LENGTH),
        category,
        isCompleted: editingReminder ? editingReminder.isCompleted : false,
        hasNotification,
      },
      editingReminder ? editingReminder.id : undefined
    );

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {editingReminder ? 'Edit Reminder' : 'New Reminder'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Title *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary },
                ]}
                placeholder="Reminder title (e.g. Doctor appointment)"
                placeholderTextColor={theme.textSecondary + '70'}
                maxLength={INPUT_LIMITS.TITLE_MAX_LENGTH}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
              <View style={styles.categoryRow}>
                {categories.map(cat => {
                  const catColor = CATEGORY_COLORS[cat];
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        { backgroundColor: isSelected ? catColor : theme.bg, borderColor: catColor },
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          { color: isSelected ? '#FFFFFF' : catColor },
                        ]}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Date & Time Input Row */}
            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.bg,
                      borderColor: !isDateValid && date.trim().length > 0 ? '#EF4444' : theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="2026-09-08"
                  placeholderTextColor={theme.textSecondary + '70'}
                  maxLength={INPUT_LIMITS.DATE_MAX_LENGTH}
                  value={date}
                  onChangeText={setDate}
                />
                {!isDateValid && date.trim().length > 0 && (
                  <Text style={styles.errorHint}>Use YYYY-MM-DD</Text>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Time (HH:mm)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.bg,
                      borderColor: !isTimeValid && time.trim().length > 0 ? '#EF4444' : theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="14:30"
                  placeholderTextColor={theme.textSecondary + '70'}
                  maxLength={INPUT_LIMITS.TIME_MAX_LENGTH}
                  value={time}
                  onChangeText={setTime}
                />
                {!isTimeValid && time.trim().length > 0 && (
                  <Text style={styles.errorHint}>Use 24h (e.g. 14:30)</Text>
                )}
              </View>
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Notes (Optional)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary },
                ]}
                placeholder="Additional details..."
                placeholderTextColor={theme.textSecondary + '70'}
                maxLength={INPUT_LIMITS.NOTES_MAX_LENGTH}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Notification Alert Toggle */}
            <View style={[styles.switchRow, { borderColor: theme.border }]}>
              <View style={styles.switchLabelGroup}>
                <Ionicons name="notifications-outline" size={20} color={theme.accent} />
                <View>
                  <Text style={[styles.switchTitle, { color: theme.textPrimary }]}>
                    Scheduled Alert
                  </Text>
                  <Text style={[styles.switchSubtitle, { color: theme.textSecondary }]}>
                    Notify when reminder time arrives
                  </Text>
                </View>
              </View>
              <Switch
                value={hasNotification}
                onValueChange={setHasNotification}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: theme.accent, opacity: isFormValid ? 1 : 0.5 },
              ]}
              onPress={handleSave}
              disabled={!isFormValid}
            >
              <Text style={styles.saveBtnText}>
                {editingReminder ? 'Save Changes' : 'Create Reminder'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  switchLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchSubtitle: {
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  errorHint: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
