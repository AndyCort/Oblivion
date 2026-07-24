import { useState, useEffect, useCallback, useRef } from 'react'
import styled, { keyframes } from 'styled-components'

/* ── Types ── */
export interface TocItem {
    id: string
    text: string
    level: number
}

/* ── Helpers ── */
export function extractHeadings(markdown: string): TocItem[] {
    const lines = markdown.split('\n')
    const items: TocItem[] = []
    let inCodeBlock = false

    for (const line of lines) {
        if (line.trimStart().startsWith('```')) {
            inCodeBlock = !inCodeBlock
            continue
        }
        if (inCodeBlock) continue
        const match = line.match(/^(#{1,3})\s+(.+)/)
        if (match) {
            const level = match[1].length
            const text = match[2].replace(/[*_`~\[\]]/g, '').trim()
            const id = text
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\u4e00-\u9fff-]/g, '')
            items.push({ id, text, level })
        }
    }
    return items
}

/* ── Animations ── */
const slideUp = keyframes`
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
`
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

/* ── Desktop Sidebar ── */
const SidebarWrapper = styled.div`
  grid-column: 3;
  padding-left: 40px;
  position: sticky;
  top: 110px;
  align-self: start;
  z-index: 10;
  
  @media (max-width: 1300px) { display: none; }
`

const Sidebar = styled.nav`
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  width: 220px;
  flex-shrink: 0;
  padding: 16px 0;

  /* scrollbar */
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: var(--glass-border-color);
    border-radius: 4px;
  }
`

const SidebarTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-color);
  opacity: 0.45;
  margin-bottom: 12px;
  padding: 0 16px;
`

const TocList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const TocLink = styled.a<{ $depth: number; $active: boolean }>`
  display: block;
  padding: 6px 16px 6px ${({ $depth }) => 16 + ($depth - 1) * 14}px;
  font-size: ${({ $depth }) => ($depth === 1 ? '0.85rem' : '0.8rem')};
  font-weight: ${({ $depth }) => ($depth === 1 ? 600 : 400)};
  line-height: 1.5;
  color: ${({ $active }) => ($active ? 'var(--main-color)' : 'var(--text-color)')};
  opacity: ${({ $active }) => ($active ? 1 : 0.55)};
  text-decoration: none;
  border-left: 2px solid ${({ $active }) => ($active ? 'var(--main-color)' : 'transparent')};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    opacity: 1;
    color: var(--main-color);
  }
`

/* ── Mobile FAB + Bottom Sheet ── */
const Fab = styled.button`
  display: none;
  position: fixed;
  bottom: 90px;
  right: 20px;
  z-index: 900;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--glass-border-color);
  background: var(--glass-bg-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  color: var(--text-color);
  font-size: 18px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:active { transform: scale(0.92); }

  @media (max-width: 1300px) { display: flex; }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.4);
  animation: ${fadeIn} 0.2s ease;
`

const Sheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 60vh;
  background: var(--glass-bg-color);
  border-top: 1px solid var(--glass-border-color);
  border-radius: 20px 20px 0 0;
  padding: 12px 0 calc(20px + var(--safe-area-inset-bottom, 0px));
  overflow-y: auto;
  animation: ${slideUp} 0.28s ease-out;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: var(--glass-border-color);
    border-radius: 4px;
  }
`

const SheetHandle = styled.div`
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--text-color);
  opacity: 0.2;
  margin: 0 auto 12px;
`

const SheetTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-color);
  opacity: 0.5;
  padding: 0 20px 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`

const SheetLink = styled.a<{ $depth: number; $active: boolean }>`
  display: block;
  padding: 10px 20px 10px ${({ $depth }) => 20 + ($depth - 1) * 16}px;
  font-size: ${({ $depth }) => ($depth === 1 ? '0.95rem' : '0.9rem')};
  font-weight: ${({ $depth }) => ($depth === 1 ? 600 : 400)};
  color: ${({ $active }) => ($active ? 'var(--main-color)' : 'var(--text-color)')};
  opacity: ${({ $active }) => ($active ? 1 : 0.65)};
  text-decoration: none;
  transition: all 0.15s;
  cursor: pointer;

  &:active {
    background: rgba(255, 255, 255, 0.06);
  }
`

/* ── Component ── */
interface Props {
    headings: TocItem[]
}

export default function TableOfContents({ headings }: Props) {
    const [activeId, setActiveId] = useState<string>('')
    const [sheetOpen, setSheetOpen] = useState(false)
    const observerRef = useRef<IntersectionObserver | null>(null)

    /* Intersection Observer for active heading tracking */
    useEffect(() => {
        if (headings.length === 0) return

        const callback: IntersectionObserverCallback = (entries) => {
            // Pick the first heading that's intersecting from the top
            const visible = entries
                .filter((e) => e.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
            if (visible.length > 0) {
                setActiveId(visible[0].target.id)
            }
        }

        observerRef.current = new IntersectionObserver(callback, {
            rootMargin: '-80px 0px -60% 0px',
            threshold: 0.1,
        })

        // Wait a tick for MDEditor.Markdown to finish rendering
        const timer = setTimeout(() => {
            headings.forEach(({ id }) => {
                const el = document.getElementById(id)
                if (el) observerRef.current?.observe(el)
            })
        }, 500)

        return () => {
            clearTimeout(timer)
            observerRef.current?.disconnect()
        }
    }, [headings])

    const scrollTo = useCallback(
        (id: string) => {
            const el = document.getElementById(id)
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                setActiveId(id)
            }
            setSheetOpen(false)
        },
        []
    )

    if (headings.length === 0) return null

    return (
        <>
            {/* Desktop sidebar */}
            <SidebarWrapper>
                <Sidebar>
                    <SidebarTitle>目录</SidebarTitle>
                    <TocList>
                        {headings.map((h) => (
                            <li key={h.id}>
                                <TocLink
                                    $depth={h.level}
                                    $active={activeId === h.id}
                                    onClick={(e) => { e.preventDefault(); scrollTo(h.id) }}
                                    href={`#${h.id}`}
                                >
                                    {h.text}
                                </TocLink>
                            </li>
                        ))}
                    </TocList>
                </Sidebar>
            </SidebarWrapper>

            {/* Mobile FAB */}
            <Fab onClick={() => setSheetOpen(true)} aria-label="Table of Contents">
                <i className="fas fa-list-ul" />
            </Fab>

            {/* Mobile Bottom Sheet */}
            {sheetOpen && (
                <Overlay onClick={() => setSheetOpen(false)}>
                    <Sheet onClick={(e) => e.stopPropagation()}>
                        <SheetHandle />
                        <SheetTitle>目录</SheetTitle>
                        {headings.map((h) => (
                            <SheetLink
                                key={h.id}
                                $depth={h.level}
                                $active={activeId === h.id}
                                onClick={(e) => { e.preventDefault(); scrollTo(h.id) }}
                                href={`#${h.id}`}
                            >
                                {h.text}
                            </SheetLink>
                        ))}
                    </Sheet>
                </Overlay>
            )}
        </>
    )
}
