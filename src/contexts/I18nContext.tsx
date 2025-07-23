// src/contexts/I18nContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nContext as I18nContextType, Translation, LanguageConfig } from '@/types/i18n';
import i18nService from '@/services/i18nService';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18nService.getCurrentLanguage());
  const [translations, setTranslations] = useState<Translation>({});
  const [isLoading, setIsLoading] = useState(true);
  const [availableLanguages] = useState<LanguageConfig[]>(i18nService.getSupportedLanguages());

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        setIsLoading(true);
        const loadedTranslations = await i18nService.loadTranslations(currentLanguage);
        setTranslations(loadedTranslations);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeI18n();

    // Subscribe to language changes
    const unsubscribe = i18nService.onLanguageChange((newLanguage) => {
      setCurrentLanguage(newLanguage);
    });

    return unsubscribe;
  }, [currentLanguage]);

  const changeLanguage = async (languageCode: string): Promise<void> => {
    try {
      setIsLoading(true);
      await i18nService.changeLanguage(languageCode);
      const newTranslations = await i18nService.loadTranslations(languageCode);
      setTranslations(newTranslations);
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    return i18nService.translate(key, params);
  };

  const formatCurrency = (amount: number): string => {
    return i18nService.formatCurrency(amount, currentLanguage);
  };

  const formatDate = (date: Date, format?: string): string => {
    return i18nService.formatDate(date, format, currentLanguage);
  };

  const contextValue: I18nContextType = {
    currentLanguage,
    translations,
    availableLanguages,
    isLoading,
    changeLanguage,
    t,
    formatCurrency,
    formatDate
  };

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Hook for translation only (lighter weight)
export const useTranslation = () => {
  const { t, currentLanguage, isLoading } = useI18n();
  return { t, currentLanguage, isLoading };
};

// Hook for currency formatting
export const useCurrency = () => {
  const { formatCurrency } = useI18n();
  return { formatCurrency };
};

// Hook for date formatting
export const useDateFormat = () => {
  const { formatDate } = useI18n();
  return { formatDate };
};

export default I18nContext;