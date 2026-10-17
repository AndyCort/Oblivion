import React, { useState, useEffect, useRef, useId, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme, useCardStyle } from '../../stores/themeStore';
import { THEME_OPTIONS, CARD_STYLES } from '../../config/theme';
import { resolveTokens, toCssVariables } from '../../theme/model';
import { Palette, Check } from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';

export default function ThemeToggle() {
  const { locale, t } = useLocale();
  const isZh = locale === 'zh-CN';
  const { theme, effectiveTheme, setTheme } = useTheme();
  const { cardStyle, setCardStyle } = useCardStyle();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const reduceMotion = useReducedMotion();
  const [menuPosition, setMenuPosition] = useState({ left: 0, maxHeight: 480 });
  useLayoutEffect(() => {
    if (!isOpen) return;
    const position = () => {
      const rect = dropdownRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(300, window.innerWidth - 24);
      setMenuPosition({
        left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)) - rect.left,
        maxHeight: Math.max(100, window.innerHeight - rect.bottom - 22),
      });
    };
    position();
    const closeOnResize = () => setIsOpen(false);
    window.addEventListener('resize', closeOnResize);
    return () => window.removeEventListener('resize', closeOnResize);
  }, [isOpen]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        dropdownRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <DropdownContainer ref={dropdownRef} className="theme-toggle-container"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false);
      }}
    >
      <ToggleContainer
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-label={t('theme.label')}
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        title={t('theme.label')}
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      >
        <Palette size={20} />
      </ToggleContainer>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenu
            id={menuId}
            style={menuPosition}
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <SectionTitle>{t('theme.label')}</SectionTitle>
            <SegmentedControl role="group" aria-label={t('theme.label')}>
              {THEME_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <Segment
                    key={opt.id}
                    type="button"
                    aria-pressed={theme === opt.id}
                    onClick={() => setTheme(opt.id)}
                  >
                    {theme === opt.id && (
                      <ActiveBg layoutId={reduceMotion ? undefined : `${menuId}-active`} transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
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
            <StyleGrid role="group" aria-label={t('cardStyle.label')}>
              {CARD_STYLES.map(style => {
                const cssVars = toCssVariables(resolveTokens(style.id, effectiveTheme)) as React.CSSProperties;

                return (
                  <StylePreviewWrapper type="button" aria-pressed={cardStyle === style.id} key={style.id} onClick={() => setCardStyle(style.id)}>
                    <StylePreview className="preview" data-card={style.id} $active={cardStyle === style.id} style={cssVars}>
                      {cardStyle === style.id && <Check size={18} color="var(--text-1)" />}
                    </StylePreview>
                    <StyleLabel $active={cardStyle === style.id}>
                      {style.label[isZh ? 'zh' : 'en']}
                    </StyleLabel>
                  </StylePreviewWrapper>
                );
              })}
            </StyleGrid>
          </DropdownMenu>
        )}
      </AnimatePresence>
    </DropdownContainer>
  );
}

const DropdownContainer = styled.div`
  position: relative;
  button:focus-visible { outline: 2px solid var(--link-color); outline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; animation: none !important; }
    button:hover .preview { transform: none; }
  }
`;

const ToggleContainer = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: oklch(0 0 0 / 0);
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
  width: min(300px, calc(100vw - 24px));
  box-sizing: border-box;
  max-height: calc(100dvh - 96px);
  background: var(--bg-1);
  border: var(--border);  
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--box-shadow);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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
  background: oklch(0 0 0 / 0);
  cursor: pointer;
  position: relative;
  z-index: 1;
  border-radius: 16px;
  -webkit-tap-highlight-color: oklch(0 0 0 / 0);
`;

const ActiveBg = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-1);
  border-radius: 16px;
  box-shadow: 0 2px 8px oklch(0 0 0 / 0.1);
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

const StyleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 4px;
`;

const StylePreviewWrapper = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  &:focus-visible { outline: 2px solid var(--main-color); outline-offset: 3px; }
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  min-width: 0;
  padding: 6px 4px;
  border-radius: 8px;
  
  &:hover .preview {
    transform: translateY(-2px);
  }
`;

const StylePreview = styled.div<{ $active: boolean }>`
  width: 72px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, outline-color 0.2s ease;
  
  /* Active state outline */
  outline: ${props => props.$active ? '2px solid var(--main-color)' : '2px solid oklch(0 0 0 / 0)'};
  outline-offset: 2px;


`;

const StyleLabel = styled.div<{ $active: boolean }>`
  text-align: center;
  overflow-wrap: anywhere;
  font-family: 'LXGW WenKai';
  font-size: 0.75rem;
  font-weight: ${props => props.$active ? '700' : '500'};
  color: ${props => props.$active ? 'var(--main-color)' : 'var(--text-2)'};
  transition: color 0.3s;
  display: flex;
  align-items: center;
`;
