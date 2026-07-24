import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './zh.json'
import en from './en.json'

const resources = {
    'zh-CN': { translation: zh },
    'en-US': { translation: en },
}

// Get saved locale from localStorage or default to zh-CN
const savedLocale = localStorage.getItem('locale') || 'zh-CN'

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLocale,
        fallbackLng: 'zh-CN',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    })

export default i18n
