// Single source of truth for all visual tokens. Change a value here and it
// reflects app-wide via ThemeProvider/useTheme — no other file edits needed.

const lightColors = {
  primary: '#159A72', // single teal-green accent — mirrors the dark theme's ring/toggle/slider color
  primaryDark: '#0F7857',
  primarySoft: '#E3F5EE', // tinted fill for chips/badges, no border needed
  secondary: '#C79A3F',
  secondarySoft: '#FBF3E2',
  background: '#F7F8F8',
  surface: '#FFFFFF',
  text: '#1A1B1E',
  textMuted: '#75767B',
  border: '#E8E9EB', // subtle separation — cards are flat, no shadow, contrast does the work
  success: '#159A72',
  danger: '#D64545',
  warning: '#D9A215',
  white: '#FFFFFF',
  black: '#000000',
};

const darkColors = {
  primary: '#5FCBA0', // single teal-green accent — ring, toggles, slider fill, active nav icon
  primaryDark: '#48A883',
  primarySoft: '#1E3A32', // tinted fill for chips/badges, no border needed
  secondary: '#D8B25C',
  secondarySoft: '#2E2716',
  background: 'black',
  surface: '#1A1A1D',
  text: '#F4F4F5',
  textMuted: '#8C8D91',
  border: '#3A3C42', // subtle separation, shadows are near-invisible in dark mode
  success: '#5FCBA0',
  danger: '#E0665C',
  warning: '#E0B85C',
  white: '#FFFFFF',
  black: '#000000',
};

const shared = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    sm: 8,
    md: 20,
    lg: 24,
    pill: 999,
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 26,
    xxl: 34,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '600' as const,
    bold: '700' as const,
  },
};

// Both modes stay intentionally flat — no shadows/gradients. Separation
// comes from the surface/background color contrast alone (white cards on an
// off-white background in light mode; lighter cards on near-black in dark).
function buildShadow(_mode: 'light' | 'dark') {
  const flat = { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 };
  return { card: flat, raised: flat };
}

export type ThemeMode = 'light' | 'dark';

export function buildTheme(mode: ThemeMode) {
  return {
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    ...shared,
    shadow: buildShadow(mode),
  };
}

export const theme = buildTheme('dark');

export type Theme = ReturnType<typeof buildTheme>;
