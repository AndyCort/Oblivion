import { useEffect, useState, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { useTranslation } from '../i18n/useTranslation'

const TYPING_SPEED = 100
const DELETING_SPEED = 60
const PAUSE_AFTER_TYPING = 2000
const PAUSE_AFTER_DELETING = 500

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`

const QuoteBox = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 16px);
  color: var(--frame-color);
  width: 90%;
  max-width: 720px;
  border-radius: 50px;
  padding: 12px clamp(20px, 3vw, 32px);
  background: var(--glass-bg-color);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: none;

  @media (max-width: 768px) {
    width: calc(100% - 32px);
    padding: 10px 20px;
  }
`

const QuoteIcon = styled.div`
  font-size: clamp(0.75rem, 1.5vh, 1.1rem);
  flex-shrink: 0;
  opacity: 0.6;
`

const QuoteText = styled.div<{ $isAnimating: boolean }>`
  flex: 1;
  font-family: var(--content-font);
  font-size: clamp(0.85rem, 1.2vh + 0.5rem, 1.15rem);
  line-height: 1.6;
  min-height: 1.4em;
  text-align: center;

  &::after {
    content: '|';
    margin-left: 2px;
    animation: ${blink} 1s infinite;
    display: ${({ $isAnimating }) => ($isAnimating ? 'inline' : 'none')};
  }
`

export default function Quote() {
    const { t, locale } = useTranslation()
    const [quote, setQuote] = useState('')
    const [displayedText, setDisplayedText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [loading, setLoading] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const isAnimating = loading || displayedText !== quote || isDeleting

    const QuoteApi = 'https://oiapi.net/api/Daily'
    const fetchQuote = async () => {
        try {
            setLoading(true)
            const res = await fetch(QuoteApi)
            const data = await res.json()
            const text = locale === 'zh-CN' ? data.data.zh : data.data.en
            setQuote(text)
        } catch (error) {
            console.error('Failed to fetch quote:', error)
            setQuote(t('quote.failed'))
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchQuote()
    }, [])

    // Re-fetch on locale change
    useEffect(() => {
        if (quote) fetchQuote()
    }, [locale])

    // Typewriter effect
    useEffect(() => {
        if (!quote || loading) return

        if (!isDeleting && displayedText.length < quote.length) {
            // Typing forward
            timeoutRef.current = setTimeout(() => {
                setDisplayedText(quote.slice(0, displayedText.length + 1))
            }, TYPING_SPEED)
        } else if (!isDeleting && displayedText.length === quote.length) {
            // Finished typing → pause then start deleting
            timeoutRef.current = setTimeout(() => {
                setIsDeleting(true)
            }, PAUSE_AFTER_TYPING)
        } else if (isDeleting && displayedText.length > 0) {
            // Deleting backward
            timeoutRef.current = setTimeout(() => {
                setDisplayedText(displayedText.slice(0, -1))
            }, DELETING_SPEED)
        } else if (isDeleting && displayedText.length === 0) {
            // Finished deleting → fetch new quote
            setIsDeleting(false)
            timeoutRef.current = setTimeout(() => {
                fetchQuote()
            }, PAUSE_AFTER_DELETING)
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [displayedText, isDeleting, quote, loading])

    return (
        <QuoteBox>
            <QuoteIcon><i className="fas fa-quote-left" /></QuoteIcon>
            <QuoteText $isAnimating={isAnimating}>{displayedText}</QuoteText>
            <QuoteIcon><i className="fas fa-quote-right" /></QuoteIcon>
        </QuoteBox>
    )
}