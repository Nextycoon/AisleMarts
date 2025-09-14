"""
AisleMarts Localization Service - Auto-detect user location and provide localized experience
Supports currency detection, language preferences, and regional customization
"""

import requests
import asyncio
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
from fastapi import Request
import json
import logging
from dotenv import load_dotenv
import os

load_dotenv()

logger = logging.getLogger(__name__)

class LocalizationService:
    """
    Handles automatic localization for AisleMarts users including:
    - IP-based location detection
    - Currency assignment based on country
    - Language preference detection
    - Regional product filtering
    """
    
    def __init__(self):
        # Currency mapping for major AisleMarts target markets
        self.country_currency_map = {
            # Africa
            'KE': {'currency': 'KES', 'symbol': 'KSh', 'name': 'Kenyan Shilling'},
            'NG': {'currency': 'NGN', 'symbol': '₦', 'name': 'Nigerian Naira'},
            'ZA': {'currency': 'ZAR', 'symbol': 'R', 'name': 'South African Rand'},
            'EG': {'currency': 'EGP', 'symbol': 'LE', 'name': 'Egyptian Pound'},
            'MA': {'currency': 'MAD', 'symbol': 'MAD', 'name': 'Moroccan Dirham'},
            
            # Europe
            'IT': {'currency': 'EUR', 'symbol': '€', 'name': 'Euro'},
            'DE': {'currency': 'EUR', 'symbol': '€', 'name': 'Euro'},
            'FR': {'currency': 'EUR', 'symbol': '€', 'name': 'Euro'},
            'ES': {'currency': 'EUR', 'symbol': '€', 'name': 'Euro'},
            'GB': {'currency': 'GBP', 'symbol': '£', 'name': 'British Pound'},
            'TR': {'currency': 'TRY', 'symbol': '₺', 'name': 'Turkish Lira'},
            
            # Americas
            'US': {'currency': 'USD', 'symbol': '$', 'name': 'US Dollar'},
            'CA': {'currency': 'CAD', 'symbol': 'C$', 'name': 'Canadian Dollar'},
            'MX': {'currency': 'MXN', 'symbol': '$', 'name': 'Mexican Peso'},
            'BR': {'currency': 'BRL', 'symbol': 'R$', 'name': 'Brazilian Real'},
            
            # Asia
            'IN': {'currency': 'INR', 'symbol': '₹', 'name': 'Indian Rupee'},
            'CN': {'currency': 'CNY', 'symbol': '¥', 'name': 'Chinese Yuan'},
            'JP': {'currency': 'JPY', 'symbol': '¥', 'name': 'Japanese Yen'},
            'AE': {'currency': 'AED', 'symbol': 'AED', 'name': 'UAE Dirham'},
            'SA': {'currency': 'SAR', 'symbol': 'SAR', 'name': 'Saudi Riyal'},
        }
        
        # Language mapping for countries
        self.country_language_map = {
            'KE': 'en',  # English/Swahili
            'NG': 'en',  # English
            'ZA': 'en',  # English
            'EG': 'ar',  # Arabic
            'MA': 'ar',  # Arabic/French
            'IT': 'it',  # Italian
            'DE': 'de',  # German
            'FR': 'fr',  # French
            'ES': 'es',  # Spanish
            'GB': 'en',  # English
            'TR': 'tr',  # Turkish
            'US': 'en',  # English
            'CA': 'en',  # English/French
            'MX': 'es',  # Spanish
            'BR': 'pt',  # Portuguese
            'IN': 'en',  # English/Hindi
            'CN': 'zh',  # Chinese
            'JP': 'ja',  # Japanese
            'AE': 'ar',  # Arabic
            'SA': 'ar',  # Arabic
        }
        
        # Free IP geolocation service
        self.ip_api_url = "http://ip-api.com/json/"
        
        # Currency conversion cache
        self.currency_cache = {}
        self.cache_expiry = {}
        
    async def detect_user_location(self, request: Request) -> Dict[str, str]:
        """
        Detect user location from IP address
        Returns country code, currency, and language
        """
        try:
            # Get IP address from request
            client_ip = self.get_client_ip(request)
            
            # For local development, return default
            if client_ip in ['127.0.0.1', 'localhost', '::1']:
                return {
                    'country_code': 'KE',  # Default to Kenya for testing
                    'country_name': 'Kenya',
                    'currency': 'KES',
                    'currency_symbol': 'KSh',
                    'language': 'en',
                    'ip': client_ip
                }
            
            # Call IP geolocation API
            response = requests.get(f"{self.ip_api_url}{client_ip}", timeout=5)
            
            if response.status_code == 200:
                location_data = response.json()
                
                if location_data.get('status') == 'success':
                    country_code = location_data.get('countryCode', 'US')
                    country_name = location_data.get('country', 'United States')
                    
                    # Get currency and language for this country
                    currency_info = self.country_currency_map.get(country_code, self.country_currency_map['US'])
                    language = self.country_language_map.get(country_code, 'en')
                    
                    return {
                        'country_code': country_code,
                        'country_name': country_name,
                        'currency': currency_info['currency'],
                        'currency_symbol': currency_info['symbol'],
                        'currency_name': currency_info['name'],
                        'language': language,
                        'city': location_data.get('city', ''),
                        'region': location_data.get('regionName', ''),
                        'ip': client_ip
                    }
            
        except Exception as e:
            logger.error(f"Error detecting user location: {str(e)}")
        
        # Fallback to default (Kenya for AisleMarts pilot)
        return {
            'country_code': 'KE',
            'country_name': 'Kenya',
            'currency': 'KES',
            'currency_symbol': 'KSh',
            'currency_name': 'Kenyan Shilling',
            'language': 'en',
            'ip': 'unknown'
        }
    
    def get_client_ip(self, request: Request) -> str:
        """Extract client IP from request headers"""
        # Check for forwarded IP (for load balancers/proxies)
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        # Check for real IP header
        real_ip = request.headers.get('X-Real-IP')
        if real_ip:
            return real_ip
        
        # Fallback to direct connection IP
        return request.client.host if request.client else '127.0.0.1'
    
    async def get_currency_conversion_rate(self, from_currency: str, to_currency: str) -> float:
        """
        Get currency conversion rate from free API
        Returns conversion rate from from_currency to to_currency
        """
        if from_currency == to_currency:
            return 1.0
        
        cache_key = f"{from_currency}_{to_currency}"
        
        # Check cache (1-hour expiry)
        if cache_key in self.currency_cache:
            if datetime.now() < self.cache_expiry.get(cache_key, datetime.now()):
                return self.currency_cache[cache_key]
        
        try:
            # Using exchangerate-api.com (free tier: 1500 requests/month)
            api_url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
            
            response = requests.get(api_url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                rate = data.get('rates', {}).get(to_currency)
                
                if rate:
                    # Cache for 1 hour
                    self.currency_cache[cache_key] = rate
                    self.cache_expiry[cache_key] = datetime.now() + timedelta(hours=1)
                    return rate
            
        except Exception as e:
            logger.error(f"Error getting currency conversion rate: {str(e)}")
        
        # Fallback rates (approximate, for demo purposes)
        fallback_rates = {
            'USD_KES': 150.0,
            'USD_EUR': 0.85,
            'USD_GBP': 0.75,
            'USD_NGN': 800.0,
            'USD_EGP': 31.0,
            'USD_TRY': 28.0,
            'KES_USD': 0.0067,
            'EUR_USD': 1.18,
            'GBP_USD': 1.33,
        }
        
        return fallback_rates.get(cache_key, 1.0)
    
    async def convert_price(self, price: float, from_currency: str, to_currency: str) -> Dict[str, any]:
        """
        Convert price from one currency to another
        Returns converted price with formatting
        """
        if from_currency == to_currency:
            currency_info = self.get_currency_info(to_currency)
            return {
                'amount': price,
                'currency': to_currency,
                'symbol': currency_info['symbol'],
                'formatted': f"{currency_info['symbol']}{price:,.2f}",
                'conversion_rate': 1.0
            }
        
        # Get conversion rate
        rate = await self.get_currency_conversion_rate(from_currency, to_currency)
        converted_amount = price * rate
        
        # Get currency info for formatting
        currency_info = self.get_currency_info(to_currency)
        
        return {
            'amount': round(converted_amount, 2),
            'currency': to_currency,
            'symbol': currency_info['symbol'],
            'formatted': f"{currency_info['symbol']}{converted_amount:,.2f}",
            'conversion_rate': rate,
            'original_amount': price,
            'original_currency': from_currency
        }
    
    def get_currency_info(self, currency_code: str) -> Dict[str, str]:
        """Get currency information by currency code"""
        for country_currencies in self.country_currency_map.values():
            if country_currencies['currency'] == currency_code:
                return country_currencies
        
        # Fallback
        return {'currency': 'USD', 'symbol': '$', 'name': 'US Dollar'}
    
    def get_supported_countries(self) -> Dict[str, Dict]:
        """Get list of all supported countries with their currency/language info"""
        return {
            code: {
                **currency_info,
                'language': self.country_language_map.get(code, 'en')
            }
            for code, currency_info in self.country_currency_map.items()
        }
    
    def is_country_supported(self, country_code: str) -> bool:
        """Check if a country is supported by AisleMarts"""
        return country_code in self.country_currency_map
    
    async def get_localized_greeting(self, country_code: str, language: str) -> str:
        """
        Get localized greeting message for Aisle AI based on country/language
        """
        greetings = {
            'en': {
                'KE': "Karibu to AisleMarts Kenya! 🇰🇪 I'm Aisle, your shopping companion. Ready to discover amazing local and global products?",
                'NG': "Welcome to AisleMarts Nigeria! 🇳🇬 I'm Aisle, here to help you find the best deals across Africa and beyond.",
                'US': "Welcome to AisleMarts! 🇺🇸 I'm Aisle, your AI shopping guide ready to help you discover amazing products.",
                'GB': "Welcome to AisleMarts UK! 🇬🇧 I'm Aisle, delighted to help you explore our global marketplace.",
                'default': "Welcome to AisleMarts! 🌍 I'm Aisle, your global shopping companion ready to help you discover amazing products worldwide."
            },
            'ar': {
                'EG': "أهلاً بك في AisleMarts مصر! 🇪🇬 أنا Aisle، مساعدك الذكي للتسوق. مستعد لاكتشاف منتجات رائعة؟",
                'SA': "أهلاً وسهلاً بك في AisleMarts السعودية! 🇸🇦 أنا Aisle، هنا لمساعدتك في العثور على أفضل المنتجات.",
                'default': "أهلاً بك في AisleMarts! 🌍 أنا Aisle، مساعدك الذكي للتسوق العالمي."
            },
            'fr': {
                'FR': "Bienvenue sur AisleMarts France! 🇫🇷 Je suis Aisle, votre compagnon d'achat IA prêt à vous aider.",
                'default': "Bienvenue sur AisleMarts! 🌍 Je suis Aisle, votre guide d'achat mondial."
            },
            'es': {
                'ES': "¡Bienvenido a AisleMarts España! 🇪🇸 Soy Aisle, tu compañero de compras IA listo para ayudarte.",
                'MX': "¡Bienvenido a AisleMarts México! 🇲🇽 Soy Aisle, aquí para ayudarte a descubrir productos increíbles.",
                'default': "¡Bienvenido a AisleMarts! 🌍 Soy Aisle, tu guía de compras global."
            },
            'it': {
                'IT': "Benvenuto su AisleMarts Italia! 🇮🇹 Sono Aisle, il tuo compagno di shopping IA pronto ad aiutarti.",
                'default': "Benvenuto su AisleMarts! 🌍 Sono Aisle, la tua guida agli acquisti globale."
            },
            'tr': {
                'TR': "AisleMarts Türkiye'ye hoş geldiniz! 🇹🇷 Ben Aisle, alışveriş arkadaşınız. Harika ürünler keşfetmeye hazır mısınız?",
                'default': "AisleMarts'a hoş geldiniz! 🌍 Ben Aisle, küresel alışveriş rehberiniz."
            }
        }
        
        # Get language-specific greetings
        lang_greetings = greetings.get(language, greetings['en'])
        
        # Get country-specific or default greeting
        return lang_greetings.get(country_code, lang_greetings['default'])

# Initialize global instance
localization_service = LocalizationService()