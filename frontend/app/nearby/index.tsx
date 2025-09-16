import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import StatusChip from '@/src/components/StatusChip';  
import EmptyState, { NoReservations } from '@/src/components/EmptyStates';
import { FadeInView, SlideInView, SkeletonLoader, SuccessCheckmark, BounceButton } from '@/src/components/Animations';
import useHaptics from '@/src/hooks/useHaptics';
import { useToast } from '@/src/components/ToastHost';

// Types
interface Merchant {
  id: string;
  name: string;
  category: string;
  description: string;
  distance: number;
  status: 'open' | 'closed' | 'busy';
  averagePrice: number;
  pickupWindows: PickupWindow[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface PickupWindow {
  id: string;
  merchantId: string;
  timeSlot: {
    start: string;
    end: string;
  };
  capacity: number;
  reserved: number;
  available: number;
  status: 'active' | 'full' | 'closed';
}

interface Reservation {
  id: string;
  merchantId: string;
  merchantName: string;
  status: 'held' | 'scheduled' | 'confirmed' | 'partial_pickup' | 'completed' | 'cancelled' | 'expired';
  items: ReservationItem[];
  total: number;
  pickupWindow?: PickupWindow;
  pickupCode?: string;
  scheduledFor?: string;
  createdAt: string;
}

interface ReservationItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export default function NearbyCommerceScreen() {
  const [activeTab, setActiveTab] = useState('discover');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    openNow: false,
    within2km: false,
    category: 'all'
  });
  
  // Data states
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [reservationModal, setReservationModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ReservationItem[]>([]);
  
  // Hooks
  const haptics = useHaptics();
  const toast = useToast();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Commerce</Text>
        <TouchableOpacity style={styles.scanButton}>
          <Ionicons name="scan" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pickup' && styles.activeTab]}
          onPress={() => setActiveTab('pickup')}
        >
          <Text style={[styles.tabText, activeTab === 'pickup' && styles.activeTabText]}>
            Pickup Windows
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reservations' && styles.activeTab]}
          onPress={() => setActiveTab('reservations')}
        >
          <Text style={[styles.tabText, activeTab === 'reservations' && styles.activeTabText]}>
            My Reservations
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'discover' && (
          <View>
            <Text style={styles.sectionTitle}>Phase 3: Nearby/Onsite Commerce ✅</Text>
            <Text style={styles.description}>
              Discover nearby merchants, reserve items for pickup, and enjoy seamless online-to-offline commerce.
            </Text>

            {/* Location Card */}
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={24} color="#667eea" />
                <Text style={styles.locationTitle}>Current Location</Text>
              </View>
              <Text style={styles.locationText}>📍 Westlands, Nairobi, Kenya</Text>
              <Text style={styles.locationSubtext}>5 nearby merchants • 150+ products available</Text>
            </View>

            {/* Nearby Merchants */}
            <Text style={styles.subsectionTitle}>Nearby Merchants</Text>
            
            <View style={styles.merchantList}>
              <View style={styles.merchantItem}>
                <View style={styles.merchantHeader}>
                  <Text style={styles.merchantName}>TechHub Westlands</Text>
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>0.5 km</Text>
                  </View>
                </View>
                <Text style={styles.merchantCategory}>Electronics & Technology</Text>
                <Text style={styles.merchantDescription}>
                  Smartphones, laptops, accessories • Available for immediate pickup
                </Text>
                <View style={styles.merchantActions}>
                  <TouchableOpacity style={styles.reserveButton}>
                    <Ionicons name="bookmark" size={16} color="white" />
                    <Text style={styles.reserveButtonText}>Reserve Items</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Products</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.merchantItem}>
                <View style={styles.merchantHeader}>
                  <Text style={styles.merchantName}>SuperMart Westlands</Text>
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>1.2 km</Text>
                  </View>
                </View>
                <Text style={styles.merchantCategory}>Grocery & Household</Text>
                <Text style={styles.merchantDescription}>
                  Fresh produce, household items • Same-day pickup available
                </Text>
                <View style={styles.merchantActions}>
                  <TouchableOpacity style={styles.reserveButton}>
                    <Ionicons name="bookmark" size={16} color="white" />
                    <Text style={styles.reserveButtonText}>Reserve Items</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Products</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'pickup' && (
          <View>
            <Text style={styles.sectionTitle}>Available Pickup Windows</Text>
            
            <View style={styles.windowsList}>
              <View style={styles.windowItem}>
                <View style={styles.windowHeader}>
                  <Text style={styles.windowTime}>Today, 2:00 PM - 3:00 PM</Text>
                  <View style={styles.availabilityBadge}>
                    <Text style={styles.availabilityText}>5 spots left</Text>
                  </View>
                </View>
                <Text style={styles.windowLocation}>TechHub Westlands</Text>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book Window</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.windowItem}>
                <View style={styles.windowHeader}>
                  <Text style={styles.windowTime}>Today, 5:00 PM - 6:00 PM</Text>
                  <View style={styles.availabilityBadge}>
                    <Text style={styles.availabilityText}>3 spots left</Text>
                  </View>
                </View>
                <Text style={styles.windowLocation}>SuperMart Westlands</Text>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book Window</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.windowItem}>
                <View style={styles.windowHeader}>
                  <Text style={styles.windowTime}>Tomorrow, 10:00 AM - 11:00 AM</Text>
                  <View style={[styles.availabilityBadge, styles.availabilityBadgeFull]}>
                    <Text style={styles.availabilityText}>Fully Booked</Text>
                  </View>
                </View>
                <Text style={styles.windowLocation}>TechHub Westlands</Text>
                <TouchableOpacity style={[styles.bookButton, styles.bookButtonDisabled]} disabled>
                  <Text style={styles.bookButtonTextDisabled}>Unavailable</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'reservations' && (
          <View>
            <Text style={styles.sectionTitle}>My Reservations</Text>
            
            <View style={styles.reservationsList}>
              <View style={styles.reservationItem}>
                <View style={styles.reservationHeader}>
                  <Text style={styles.reservationId}>Reservation #RES001</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Confirmed</Text>
                  </View>
                </View>
                <Text style={styles.reservationMerchant}>TechHub Westlands</Text>
                <Text style={styles.reservationTime}>📅 Today, 2:00 PM - 3:00 PM</Text>
                <Text style={styles.reservationItems}>2 items reserved • Total: KES 25,000</Text>
                <View style={styles.reservationActions}>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modifyButton}>
                    <Text style={styles.modifyButtonText}>Modify</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.reservationItem}>
                <View style={styles.reservationHeader}>
                  <Text style={styles.reservationId}>Reservation #RES002</Text>
                  <View style={[styles.statusBadge, styles.statusBadgePartial]}>
                    <Text style={styles.statusText}>Partial Pickup</Text>
                  </View>
                </View>
                <Text style={styles.reservationMerchant}>SuperMart Westlands</Text>
                <Text style={styles.reservationTime}>📅 Yesterday, 5:00 PM - 6:00 PM</Text>
                <Text style={styles.reservationItems}>1 of 3 items picked up • Remaining: KES 12,500</Text>
                <View style={styles.reservationActions}>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>Complete Pickup</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modifyButton}>
                    <Text style={styles.modifyButtonText}>Extend Hold</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  scanButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: 12,
    color: '#999',
  },
  merchantList: {
    gap: 16,
  },
  merchantItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  merchantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: '#e8f2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  merchantCategory: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 4,
  },
  merchantDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  merchantActions: {
    flexDirection: 'row',
    gap: 12,
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  reserveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  windowsList: {
    gap: 16,
  },
  windowItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  windowTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  availabilityBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availabilityBadgeFull: {
    backgroundColor: '#FF3B30',
  },
  availabilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  windowLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bookButtonTextDisabled: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  reservationsList: {
    gap: 16,
  },
  reservationItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservationId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgePartial: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reservationMerchant: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 4,
  },
  reservationTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reservationItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  reservationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modifyButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  modifyButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});