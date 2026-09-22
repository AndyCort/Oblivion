import { createPortal } from 'react-dom';
import { useTheme, isDarkTheme } from '../stores/themeStore';

export default function Background() {
  const { theme } = useTheme();

  return createPortal(
    <div className={isDarkTheme(theme) ? 'bg-dark-container' : 'bg-light-container'} />,
    document.body
  );
}

