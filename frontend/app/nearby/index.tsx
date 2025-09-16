/**
 * Phase 3: Nearby/Onsite Commerce - Main Nearby Screen
 * Map + List hybrid view for location-based product discovery
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

// Note: Mapbox temporarily disabled for web compatibility
import { requestLocationPermission, NAIROBI_CENTER, formatDistance } from './_lib/map';

const { width, height } = Dimensions.get('window');

interface Location {
  id: string;
  name: string;
  type: string;
  geo: {
    coordinates: [number, number];
  };
  address: {
    line1: string;
    city: string;
  };
  distance_m: number;
  services: string[];
  capabilities: {
    rfq_counter: boolean;
    mpesa_payment: boolean;
  };
}

interface Offer {
  sku: string;
  gtin?: string;
  qty: number;
  price: {
    amount: number;
    currency: string;
  };
  attributes: {
    color?: string;
    storage?: string;
    condition: string;
  };
  location_id: string;
  distance_m: number;
}

interface NearbyItem {
  product_id?: string;
  title: string;
  description: string;
  best_pick_score: number;
  best_pick_reasons: string[];
  best_offer: Offer;
  location: Location;
}

const API_BASE = Constants.expoConfig?.extra?.BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function NearbyScreen() {
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [items, setItems] = useState<NearbyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<'retail' | 'wholesale' | 'all'>('retail');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedItem, setSelectedItem] = useState<NearbyItem | null>(null);

  const mapRef = useRef<any>(null);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const result = await requestLocationPermission();
      
      if (result.granted && result.location) {
        const { latitude, longitude } = result.location.coords;
        setLocation({ lat: latitude, lng: longitude });
        await searchNearby(latitude, longitude);
      } else {
        // Use Nairobi as fallback
        setLocation({ lat: NAIROBI_CENTER[1], lng: NAIROBI_CENTER[0] });
        await searchNearby(NAIROBI_CENTER[1], NAIROBI_CENTER[0]);
        
        if (result.error) {
          Alert.alert(
            'Location Access',
            result.error + '\n\nShowing results for Nairobi instead.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Location initialization error:', error);
      // Fallback to Nairobi
      setLocation({ lat: NAIROBI_CENTER[1], lng: NAIROBI_CENTER[0] });
      await searchNearby(NAIROBI_CENTER[1], NAIROBI_CENTER[0]);
    } finally {
      setLoading(false);
    }
  };

  const searchNearby = async (lat: number, lng: number) => {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius_m: '5000',
        mode: selectedMode,
        limit: '20'
      });

      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }

      const response = await fetch(`${API_BASE}/api/v1/nearby/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Nearby search error:', error);
      Alert.alert('Search Error', 'Failed to load nearby items. Please try again.');
      setItems([]);
    }
  };

  const handleSearch = () => {
    if (location) {
      setLoading(true);
      searchNearby(location.lat, location.lng).finally(() => setLoading(false));
    }
  };

  const handleModeChange = (mode: 'retail' | 'wholesale' | 'all') => {
    setSelectedMode(mode);
    if (location) {
      setLoading(true);
      searchNearby(location.lat, location.lng).finally(() => setLoading(false));
    }
  };

  const formatPrice = (amount: number, currency: string = 'KES') => {
    if (currency === 'KES') {
      return `KSh ${(amount / 100).toLocaleString()}`;
    }
    return `${currency} ${(amount / 100).toFixed(2)}`;
  };

  const renderBestPickBadge = (score: number, reasons: string[]) => (
    <View style={styles.bestPickBadge}>
      <Ionicons name="trophy" size={14} color="#FFD700" />
      <Text style={styles.bestPickScore}>{(score * 100).toFixed(0)}%</Text>
      <Text style={styles.bestPickReason}>{reasons[0]}</Text>
    </View>
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      {/* Placeholder map view for web compatibility */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={64} color="#ccc" />
        <Text style={styles.mapPlaceholderText}>Map View</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          Location: {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Unknown'}
        </Text>
        <Text style={styles.mapPlaceholderSubtext}>
          Found {items.length} nearby items
        </Text>
        
        {/* Show selected item overlay if any */}
        {selectedItem && (
          <View style={styles.selectedItemOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedItem(null)}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
            
            <Text style={styles.selectedItemTitle}>{selectedItem.title}</Text>
            <Text style={styles.selectedItemLocation}>{selectedItem.location.name}</Text>
            <Text style={styles.selectedItemPrice}>
              {formatPrice(selectedItem.best_offer.price.amount)}
            </Text>
            
            {renderBestPickBadge(selectedItem.best_pick_score, selectedItem.best_pick_reasons)}
            
            <TouchableOpacity
              style={styles.reserveButton}
              onPress={() => router.push(`/nearby/reserve/${selectedItem.best_offer.sku}`)}
            >
              <Text style={styles.reserveButtonText}>Reserve & Pickup</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderListItem = ({ item }: { item: NearbyItem }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => setSelectedItem(item)}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {renderBestPickBadge(item.best_pick_score, item.best_pick_reasons)}
      </View>
      
      <Text style={styles.itemLocation}>{item.location.name}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
      
      <View style={styles.itemFooter}>
        <Text style={styles.itemPrice}>
          {formatPrice(item.best_offer.price.amount)}
        </Text>
        <Text style={styles.itemDistance}>
          {formatDistance(item.best_offer.distance_m)}
        </Text>
        <Text style={styles.itemStock}>Qty: {item.best_offer.qty}</Text>
      </View>

      <View style={styles.itemCapabilities}>
        {item.location.capabilities.mpesa_payment && (
          <View style={styles.capabilityTag}>
            <Text style={styles.capabilityText}>M-Pesa</Text>
          </View>
        )}
        {item.location.services.includes('pickup') && (
          <View style={styles.capabilityTag}>
            <Text style={styles.capabilityText}>Pickup</Text>
          </View>
        )}
        {item.location.capabilities.rfq_counter && (
          <View style={styles.capabilityTag}>
            <Text style={styles.capabilityText}>B2B</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderListView = () => (
    <FlatList
      data={items}
      renderItem={renderListItem}
      keyExtractor={(item, index) => `${item.best_offer.sku}-${index}`}
      style={styles.listContainer}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Finding nearby products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Nearby Products</Text>
        
        <TouchableOpacity onPress={() => router.push('/nearby/scan')}>
          <Ionicons name="qr-code-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={16} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Mode Filter */}
      <View style={styles.modeContainer}>
        {(['retail', 'wholesale', 'all'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeButton,
              selectedMode === mode && styles.modeButtonActive
            ]}
            onPress={() => handleModeChange(mode)}
          >
            <Text style={[
              styles.modeButtonText,
              selectedMode === mode && styles.modeButtonTextActive
            ]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
          onPress={() => setViewMode('map')}
        >
          <Ionicons name="map" size={16} color={viewMode === 'map' ? 'white' : '#666'} />
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
            Map
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons name="list" size={16} color={viewMode === 'list' ? 'white' : '#666'} />
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            List
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'map' ? renderMapView() : renderListView()}

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsText}>
          {items.length} product{items.length !== 1 ? 's' : ''} found
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: 'white',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  itemMarker: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedItemOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  selectedItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    paddingRight: 32,
  },
  selectedItemLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  selectedItemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  reserveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  reserveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  bestPickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestPickScore: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
  },
  bestPickReason: {
    marginLeft: 4,
    fontSize: 10,
    color: '#856404',
  },
  itemLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  itemDistance: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  itemStock: {
    fontSize: 12,
    color: '#999',
  },
  itemCapabilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  capabilityTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  capabilityText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '500',
  },
  resultsCount: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});