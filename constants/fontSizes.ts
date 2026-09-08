import { ClockFontSize } from '../types/reminder';

export interface ClockFontScale {
  id: ClockFontSize;
  label: string;
  sublabel: string;
  timeSize: number;
  periodSize: number;
  secondsSize: number;
  dateSize: number;
  yearSize: number;
}

export const CLOCK_FONT_SIZES: Record<ClockFontSize, ClockFontScale> = {
  small: {
    id: 'small',
    label: 'Small',
    sublabel: '72pt',
    timeSize: 72,
    periodSize: 22,
    secondsSize: 24,
    dateSize: 24,
    yearSize: 20,
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    sublabel: '96pt (Default)',
    timeSize: 96,
    periodSize: 28,
    secondsSize: 32,
    dateSize: 32,
    yearSize: 26,
  },
  large: {
    id: 'large',
    label: 'Large',
    sublabel: '120pt',
    timeSize: 120,
    periodSize: 34,
    secondsSize: 40,
    dateSize: 38,
    yearSize: 30,
  },
  huge: {
    id: 'huge',
    label: 'Huge',
    sublabel: '144pt',
    timeSize: 144,
    periodSize: 40,
    secondsSize: 48,
    dateSize: 44,
    yearSize: 34,
  },
};

export const CLOCK_FONT_SIZE_OPTIONS: ClockFontScale[] = [
  CLOCK_FONT_SIZES.small,
  CLOCK_FONT_SIZES.medium,
  CLOCK_FONT_SIZES.large,
  CLOCK_FONT_SIZES.huge,
];

export const DEFAULT_CLOCK_FONT_SIZE: ClockFontSize = 'medium';

export function getClockFontScale(size?: ClockFontSize | string): ClockFontScale {
  if (size && size in CLOCK_FONT_SIZES) {
    return CLOCK_FONT_SIZES[size as ClockFontSize];
  }
  return CLOCK_FONT_SIZES[DEFAULT_CLOCK_FONT_SIZE];
}
