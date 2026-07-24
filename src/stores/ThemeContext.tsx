import { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface ThemeContextType {
    theme: string
    initTheme: () => void
    toggleTheme: () => void
    setTheme: (newTheme: string) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState('light')

    const applyTheme = useCallback((themeName: string) => {
        if (themeName === 'dark') {
            document.documentElement.classList.add('dark-mode')
        } else {
            document.documentElement.classList.remove('dark-mode')
        }
    }, [])

    const initTheme = useCallback(() => {
        const savedTheme = localStorage.getItem('theme')
        let t = 'light'
        if (savedTheme) {
            t = savedTheme
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            t = 'dark'
        }
        setThemeState(t)
        applyTheme(t)
    }, [applyTheme])

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => {
            const next = prev === 'light' ? 'dark' : 'light'
            localStorage.setItem('theme', next)
            applyTheme(next)
            return next
        })
    }, [applyTheme])

    const setTheme = useCallback((newTheme: string) => {
        setThemeState(newTheme)
        localStorage.setItem('theme', newTheme)
        applyTheme(newTheme)
    }, [applyTheme])

    useEffect(() => {
        initTheme()
    }, [initTheme])

    return (
        <ThemeContext.Provider value={{ theme, initTheme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
    return ctx
}
