import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  headings: TocItem[];
}

export default function Toc({ headings = [] }: Props) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;
    const ids = headings.map(h => h.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );
    setTimeout(() => {
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 300);
    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
    setIsOpen(false);
  };

  if (headings.length === 0) return null;

  return (
    <>
      <Sidebar aria-label="Table of Contents" data-card="base">
        <SidebarTitle>目录</SidebarTitle>
        <TocList>
          {headings.map((h) => (
            <li key={h.id}>
              <SidebarLink
                $isActive={activeId === h.id}
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                style={{
                  paddingLeft: `${16 + (h.level - 1) * 14}px`,
                  fontSize: h.level === 1 ? '0.85rem' : '0.8rem',
                  fontWeight: h.level === 1 ? 600 : 400
                }}
              >
                {h.text}
              </SidebarLink>
            </li>
          ))}
        </TocList>
      </Sidebar>

      <Fab aria-label="Table of Contents" onClick={() => setIsOpen(true)}>
        <List size={18} />
      </Fab>

      <Overlay $isOpen={isOpen} onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
        <BottomSheet>
          <SheetHandle />
          <SheetTitle>目录</SheetTitle>
          {headings.map((h) => (
            <SheetLink
              key={h.id}
              $isActive={activeId === h.id}
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              style={{
                paddingLeft: `${20 + (h.level - 1) * 16}px`,
                fontSize: h.level === 1 ? '0.95rem' : '0.9rem',
                fontWeight: h.level === 1 ? 600 : 400
              }}
            >
              {h.text}
            </SheetLink>
          ))}
        </BottomSheet>
      </Overlay>
    </>
  );
}

// Styled Components

const Sidebar = styled.nav`
  position: fixed;
  top: 100px;
  right: max(calc((100vw - 900px) / 2 - 280px), 20px);
  width: 220px;
  max-height: calc(100vh - 140px);
  max-height: calc(100svh - 140px);
  overflow-y: auto;
  z-index: 10;
  padding: 16px 0;

  @media (max-width: 1300px) {
    display: none;
  }
`;

const SidebarTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
  color: var(--main-color);
  opacity: 0.8;
  margin-bottom: 12px;
  padding: 0 16px;
`;

const TocList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const SidebarLink = styled.a<{ $isActive?: boolean }>`
  display: block;
  padding: 6px 16px;
  line-height: 1.5;
  color: ${props => props.$isActive ? 'var(--main-color)' : 'var(--text-3)'};
  opacity: ${props => props.$isActive ? 1 : 0.55};
  text-decoration: none;
  border-left: 2px solid ${props => props.$isActive ? 'var(--main-color)' : 'transparent'};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    opacity: 1;
    color: var(--main-color);
  }
`;

const Fab = styled.button`
  display: none;
  position: fixed;
  bottom: 90px;
  right: 20px;
  z-index: 900;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: var(--border);
  background: var(--bg-1);
  box-shadow: var(--box-shadow);
  color: var(--text-3);
  font-size: 18px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.92);
  }

  @media (max-width: 1300px) {
    display: flex;
  }
`;

const Overlay = styled.div<{ $isOpen?: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.4);
  opacity: ${props => props.$isOpen ? 1 : 0};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  transition: opacity 0.2s ease;

  .toc-sheet {
    transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(100%)'};
  }
`;

const BottomSheet = styled.div.attrs({ className: 'toc-sheet' })`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 60vh;
  background: var(--bg-1);
  border-top: var(--border);
  border-radius: 20px 20px 0 0;
  padding: 12px 0 20px;
  overflow-y: auto;
  transition: transform 0.28s ease-out;

`;

const SheetHandle = styled.div`
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--text-3);
  opacity: 0.2;
  margin: 0 auto 12px;
`;

const SheetTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--main-color);
  opacity: 0.8;
  padding: 0 20px 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const SheetLink = styled.a<{ $isActive?: boolean }>`
  display: block;
  padding: 10px 20px;
  color: ${props => props.$isActive ? 'var(--main-color)' : 'var(--text-3)'};
  opacity: ${props => props.$isActive ? 1 : 0.65};
  text-decoration: none;
  transition: all 0.15s;
  cursor: pointer;

  &:active {
    background: rgba(255, 255, 255, 0.06);
  }
`;
