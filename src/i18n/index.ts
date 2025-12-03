export { I18nProvider, useI18n, setGlobalLanguage } from './I18nProvider';
export { type Locale, translations } from './translations';

export function switchLanguage(lang: 'en' | 'fr' | 'es' | 'de' | 'ru') {
  setGlobalLanguage(lang);
}

export function switchToFrench() {
  switchLanguage('fr');
}
