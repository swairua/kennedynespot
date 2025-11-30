export { I18nProvider, useI18n, setGlobalLanguage } from './I18nProvider';
export { type Locale, translations } from './translations';

export function switchLanguage(lang: 'en' | 'fr' | 'es' | 'de' | 'ru') {
  // import locally to avoid circular deps
  const { setGlobalLanguage } = require('./I18nProvider') as typeof import('./I18nProvider');
  setGlobalLanguage(lang);
}

export function switchToFrench() {
  switchLanguage('fr');
}
