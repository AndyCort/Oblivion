import { useEffect, useState, useRef } from 'react'
import { getLocale, t as translate, type Locale } from '../i18n/utils'

const TYPING_SPEED = 100
const DELETING_SPEED = 60
const PAUSE_AFTER_TYPING = 2000
const PAUSE_AFTER_DELETING = 500

export default function Quote() {
    const [locale, setLocale] = useState<Locale>(() => getLocale())
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
        <div className="quote-box">
            <div className="quote-icon"><i className="fas fa-quote-left" /></div>
            <div className={`quote-text ${isAnimating ? 'animating' : ''}`}>{displayedText}</div>
            <div className="quote-icon"><i className="fas fa-quote-right" /></div>
        </div>
    )
}