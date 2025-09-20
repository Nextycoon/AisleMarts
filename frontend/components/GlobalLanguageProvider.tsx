import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Platform } from 'react-native';
import i18n from '../lib/i18n';

interface GlobalLanguageProviderProps {
  children: React.ReactNode;
}

export default function GlobalLanguageProvider({ children }: GlobalLanguageProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Auto-detect language from browser/device
        const detectedLanguage = await i18n.init();
        
        // Apply RTL styling for Arabic and other RTL languages
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        const isRTL = rtlLanguages.includes(i18n.language);
        
        if (Platform.OS === 'web') {
          document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
          document.documentElement.lang = i18n.language;
          
          // Add global CSS for RTL support
          if (isRTL && !document.getElementById('rtl-styles')) {
            const style = document.createElement('style');
            style.id = 'rtl-styles';
            style.textContent = `
              body[dir="rtl"] {
                text-align: right;
              }
              [dir="rtl"] .fusion-dashboard {
                flex-direction: row-reverse;
              }
              [dir="rtl"] .language-switcher {
                left: 12px;
                right: auto;
              }
            `;
            document.head.appendChild(style);
          }
        }
        
        console.log(`🌍 Language-Infinity Engine: Initialized with ${i18n.language}`);
        setIsReady(true);
      } catch (error) {
        console.error('Language initialization failed:', error);
        setIsReady(true); // Still render with fallback
      }
    };

    initializeLanguage();

    // Listen for language changes
    const onLanguageChanged = (lng: string) => {
      console.log(`🌍 Language switched to: ${lng}`);
      
      // Update document attributes for web
      if (Platform.OS === 'web') {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        const isRTL = rtlLanguages.includes(lng);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = lng;
      }
      
      // Store in AsyncStorage for mobile persistence
      if (Platform.OS !== 'web') {
        // AsyncStorage.setItem('userLanguage', lng);
      }
    };

    i18n.on('languageChanged', onLanguageChanged);

    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  if (!isReady) {
    return null; // Or a loading spinner
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}