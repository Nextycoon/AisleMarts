import { useState, useEffect } from 'react';
import { t, setLanguage, getCurrentLanguage } from '../lib/i18n';

export const useSimpleTranslation = () => {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  const changeLanguage = (newLang: string) => {
    setLanguage(newLang);
    setCurrentLang(newLang);
  };

  useEffect(() => {
    setCurrentLang(getCurrentLanguage());
  }, []);

  return {
    t,
    i18n: {
      language: currentLang,
      changeLanguage,
    }
  };
};