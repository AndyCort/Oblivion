import { createPortal } from 'react-dom';
import { useTheme } from '../../stores/themeStore';

export default function Background() {
  const { effectiveTheme } = useTheme();

  return createPortal(
    <div className={effectiveTheme === 'dark' ? 'bg-dark-container' : 'bg-light-container'} />,
    document.body
  );
}

