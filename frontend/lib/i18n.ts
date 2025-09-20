import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Platform detection for proper initialization
const isWeb = typeof window !== 'undefined';

// Language resources - Optimized for performance
const resources = {
  en: {
    translation: {
      // Digital Lifestyle Universe Core
      'digitalLifestyleUniverse': 'Digital Lifestyle Universe',
      'whereRealMeetsVirtual': 'Where real meets virtual, and one lifestyle spans both worlds',
      'oneLifestyleBothWorlds': 'One lifestyle. Both worlds. Real meets virtual.',
      'welcomeToYourDigitalLifestyle': 'Welcome to Your Digital Lifestyle, {{name}}',
      
      // Fusion Dashboard
      'fusionZone': 'FUSION ZONE',
      'realWorld': 'REAL WORLD',
      'virtualWorld': 'VIRTUAL WORLD',
      'aiAssistant': 'AI Assistant',
      'cloudHub': 'Cloud Hub',
      'lifestyleAds': 'Lifestyle Ads',
      
      // Milan Journey
      'milanBoutique': 'Milan Boutique',
      'cafeMeeting': 'Café Meeting',
      'friendsChat': 'Friends Chat',
      'avatarCloset': 'Avatar Closet',
      'virtualHangout': 'Virtual Hangout',
      'aiCommunity': 'AI Community',
      
      // Navigation & UI
      'home': 'Home',
      'messages': 'Messages',
      'calls': 'Calls',
      'channels': 'Channels',
      'liveSale': 'LiveSale',
      'profile': 'Profile',
      'settings': 'Settings',
      'search': 'Search',
      'notifications': 'Notifications',
      
      // Status & Actions
      'active': 'Active',
      'live': 'Live',
      'online': 'online',
      'updated': 'Updated',
      'messages_count': '{{count}} msgs',
      'loading': 'Loading...',
    }
  }
};

// Optimized detection configuration for web only
const detectionOptions = isWeb ? {
  order: ['localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage'],
  lookupLocalStorage: 'i18nextLng',
} : {
  order: ['navigator'],
  caches: [],
};

// Initialize i18n with performance optimization
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // Start with English for fast loading
    debug: false,
    
    detection: detectionOptions,
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
    
    supportedLngs: ['en'],
    defaultNS: 'translation',
    ns: ['translation'],
  });

// Stream additional languages after initialization (performance optimization)
if (isWeb) {
  setTimeout(() => {
    // Add Spanish
    i18n.addResources('es', 'translation', {
      'digitalLifestyleUniverse': 'Universo de Estilo de Vida Digital',
      'whereRealMeetsVirtual': 'Donde lo real se encuentra con lo virtual, y un estilo de vida abarca ambos mundos',
      'oneLifestyleBothWorlds': 'Un estilo de vida. Ambos mundos. Lo real se encuentra con lo virtual.',
      'welcomeToYourDigitalLifestyle': 'Bienvenido a Tu Estilo de Vida Digital, {{name}}',
      'fusionZone': 'ZONA DE FUSIÓN',
      'realWorld': 'MUNDO REAL',
      'virtualWorld': 'MUNDO VIRTUAL',
      'aiAssistant': 'Asistente IA',
      'cloudHub': 'Centro en la Nube',
      'lifestyleAds': 'Anuncios de Estilo de Vida',
      'milanBoutique': 'Boutique de Milán',
      'cafeMeeting': 'Reunión en Café',
      'friendsChat': 'Chat de Amigos',
      'avatarCloset': 'Closet del Avatar',
      'virtualHangout': 'Encuentro Virtual',
      'aiCommunity': 'Comunidad IA',
      'active': 'Activo',
      'live': 'En Vivo',
      'online': 'en línea',
      'updated': 'Actualizado', 
      'loading': 'Cargando...',
    });

    // Add French
    i18n.addResources('fr', 'translation', {
      'digitalLifestyleUniverse': 'Univers de Style de Vie Numérique',
      'whereRealMeetsVirtual': 'Où le réel rencontre le virtuel, et un style de vie englobe les deux mondes',
      'oneLifestyleBothWorlds': 'Un style de vie. Les deux mondes. Le réel rencontre le virtuel.',
      'welcomeToYourDigitalLifestyle': 'Bienvenue dans Votre Style de Vie Numérique, {{name}}',
      'fusionZone': 'ZONE DE FUSION',
      'realWorld': 'MONDE RÉEL',
      'virtualWorld': 'MONDE VIRTUEL',
      'aiAssistant': 'Assistant IA',
      'cloudHub': 'Centre Cloud',
      'lifestyleAds': 'Publicités Lifestyle',
      'loading': 'Chargement...',
    });

    console.log('🌍 Language-Infinity Engine: Additional languages loaded');
  }, 500);
}

export default i18n;

export default i18n;