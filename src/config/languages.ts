// src/config/languages.ts
import { LanguageConfig } from '@/types/i18n';

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    dateFormat: 'MMM dd, yyyy',
    currencyFormat: {
      symbol: 'R',
      position: 'before',
      decimal: '.',
      thousand: ','
    }
  },
  {
    code: 'af',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    flag: '🇿🇦',
    rtl: false,
    dateFormat: 'dd MMM yyyy',
    currencyFormat: {
      symbol: 'R',
      position: 'before',
      decimal: ',',
      thousand: ' '
    }
  },
  {
    code: 'zu',
    name: 'Zulu',
    nativeName: 'isiZulu',
    flag: '🇿🇦',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    currencyFormat: {
      symbol: 'R',
      position: 'before',
      decimal: '.',
      thousand: ','
    }
  },
  {
    code: 'xh',
    name: 'Xhosa',
    nativeName: 'isiXhosa',
    flag: '🇿🇦',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    currencyFormat: {
      symbol: 'R',
      position: 'before',
      decimal: '.',
      thousand: ','
    }
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    currencyFormat: {
      symbol: 'R',
      position: 'before',
      decimal: ',',
      thousand: '.'
    }
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    currencyFormat: {
      symbol: 'R',
      position: 'after',
      decimal: ',',
      thousand: ' '
    }
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    dateFormat: 'dd.MM.yyyy',
    currencyFormat: {
      symbol: 'R',
      position: 'after',
      decimal: ',',
      thousand: '.'
    }
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    currencyFormat: {
      symbol: 'R',
      position: 'before',
      decimal: ',',
      thousand: '.'
    }
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    dateFormat: 'dd/MM/yyyy',
    currencyFormat: {
      symbol: 'ر.س',
      position: 'after',
      decimal: '.',
      thousand: ','
    }
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    dateFormat: 'yyyy/MM/dd',
    currencyFormat: {
      symbol: 'R',
      position: 'before',
      decimal: '.',
      thousand: ','
    }
  }
];

export const DEFAULT_LANGUAGE = 'en';

export const getLanguageConfig = (code: string): LanguageConfig => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0];
};

export const isRTLLanguage = (code: string): boolean => {
  const config = getLanguageConfig(code);
  return config.rtl;
};