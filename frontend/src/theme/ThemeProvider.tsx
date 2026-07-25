import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildTheme, Theme, ThemeMode, ThemeVariant } from './theme';

const THEME_MODE_KEY = 'tazkiyah_theme_mode';
const THEME_VARIANT_KEY = 'tazkiyah_theme_variant';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  variant: ThemeVariant;
  setMode: (mode: ThemeMode) => void;
  setVariant: (variant: ThemeVariant) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: buildTheme('dark', 'classic'),
  mode: 'dark',
  variant: 'classic',
  setMode: () => {},
  setVariant: () => {},
  toggleMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [variant, setVariantState] = useState<ThemeVariant>('classic');

  useEffect(() => {
    AsyncStorage.multiGet([THEME_MODE_KEY, THEME_VARIANT_KEY]).then((entries) => {
      const modeEntry = entries.find(([key]) => key === THEME_MODE_KEY)?.[1];
      const variantEntry = entries.find(([key]) => key === THEME_VARIANT_KEY)?.[1];
      if (modeEntry === 'light' || modeEntry === 'dark') setModeState(modeEntry);
      if (variantEntry === 'classic' || variantEntry === 'islamic') setVariantState(variantEntry);
    });
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_MODE_KEY, next);
  };

  const setVariant = (next: ThemeVariant) => {
    setVariantState(next);
    AsyncStorage.setItem(THEME_VARIANT_KEY, next);
  };

  const toggleMode = () => setMode(mode === 'dark' ? 'light' : 'dark');

  const value: ThemeContextValue = { theme: buildTheme(mode, variant), mode, variant, setMode, setVariant, toggleMode };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Returns the current resolved theme tokens (colors/spacing/etc). */
export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

/** Returns the current mode plus setters — for the settings screen's dark-mode toggle. */
export function useThemeMode(): Omit<ThemeContextValue, 'theme'> {
  const { mode, variant, setMode, setVariant, toggleMode } = useContext(ThemeContext);
  return { mode, variant, setMode, setVariant, toggleMode };
}
