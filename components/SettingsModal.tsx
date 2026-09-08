import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, AppSettings } from '../types/reminder';
import { THEMES } from '../constants/themes';
import {
  CLOCK_FONT_SIZE_OPTIONS,
  getClockFontScale,
  DEFAULT_CLOCK_FONT_SIZE,
} from '../constants/fontSizes';

interface SettingsModalProps {
  visible: boolean;
  theme: AppTheme;
  settings: AppSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  theme,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  const activeFontScale = getClockFontScale(settings.clockFontSize);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Clock & Display Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Theme Selector */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Visual Theme</Text>
              <View style={styles.themesGrid}>
                {Object.values(THEMES).map(t => {
                  const isSelected = settings.themeId === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        styles.themeTile,
                        { backgroundColor: t.bg, borderColor: isSelected ? t.accent : t.border },
                        isSelected && styles.selectedThemeTile,
                      ]}
                      onPress={() => onUpdateSettings({ themeId: t.id })}
                    >
                      <View style={[styles.colorPreview, { backgroundColor: t.clockText }]} />
                      <Text style={[styles.themeName, { color: t.textPrimary }]}>{t.name}</Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={t.accent}
                          style={styles.checkIcon}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Clock Font Size Selector */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Clock Font Size
              </Text>
              <View style={styles.fontSizesGrid}>
                {CLOCK_FONT_SIZE_OPTIONS.map(opt => {
                  const isSelected = (settings.clockFontSize || DEFAULT_CLOCK_FONT_SIZE) === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.fontSizeTile,
                        {
                          backgroundColor: isSelected ? `${theme.accent}18` : theme.bg,
                          borderColor: isSelected ? theme.accent : theme.border,
                        },
                        isSelected && styles.selectedFontSizeTile,
                      ]}
                      onPress={() => onUpdateSettings({ clockFontSize: opt.id })}
                      activeOpacity={0.7}
                      accessibilityLabel={`Select ${opt.label} font size`}
                    >
                      <View style={styles.fontSizeHeader}>
                        <Text
                          style={[
                            styles.fontSizeName,
                            { color: isSelected ? theme.accent : theme.textPrimary },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={theme.accent}
                          />
                        )}
                      </View>
                      <Text style={[styles.fontSizeDetails, { color: theme.textSecondary }]}>
                        {opt.sublabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Live Preview Box */}
              <View
                style={[
                  styles.previewBox,
                  { backgroundColor: theme.bg, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>
                  Preview ({activeFontScale.label} • {activeFontScale.timeSize}pt)
                </Text>
                <View style={styles.previewClockRow}>
                  <Text
                    style={[
                      styles.previewDigits,
                      {
                        color: theme.clockText,
                        fontSize: Math.round(activeFontScale.timeSize * 0.38),
                      },
                    ]}
                  >
                    10:30
                  </Text>
                  <View style={styles.previewMeta}>
                    {settings.timeFormat12h && (
                      <Text
                        style={[
                          styles.previewPeriod,
                          {
                            color: theme.accent,
                            fontSize: Math.round(activeFontScale.periodSize * 0.38),
                          },
                        ]}
                      >
                        AM
                      </Text>
                    )}
                    {settings.showSeconds && (
                      <Text
                        style={[
                          styles.previewSeconds,
                          {
                            color: theme.textSecondary,
                            fontSize: Math.round(activeFontScale.secondsSize * 0.38),
                          },
                        ]}
                      >
                        :45
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Display Preferences */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Time Display</Text>

              {/* 12H / 24H Toggle */}
              <View style={[styles.settingRow, { borderColor: theme.border }]}>
                <View style={styles.labelWithIcon}>
                  <Ionicons name="time-outline" size={20} color={theme.accent} />
                  <View>
                    <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                      12-Hour Format (AM/PM)
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                      Toggle between 12-hour and 24-hour time
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.timeFormat12h}
                  onValueChange={val => onUpdateSettings({ timeFormat12h: val })}
                  trackColor={{ false: theme.border, true: theme.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Show Seconds Toggle */}
              <View style={[styles.settingRow, { borderColor: theme.border }]}>
                <View style={styles.labelWithIcon}>
                  <Ionicons name="stopwatch-outline" size={20} color={theme.accent} />
                  <View>
                    <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                      Show Seconds
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                      Display live seconds counter
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.showSeconds}
                  onValueChange={val => onUpdateSettings({ showSeconds: val })}
                  trackColor={{ false: theme.border, true: theme.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Keep Awake Toggle */}
              <View style={[styles.settingRow, { borderColor: theme.border }]}>
                <View style={styles.labelWithIcon}>
                  <Ionicons name="tv-outline" size={20} color={theme.accent} />
                  <View>
                    <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                      Keep Tablet Screen Awake
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                      Prevent screen sleep while serving as a clock
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.keepAwake}
                  onValueChange={val => onUpdateSettings({ keepAwake: val })}
                  trackColor={{ false: theme.border, true: theme.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Night Dim Toggle */}
              <View style={[styles.settingRow, { borderColor: theme.border }]}>
                <View style={styles.labelWithIcon}>
                  <Ionicons name="moon-outline" size={20} color={theme.accent} />
                  <View>
                    <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                      Night Mode Dimming
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                      Apply dim overlay for bedside night viewing
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.nightModeDim}
                  onValueChange={val => onUpdateSettings({ nightModeDim: val })}
                  trackColor={{ false: theme.border, true: theme.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: theme.accent }]}
              onPress={onClose}
            >
              <Text style={styles.doneBtnText}>Done</Text>
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
    maxHeight: 480,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeTile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
    position: 'relative',
  },
  selectedThemeTile: {
    borderWidth: 2,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themeName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  checkIcon: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  fontSizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  fontSizeTile: {
    width: '48%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  selectedFontSizeTile: {
    borderWidth: 2,
  },
  fontSizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  fontSizeName: {
    fontSize: 13,
    fontWeight: '700',
  },
  fontSizeDetails: {
    fontSize: 11,
  },
  previewBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewClockRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  previewDigits: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  previewMeta: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  previewPeriod: {
    fontWeight: '700',
  },
  previewSeconds: {
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 11,
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  doneBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
