// src/services/i18nService.ts
import { Translation, LanguageConfig } from '@/types/i18n';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageConfig } from '@/config/languages';
import { format as dateFnsFormat } from 'date-fns';
import { enUS, af, pt, fr, de, es, ar, zhCN } from 'date-fns/locale';

class I18nService {
  private currentLanguage: string = DEFAULT_LANGUAGE;
  private translations: { [key: string]: Translation } = {};
  private loadedLanguages: Set<string> = new Set();
  private changeListeners: ((language: string) => void)[] = [];

  // Date-fns locale mapping
  private localeMap: { [key: string]: any } = {
    en: enUS,
    af: enUS, // Fallback to English for Afrikaans
    zu: enUS, // Fallback to English for Zulu
    xh: enUS, // Fallback to English for Xhosa
    pt: pt,
    fr: fr,
    de: de,
    es: es,
    ar: ar,
    zh: zhCN
  };

  constructor() {
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    try {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
        this.currentLanguage = savedLanguage;
      }
    } catch (error) {
      console.warn('Failed to load language from storage:', error);
    }
  }

  async loadTranslations(languageCode: string): Promise<Translation> {
    if (this.loadedLanguages.has(languageCode)) {
      return this.translations[languageCode];
    }

    try {
      const response = await fetch(`/src/translations/${languageCode}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${languageCode}`);
      }
      
      const translations = await response.json();
      this.translations[languageCode] = translations;
      this.loadedLanguages.add(languageCode);
      
      return translations;
    } catch (error) {
      console.error(`Error loading translations for ${languageCode}:`, error);
      
      // Fallback to default language
      if (languageCode !== DEFAULT_LANGUAGE) {
        return this.loadTranslations(DEFAULT_LANGUAGE);
      }
      
      // Return empty translations as last resort
      return {};
    }
  }

  async changeLanguage(languageCode: string): Promise<void> {
    if (!SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode)) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }

    await this.loadTranslations(languageCode);
    this.currentLanguage = languageCode;
    
    try {
      localStorage.setItem('selectedLanguage', languageCode);
    } catch (error) {
      console.warn('Failed to save language to storage:', error);
    }

    // Update document direction for RTL languages
    this.updateDocumentDirection();
    
    // Notify listeners
    this.changeListeners.forEach(listener => listener(languageCode));
  }

  private updateDocumentDirection(): void {
    const config = getLanguageConfig(this.currentLanguage);
    document.documentElement.dir = config.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = this.currentLanguage;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getSupportedLanguages(): LanguageConfig[] {
    return SUPPORTED_LANGUAGES;
  }

  getLanguageConfig(code?: string): LanguageConfig {
    return getLanguageConfig(code || this.currentLanguage);
  }

  translate(key: string, params: Record<string, string | number> = {}): string {
    const translations = this.translations[this.currentLanguage] || {};
    const keys = key.split('.');
    let value: any = translations;

    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to default language
        const defaultTranslations = this.translations[DEFAULT_LANGUAGE] || {};
        let fallbackValue: any = defaultTranslations;
        
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            return key; // Return key if translation not found
          }
        }
        
        value = fallbackValue;
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters
    let result = value;
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    });

    return result;
  }

  formatCurrency(amount: number, languageCode?: string): string {
    const config = getLanguageConfig(languageCode || this.currentLanguage);
    const { symbol, position, decimal, thousand } = config.currencyFormat;

    // Format number with locale-specific separators
    const parts = amount.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousand);
    const formattedAmount = integerPart + decimal + parts[1];

    return position === 'before' ? `${symbol}${formattedAmount}` : `${formattedAmount} ${symbol}`;
  }

  formatDate(date: Date, formatString?: string, languageCode?: string): string {
    const config = getLanguageConfig(languageCode || this.currentLanguage);
    const locale = this.localeMap[config.code] || this.localeMap[DEFAULT_LANGUAGE];
    const format = formatString || config.dateFormat;
    
    try {
      return dateFnsFormat(date, format, { locale });
    } catch (error) {
      console.error('Date formatting error:', error);
      return date.toLocaleDateString();
    }
  }

  formatNumber(num: number, languageCode?: string): string {
    const config = getLanguageConfig(languageCode || this.currentLanguage);
    const { decimal, thousand } = config.currencyFormat;

    return num.toLocaleString().replace(/\./g, decimal).replace(/,/g, thousand);
  }

  isRTL(languageCode?: string): boolean {
    const config = getLanguageConfig(languageCode || this.currentLanguage);
    return config.rtl;
  }

  onLanguageChange(callback: (language: string) => void): () => void {
    this.changeListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.changeListeners.indexOf(callback);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }

  // Pluralization helper
  pluralize(key: string, count: number, params: Record<string, string | number> = {}): string {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    const fallbackKey = key;
    
    const translation = this.translate(pluralKey, { ...params, count });
    
    // If plural form not found, use the base key
    return translation === pluralKey ? this.translate(fallbackKey, { ...params, count }) : translation;
  }

  // Batch translation for better performance
  translateBatch(keys: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    keys.forEach(key => {
      result[key] = this.translate(key);
    });
    return result;
  }

  // Get translation namespace
  getNamespace(namespace: string): Record<string, any> {
    const translations = this.translations[this.currentLanguage] || {};
    return translations[namespace] || {};
  }

  // Check if translation exists
  hasTranslation(key: string, languageCode?: string): boolean {
    const translations = this.translations[languageCode || this.currentLanguage] || {};
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return typeof value === 'string';
  }
}

export const i18nService = new I18nService();
export default i18nService;