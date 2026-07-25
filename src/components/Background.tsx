import { useEffect, useState } from 'react';
import { getTheme, onThemeChange, type Theme } from '../stores/themeStore';

export default function Background() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== 'undefined') return getTheme()
    return 'light'
  });

  // Subscribe to theme changes from the vanilla store
  useEffect(() => {
    setTheme(getTheme())
    return onThemeChange(setTheme)
  }, []);

  return (
    <div className={theme === 'dark' ? 'bg-dark-container' : 'bg-light-container'} />
  );
}
