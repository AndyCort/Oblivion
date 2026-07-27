import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'

function getMusicUrl(filename: string) {
    return new URL(`../assets/music/${filename}`, import.meta.url).href
}

const initialPlaylist = [
    {
        name: 'いつかこの恋を思い出してきっと泣いてしまう',
        artist_name: '得田真裕',
        audio: getMusicUrl('得田真裕 - いつかこの恋を思い出してきっと泣いてしまう.flac'),
    },
]

const STORAGE_KEY = 'music-widget-pos'

interface Position { x: number; y: number }

function loadPosition(): Position {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) return JSON.parse(saved)
    } catch { }
    return { x: 20, y: 20 }
}

export default function Music() {
    const [playlist] = useState(initialPlaylist)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [loading] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [position, setPosition] = useState<Position>(loadPosition)
    const [isDragging, setIsDragging] = useState(false)

    const audioRef = useRef<HTMLAudioElement>(null)
    const widgetRef = useRef<HTMLDivElement>(null)
    const dragOffset = useRef({ x: 0, y: 0 })

    const currentTrack = useMemo(() => playlist[currentIndex] || null, [playlist, currentIndex])

    const savePosition = useCallback((pos: Position) => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)) } catch { }
    }, [])

    const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const target = e.target as HTMLElement
        if (target.closest('[data-control]') || target.closest('[data-toggle]')) return
        setIsDragging(true)
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
        setPosition((prev) => {
            dragOffset.current = { x: clientX - prev.x, y: clientY - prev.y }
            return prev
        })
    }, [])

    useEffect(() => {
        if (!isDragging) return
        const onDrag = (e: MouseEvent | TouchEvent) => {
            e.preventDefault()
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
            const el = widgetRef.current
            if (!el) return
            const maxX = window.innerWidth - el.offsetWidth
            const maxY = window.innerHeight - el.offsetHeight
            setPosition({
                x: Math.max(0, Math.min(clientX - dragOffset.current.x, maxX)),
                y: Math.max(0, Math.min(clientY - dragOffset.current.y, maxY)),
            })
        }
        const stopDrag = () => {
            setIsDragging(false)
            setPosition((pos) => { savePosition(pos); return pos })
        }
        document.addEventListener('mousemove', onDrag)
        document.addEventListener('mouseup', stopDrag)
        document.addEventListener('touchmove', onDrag, { passive: false })
        document.addEventListener('touchend', stopDrag)
        return () => {
            document.removeEventListener('mousemove', onDrag)
            document.removeEventListener('mouseup', stopDrag)
            document.removeEventListener('touchmove', onDrag)
            document.removeEventListener('touchend', stopDrag)
        }
    }, [isDragging, savePosition])

    useEffect(() => {
        const clamp = () => {
            const el = widgetRef.current
            if (!el) return
            const maxX = window.innerWidth - el.offsetWidth
            const maxY = window.innerHeight - el.offsetHeight
            setPosition((prev) => {
                const clamped = {
                    x: Math.max(0, Math.min(prev.x, maxX)),
                    y: Math.max(0, Math.min(prev.y, maxY)),
                }
                savePosition(clamped)
                return clamped
            })
        }
        window.addEventListener('resize', clamp)
        requestAnimationFrame(clamp)
        return () => window.removeEventListener('resize', clamp)
    }, [savePosition])

    const togglePlay = () => {
        if (!audioRef.current || !currentTrack) return
        if (isPlaying) { audioRef.current.pause() } else { audioRef.current.play().catch(() => { }) }
        setIsPlaying(!isPlaying)
    }

    const prevTrack = () => {
        if (playlist.length === 0) return
        setCurrentIndex(currentIndex === 0 ? playlist.length - 1 : currentIndex - 1)
    }

    const nextTrack = useCallback(() => {
        if (playlist.length === 0) return
        setCurrentIndex((prev) => (prev + 1) % playlist.length)
    }, [playlist.length])

    useEffect(() => {
        if (!audioRef.current) return
        audioRef.current.load()
        if (isPlaying) audioRef.current.play().catch(() => { })
    }, [currentIndex])

    return (
        <MusicWidget
            className={isDragging ? 'dragging' : ''}
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
            ref={widgetRef}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
        >
            <MusicControls>
                <MusicControlBtn data-control="" onClick={prevTrack}>
                    <i className="fas fa-step-backward"></i>
                </MusicControlBtn>
                <MusicControlBtn data-control="" onClick={togglePlay}>
                    <i className={`fas ${loading ? 'fa-spinner fa-spin' : isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                </MusicControlBtn>
                <MusicControlBtn data-control="" onClick={nextTrack}>
                    <i className="fas fa-step-forward"></i>
                </MusicControlBtn>
            </MusicControls>

            {expanded && (
                <MusicTrackInfo>
                    <MusicTrackText>
                        {currentTrack ? `${currentTrack.name} - ${currentTrack.artist_name}` : loading ? 'Loading...' : 'No track'}
                    </MusicTrackText>
                </MusicTrackInfo>
            )}

            <MusicToggleBtn data-toggle="" onClick={() => setExpanded(!expanded)}>
                <i className={`fas ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </MusicToggleBtn>

            <audio ref={audioRef} src={currentTrack?.audio} onEnded={nextTrack} onError={() => setIsPlaying(false)} preload="auto" />
        </MusicWidget>
    )
}

const MusicWidget = styled.div`
  position: fixed;
  z-index: 9998;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  user-select: none;
  cursor: grab;
  transition: border-color 0.3s;
  min-width: 140px;

  &.dragging {
    cursor: grabbing;
  }

  &:hover {
    border-color: var(--main-color);
  }
`;

const MusicControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MusicControlBtn = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  height: clamp(2rem, 4vh, 2.8rem);
  width: clamp(2rem, 4vh, 2.8rem);
  border-radius: 50%;
  color: var(--text-1);
  font-size: clamp(0.85rem, 1.6vh, 1.1rem);
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
  background: transparent;
  border: none;

  &:hover {
    transform: scale(1.15);
    color: var(--main-color);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const MusicTrackInfo = styled.div`
  text-align: center;
  max-width: 180px;
  overflow: hidden;
`;

const scrollText = keyframes`
  0%, 15% { transform: translateX(0); }
  85%, 100% { transform: translateX(calc(-100% + 180px)); }
`;

const MusicTrackText = styled.span`
  font-family: var(--content-font);
  font-size: clamp(0.6rem, 1vh, 0.75rem);
  color: var(--text-1);
  opacity: 0.75;
  white-space: nowrap;
  display: inline-block;
  animation: ${scrollText} 12s linear infinite;
`;

const MusicToggleBtn = styled.button`
  cursor: pointer;
  color: var(--text-1);
  opacity: 0.4;
  font-size: 0.6rem;
  transition: opacity 0.2s;
  padding: 0 4px;
  background: transparent;
  border: none;

  &:hover {
    opacity: 0.8;
  }
`;
