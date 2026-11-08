import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { List } from 'lucide-react';
import { useCardStyle } from '../../stores/themeStore';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  headings: TocItem[];
}

export default function Toc({ headings = [] }: Props) {
  const { cardStyle } = useCardStyle();
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
    const timer = setTimeout(() => {
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 300);
    return () => { clearTimeout(timer); observer.disconnect(); };
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
    <TocWrapper className="toc-root">
      <nav className="toc-sidebar" aria-label="Table of Contents" data-card={cardStyle}>
        <h3 className="toc-sidebar-title">目录</h3>
        <ul className="toc-list">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                className="toc-link"
                data-active={activeId === h.id ? 'true' : undefined}
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                style={{
                  paddingLeft: `${1 + (h.level - 1) * 0.875}rem`,
                  fontWeight: h.level === 1 ? 'var(--weight-strong)' : 'var(--weight-regular)'
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        className="toc-fab"
        data-button={cardStyle}
        data-shape="circle"
        aria-label="Table of Contents"
        onClick={() => setIsOpen(true)}
      >
        <List size={18} />
      </button>

      <div
        className={`toc-overlay ${isOpen ? 'is-open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
      >
        <div className="toc-bottom-sheet">
          <div className="sheet-handle" />
          <h4 className="sheet-title">目录</h4>
          {headings.map((h) => (
            <a
              key={h.id}
              className="sheet-link"
              data-active={activeId === h.id ? 'true' : undefined}
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              style={{
                paddingLeft: `${1.25 + (h.level - 1)}rem`,
                fontWeight: h.level === 1 ? 'var(--weight-strong)' : 'var(--weight-regular)'
              }}
            >
              {h.text}
            </a>
          ))}
        </div>
      </div>
    </TocWrapper>
  );
}

// Scoped Styled Root
const TocWrapper = styled.div`
  .toc-sidebar {
    position: fixed;
    top: 100px;
    right: max(calc((100vw - 900px) / 2 - 280px), 20px);
    width: 220px;
    max-height: calc(100vh - 140px);
    max-height: calc(100svh - 140px);
    overflow-y: auto;
    z-index: 10;
    padding: 16px 0;

    @media (max-width: 81.25rem) {
      display: none;
    }
  }

  .toc-sidebar-title {
    font-size: var(--text-body);
    font-weight: var(--weight-strong);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    text-align: center;
    color: var(--main-color);
    margin-bottom: 12px;
    padding: 0 16px;
  }

  .toc-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .toc-link {
    display: block;
    font-size: var(--text-meta);
    overflow-wrap: anywhere;
    padding: 6px 16px;
    line-height: var(--leading-ui);
    color: var(--text-2);
    text-decoration: none;
    border-left: 2px solid oklch(0 0 0 / 0);
    transition: all 0.2s ease;
    cursor: pointer;

    &[data-active="true"] {
      color: var(--main-color);
      border-left-color: var(--main-color);
    }

    &:hover {
      opacity: 1;
      color: var(--main-color);
    }
  }

  .toc-fab {
    display: none;
    position: fixed;
    bottom: calc(90px + var(--safe-bottom));
    right: calc(40px + var(--safe-right));
    z-index: 900;
    font-size: 18px;

    @media (max-width: 81.25rem) {
      display: flex;
    }

    @media (max-width: 48rem) {
      right: calc(20px + var(--safe-right));
    }
  }

  .toc-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: oklch(0 0 0 / 0.4);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;

    &.is-open {
      opacity: 1;
      pointer-events: auto;

      .toc-bottom-sheet {
        transform: translateY(0);
      }
    }
  }

  .toc-bottom-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    max-height: 60vh;
    background: var(--bg-3);
    border-top: var(--border);
    border-radius: 20px 20px 0 0;
    padding: 12px var(--safe-right) calc(20px + var(--safe-bottom)) var(--safe-left);
    overflow-y: auto;
    transform: translateY(100%);
    transition: transform 0.28s ease-out;
  }

  .sheet-handle {
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: var(--text-3);
    opacity: 0.2;
    margin: 0 auto 12px;
  }

  .sheet-title {
    font-size: var(--text-meta);
    font-weight: var(--weight-strong);
    color: var(--main-color);
    padding: 0 20px 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .sheet-link {
    display: block;
    font-size: var(--text-meta);
    line-height: var(--leading-ui);
    overflow-wrap: anywhere;
    padding: 10px 20px;
    color: var(--text-2);
    text-decoration: none;
    transition: all 0.15s;
    cursor: pointer;

    &[data-active="true"] {
      color: var(--main-color);
    }

    &:active {
      background: oklch(1 0 0 / 0.06);
    }
  }
`;
