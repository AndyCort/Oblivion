import styled, { keyframes } from 'styled-components'

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
  40% { transform: translateX(-50%) translateY(-12px); }
  60% { transform: translateX(-50%) translateY(-6px); }
`

const Hint = styled.div`
  position: absolute;
  bottom: clamp(20px, 4vh, 50px);
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 100;
  animation: ${bounce} 2s ease-in-out infinite;
`

const Arrow = styled.div`
  font-size: 24px;
  color: var(--frame-color);
  transition: color 0.2s, transform 0.2s;
  &:hover { color: var(--accent-color); transform: scale(1.2); }
`

export default function ScrollArrow() {
    const scrollToArticles = () => {
        const el = document.getElementsByClassName('article-list')[0]
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <Hint onClick={scrollToArticles}>
            <Arrow><i className="fas fa-chevron-down"></i></Arrow>
        </Hint>
    )
}
