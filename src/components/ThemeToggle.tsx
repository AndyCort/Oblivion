import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getTheme, setTheme, onThemeChange, getCardStyle, setCardStyle, onCardStyleChange, type Theme, type CardStyle } from '../stores/themeStore';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';
import { useLocale } from '../i18n/useLocale';

const THEME_OPTIONS: { id: Theme; icon: React.FC<any>; label: string }[] = [
  { id: 'light', icon: Sun, label: 'light' },
  { id: 'system', icon: Monitor, label: 'system' },
  { id: 'dark', icon: Moon, label: 'dark' }
];

const CARD_STYLES: { id: CardStyle; label: string }[] = [
  { id: 'base', label: 'base' },
  { id: 'glass', label: 'glass' },
  { id: 'flat', label: 'flat' },
  { id: 'neo', label: 'neo' }
];

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [cardStyle, setCardStyleState] = useState<CardStyle>('base');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();

  const t = {
    theme: locale === 'zh-CN' ? '主题' : 'Theme',
    light: locale === 'zh-CN' ? '浅色' : 'Light',
    dark: locale === 'zh-CN' ? '深色' : 'Dark',
    system: locale === 'zh-CN' ? '系统' : 'System',
    cardStyle: locale === 'zh-CN' ? '卡片风格' : 'Card Style',
    base: locale === 'zh-CN' ? '基础' : 'Base',
    glass: locale === 'zh-CN' ? '半生雨' : 'Glass',
    flat: locale === 'zh-CN' ? '扁平' : 'Flat',
    neo: locale === 'zh-CN' ? '新拟态' : 'Neo'
  };

  useEffect(() => {
    setThemeState(getTheme());
    setCardStyleState(getCardStyle());

    const unsubTheme = onThemeChange(setThemeState);
    const unsubCard = onCardStyleChange(setCardStyleState);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubTheme();
      unsubCard();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <DropdownContainer ref={dropdownRef} className="theme-toggle-container">
      <ToggleContainer
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Settings"
        title={t.theme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Palette size={20} />
      </ToggleContainer>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenu
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <SectionTitle>{t.theme}</SectionTitle>
            <SegmentedControl>
              {THEME_OPTIONS.map(opt => (
                <Segment
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                >
                  {theme === opt.id && (
                    <ActiveBg layoutId="theme-active" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                  )}
                  <SegmentContent $active={theme === opt.id}>
                    <opt.icon size={14} />
                    <span>{t[opt.label as keyof typeof t]}</span>
                  </SegmentContent>
                </Segment>
              ))}
            </SegmentedControl>

            <SectionTitle style={{ marginTop: '16px' }}>{t.cardStyle}</SectionTitle>
            <StyleCarousel>
              {CARD_STYLES.map(style => (
                <StylePreviewWrapper key={style.id} onClick={() => setCardStyle(style.id)}>
                  <StyleDisk className="disk" $style={style.id} $active={cardStyle === style.id}>
                    {cardStyle === style.id && <Check size={18} color="var(--main-color)" />}
                  </StyleDisk>
                  <StyleLabel $active={cardStyle === style.id}>
                    {t[style.label as keyof typeof t]}
                  </StyleLabel>
                </StylePreviewWrapper>
              ))}
            </StyleCarousel>
          </DropdownMenu>
        )}
      </AnimatePresence>
    </DropdownContainer>
  );
}

const DropdownContainer = styled.div`
  position: relative;
`;

const ToggleContainer = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: var(--text-1);
  cursor: pointer;
  border-radius: 50%;
  position: relative;
  overflow: hidden;

  &:hover {
    color: var(--main-color);
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 260px;
  background: var(--bg-0);
  border: var(--border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--box-shadow);
  z-index: 100;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    right: -130px;
  }
`;

const SectionTitle = styled.div`
  font-size: 0.75rem;
  color: var(--text-3);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
`;

const SegmentedControl = styled.div`
  display: flex;
  background: oklch(from var(--text-1) l c h / 0.05);
  border-radius: 20px;
  padding: 4px;
  position: relative;
`;

const Segment = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  z-index: 1;
  border-radius: 16px;
  -webkit-tap-highlight-color: transparent;
`;

const ActiveBg = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-0);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: -1;
`;

const SegmentContent = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => props.$active ? 'var(--main-color)' : 'var(--text-2)'};
  font-size: 0.75rem;
  font-weight: 600;
  transition: color 0.3s;
`;

const StyleCarousel = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const StylePreviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
  
  &:hover .disk {
    transform: translateY(-2px);
  }
`;

const StyleDisk = styled.div<{ $style: CardStyle; $active: boolean }>`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Mock styles based on style.css */
  ${props => {
    switch (props.$style) {
      case 'glass':
        return `
          background: oklch(from var(--bg-1) l c h / 0.3);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: var(--box-shadow);
        `;
      case 'base':
        return `
          background: oklch(from var(--bg-1) l c h / 0.5);
          box-shadow: var(--box-shadow);
          border: var(--border);
        `;
      case 'flat':
        return `
          background: var(--bg-0);
          border: 1px solid var(--text-3);
        `;
      case 'neo':
        return `
          background: var(--bg-0);
          border: 2px solid var(--text-1);
          box-shadow: 2px 2px 0 var(--text-1);
        `;
    }
  }}

  /* Active state outline */
  outline: ${props => props.$active ? '2px solid var(--main-color)' : '2px solid transparent'};
  outline-offset: 2px;
`;

const StyleLabel = styled.div<{ $active: boolean }>`
  font-size: 0.75rem;
  font-weight: ${props => props.$active ? '700' : '500'};
  color: ${props => props.$active ? 'var(--main-color)' : 'var(--text-2)'};
  transition: color 0.3s;
`;
