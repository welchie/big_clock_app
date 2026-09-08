import { AppTheme } from '../types/reminder';

export const CATEGORY_COLORS: Record<string, string> = {
  work: '#3B82F6', // Blue
  personal: '#EC4899', // Pink
  health: '#10B981', // Emerald Green
  event: '#8B5CF6', // Purple
  other: '#F59E0B', // Amber
};

export const THEMES: Record<string, AppTheme> = {
  'oled-dark': {
    id: 'oled-dark',
    name: 'OLED Midnight',
    bg: '#000000',
    cardBg: '#121212',
    textPrimary: '#FFFFFF',
    textSecondary: '#888888',
    accent: '#06B6D4', // Cyan
    clockText: '#38BDF8', // Light Cyan Blue
    border: '#262626',
    nightOverlay: 'rgba(0, 0, 0, 0.75)',
  },
  'modern-slate': {
    id: 'modern-slate',
    name: 'Modern Slate',
    bg: '#0F172A',
    cardBg: '#1E293B',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accent: '#818CF8', // Indigo
    clockText: '#F1F5F9', // Pure Slate White
    border: '#334155',
    nightOverlay: 'rgba(15, 23, 42, 0.75)',
  },
  'warm-amber': {
    id: 'warm-amber',
    name: 'Warm Amber Glow',
    bg: '#180E04',
    cardBg: '#2A1808',
    textPrimary: '#FEF3C7',
    textSecondary: '#D97706',
    accent: '#F59E0B', // Amber
    clockText: '#FBBF24', // Bright Amber
    border: '#451A03',
    nightOverlay: 'rgba(24, 14, 4, 0.8)',
  },
  'emerald-forest': {
    id: 'emerald-forest',
    name: 'Emerald Forest',
    bg: '#022C22',
    cardBg: '#064E3B',
    textPrimary: '#ECFDF5',
    textSecondary: '#6EE7B7',
    accent: '#10B981', // Mint
    clockText: '#34D399', // Bright Emerald
    border: '#047857',
    nightOverlay: 'rgba(2, 44, 34, 0.8)',
  },
  'cyberpunk-red': {
    id: 'cyberpunk-red',
    name: 'Neon Crimson',
    bg: '#180509',
    cardBg: '#2D0C13',
    textPrimary: '#FFE4E6',
    textSecondary: '#FB7185',
    accent: '#F43F5E', // Rose
    clockText: '#FF2E54', // Neon Coral
    border: '#4C0519',
    nightOverlay: 'rgba(24, 5, 9, 0.8)',
  },
  'soft-pastel': {
    id: 'soft-pastel',
    name: 'Minimal Light',
    bg: '#F8FAFC',
    cardBg: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    accent: '#4F46E5', // Deep Indigo
    clockText: '#1E1B4B',
    border: '#E2E8F0',
    nightOverlay: 'rgba(0, 0, 0, 0.5)',
  },
};

export const DEFAULT_THEME = THEMES['oled-dark'];
