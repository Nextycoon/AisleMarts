import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Language resources - Global Infinity Engine
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
      'tryNow': 'Try Now',
      'experience': 'Experience',
      'demo': 'Demo',
      
      // Luxury Commerce
      'luxuryCommerce': 'Luxury Commerce',
      'premiumExperience': 'Premium Experience',
      'culturalIntelligence': 'Cultural Intelligence',
      'globalAwareness': 'Global Awareness',
      
      // Technical
      'operationalInfrastructure': 'Operational Infrastructure',
      'enterpriseSecurity': 'Enterprise Security',
      'realTimeFusion': 'Real-time Fusion',
      'globalReady': 'Global Ready',
    }
  },
  es: {
    translation: {
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
      
      'home': 'Inicio',
      'messages': 'Mensajes',
      'calls': 'Llamadas',
      'channels': 'Canales',
      'liveSale': 'Venta en Vivo',
      'profile': 'Perfil',
      'settings': 'Configuración',
      'search': 'Buscar',
      'notifications': 'Notificaciones',
      
      'active': 'Activo',
      'live': 'En Vivo',
      'online': 'en línea',
      'updated': 'Actualizado',
      'messages_count': '{{count}} msgs',
      'loading': 'Cargando...',
      'tryNow': 'Pruébalo Ahora',
      'experience': 'Experiencia',
      'demo': 'Demo',
      
      'luxuryCommerce': 'Comercio de Lujo',
      'premiumExperience': 'Experiencia Premium',
      'culturalIntelligence': 'Inteligencia Cultural',
      'globalAwareness': 'Conciencia Global',
      
      'operationalInfrastructure': 'Infraestructura Operacional',
      'enterpriseSecurity': 'Seguridad Empresarial',
      'realTimeFusion': 'Fusión en Tiempo Real',
      'globalReady': 'Listo Global',
    }
  },
  fr: {
    translation: {
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
      
      'milanBoutique': 'Boutique de Milan',
      'cafeMeeting': 'Réunion au Café',
      'friendsChat': 'Chat d\'Amis',
      'avatarCloset': 'Garde-robe Avatar',
      'virtualHangout': 'Rencontre Virtuelle',
      'aiCommunity': 'Communauté IA',
      
      'home': 'Accueil',
      'messages': 'Messages',
      'calls': 'Appels',
      'channels': 'Chaînes',
      'liveSale': 'Vente en Direct',
      'profile': 'Profil',
      'settings': 'Paramètres',
      'search': 'Recherche',
      'notifications': 'Notifications',
      
      'active': 'Actif',
      'live': 'En Direct',
      'online': 'en ligne',
      'updated': 'Mis à jour',
      'messages_count': '{{count}} msgs',
      'loading': 'Chargement...',
      'tryNow': 'Essayez Maintenant',
      'experience': 'Expérience',
      'demo': 'Démo',
      
      'luxuryCommerce': 'Commerce de Luxe',
      'premiumExperience': 'Expérience Premium',
      'culturalIntelligence': 'Intelligence Culturelle',
      'globalAwareness': 'Conscience Globale',
      
      'operationalInfrastructure': 'Infrastructure Opérationnelle',
      'enterpriseSecurity': 'Sécurité d\'Entreprise',
      'realTimeFusion': 'Fusion en Temps Réel',
      'globalReady': 'Prêt Global',
    }
  },
  de: {
    translation: {
      'digitalLifestyleUniverse': 'Digitales Lifestyle-Universum',
      'whereRealMeetsVirtual': 'Wo das Reale auf das Virtuelle trifft und ein Lebensstil beide Welten umspannt',
      'oneLifestyleBothWorlds': 'Ein Lebensstil. Beide Welten. Real trifft auf virtuell.',
      'welcomeToYourDigitalLifestyle': 'Willkommen zu Ihrem Digitalen Lebensstil, {{name}}',
      
      'fusionZone': 'FUSIONSZONE',
      'realWorld': 'REALE WELT',
      'virtualWorld': 'VIRTUELLE WELT',
      'aiAssistant': 'KI-Assistent',
      'cloudHub': 'Cloud-Hub',
      'lifestyleAds': 'Lifestyle-Anzeigen',
      
      'milanBoutique': 'Mailänder Boutique',
      'cafeMeeting': 'Café-Treffen',
      'friendsChat': 'Freunde-Chat',
      'avatarCloset': 'Avatar-Kleiderschrank',
      'virtualHangout': 'Virtueller Treffpunkt',
      'aiCommunity': 'KI-Community',
      
      'home': 'Start',
      'messages': 'Nachrichten',
      'calls': 'Anrufe',
      'channels': 'Kanäle',
      'liveSale': 'Live-Verkauf',
      'profile': 'Profil',
      'settings': 'Einstellungen',
      'search': 'Suchen',
      'notifications': 'Benachrichtigungen',
      
      'active': 'Aktiv',
      'live': 'Live',
      'online': 'online',
      'updated': 'Aktualisiert',
      'messages_count': '{{count}} Nachr.',
      'loading': 'Lädt...',
      'tryNow': 'Jetzt Probieren',
      'experience': 'Erfahrung',
      'demo': 'Demo',
      
      'luxuryCommerce': 'Luxus-Handel',
      'premiumExperience': 'Premium-Erfahrung',
      'culturalIntelligence': 'Kulturelle Intelligenz',
      'globalAwareness': 'Globales Bewusstsein',
      
      'operationalInfrastructure': 'Operative Infrastruktur',
      'enterpriseSecurity': 'Unternehmenssicherheit',
      'realTimeFusion': 'Echtzeit-Fusion',
      'globalReady': 'Global Bereit',
    }
  },
  zh: {
    translation: {
      'digitalLifestyleUniverse': '数字生活宇宙',
      'whereRealMeetsVirtual': '现实与虚拟相遇的地方，一种生活方式跨越两个世界',
      'oneLifestyleBothWorlds': '一种生活方式。两个世界。现实遇见虚拟。',
      'welcomeToYourDigitalLifestyle': '欢迎来到您的数字生活方式，{{name}}',
      
      'fusionZone': '融合区域',
      'realWorld': '现实世界',
      'virtualWorld': '虚拟世界',
      'aiAssistant': 'AI助手',
      'cloudHub': '云中心',
      'lifestyleAds': '生活方式广告',
      
      'milanBoutique': '米兰精品店',
      'cafeMeeting': '咖啡厅会议',
      'friendsChat': '朋友聊天',
      'avatarCloset': '虚拟衣橱',
      'virtualHangout': '虚拟聚会',
      'aiCommunity': 'AI社区',
      
      'home': '首页',
      'messages': '消息',
      'calls': '通话',
      'channels': '频道',
      'liveSale': '直播销售',
      'profile': '个人资料',
      'settings': '设置',
      'search': '搜索',
      'notifications': '通知',
      
      'active': '活跃',
      'live': '直播',
      'online': '在线',
      'updated': '已更新',
      'messages_count': '{{count}}条消息',
      'loading': '加载中...',
      'tryNow': '立即体验',
      'experience': '体验',
      'demo': '演示',
      
      'luxuryCommerce': '奢华商务',
      'premiumExperience': '高端体验',
      'culturalIntelligence': '文化智能',
      'globalAwareness': '全球意识',
      
      'operationalInfrastructure': '运营基础设施',
      'enterpriseSecurity': '企业安全',
      'realTimeFusion': '实时融合',
      'globalReady': '全球就绪',
    }
  },
  ja: {
    translation: {
      'digitalLifestyleUniverse': 'デジタルライフスタイルユニバース',
      'whereRealMeetsVirtual': 'リアルとバーチャルが出会い、一つのライフスタイルが両方の世界にまたがる場所',
      'oneLifestyleBothWorlds': '一つのライフスタイル。両方の世界。リアルがバーチャルと出会う。',
      'welcomeToYourDigitalLifestyle': 'あなたのデジタルライフスタイルへようこそ、{{name}}さん',
      
      'fusionZone': 'フュージョンゾーン',
      'realWorld': 'リアルワールド',
      'virtualWorld': 'バーチャルワールド',
      'aiAssistant': 'AIアシスタント',
      'cloudHub': 'クラウドハブ',
      'lifestyleAds': 'ライフスタイル広告',
      
      'milanBoutique': 'ミラノブティック',
      'cafeMeeting': 'カフェミーティング',
      'friendsChat': '友達チャット',
      'avatarCloset': 'アバタークローゼット',
      'virtualHangout': 'バーチャルハングアウト',
      'aiCommunity': 'AIコミュニティ',
      
      'home': 'ホーム',
      'messages': 'メッセージ',
      'calls': '通話',
      'channels': 'チャンネル',
      'liveSale': 'ライブ販売',
      'profile': 'プロフィール',
      'settings': '設定',
      'search': '検索',
      'notifications': '通知',
      
      'active': 'アクティブ',
      'live': 'ライブ',
      'online': 'オンライン',
      'updated': '更新済み',
      'messages_count': '{{count}}件のメッセージ',
      'loading': '読み込み中...',
      'tryNow': '今すぐ試す',
      'experience': '体験',
      'demo': 'デモ',
      
      'luxuryCommerce': 'ラグジュアリーコマース',
      'premiumExperience': 'プレミアム体験',
      'culturalIntelligence': '文化的知能',
      'globalAwareness': 'グローバル意識',
      
      'operationalInfrastructure': '運用インフラストラクチャ',
      'enterpriseSecurity': 'エンタープライズセキュリティ',
      'realTimeFusion': 'リアルタイム融合',
      'globalReady': 'グローバル対応',
    }
  },
  ar: {
    translation: {
      'digitalLifestyleUniverse': 'الكون الرقمي لأسلوب الحياة',
      'whereRealMeetsVirtual': 'حيث يلتقي الواقع بالافتراضي، وأسلوب حياة واحد يمتد عبر العالمين',
      'oneLifestyleBothWorlds': 'أسلوب حياة واحد. عالمان. الواقع يلتقي بالافتراضي.',
      'welcomeToYourDigitalLifestyle': 'مرحباً بك في أسلوب حياتك الرقمي، {{name}}',
      
      'fusionZone': 'منطقة الاندماج',
      'realWorld': 'العالم الحقيقي',
      'virtualWorld': 'العالم الافتراضي',
      'aiAssistant': 'مساعد الذكاء الاصطناعي',
      'cloudHub': 'مركز السحابة',
      'lifestyleAds': 'إعلانات أسلوب الحياة',
      
      'milanBoutique': 'بوتيك ميلان',
      'cafeMeeting': 'اجتماع المقهى',
      'friendsChat': 'دردشة الأصدقاء',
      'avatarCloset': 'خزانة الأفاتار',
      'virtualHangout': 'تجمع افتراضي',
      'aiCommunity': 'مجتمع الذكاء الاصطناعي',
      
      'home': 'الرئيسية',
      'messages': 'الرسائل',
      'calls': 'المكالمات',
      'channels': 'القنوات',
      'liveSale': 'البيع المباشر',
      'profile': 'الملف الشخصي',
      'settings': 'الإعدادات',
      'search': 'البحث',
      'notifications': 'الإشعارات',
      
      'active': 'نشط',
      'live': 'مباشر',
      'online': 'متصل',
      'updated': 'محدث',
      'messages_count': '{{count}} رسائل',
      'loading': 'جاري التحميل...',
      'tryNow': 'جرب الآن',
      'experience': 'التجربة',
      'demo': 'العرض التوضيحي',
      
      'luxuryCommerce': 'التجارة الفاخرة',
      'premiumExperience': 'تجربة متميزة',
      'culturalIntelligence': 'الذكاء الثقافي',
      'globalAwareness': 'الوعي العالمي',
      
      'operationalInfrastructure': 'البنية التحتية التشغيلية',
      'enterpriseSecurity': 'أمان المؤسسات',
      'realTimeFusion': 'الاندماج في الوقت الفعلي',
      'globalReady': 'جاهز عالمياً',
    }
  }
};

// Advanced language detection configuration
const detectionOptions = {
  order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
  lookupQuerystring: 'lng',
  lookupCookie: 'i18next',
  lookupLocalStorage: 'i18nextLng',
  lookupSessionStorage: 'i18nextLng',
  lookupFromPathIndex: 0,
  lookupFromSubdomainIndex: 0,
  caches: ['localStorage', 'cookie'],
  excludeCacheFor: ['cimode'],
  cookieMinutes: 10080, // 7 days
  cookieDomain: 'aislemarts.com',
  htmlTag: document.documentElement,
  checkWhitelist: true
};

// HOTFIX: Lazy load optimization - EN first, others stream
const initI18n = async () => {
  return i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: resources.en, // Load English immediately
      },
      fallbackLng: 'en',
      lng: 'en', // Start with English to prevent loading delays
      debug: false, // Disable debug for performance
      
      // Optimized detection - priority to fast methods
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      
      // Performance optimizations
      interpolation: {
        escapeValue: false,
      },
      
      react: {
        useSuspense: false,
      },
      
      // Minimal supported languages for initial load
      supportedLngs: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'],
      
      defaultNS: 'translation',
      ns: ['translation'],
    });
};

// Stream additional languages after initial load
const loadAdditionalLanguages = () => {
  setTimeout(() => {
    // Add other languages progressively
    const additionalLangs = ['es', 'fr', 'de', 'zh', 'ja', 'ar'];
    additionalLangs.forEach(lang => {
      if (resources[lang]) {
        i18n.addResources(lang, 'translation', resources[lang].translation);
      }
    });
    console.log('🌍 Additional languages loaded');
  }, 1000);
};

// Initialize with performance optimization
initI18n().then(() => {
  loadAdditionalLanguages();
}).catch(console.error);

export default i18n;