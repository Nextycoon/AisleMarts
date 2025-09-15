import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { CompareCard } from '../cards/CompareCard';
import { ConnectStoreCard } from '../cards/ConnectStoreCard';
import { ProductCard } from '../cards/ProductCard';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface AICard {
  type: string;
  data: any;
}

export default function AvatarHomeScreen() {
  const [query, setQuery] = useState('');
  const [cards, setCards] = useState<AICard[]>([]);
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    loadLocale();
    // Show welcome cards on first load
    showWelcomeCards();
  }, []);

  const loadLocale = async () => {
    try {
      const savedLocale = await AsyncStorage.getItem('user_locale');
      if (savedLocale) {
        setLocale(savedLocale);
      }
    } catch (error) {
      console.log('Error loading locale:', error);
    }
  };

  const showWelcomeCards = () => {
    // Show sample cards to demonstrate AI capabilities
    const welcomeCards: AICard[] = [
      {
        type: 'product',
        data: {
          title: 'Welcome to AI Shopping!',
          description: 'I can help you find, compare, and bundle products intelligently.',
          price: 0,
          rating: 5.0,
          eta: 'Available now'
        }
      },
      {
        type: 'connect_store',
        data: {}
      }
    ];
    setCards(welcomeCards);
  };

  const sendToAI = async (payload: any) => {
    setLoading(true);
    try {
      // Use our new AI intents API
      const response = await axios.post(`${API_BASE_URL}/api/ai/intents`, {
        input: payload,
        locale: locale,
        currency: 'KES',
        lat: null,
        lng: null
      });

      if (response.data.cards) {
        setCards(response.data.cards);
      }
    } catch (error) {
      console.error('AI request failed:', error);
      
      // Fallback to show some demo cards
      const fallbackCards: AICard[] = [
        {
          type: 'product',
          data: {
            title: 'AI Assistant Ready',
            description: 'I can help you find products, compare prices, and connect your store to AisleMarts!',
            price: 0,
            rating: 5.0,
            eta: 'Always available'
          }
        }
      ];
      setCards(fallbackCards);
    }
    setLoading(false);
  };

  const handleConnectStore = async (platform: { platform: string }) => {
    Alert.alert(
      'Connect Store',
      `Ready to connect your ${platform.platform} store! This will redirect to our seller onboarding flow.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => console.log('Navigate to seller registration') }
      ]
    );
  };

  // Enhanced contextual examples based on user location/language
  const getContextualExamples = (locale: string, userType: 'buyer' | 'seller' = 'buyer') => {
    const examples = {
      buyer: {
        en: [
          "Find electronics under KES 15,000 in Nairobi",
          "Compare Samsung vs Infinix phones for business", 
          "Bundle laptop + accessories within my budget",
          "Best M-Pesa friendly stores near me",
          "Show me phones with good cameras under KES 25,000",
          "Find reliable electronics sellers in Mombasa"
        ],
        sw: [
          "Tafuta simu za biashara chini ya KES 20,000",
          "Linganisha bei za laptop za ufundi", 
          "Nipatie bundle ya mahitaji ya duka",
          "Maduka mazuri ya M-Pesa karibu nami",
          "Onyesha simu zenye kamera nzuri chini ya KES 25,000",
          "Tafuta wachuuzi wa kuaminika Mombasa"
        ]
      },
      seller: {
        en: [
          "Help me price my electronics competitively",
          "Create product bundle suggestions",
          "Optimize my store for Kenya market", 
          "Generate product descriptions that sell",
          "Show me trending products in my category",
          "Help me understand my competitor pricing"
        ],
        sw: [
          "Nisaidie kuweka bei za ushindani",
          "Tengeneza mipango ya bidhaa",
          "Boresha duka langu kwa soko la Kenya",
          "Tunga maelezo ya bidhaa yanayouzwa",
          "Onyesha bidhaa zinazovuma katika aina yangu",
          "Nisaidie kuelewa bei za washindani"
        ]
      }
    };
    return examples[userType][locale] || examples[userType]['en'];
  };

  // Dynamic placeholder rotation
  const [currentExample, setCurrentExample] = useState(0);
  const [displayedExample, setDisplayedExample] = useState('');

  useEffect(() => {
    const examples = getContextualExamples(locale, 'buyer');
    const interval = setInterval(() => {
      setCurrentExample(prev => (prev + 1) % examples.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, [locale]);

  useEffect(() => {
    const examples = getContextualExamples(locale, 'buyer');
    setDisplayedExample(examples[currentExample] || examples[0]);
  }, [currentExample, locale]);

  // Smart suggestions based on time and context
  const getSmartSuggestions = () => {
    const hour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());
    
    if (locale === 'sw') {
      if (hour < 12) {
        return ['Bidhaa za asubuhi', 'Chakula cha mapema', 'Mahitaji ya kazini', 'Simu za biashara'];
      } else if (hour < 17) {
        return ['Vitu vya nyumbani', 'Elektroniki', 'Bidhaa za familia', 'Mahitaji ya jioni'];
      } else {
        return ['Burudani za usiku', 'Vifaa vya mapishi', 'Mahitaji ya usiku', 'Bidhaa za familia'];
      }
    }
    
    // English suggestions
    if (hour < 12) {
      return ['Morning electronics', 'Business phones', 'Work essentials', 'Quick breakfast items'];
    } else if (hour < 17) {
      return ['Home electronics', 'Family essentials', 'Afternoon deals', 'Kitchen appliances'];
    } else if (isWeekend) {
      return ['Weekend projects', 'Family entertainment', 'Home improvement', 'Bulk purchases'];
    } else {
      return ['Evening entertainment', 'Home essentials', 'Kitchen gadgets', 'Relaxation items'];
    }
  };

  const getLocalizedText = (key: string, fallback: string) => {
    const translations: { [key: string]: { [lang: string]: string } } = {
      'title': {
        'en': 'AisleMarts — AI for Shopping',
        'sw': 'AisleMarts — AI kwa Ununuzi'
      },
      'subtitle': {
        'en': 'Smarter. Faster. Everywhere.',
        'sw': 'Akili zaidi. Haraka zaidi. Kila mahali.'
      },
      'placeholder': {
        'en': displayedExample || 'Ask me to find, compare, or bundle…',
        'sw': displayedExample || 'Niulize kutafuta, kulinganisha, au kuunganisha...'
      }
    };
    
    return translations[key]?.[locale] || fallback;
  };

  const renderCard = (card: AICard, index: number) => {
    switch (card.type) {
      case 'compare':
        return <CompareCard key={index} items={card.data.items} />;
      case 'connect_store':
        return <ConnectStoreCard key={index} onConnect={handleConnectStore} />;
      case 'product':
      default:
        return <ProductCard key={index} product={card.data} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView style={{ flex: 1, padding: theme.space.md }}>
        {/* AI-First Header with Language Toggle */}
        <View style={{ gap: theme.space.xs, marginBottom: theme.space.lg }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Text style={{ 
              color: theme.colors.text, 
              fontSize: 22, 
              fontWeight: '700',
              flex: 1
            }}>
              {getLocalizedText('title', 'AisleMarts — AI for Shopping')}
            </Text>
            
            {/* Language Toggle */}
            <TouchableOpacity
              onPress={() => {
                const newLocale = locale === 'en' ? 'sw' : 'en';
                setLocale(newLocale);
                AsyncStorage.setItem('user_locale', newLocale);
              }}
              style={{
                backgroundColor: theme.colors.card,
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.xs,
                borderRadius: theme.radius.sm,
                borderWidth: 1,
                borderColor: '#4A9EFF',
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.xs
              }}
            >
              <Text style={{ fontSize: 16 }}>🇰🇪</Text>
              <Text style={{ 
                color: '#4A9EFF', 
                fontSize: 12, 
                fontWeight: '600' 
              }}>
                {locale === 'en' ? 'EN' : 'SW'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={{ color: theme.colors.textDim }}>
            {getLocalizedText('subtitle', 'Smarter. Faster. Everywhere.')}
          </Text>
          
          {/* Kenya Context Indicator */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: theme.space.xs,
            marginTop: theme.space.xs
          }}>
            <Text style={{ fontSize: 12, opacity: 0.7 }}>📍</Text>
            <Text style={{ 
              color: theme.colors.textDim, 
              fontSize: 12,
              opacity: 0.8
            }}>
              {locale === 'sw' ? 'Nairobi, Kenya • KES' : 'Nairobi, Kenya • KES'}
            </Text>
          </View>
        </View>

        {/* Multi-modal Input Bar */}
        <View style={{ 
          flexDirection: 'row', 
          gap: theme.space.sm, 
          marginBottom: theme.space.md,
          alignItems: 'center'
        }}>
          <TouchableOpacity 
            onPress={() => sendToAI({ type: 'voice' })}
            style={{ 
              backgroundColor: theme.colors.card, 
              padding: theme.space.sm, 
              borderRadius: theme.radius.md 
            }}
          >
            <Text style={{ fontSize: 20 }}>🎤</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={async () => {
              const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!res.canceled) {
                sendToAI({ type: 'image', uri: res.assets[0].uri });
              }
            }}
            style={{ 
              backgroundColor: theme.colors.card, 
              padding: theme.space.sm, 
              borderRadius: theme.radius.md 
            }}
          >
            <Text style={{ fontSize: 20 }}>🖼️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => sendToAI({ type: 'barcode' })}
            style={{ 
              backgroundColor: theme.colors.card, 
              padding: theme.space.sm, 
              borderRadius: theme.radius.md 
            }}
          >
            <Text style={{ fontSize: 20 }}>🏷️</Text>
          </TouchableOpacity>
        </View>

        {/* Text Input */}
        <TextInput
          placeholder={getLocalizedText('placeholder', 'Ask me to find, compare, or bundle…')}
          placeholderTextColor="#99A8B2"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => {
            if (query.trim()) {
              sendToAI({ type: 'text', text: query });
              setQuery('');
            }
          }}
          style={{
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderRadius: theme.radius.md,
            padding: theme.space.md,
            marginBottom: theme.space.md,
            fontSize: 16
          }}
        />

        {/* Smart Contextual Action Chips */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          gap: theme.space.sm, 
          marginBottom: theme.space.lg 
        }}>
          {getSmartSuggestions().map((prompt, index) => (
            <TouchableOpacity
              key={`${prompt}-${index}`}
              onPress={() => sendToAI({ type: 'prompt', text: prompt })}
              style={{
                backgroundColor: theme.colors.card,
                paddingVertical: theme.space.sm,
                paddingHorizontal: theme.space.md,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: index === 0 ? '#4A9EFF' : 'transparent', // Highlight first suggestion
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }}
            >
              <Text style={{ 
                color: index === 0 ? '#4A9EFF' : '#E6EDF3', 
                fontSize: 14,
                fontWeight: index === 0 ? '600' : '400'
              }}>
                {prompt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Context Helper Text */}
        <View style={{
          backgroundColor: 'rgba(74, 158, 255, 0.1)',
          padding: theme.space.sm,
          borderRadius: theme.radius.md,
          marginBottom: theme.space.md,
          borderLeftWidth: 3,
          borderLeftColor: '#4A9EFF'
        }}>
          <Text style={{
            color: '#4A9EFF',
            fontSize: 12,
            fontStyle: 'italic'
          }}>
            {locale === 'sw' 
              ? '💡 Tip: Uliza kwa lugha yoyote - nitakuelewa!' 
              : '💡 Tip: Ask in any language - I understand both English and Swahili!'
            }
          </Text>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={{ 
            backgroundColor: theme.colors.card, 
            padding: theme.space.md, 
            borderRadius: theme.radius.md,
            marginBottom: theme.space.md 
          }}>
            <Text style={{ color: theme.colors.text, textAlign: 'center' }}>
              🤖 AI is thinking...
            </Text>
          </View>
        )}

        {/* Smart Cards */}
        <View style={{ gap: theme.space.md }}>
          {cards.map((card, index) => renderCard(card, index))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}