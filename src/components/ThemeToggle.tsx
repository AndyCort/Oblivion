import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, useCardStyle } from '../stores/themeStore';
import { THEME_OPTIONS, CARD_STYLES } from '../config/theme';
import { Palette, Check } from 'lucide-react';
import { useLocale } from '../i18n/useLocale';

export default function ThemeToggle() {
  const { locale, t } = useLocale();
  const isZh = locale === 'zh-CN';
  const { theme, setTheme } = useTheme();
  const { cardStyle, setCardStyle } = useCardStyle();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownContainer ref={dropdownRef} className="theme-toggle-container">
      <ToggleContainer
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('theme.label')}
        title={t('theme.label')}
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
            <SectionTitle>{t('theme.label')}</SectionTitle>
            <SegmentedControl>
              {THEME_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <Segment
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                  >
                    {theme === opt.id && (
                      <ActiveBg layoutId="theme-active" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                    )}
                    <SegmentContent $active={theme === opt.id}>
                      <Icon size={14} />
                      <span>{t(`theme.${opt.labelKey}`)}</span>
                    </SegmentContent>
                  </Segment>
                )
              })}
            </SegmentedControl>

            <SectionTitle style={{ marginTop: '16px' }}>{t('cardStyle.label')}</SectionTitle>
            <StyleCarousel>
              {CARD_STYLES.map(style => (
                <StylePreviewWrapper key={style.id} onClick={() => setCardStyle(style.id)}>
                  <StyleDisk className="disk" data-card={style.id} $active={cardStyle === style.id}>
                    {cardStyle === style.id && <Check size={18} color="var(--main-color)" />}
                  </StyleDisk>
                  <StyleLabel $active={cardStyle === style.id}>
                    {style.label[isZh ? 'zh' : 'en']}
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

const StyleDisk = styled.div<{ $active: boolean }>`
  width: 46px;
  height: 46px;
  border-radius: 50% !important; /* Force circle overriding global card radius */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Active state outline */
  outline: ${props => props.$active ? '2px solid var(--main-color)' : '2px solid transparent'};
  outline-offset: 2px;
`;

const StyleLabel = styled.div<{ $active: boolean }>`
  font-family: 'LXGW WenKai';
  font-size: 0.75rem;
  font-weight: ${props => props.$active ? '700' : '500'};
  color: ${props => props.$active ? 'var(--main-color)' : 'var(--text-2)'};
  transition: color 0.3s;
  display: flex;
  align-items: center;
`;
