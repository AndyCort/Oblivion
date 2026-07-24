import { useState, useEffect, useRef, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'

const heartColors = ['#ff8d9f', '#ffb6c1', '#ff99cc', '#ffe4e1', '#ffcced', '#ff1a1a']
let heartIdCounter = 0

const floatUp = keyframes`
  0% { transform: translateY(0) translateX(0) scale(0.5) rotate(0deg); opacity: 0; }
  10% { transform: translateY(-10px) translateX(calc(var(--drift) * 0.1)) scale(1) rotate(calc(var(--rotation) * 0.2)); opacity: 0.85; }
  100% { transform: translateY(-150px) translateX(var(--drift)) scale(0.3) rotate(var(--rotation)); opacity: 0; }
`

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
`

const FloatingHeart = styled.div`
  position: absolute;
  pointer-events: none;
  animation: ${floatUp} var(--duration) ease-out forwards;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.5s;
  }
`

const HeartShape = styled.div`
  position: relative;
  width: var(--size);
  height: calc(var(--size) * 0.9);

  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    width: calc(var(--size) * 0.6);
    height: var(--size);
    background: var(--color);
    border-radius: calc(var(--size) * 0.6) calc(var(--size) * 0.6) 0 0;
  }

  &::before {
    left: calc(var(--size) * 0.5);
    transform: rotate(-45deg);
    transform-origin: 0 100%;
  }

  &::after {
    left: 0;
    transform: rotate(45deg);
    transform-origin: 100% 100%;
  }
`

interface Heart {
  id: number
  x: number
  y: number
  size: number
  duration: number
  drift: number
  rotation: number
  color: string
}

export default function HeartAnimation() {
  const [hearts, setHearts] = useState<Heart[]>([])
  const autoSpawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const createHeart = useCallback((x: number, y: number, isClick = false) => {
    const size = isClick ? 14 + Math.random() * 8 : 10 + Math.random() * 6
    const heart: Heart = {
      id: heartIdCounter++, x: x - size / 2, y: y - size / 2, size,
      duration: 3.5 + Math.random() * 2,
      drift: (Math.random() - 0.5) * 40,
      rotation: (Math.random() - 0.5) * 20,
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
    }
    setHearts((prev) => [...prev, heart])
    setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== heart.id)), heart.duration * 1000)
  }, [])

  const createHeartBurst = useCallback((x: number, y: number) => {
    const count = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < count; i++) {
      const ox = (Math.random() - 0.5) * 20, oy = (Math.random() - 0.5) * 15
      setTimeout(() => createHeart(x + ox, y + oy, true), i * 100)
    }
  }, [createHeart])

  const autoSpawn = useCallback(() => {
    const count = 3 + Math.floor(Math.random() * 2)
    for (let i = 0; i < count; i++) {
      createHeart(Math.random() * window.innerWidth, window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.5, false)
    }
  }, [createHeart])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => createHeartBurst(e.clientX, e.clientY)
    document.addEventListener('click', handleClick)
    const scheduleNext = () => {
      autoSpawnTimerRef.current = setTimeout(() => { autoSpawn(); scheduleNext() }, 2000 + Math.random() * 2000)
    }
    scheduleNext()
    return () => {
      document.removeEventListener('click', handleClick)
      if (autoSpawnTimerRef.current) clearTimeout(autoSpawnTimerRef.current)
    }
  }, [autoSpawn, createHeartBurst])

  return (
    <Container>
      {hearts.map((heart) => (
        <FloatingHeart key={heart.id} style={{
          left: heart.x + 'px', top: heart.y + 'px',
          '--size': heart.size + 'px', '--duration': heart.duration + 's',
          '--drift': heart.drift + 'px', '--rotation': heart.rotation + 'deg', '--color': heart.color,
        } as React.CSSProperties}>
          <HeartShape />
        </FloatingHeart>
      ))}
    </Container>
  )
}
