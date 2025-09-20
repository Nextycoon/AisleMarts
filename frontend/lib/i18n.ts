// Simple Language System - Performance Optimized
export const translations = {
  en: {
    digitalLifestyleUniverse: 'Digital Lifestyle Universe',
    whereRealMeetsVirtual: 'Where real meets virtual, and one lifestyle spans both worlds',
    oneLifestyleBothWorlds: 'One lifestyle. Both worlds. Real meets virtual.',
    welcomeToYourDigitalLifestyle: 'Welcome to Your Digital Lifestyle, {{name}}',
    fusionZone: 'FUSION ZONE',
    realWorld: 'REAL WORLD',
    virtualWorld: 'VIRTUAL WORLD',
    aiAssistant: 'AI Assistant',
    cloudHub: 'Cloud Hub',
    lifestyleAds: 'Lifestyle Ads',
    milanBoutique: 'Milan Boutique',
    cafeMeeting: 'Café Meeting',
    friendsChat: 'Friends Chat',
    avatarCloset: 'Avatar Closet',
    virtualHangout: 'Virtual Hangout',
    aiCommunity: 'AI Community',
    active: 'Active',
    live: 'Live',
    online: 'online',
    updated: 'Updated',
    loading: 'Loading...',
  },
  es: {
    digitalLifestyleUniverse: 'Universo de Estilo de Vida Digital',
    whereRealMeetsVirtual: 'Donde lo real se encuentra con lo virtual, y un estilo de vida abarca ambos mundos',
    oneLifestyleBothWorlds: 'Un estilo de vida. Ambos mundos. Lo real se encuentra con lo virtual.',
    welcomeToYourDigitalLifestyle: 'Bienvenido a Tu Estilo de Vida Digital, {{name}}',
    fusionZone: 'ZONA DE FUSIÓN',
    realWorld: 'MUNDO REAL',
    virtualWorld: 'MUNDO VIRTUAL',
    aiAssistant: 'Asistente IA',
    cloudHub: 'Centro en la Nube',
    lifestyleAds: 'Anuncios de Estilo de Vida',
    milanBoutique: 'Boutique de Milán',
    cafeMeeting: 'Reunión en Café',
    friendsChat: 'Chat de Amigos',
    avatarCloset: 'Closet del Avatar',
    virtualHangout: 'Encuentro Virtual',
    aiCommunity: 'Comunidad IA',
    active: 'Activo',
    live: 'En Vivo',
    online: 'en línea',
    updated: 'Actualizado',
    loading: 'Cargando...',
  },
  fr: {
    digitalLifestyleUniverse: 'Univers de Style de Vie Numérique',
    whereRealMeetsVirtual: 'Où le réel rencontre le virtuel, et un style de vie englobe les deux mondes',
    oneLifestyleBothWorlds: 'Un style de vie. Les deux mondes. Le réel rencontre le virtuel.',
    welcomeToYourDigitalLifestyle: 'Bienvenue dans Votre Style de Vie Numérique, {{name}}',
    fusionZone: 'ZONE DE FUSION',
    realWorld: 'MONDE RÉEL',
    virtualWorld: 'MONDE VIRTUEL',
    aiAssistant: 'Assistant IA',
    cloudHub: 'Centre Cloud',
    lifestyleAds: 'Publicités Lifestyle',
    loading: 'Chargement...',
  }
};

// Simple language detection
export const detectLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';
  
  const stored = localStorage.getItem('userLanguage');
  if (stored && stored in translations) return stored;
  
  const browserLang = navigator.language?.split('-')[0] || 'en';
  return browserLang in translations ? browserLang : 'en';
};

// Simple translation function
export const t = (key: string, params?: { [key: string]: string }): string => {
  const lang = detectLanguage();
  const translation = translations[lang as keyof typeof translations]?.[key as keyof typeof translations.en] || 
                     translations.en[key as keyof typeof translations.en] || 
                     key;
  
  if (params) {
    return Object.keys(params).reduce((text, param) => {
      return text.replace(`{{${param}}}`, params[param]);
    }, translation);
  }
  
  return translation;
};

// Set language
export const setLanguage = (lang: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userLanguage', lang);
    window.location.reload(); // Simple refresh to apply language
  }
};

export const getCurrentLanguage = (): string => detectLanguage();

export default i18n;