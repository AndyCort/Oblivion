import { useTheme, isDarkTheme } from '../stores/themeStore';

export default function Background() {
  const { theme } = useTheme();

  return <div className={isDarkTheme(theme) ? 'bg-dark-container' : 'bg-light-container'} />;
}
