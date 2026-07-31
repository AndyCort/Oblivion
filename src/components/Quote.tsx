import { useEffect, useState, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { t as translate, type Locale } from '../i18n/utils'
import { useLocale } from '../i18n/useLocale'
import { Quote as QuoteIconLucide } from 'lucide-react'

const TYPING_SPEED = 100
const DELETING_SPEED = 60
const PAUSE_AFTER_TYPING = 2000
const PAUSE_AFTER_DELETING = 500
const QUOTE_API = 'https://oiapi.net/api/Daily'

export default function Quote() {
    const { locale } = useLocale()
    const [quote, setQuote] = useState('')
    const [displayedText, setDisplayedText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [loading, setLoading] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const isAnimating = loading || displayedText !== quote || isDeleting

    const fetchQuote = async () => {
        try {
            setLoading(true)
            const res = await fetch(QUOTE_API)
            const data = await res.json()
            const text = locale === 'zh-CN' ? data.data.zh : data.data.en
            setQuote(text)
        } catch (error) {
            console.error('Failed to fetch quote:', error)
            setQuote(translate('quote.failed', locale))
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch
    useEffect(() => { fetchQuote() }, [])

    // Typewriter effect
    useEffect(() => {
        if (!quote || loading) return

        if (!isDeleting && displayedText.length < quote.length) {
            timeoutRef.current = setTimeout(() => {
                setDisplayedText(quote.slice(0, displayedText.length + 1))
            }, TYPING_SPEED)
        } else if (!isDeleting && displayedText.length === quote.length) {
            timeoutRef.current = setTimeout(() => {
                setIsDeleting(true)
            }, PAUSE_AFTER_TYPING)
        } else if (isDeleting && displayedText.length > 0) {
            timeoutRef.current = setTimeout(() => {
                setDisplayedText(displayedText.slice(0, -1))
            }, DELETING_SPEED)
        } else if (isDeleting && displayedText.length === 0) {
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
        <QuoteBox data-card="glass">
            <QuoteIcon><QuoteIconLucide size={16} /></QuoteIcon>
            <QuoteText className={isAnimating ? 'animating' : ''}>{displayedText}</QuoteText>
            <QuoteIcon><QuoteIconLucide size={16} style={{ transform: 'scaleX(-1)' }} /></QuoteIcon>
        </QuoteBox>
    )
}

const QuoteBox = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 16px);
  color: var(--text-1);
  width: 90%;
  max-width: 720px;
  border-radius: 50px;
  padding: 12px clamp(20px, 3vw, 32px);

  @media (max-width: 768px) {
    width: calc(100% - 32px);
    padding: 10px 20px;
  }
`;

const QuoteIcon = styled.div`
  font-size: clamp(0.75rem, 1.5vh, 1.1rem);
  flex-shrink: 0;
  opacity: 0.6;
`;

const quoteBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const QuoteText = styled.div`
  flex: 1;
  font-family: var(--content-font);
  font-size: clamp(0.85rem, 1.2vh + 0.5rem, 1.15rem);
  line-height: 1.6;
  min-height: 1.4em;
  text-align: center;

  &.animating::after {
    content: '|';
    margin-left: 2px;
    animation: ${quoteBlink} 1s infinite;
    display: inline;
  }
`;