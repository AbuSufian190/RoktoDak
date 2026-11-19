import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import bn from './bn'

const saved = localStorage.getItem('lang') || 'bn'
i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, bn: { translation: bn } },
  lng: saved,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})
document.documentElement.lang = saved

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng)
  document.documentElement.lang = lng
})

export default i18n
