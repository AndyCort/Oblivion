import React, { useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useLocale } from '../i18n/useLocale';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Background from './Background';
import { useAutoContrast } from '../hooks/useAutoContrast';
import { Languages, Search, Menu, X } from 'lucide-react';

const menuItems = [
  { key: 'home', path: '/' },
  { key: 'articles', path: '/articles' },
  { key: 'about', path: '/about' },
  { key: 'moment', path: '/moment' },
];

export default function NavBar() {
  const { locale, t, toggleLocale } = useLocale();
  const siteName = t('siteName');

  const [currentPath, setCurrentPath] = useState('/');
  const [atTop, setAtTop] = useState(true);
  const [navHidden, setNavHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const navMenuRef = useRef<HTMLUListElement>(null);
  const navSliderRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setAtTop(scrollY <= 20);
      setNavHidden(scrollY > 100 && scrollY > lastScrollY);
      lastScrollY = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  const closeMobileMenu = () => setMobileOpen(false);

  const updateSlider = (element: HTMLElement) => {
    if (!navSliderRef.current || !element) return;
    const insetX = 2, insetY = 2;
    const left = element.offsetLeft + insetX;
    const top = element.offsetTop + insetY;
    const width = element.offsetWidth - insetX * 2;
    const height = element.offsetHeight - insetY * 2;

    navSliderRef.current.style.transform = `translate(${left}px, ${top}px)`;
    navSliderRef.current.style.width = `${width}px`;
    navSliderRef.current.style.height = `${height}px`;
    navSliderRef.current.style.opacity = '0.1';
  };

  const resetSlider = () => {
    const activeItem = navMenuRef.current?.querySelector('li a.active') as HTMLElement;
    if (activeItem) {
      updateSlider(activeItem);
    } else if (navSliderRef.current) {
      navSliderRef.current.style.opacity = '0';
    }
  };

  useEffect(() => {
    const timer = setTimeout(resetSlider, 100);
    return () => clearTimeout(timer);
  }, [currentPath, locale]);

  const handleMouseEnter = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    updateSlider(e.currentTarget as HTMLElement);
  };

  const toggleSearch = () => {
    setSearchExpanded((prev) => {
      if (!prev) setTimeout(() => searchInputRef.current?.focus(), 100);
      return !prev;
    });
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (!searchInputRef.current?.value) setSearchExpanded(false);
    }, 200);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputRef.current?.value.trim()) {
      navigate(`/search?s=${encodeURIComponent(searchInputRef.current.value.trim())}`);
      setSearchExpanded(false);
      if (mobileOpen) setMobileOpen(false);
    }
  };

  return (
    <>
      <NavBarContainer
        $atTop={atTop}
        $navHidden={navHidden}
      >
        <NavLeft>
          <a href="/">{siteName}</a>
        </NavLeft>

        <NavMiddle
          $atTop={atTop}
          data-card="glass"
        >
          <NavMenu ref={navMenuRef} onMouseLeave={resetSlider}>
            {menuItems.map((item, index) => {
              const isActive = item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path);
              return (
                <NavItem key={item.key}>
                  <NavLink
                    href={item.path}
                    className={isActive ? 'active' : ''}
                    $isActive={isActive}
                    onMouseEnter={handleMouseEnter}
                    onClick={closeMobileMenu}
                  >
                    {t(`nav.${item.key}`)}
                  </NavLink>
                </NavItem>
              );
            })}
            <NavSlider aria-hidden="true" ref={navSliderRef} />
          </NavMenu>
        </NavMiddle>

        <NavRight
          $atTop={atTop}
          $mobileOpen={mobileOpen}
          data-card="glass">
          <ActionsContainer className="actions-container">
            <ThemeToggle />
            <I18nToggle
              className="i18n-toggle"
              aria-label="Toggle language"
              title={locale === 'zh-CN' ? 'Switch to English' : '切换至中文'}
              onClick={toggleLocale}
            >
              <Languages size={20} />
            </I18nToggle>

            <NavSearchForm
              className={`nav-search ${searchExpanded ? 'expanded' : ''}`}
              onSubmit={handleSearchSubmit}
              $expanded={searchExpanded}
            >
              <SearchInput
                type="search"
                name="s"
                placeholder={t('search.placeholder')}
                className="search-input"
                ref={searchInputRef}
                onBlur={handleSearchBlur}
              />
              <IconButton type="button" aria-label="Toggle search" onClick={toggleSearch}>
                <Search size={20} />
              </IconButton>
            </NavSearchForm>
          </ActionsContainer>

          <MenuToggle
            $atTop={atTop}
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </MenuToggle>
        </NavRight>
      </NavBarContainer >

      {mobileOpen && (
        <MobileOverlay onClick={closeMobileMenu} />
      )
      }
    </>
  );
}

// Styled Components

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const NavBarContainer = styled.nav<{ $atTop: boolean; $navHidden: boolean }>`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  position: fixed;
  inset: 0 0 auto;
  z-index: 1000;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 24px 12px 24px;
  font-family: var(--title-font);
  transition: transform 0.3s ease;

  ${props => props.$navHidden && 'transform: translateY(-100%);'}

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
  }
`;

const NavLeft = styled.div`
  justify-self: start;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: clamp(16px, 4vw, 64px);

  a {
    font-size: 1.5rem;
    font-weight: bold;
    font-family: var(--site-title-font);
    color: var(--main-color);
    text-decoration: none;
    transition: color 0.2s;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavPill = styled.div<{ $atTop?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0;
  border-radius: 999px !important;
  background: ${props => props.$atTop ? 'transparent' : 'var(--bg-1)'};
  border: ${props => props.$atTop ? '1px solid transparent' : 'var(--border)'};
  box-shadow: ${props => props.$atTop ? 'none' : 'var(--box-shadow)'};
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
`;

const NavMiddle = styled(NavPill)`
  justify-self: center;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  @media (max-width: 768px) {
    max-width: calc(100vw - 160px);
  }
`;

const NavMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: 8px;
  margin: 0;
  padding: 0;
  position: relative;
`;

const NavItem = styled.li`
  opacity: 1;
  transform: none;
  transition: all 0.4s ease;
  flex-shrink: 0;
`;

const NavLink = styled.a<{ $isActive?: boolean }>`
  display: block;
  padding: 8px 16px;
  color: ${props => props.$isActive ? 'var(--main-color)' : 'var(--text-1)'};
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  font-family: var(--content-font);
  font-weight: bold;

  &:hover {
    color: var(--main-color);
  }
`;

const NavSlider = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background-color: var(--main-color);
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  z-index: 0;
  box-shadow: var(--box-shadow);
  border: none;
`;

const NavRight = styled(NavPill) <{ $mobileOpen?: boolean }>`
  justify-self: end;
  margin-right: clamp(16px, 4vw, 64px);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 0 4px;
  color: var(--text-1);

  @media (max-width: 768px) {
    position: absolute;
    right: 24px;
    margin-right: 0;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;

    ${props => props.$mobileOpen && css`
      .actions-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        justify-items: center;
        width: 220px;
        position: absolute;
        top: calc(100% + 12px);
        right: 0;
        background: var(--bg-1);
        border: var(--border);
        border-radius: 24px;
        padding: 16px;
        gap: 16px;
        box-shadow: var(--box-shadow);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        animation: ${slideDown} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .i18n-toggle, .theme-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--bg-1);
        border: var(--border);
        color: var(--text-1);
        font-size: 1.15rem;
      }
      .nav-search {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        background: var(--bg-1);
        border: var(--border);
        border-radius: 22px;
        padding: 2px 4px;
        width: 100%;
      }
      .nav-search .search-input {
        width: 100%;
        opacity: 1;
        padding: 8px 12px;
        background: transparent;
        border: none;
        color: var(--text-1);
        outline: none;
      }
      .nav-search button {
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        color: var(--text-1);
      }
    `}
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: var(--text-1);
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 50%;
  &:hover { color: var(--main-color); }
`;

const I18nToggle = styled(IconButton)`
  font-size: 1.15rem;
`;

const NavSearchForm = styled.form<{ $expanded?: boolean }>`
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  transition: all 0.3s ease;

  ${props => props.$expanded && `
    .search-input {
      background: transparent;
      width: 200px;
      padding: 8px 16px;
      opacity: 1;
      margin-right: 8px;
      border: var(--border);
    }
  `}
`;

const SearchInput = styled.input`
  width: 0;
  padding: 0;
  border: none;
  outline: none;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-1);
  border-radius: 20px;
  font-size: 0.9rem;
`;

const MenuToggle = styled.button<{ $atTop?: boolean }>`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => props.$atTop ? 'transparent' : 'var(--bg-1)'};
  border: ${props => props.$atTop ? '1px solid transparent' : 'var(--border)'};
  color: var(--text-1);
  cursor: pointer;
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 18px;
  z-index: 1002;

  &:hover {
    border-color: var(--main-color);
    color: var(--main-color);
  }

  @media (max-width: 768px) {
    display: flex !important;
  }
`;

const MobileOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 990;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
`;
