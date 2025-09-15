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
        'en': 'Ask me to find, compare, or bundle…',
        'sw': 'Niulize kutafuta, kulinganisha, au kuunganisha...'
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
        {/* AI-First Header */}
        <View style={{ gap: theme.space.xs, marginBottom: theme.space.lg }}>
          <Text style={{ 
            color: theme.colors.text, 
            fontSize: 22, 
            fontWeight: '700' 
          }}>
            {getLocalizedText('title', 'AisleMarts — AI for Shopping')}
          </Text>
          <Text style={{ color: theme.colors.textDim }}>
            {getLocalizedText('subtitle', 'Smarter. Faster. Everywhere.')}
          </Text>
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

        {/* Quick Action Chips */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          gap: theme.space.sm, 
          marginBottom: theme.space.lg 
        }}>
          {[
            'Best deal nearby',
            'Compare two products', 
            'Bundle under $200',
            'Help me sell this'
          ].map((prompt) => (
            <TouchableOpacity
              key={prompt}
              onPress={() => sendToAI({ type: 'prompt', text: prompt })}
              style={{
                backgroundColor: theme.colors.card,
                paddingVertical: theme.space.sm,
                paddingHorizontal: theme.space.md,
                borderRadius: 999
              }}
            >
              <Text style={{ color: '#E6EDF3', fontSize: 14 }}>{prompt}</Text>
            </TouchableOpacity>
          ))}
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