import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getTheme, toggleTheme, onThemeChange, type Theme } from '../stores/themeStore';

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document !== 'undefined') return getTheme();
    return 'light';
  });

  useEffect(() => {
    setThemeState(getTheme());
    return onThemeChange(setThemeState);
  }, []);

  return (
    <ToggleContainer
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'light' ? (
          <IconWrapper
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <i className="fas fa-sun"></i>
          </IconWrapper>
        ) : (
          <IconWrapper
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <i className="fas fa-moon"></i>
          </IconWrapper>
        )}
      </AnimatePresence>
    </ToggleContainer>
  );
}

const ToggleContainer = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  border-radius: 50%;
  position: relative;
  overflow: hidden;

  &:hover {
    color: var(--main-color);
  }
`;

const IconWrapper = styled(motion.div)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
`;
