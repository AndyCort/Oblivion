import React, {
  useState,
  useEffect,
  useRef,
  MouseEvent as ReactMouseEvent,
} from "react";
import styled, { keyframes } from "styled-components";
import { useLocale } from "../../i18n/useLocale";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";
import Music from "../common/Music";
import { useCardStyle } from "../../stores/themeStore";
import { Languages, Menu, X, Search } from "lucide-react";

const menuItems = [
  { key: "home", path: "/" },
  { key: "articles", path: "/articles" },
  { key: "moment", path: "/moment" },
  { key: "about", path: "/about" },
];

export default function NavBar() {
  const { cardStyle } = useCardStyle();
  const { locale, siteName, toggleLocale, t } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const isZh = locale === "zh-CN";

  const navMenuRef = useRef<HTMLUListElement>(null);
  const navSliderRef = useRef<HTMLLIElement>(null);

  const currentPath = location.pathname;

  const updateSlider = (targetElement: HTMLElement) => {
    if (!navMenuRef.current || !navSliderRef.current) return;
    const menuRect = navMenuRef.current.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const left = targetRect.left - menuRect.left;
    const width = targetRect.width;

    navSliderRef.current.style.width = `${width}px`;
    navSliderRef.current.style.transform = `translateX(${left}px)`;
    navSliderRef.current.style.opacity = "1";
  };

  const resetSlider = () => {
    if (!navMenuRef.current || !navSliderRef.current) return;
    const activeLink = navMenuRef.current.querySelector(
      ".nav-link.active",
    ) as HTMLElement;
    if (activeLink) {
      updateSlider(activeLink);
    } else {
      navSliderRef.current.style.opacity = "0";
    }
  };

  useEffect(() => {
    resetSlider();
    const observer = new ResizeObserver(resetSlider);
    if (navMenuRef.current) observer.observe(navMenuRef.current);
    return () => observer.disconnect();
  }, [currentPath, locale]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchExpanded(false);

    const nav = navRef.current;
    const page = document.scrollingElement;
    if (!nav || !page) return;
    nav.dataset.scrollHidden = "false";
    let navHeight = 0;
    let maxScroll = 0;
    const measure = () => {
      navHeight = nav.offsetHeight;
      maxScroll = Math.max(0, page.scrollHeight - page.clientHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    observer.observe(document.body);
    window.addEventListener("resize", measure);

    // Clamp elastic overscroll using the last measured bounds.
    const scrollTop = () => Math.max(0, Math.min(window.scrollY, maxScroll));
    const threshold = 12;
    let pivot = scrollTop();
    let hidden = false;
    const onScroll = () => {
      const y = scrollTop();
      pivot = hidden ? Math.max(pivot, y) : Math.min(pivot, y);
      const nearTop = y <= navHeight;
      const shouldHide = !nearTop && (hidden ? pivot - y < threshold : y - pivot >= threshold);
      if (shouldHide === hidden) return;
      hidden = shouldHide;
      pivot = y;
      nav.dataset.scrollHidden = String(hidden);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, [location.key]);

  useEffect(() => {
    if (searchExpanded) {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }
  }, [searchExpanded]);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setMobileOpen(false);
    };
    const closeOnResize = () => {
      if (window.matchMedia("(min-width: 48.001rem)").matches)
        setMobileOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("resize", closeOnResize);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [mobileOpen]);

  const handleMouseEnter = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    updateSlider(e.currentTarget);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const toggleSearch = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!searchExpanded && !mobileOpen) {
      setSearchExpanded(true);
      return;
    }
    if (searchInputRef.current?.value.trim()) {
      navigate(
        `/search?s=${encodeURIComponent(searchInputRef.current.value.trim())}`,
      );
      setSearchExpanded(false);
      if (mobileOpen) setMobileOpen(false);
      return;
    }
    if (mobileOpen) searchInputRef.current?.focus();
    else setSearchExpanded((prev) => !prev);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputRef.current?.value.trim()) {
      navigate(
        `/search?s=${encodeURIComponent(searchInputRef.current.value.trim())}`,
      );
      setSearchExpanded(false);
      if (mobileOpen) setMobileOpen(false);
    }
  };

  return (
    <>
      <NavBarContainer
        ref={navRef}
        className="navbar-container"
        data-search-open={searchExpanded || undefined}
        aria-label={isZh ? "主导航" : "Main navigation"}
        onBlur={(event) => {
          if (
            event.relatedTarget &&
            !event.currentTarget.contains(event.relatedTarget as Node)
          ) {
            setMobileOpen(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          const target = event.target as HTMLElement;
          // Nested theme/music panels handle their own Escape and focus return.
          if (
            target.closest(".theme-toggle-container, .music-player-container")
          )
            return;
          if (searchExpanded) {
            event.preventDefault();
            setSearchExpanded(false);
            searchButtonRef.current?.focus();
          } else if (mobileOpen) {
            event.preventDefault();
            setMobileOpen(false);
            menuButtonRef.current?.focus();
          }
        }}
      >
        <div className="nav-left">
          <Link to="/">{siteName}</Link>
        </div>

        <div data-navbar={cardStyle} className="nav-middle">
          <ul className="nav-menu" ref={navMenuRef} onMouseLeave={resetSlider}>
            {menuItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(item.path);
              return (
                <li key={item.key} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    onMouseEnter={handleMouseEnter}
                    onFocus={(event) => updateSlider(event.currentTarget)}
                    onBlur={resetSlider}
                    onClick={closeMobileMenu}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              );
            })}
            <li className="nav-slider" aria-hidden="true" ref={navSliderRef} />
          </ul>
        </div>

        <div className="nav-right-group">
          <Music />
          <div
            id="mobile-navigation"
            className={`nav-right ${mobileOpen ? "mobile-open" : ""}`}
          >
            <ul className="mobile-links">
              {menuItems.map((item) => {
                const isActive =
                  item.path === "/"
                    ? currentPath === "/"
                    : currentPath.startsWith(item.path);
                return (
                  <li key={item.key}>
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive ? "active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                      onClick={closeMobileMenu}
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="actions-container">
              <ThemeToggle />
              <button
                type="button"
                data-button={cardStyle}
                data-shape="circle"
                className="i18n-toggle"
                aria-label={isZh ? "切换至英文" : "Switch to Chinese"}
                title={locale === "zh-CN" ? "Switch to English" : "切换至中文"}
                onClick={toggleLocale}
              >
                <Languages size={18} aria-hidden="true" />
              </button>

              <form
                data-button={cardStyle}
                data-shape={searchExpanded ? undefined : "circle"}
                className={`nav-search ${searchExpanded ? "expanded" : ""}`}
                onSubmit={handleSearchSubmit}
                role="search"
                onBlur={(event) => {
                  if (
                    !event.currentTarget.contains(
                      event.relatedTarget as Node | null,
                    )
                  )
                    setSearchExpanded(false);
                }}
              >
                <input
                  type="search"
                  name="s"
                  aria-label={isZh ? "搜索文章" : "Search articles"}
                  placeholder={t("search.placeholder")}
                  className="search-input"
                  ref={searchInputRef}
                  tabIndex={searchExpanded || mobileOpen ? 0 : -1}
                />
                <button
                  type="button"
                  ref={searchButtonRef}
                  className="search-submit-btn"
                  aria-label={t("search.button")}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={toggleSearch}
                >
                  <Search size={18} aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
          <button
            type="button"
            ref={menuButtonRef}
            data-button={cardStyle}
            data-shape="circle"
            className="menu-toggle"
            aria-label={
              isZh
                ? mobileOpen
                  ? "关闭菜单"
                  : "打开菜单"
                : mobileOpen
                  ? "Close menu"
                  : "Open menu"
            }
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </NavBarContainer>

      {mobileOpen && (
        <MobileOverlay aria-hidden="true" onClick={closeMobileMenu} />
      )}
    </>
  );
}

// Styled Scoped Layout Container

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const NavBarContainer = styled.nav`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  position: fixed;
  inset: 0 0 auto;
  z-index: 1000;
  box-sizing: border-box;
  width: 100%;
  --nav-gutter: 24px;
  padding: calc(var(--safe-top) + 12px) max(var(--nav-gutter), var(--safe-right))
    12px max(var(--nav-gutter), var(--safe-left));
  font-family: var(--title-font);
  will-change: transform;
  transition: transform 150ms ease-out;

  &[data-scroll-hidden="true"]:not([data-search-open], :has(:focus-visible, [aria-expanded="true"])) {
    transform: translateY(-100%);
    pointer-events: none;
  }

  &:has(:focus-visible) {
    transition: none;
  }

  @media (max-width: 48rem) {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    --nav-gutter: 16px;
  }

  .nav-left {
    justify-self: start;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: clamp(16px, 4vw, 64px);

    a {
      font-size: var(--text-brand);
      font-weight: var(--weight-regular);
      font-family: var(--site-title-font);
      color: var(--main-color);
      text-decoration: none;
      transition: color 0.2s;
    }

    @media (max-width: 48rem) {
      margin-left: 0;
    }
  }

  .nav-middle {
    justify-self: center;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    display: flex;
    align-items: center;
    padding: 0;

    &::-webkit-scrollbar {
      display: none;
    }

    @media (max-width: 48rem) {
      display: none;
    }
  }

  .nav-menu {
    display: flex;
    align-items: center;
    position: relative;
    padding: 4px;
    margin: 0;
    gap: 12px;
    list-style: none;
    isolation: isolate;
  }

  .nav-item {
    position: relative;
    z-index: 1;
    list-style: none;
  }

  .nav-link {
    display: block;
    padding: 4px 12px;
    color: var(--text-2);
    text-decoration: none;
    font-size: var(--text-body);
    font-weight: var(--weight-regular);
    transition: color 0.25s ease;
    border-radius: 999px;
    white-space: nowrap;

    &:hover {
      color: var(--text-1);
    }

    &.active {
      color: var(--text-1);
      font-weight: var(--weight-regular);
    }

    &:focus-visible {
      outline: 2px solid var(--main-color);
      outline-offset: -2px;
    }
  }

  .nav-slider {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 0;
    border-radius: 999px;
    background: oklch(from var(--main-color) l c h / 0.5);
    transition:
      transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
      width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
      opacity 0.2s ease;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
  }

  .nav-right-group {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: clamp(16px, 4vw, 64px);

    @media (max-width: 48rem) {
      margin-right: 0;
    }
  }

  .nav-right {
    display: flex;
    align-items: center;

    @media (max-width: 48rem) {
      display: none;
    }

    &.mobile-open {
      @media (max-width: 48rem) {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        right: max(var(--nav-gutter), var(--safe-right));
        left: max(var(--nav-gutter), var(--safe-left));
        background: var(--bg-3);
        border: var(--border);
        box-shadow: var(--box-shadow);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 16px;
        gap: 16px;
        z-index: 1001;
        animation: ${slideDown} 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);

        .actions-container {
          display: grid;
          grid-template-columns: 44px 44px minmax(0, 1fr);
          width: 100%;
          gap: 8px;
        }

        .actions-container > * {
          width: 100% !important;
          height: 44px !important;
          border-radius: 12px !important;
          justify-content: center;
          display: flex;
          align-items: center;
        }

        .nav-search {
          width: 100% !important;
          border-radius: 12px !important;
          height: 44px !important;
          padding: 0 4px;
        }

        .search-input {
          width: 100% !important;
          opacity: 1 !important;
          padding: 0 12px !important;
          pointer-events: auto !important;
        }

        .search-submit-btn {
          background: oklch(0 0 0 / 0);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          color: var(--text-1);
        }
      }
    }
  }

  .mobile-links {
    display: none;
    @media (max-width: 48rem) {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
      gap: 8px;
      list-style: none;
      border-bottom: var(--border);
      padding-bottom: 16px;
      .nav-link {
        border-radius: 12px;
      }
      .active {
        background: oklch(from var(--main-color) l c h / 0.5);
      }
    }
  }

  .actions-container {
    display: flex;
    align-items: center;
    gap: 8px;

    @media (max-width: 48rem) {
      display: none;
    }
  }

  .i18n-toggle,
  .menu-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;

    &:focus-visible {
      outline: 2px solid var(--main-color);
      outline-offset: 3px;
    }
    &:active {
      transform: scale(0.94);
      transition-duration: 0.1s;
    }
  }

  .nav-search {
    display: inline-flex;
    align-items: center;
    position: relative;
    height: 40px;
    width: 40px;
    border-radius: 50% !important;
    box-sizing: border-box;
    cursor: default;
    transition:
      width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
      border-radius 0.3s ease,
      border-color 0.25s ease,
      box-shadow 0.3s ease,
      background-color 0.25s ease;
    overflow: hidden;

    &.expanded {
      width: 220px;
      border-radius: 999px !important;

      .search-input {
        width: 100%;
        opacity: 1;
        padding: 0 0 0 16px;
        pointer-events: auto;
      }
    }

    &:hover,
    &:focus-within {
      border-color: var(--main-color);
    }

    &:focus-within {
      outline: 2px solid var(--main-color);
      outline-offset: 3px;
    }

    @media (min-width: 48.001rem) and (max-width: 68.75rem) {
      &.expanded {
        width: 40px;
        overflow: visible;
        .search-input {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 280px;
          height: 44px;
          padding: 0 16px;
          background: var(--bg-3);
          border: var(--border);
          border-radius: 16px;
          box-shadow: var(--box-shadow);
          outline: 2px solid var(--main-color);
        }
      }
    }
  }

  .search-input {
    flex: 1;
    min-width: 0;
    width: 0;
    opacity: 0;
    pointer-events: none;
    height: 100%;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-1);
    font-family: var(--content-font);
    font-size: var(--text-body);
    transition:
      opacity 0.2s ease,
      width 0.3s ease,
      padding 0.3s ease;

    &::placeholder {
      color: var(--text-3);
      opacity: 1;
    }
  }

  .search-submit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    padding: 0;
    background: transparent;
    border: none;
    color: var(--text-1);
    cursor: pointer;
    transition:
      color 0.2s ease,
      transform 0.2s ease;

    &:hover {
      color: var(--main-color);
    }
    &:active {
      transform: scale(0.92);
    }
    &:focus-visible {
      outline: 2px solid var(--main-color);
      outline-offset: 3px;
    }
  }

  .menu-toggle {
    display: none !important;
    font-size: 18px;
    z-index: 1002;

    @media (max-width: 48rem) {
      display: inline-flex !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;

const MobileOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  background: oklch(0 0 0 / 0.35);
  @media (min-width: 48.001rem) {
    display: none;
  }
`;
