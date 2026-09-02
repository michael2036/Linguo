import { useEffect, useState } from 'react';
import type { Theme } from '@fluentui/react-components';
import type { ThemePreference } from '../types/appState';
import { brandDarkTheme, brandLightTheme } from './brand';

const getSystemPrefersDark = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Resolves the user's theme preference (system/light/dark) against the OS
// media query, per TR-05, and stays in sync if the OS theme changes live.
export const useResolvedTheme = (preference: ThemePreference): Theme => {
  const [prefersDark, setPrefersDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const isDark = preference === 'dark' || (preference === 'system' && prefersDark);
  return isDark ? brandDarkTheme : brandLightTheme;
};
