// Single source of truth for all visual tokens.

export type ThemeMode = 'light' | 'dark';
export type ThemeVariant = 'classic' | 'islamic';

const classicLightColors = {
  primary: '#159A72',
  primaryDark: '#0F7857',
  primarySoft: '#E3F5EE',
  secondary: '#C79A3F',
  secondarySoft: '#FBF3E2',
  background: '#F7F8F8',
  surface: '#FFFFFF',
  text: '#1A1B1E',
  textMuted: '#75767B',
  border: '#E8E9EB',
  success: '#159A72',
  danger: '#D64545',
  warning: '#D9A215',
  white: '#FFFFFF',
  black: '#000000',
};

const classicDarkColors = {
  primary: '#5FCBA0',
  primaryDark: '#48A883',
  primarySoft: '#1E3A32',
  secondary: '#D8B25C',
  secondarySoft: '#2E2716',
  background: 'black',
  surface: '#1A1A1D',
  text: '#F4F4F5',
  textMuted: '#8C8D91',
  border: '#3A3C42',
  success: '#5FCBA0',
  danger: '#E0665C',
  warning: '#E0B85C',
  white: '#FFFFFF',
  black: '#000000',
};

const islamicLightColors = {
  primary: '#2E7C7B',
  primaryDark: '#205B5B',
  primarySoft: '#E6F3F2',
  secondary: '#C9A45A',
  secondarySoft: '#FAF1DC',
  background: '#F7F3EA',
  surface: '#FFFCF6',
  text: '#1F2B2D',
  textMuted: '#6D7678',
  border: '#E7DED0',
  success: '#2E7C7B',
  danger: '#D64545',
  warning: '#C58E2A',
  white: '#FFFFFF',
  black: '#000000',
};

const islamicDarkColors = {
  primary: '#5AB7B2',
  primaryDark: '#3F8E89',
  primarySoft: '#1C3138',
  secondary: '#D5B56A',
  secondarySoft: '#342C1F',
  background: '#12161D',
  surface: '#1A2230',
  text: '#F4F2EC',
  textMuted: '#A8AFB2',
  border: '#2E3945',
  success: '#5AB7B2',
  danger: '#E27A6D',
  warning: '#D3B06A',
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
    sm: 10,
    md: 18,
    lg: 26,
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

function buildShadow(mode: ThemeMode) {
  if (mode === 'dark') {
    return {
      card: {
        shadowColor: '#000000',
        shadowOpacity: 0.28,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 0,
      },
      raised: {
        shadowColor: '#000000',
        shadowOpacity: 0.34,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
        elevation: 0,
      },
    };
  }

  return {
    card: {
      shadowColor: '#8A6B2A',
      shadowOpacity: 0.12,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 0,
    },
    raised: {
      shadowColor: '#8A6B2A',
      shadowOpacity: 0.16,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 0,
    },
  };
}

export function buildTheme(mode: ThemeMode, variant: ThemeVariant = 'classic') {
  return {
    mode,
    variant,
    colors:
      variant === 'islamic'
        ? mode === 'dark'
          ? islamicDarkColors
          : islamicLightColors
        : mode === 'dark'
        ? classicDarkColors
        : classicLightColors,
    ...shared,
    shadow: buildShadow(mode),
  };
}

export const theme = buildTheme('dark', 'classic');

export type Theme = ReturnType<typeof buildTheme>;
