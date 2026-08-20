import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const themes = {
  dark: {
    name: 'dark',
    background: '#0b0d13',
    surface: '#191f2d',
    surfaceElevated: '#11141d',
    input: '#0b0d13',
    border: '#2d3748',
    borderStrong: '#4a5568',
    accent: '#ffaa00',
    text: '#e2e8f0',
    textSecondary: '#cbd5e1',
    textMuted: '#a0aec0',
    onAccent: '#0b0d13',
  },
  light: {
    name: 'light',
    background: '#f4f6f8',
    surface: '#ffffff',
    surfaceElevated: '#eef1f5',
    input: '#f8fafc',
    border: '#d7dde6',
    borderStrong: '#aab4c2',
    accent: '#a86100',
    text: '#1f2937',
    textSecondary: '#475569',
    textMuted: '#64748b',
    onAccent: '#ffffff',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');

  useEffect(() => {
    AsyncStorage.getItem('sorola.theme').then((savedMode) => {
      if (savedMode === 'light' || savedMode === 'dark') setMode(savedMode);
    }).catch(() => {});
  }, []);

  const setTheme = (nextMode) => {
    const resolvedMode = nextMode === 'light' ? 'light' : 'dark';
    setMode(resolvedMode);
    AsyncStorage.setItem('sorola.theme', resolvedMode).catch(() => {});
  };

  const value = useMemo(() => ({
    mode,
    colors: themes[mode],
    setTheme,
    toggleTheme: () => setTheme(mode === 'dark' ? 'light' : 'dark'),
  }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
