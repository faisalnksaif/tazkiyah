import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildTheme, Theme, ThemeMode } from './theme';

const THEME_MODE_KEY = 'tazkiyah_theme_mode';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: buildTheme('dark'),
  mode: 'dark',
  setMode: () => {},
  toggleMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark') setModeState(stored);
    });
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_MODE_KEY, next);
  };

  const toggleMode = () => setMode(mode === 'dark' ? 'light' : 'dark');

  const value: ThemeContextValue = { theme: buildTheme(mode), mode, setMode, toggleMode };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Returns the current resolved theme tokens (colors/spacing/etc). */
export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

/** Returns the current mode plus setters — for the settings screen's dark-mode toggle. */
export function useThemeMode(): Omit<ThemeContextValue, 'theme'> {
  const { mode, setMode, toggleMode } = useContext(ThemeContext);
  return { mode, setMode, toggleMode };
}
