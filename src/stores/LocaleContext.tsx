import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'


interface LocaleContextType {
    locale: string
    initLocale: () => void
    setLocale: (newLocale: string) => void
    toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const { i18n: i18nInstance } = useTranslation()
    const [locale, setLocaleState] = useState(i18nInstance.language)

    const initLocale = useCallback(() => {
        const current = i18nInstance.language
        setLocaleState(current)
        localStorage.setItem('locale', current)
    }, [i18nInstance])

    const setLocale = useCallback((newLocale: string) => {
        i18nInstance.changeLanguage(newLocale)
    }, [i18nInstance])

    const toggleLocale = useCallback(() => {
        const next = locale === 'zh-CN' ? 'en-US' : 'zh-CN'
        i18nInstance.changeLanguage(next)
    }, [locale, i18nInstance])

    useEffect(() => {
        const handleLanguageChanged = (lng: string) => {
            setLocaleState(lng)
            localStorage.setItem('locale', lng)
        }
        i18nInstance.on('languageChanged', handleLanguageChanged)
        return () => {
            i18nInstance.off('languageChanged', handleLanguageChanged)
        }
    }, [i18nInstance])

    useEffect(() => {
        initLocale()
    }, [initLocale])

    return (
        <LocaleContext.Provider value={{ locale, initLocale, setLocale, toggleLocale }}>
            {children}
        </LocaleContext.Provider>
    )
}

export function useLocale() {
    const ctx = useContext(LocaleContext)
    if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
    return ctx
}
