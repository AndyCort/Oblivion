import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTheme } from '../stores/ThemeContext'
import { useTranslation } from '../i18n/useTranslation'
import { API_BASE } from '../api/config'


const menuItems = [
  { key: 'home', path: '/' },
  { key: 'articles', path: '/' },
  { key: 'about', path: '/about' },
]



const Nav = styled.nav`
  font-family: var(--title-font);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: transform 0.3s ease;
  box-sizing: border-box;

  &.nav-hidden {
    transform: translateY(-100%);
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`

const NavLeft = styled.div`
  flex-shrink: 0;

  a {
    font-size: 1.5rem;
    font-weight: bold;
    font-family: var(--site-title-font);
    color: var(--main-color);
    text-decoration: none;
    transition: color 0.2s;
  }

  @media (max-width: 480px) {
    a { 
      font-size: 1.25rem; 
    }
  }
`

const NavContent = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    position: fixed;
    left: auto;
    transform: none;
    top: 0;
    right: -100%;
    width: 80%;
    height: 100vh;
    z-index: 1001;
    background: var(--nav-bg);
    border-left: 1px solid var(--border-color);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    margin: 0;
    box-sizing: border-box;
    transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);

    &.mobile-open { right: 0; }
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`

const NavMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: 8px;
  margin: 0;
  padding: 0;

  li {
    opacity: 1;
    transform: none;
    transition: all 0.4s ease;
  }

  li a {
    display: block;
    padding: 8px 16px;
    color: var(--frame-color);
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;
    font-family: var(--content-font);
    font-weight: bold;

    &:hover, &.active { color: var(--main-color); }

    &::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      width: 0;
      height: 2px;
      background-color: var(--main-color);
      transition: width 0.3s ease, left 0.3s ease;
      border-radius: 2px;
    }

    &:hover::after, &.active::after {
      width: calc(100% - 32px);
      left: 16px;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    width: 100%;
    align-items: center;

    ${NavContent}:not(.mobile-open) & li {
      opacity: 0;
      transform: translateY(20px);
    }

    li {
      transition-delay: calc(var(--i) * 0.1s);
    }

    li a {
      font-size: 1.5rem;
      padding: 12px 24px;
      text-align: center;
      
      &:hover::after, &.active::after {
        width: 40px;
        left: calc(50% - 20px);
        bottom: 0;
      }
    }
  }
`

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  position: absolute;
  right: 24px;
  z-index: 1002;

  @media (max-width: 768px) {
    position: static;
    flex-direction: column;
    gap: 24px;
    margin-top: 40px;
    width: 100%;
    align-items: center;
    display: none; /* Hide desktop version on mobile */

    &.mobile-only {
      display: flex;
    }
  }
`

const NavSearch = styled.div`
  display: flex;
  align-items: center;

  form {
    display: flex;
    align-items: center;
    background: transparent;
    border: none;
    transition: all 0.3s ease;
  }

  .search-input {
    width: 0;
    padding: 0;
    border: none;
    outline: none;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--text-color);
    background: var(--input-bg);
    border-radius: 20px;
    font-size: 0.9rem;
  }

  &.expanded .search-input {
    width: 200px;
    padding: 8px 16px;
    opacity: 1;
    margin-right: 8px;
    border: 1px solid var(--border-color);
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    color: var(--frame-color);
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 50%;

    &:hover {
      color: var(--main-color);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
    justify-content: center;

    form {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 0 4px;
    }

    .search-input {
      width: 100% !important;
      padding: 10px 16px !important;
      opacity: 1 !important;
      background: var(--input-bg) !important;
      border: 1px solid var(--border-color) !important;
    }
    
    button {
      background: transparent !important;
    }
  }
`





const MenuToggle = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--nav-bg);
  border: 1px solid var(--border-color);
  color: var(--frame-color);
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 18px;
  z-index: 1002;

  &:hover {
    border-color: var(--main-color);
    color: var(--main-color);
  }

  @media (max-width: 768px) {
    display: flex;
    order: 3;
    &.active {
      background: transparent;
      border-color: transparent;
      color: var(--frame-color);
    }
  }
`

const MobileOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;

  &.active {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 768px) {
    display: block;
  }
`

export default function NavBar() {
  const { theme } = useTheme()
  const { t } = useTranslation()

  const [siteTitle, setSiteTitle] = useState(t('siteName'))
  const [showSearch, setShowSearch] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && data.siteTitle) setSiteTitle(data.siteTitle)
      })
      .catch(() => { })
  }, [])

  const searchNavigate = useNavigate()

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => {
      if (!prev) setTimeout(() => searchInputRef.current?.focus(), 100)
      return !prev
    })
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = searchInputRef.current?.value?.trim()
    if (val) {
      searchNavigate(`/search?s=${encodeURIComponent(val)}`)
      setShowSearch(false)
      closeMobileMenu()
    }
  }

  const onSearchBlur = () => {
    setTimeout(() => {
      if (!searchInputRef.current?.value) setShowSearch(false)
    }, 200)
  }



  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      document.body.style.overflow = !prev ? 'hidden' : ''
      return !prev
    })
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    document.body.style.overflow = ''
  }

  const handleMenuItemClick = (key: string) => {
    closeMobileMenu()
    if (key === 'home') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const updateScroll = () => {
      const scrollY = window.scrollY
      if (scrollY > 100) {
        setNavVisible(scrollY < lastScrollYRef.current)
      } else {
        setNavVisible(true)
      }


      lastScrollYRef.current = scrollY
    }

    window.addEventListener('scroll', updateScroll)
    return () => window.removeEventListener('scroll', updateScroll)
  }, [theme])



  return (
    <>
      <Nav className={`nav-bar${navVisible ? '' : ' nav-hidden'}`}>
        <NavLeft>
          <a href="/">{siteTitle}</a>
        </NavLeft>

        <MenuToggle className={mobileMenuOpen ? 'active' : ''} onClick={toggleMobileMenu}>
          <i className={`fas ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </MenuToggle>

        <NavContent className={mobileMenuOpen ? 'mobile-open' : ''}>
          <NavMenu>
            {menuItems.map((item, index) => (
              <li key={item.key} style={{ '--i': index } as any}>
                <Link to={item.path} onClick={() => handleMenuItemClick(item.key)}>
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </NavMenu>

          {isMobile && (
            <NavRight className="mobile-only">
              <NavSearch className={showSearch ? 'expanded' : ''}>
                <form onSubmit={handleSearchSubmit}>
                  <input
                    ref={searchInputRef}
                    type="search"
                    name="s"
                    placeholder={t('search.placeholder')}
                    className="search-input"
                    data-glass=""
                    onFocus={() => setShowSearch(true)}
                    onBlur={onSearchBlur}
                  />
                  <button type="button" onClick={toggleSearch}>
                    <i className="fas fa-magnifying-glass"></i>
                  </button>
                </form>
              </NavSearch>
            </NavRight>
          )}
        </NavContent>

        {!isMobile && (
          <NavRight>
            <NavSearch className={showSearch ? 'expanded' : ''}>
              <form onSubmit={handleSearchSubmit}>
                <input
                  ref={searchInputRef}
                  type="search"
                  name="s"
                  placeholder={t('search.placeholder')}
                  className="search-input"
                  data-glass=""
                  onFocus={() => setShowSearch(true)}
                  onBlur={onSearchBlur}
                />
                <button type="button" onClick={toggleSearch}>
                  <i className="fas fa-magnifying-glass"></i>
                </button>
              </form>
            </NavSearch>
          </NavRight>
        )}
      </Nav>
      <MobileOverlay className={mobileMenuOpen ? 'active' : ''} onClick={closeMobileMenu} />
    </>
  )
}
