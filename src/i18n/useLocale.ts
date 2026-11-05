import { useState, useEffect } from 'react';
import { getLocale, t, toggleLocale, onLocaleChange, getSiteName, Locale } from './utils';

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  useEffect(() => {
    // Set initial
    setLocaleState(getLocale());
    
    // Subscribe to changes
    const unsubscribe = onLocaleChange((newLocale) => {
      setLocaleState(newLocale);
    });
    
    return unsubscribe;
  }, []);

  return {
    locale,
    siteName: getSiteName(locale),
    t: (key: string) => t(key, locale),
    toggleLocale
  };
}
