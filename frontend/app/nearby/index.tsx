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

  // Initialize data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // API Functions
  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadNearbyMerchants(),
        loadMyReservations()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Loading Error', 'Failed to load nearby commerce data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyMerchants = async () => {
    try {
      // Demo data for now - replace with actual API call
      const demoMerchants: Merchant[] = [
        {
          id: 'merchant-1',
          name: 'TechHub Westlands',
          category: 'Electronics & Technology',
          description: 'Smartphones, laptops, accessories • Available for immediate pickup',
          distance: 0.5,
          status: 'open',
          averagePrice: 25000,
          coordinates: { lat: -1.2685, lng: 36.8065 },
          pickupWindows: [
            {
              id: 'window-1',
              merchantId: 'merchant-1',
              timeSlot: { start: '14:00', end: '15:00' },
              capacity: 8,
              reserved: 3,
              available: 5,
              status: 'active'
            },
            {
              id: 'window-2',
              merchantId: 'merchant-1',
              timeSlot: { start: '17:00', end: '18:00' },
              capacity: 8,
              reserved: 8,
              available: 0,
              status: 'full'
            }
          ]
        },
        {
          id: 'merchant-2',
          name: 'SuperMart Westlands',
          category: 'Grocery & Household',
          description: 'Fresh produce, household items • Same-day pickup available',
          distance: 1.2,
          status: 'open',
          averagePrice: 5000,
          coordinates: { lat: -1.2705, lng: 36.8085 },
          pickupWindows: [
            {
              id: 'window-3',
              merchantId: 'merchant-2',
              timeSlot: { start: '16:00', end: '17:00' },
              capacity: 6,
              reserved: 2,
              available: 4,
              status: 'active'
            }
          ]
        }
      ];
      
      setMerchants(demoMerchants);
    } catch (error) {
      console.error('Failed to load merchants:', error);
      throw error;
    }
  };

  const loadMyReservations = async () => {
    try {
      // Demo data for now - replace with actual API call
      const demoReservations: Reservation[] = [
        {
          id: 'RES001',
          merchantId: 'merchant-1',
          merchantName: 'TechHub Westlands',
          status: 'confirmed',
          pickupCode: 'TECH123',
          scheduledFor: '2024-12-20T14:30:00Z',
          createdAt: '2024-12-19T10:00:00Z',
          items: [
            { sku: 'PHONE-001', name: 'Samsung Galaxy S24', qty: 1, price: 50000 },
            { sku: 'CASE-001', name: 'Phone Case', qty: 1, price: 2000 }
          ],
          total: 52000,
          pickupWindow: {
            id: 'window-1',
            merchantId: 'merchant-1',
            timeSlot: { start: '14:00', end: '15:00' },
            capacity: 8,
            reserved: 3,
            available: 5,
            status: 'active'
          }
        },
        {
          id: 'RES002',
          merchantId: 'merchant-2',
          merchantName: 'SuperMart Westlands',
          status: 'partial_pickup',
          pickupCode: 'SUPER456',
          scheduledFor: '2024-12-19T17:00:00Z',
          createdAt: '2024-12-19T08:00:00Z',
          items: [
            { sku: 'MILK-001', name: 'Fresh Milk 1L', qty: 2, price: 800 },
            { sku: 'BREAD-001', name: 'Whole Wheat Bread', qty: 1, price: 300 },
            { sku: 'EGGS-001', name: 'Farm Eggs (12pcs)', qty: 1, price: 400 }
          ],
          total: 2300
        }
      ];
      
      setReservations(demoReservations);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
      toast.success('Refreshed', 'Data updated successfully');
      haptics.onButtonPress();
    } catch (error) {
      toast.error('Refresh Failed', 'Unable to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleMerchantSelect = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setReservationModal(true);
    haptics.onWindowSelected();
  };

  const handleReservationCreate = async (items: ReservationItem[], pickupWindow: PickupWindow) => {
    try {
      setLoading(true);
      
      // Demo reservation creation - replace with actual API call
      const newReservation: Reservation = {
        id: `RES${Date.now()}`,
        merchantId: selectedMerchant!.id,
        merchantName: selectedMerchant!.name,
        status: 'scheduled',
        pickupCode: `${selectedMerchant!.name.substring(0, 4).toUpperCase()}${Math.floor(Math.random() * 1000)}`,
        scheduledFor: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        items,
        total: items.reduce((sum, item) => sum + (item.price * item.qty), 0),
        pickupWindow
      };

      setReservations(prev => [newReservation, ...prev]);
      setReservationModal(false);
      setSelectedMerchant(null);
      setActiveTab('reservations');
      
      toast.success('Reservation Created!', `Pickup code: ${newReservation.pickupCode}`);
      haptics.onReservationScheduled();
      
    } catch (error) {
      console.error('Failed to create reservation:', error);
      toast.error('Reservation Failed', 'Unable to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReservationAction = async (reservationId: string, action: 'extend' | 'modify' | 'cancel') => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) return;

      switch (action) {
        case 'extend':
          toast.warning('Hold Extended', 'Your reservation hold has been extended by 30 minutes.');
          haptics.onHoldExtended();
          break;
        case 'modify':
          router.push(`/nearby/reserve/${reservationId}/details`);
          break;
        case 'cancel':
          Alert.alert(
            'Cancel Reservation',
            'Are you sure you want to cancel this reservation?',
            [
              { text: 'Keep', style: 'cancel' },
              { 
                text: 'Cancel', 
                style: 'destructive',
                onPress: () => {
                  setReservations(prev => prev.map(r => 
                    r.id === reservationId ? { ...r, status: 'cancelled' } : r
                  ));
                  toast.error('Reservation Cancelled', 'Your reservation has been cancelled.');
                  haptics.onReservationCancelled();
                }
              }
            ]
          );
          break;
      }
    } catch (error) {
      console.error('Failed to handle reservation action:', error);
      toast.error('Action Failed', 'Unable to complete the action. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with Search */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Commerce</Text>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => router.push('/nearby/scan')}
        >
          <Ionicons name="scan" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search merchants, products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterOpen(!filterOpen)}
        >
          <Ionicons name="options" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      {filterOpen && (
        <SlideInView direction="down" style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BounceButton
              style={[styles.filterPill, selectedFilters.openNow && styles.filterPillActive]}
              onPress={() => setSelectedFilters(prev => ({ ...prev, openNow: !prev.openNow }))}
            >
              <Ionicons name="time" size={16} color={selectedFilters.openNow ? 'white' : '#667eea'} />
              <Text style={[styles.filterPillText, selectedFilters.openNow && styles.filterPillTextActive]}>
                Open Now
              </Text>
            </BounceButton>
            
            <BounceButton
              style={[styles.filterPill, selectedFilters.within2km && styles.filterPillActive]}
              onPress={() => setSelectedFilters(prev => ({ ...prev, within2km: !prev.within2km }))}
            >
              <Ionicons name="location" size={16} color={selectedFilters.within2km ? 'white' : '#667eea'} />
              <Text style={[styles.filterPillText, selectedFilters.within2km && styles.filterPillTextActive]}>
                Within 2km
              </Text>
            </BounceButton>
          </ScrollView>
        </SlideInView>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['discover', 'pickup', 'reservations'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab as any);
              haptics.onButtonPress();
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'discover' ? 'Discover' : tab === 'pickup' ? 'Windows' : 'My Orders'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'discover' && (
          <FadeInView>
            {/* Location Card */}
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={24} color="#667eea" />
                <Text style={styles.locationTitle}>Current Location</Text>
              </View>
              <Text style={styles.locationText}>📍 Westlands, Nairobi, Kenya</Text>
              <Text style={styles.locationSubtext}>
                {merchants.length} nearby merchants • {merchants.reduce((sum, m) => sum + m.pickupWindows.length, 0)} pickup windows
              </Text>
            </View>

            {/* Merchants List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Finding nearby merchants...</Text>
              </View>
            ) : merchants && merchants.length > 0 ? (
              <View style={styles.merchantList}>
                {merchants.map((merchant, index) => (
                  <SlideInView key={merchant.id} delay={index * 100} style={styles.merchantItem}>
                    <View style={styles.merchantHeader}>
                      <Text style={styles.merchantName}>{merchant.name}</Text>
                      <View style={styles.distanceBadge}>
                        <Text style={styles.distanceText}>{merchant.distance} km</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.merchantCategory}>{merchant.category}</Text>
                    <Text style={styles.merchantDescription}>{merchant.description}</Text>
                    
                    <View style={styles.merchantStats}>
                      <StatusChip 
                        status={merchant.status === 'open' ? 'active' : 'inactive'} 
                        size="small" 
                      />
                      <Text style={styles.averagePrice}>Avg: KES {merchant.averagePrice.toLocaleString()}</Text>
                    </View>
                    
                    <View style={styles.merchantActions}>
                      <BounceButton
                        style={styles.reserveButton}
                        onPress={() => handleMerchantSelect(merchant)}
                      >
                        <Ionicons name="bookmark" size={16} color="white" />
                        <Text style={styles.reserveButtonText}>Reserve Items</Text>
                      </BounceButton>
                      
                      <TouchableOpacity style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </SlideInView>
                ))}
              </View>
            ) : (
              <EmptyState 
                type="inventory"
                customTitle="No Nearby Merchants"
                customMessage="We couldn't find any merchants in your area. Try expanding your search radius or check back later."
                onAction={loadNearbyMerchants}
                actionText="Refresh"
              />
            )}
          </FadeInView>
        )}

        {activeTab === 'pickup' && (
          <FadeInView>
            {merchants && merchants.length > 0 ? (
              <View style={styles.windowsList}>
                {merchants.flatMap(merchant => 
                  (merchant.pickupWindows || []).map((window, index) => (
                    <SlideInView key={window.id} delay={index * 100} style={styles.windowItem}>
                      <View style={styles.windowHeader}>
                        <Text style={styles.windowTime}>
                          Today, {window.timeSlot.start} - {window.timeSlot.end}
                        </Text>
                        <StatusChip 
                          status={window.status} 
                          size="small"
                          customText={window.available > 0 ? `${window.available} spots` : 'Full'}
                        />
                      </View>
                      
                      <Text style={styles.windowLocation}>{merchant.name}</Text>
                      
                      <BounceButton
                        style={[styles.bookButton, window.status === 'full' && styles.bookButtonDisabled]}
                        disabled={window.status === 'full'}
                        onPress={() => handleMerchantSelect(merchant)}
                      >
                        <Text style={[styles.bookButtonText, window.status === 'full' && styles.bookButtonTextDisabled]}>
                          {window.status === 'full' ? 'Fully Booked' : 'Book Window'}
                        </Text>
                      </BounceButton>
                    </SlideInView>
                  ))
                )}
              </View>
            ) : (
              <EmptyState 
                type="pickup_windows"
                onAction={loadNearbyMerchants}
              />
            )}
          </FadeInView>
        )}

        {activeTab === 'reservations' && (
          <FadeInView>
            {reservations && reservations.length > 0 ? (
              <View style={styles.reservationsList}>
                {reservations.map((reservation, index) => (
                  <SlideInView key={reservation.id} delay={index * 100} style={styles.reservationItem}>
                    <View style={styles.reservationHeader}>
                      <Text style={styles.reservationId}>#{reservation.id}</Text>
                      <StatusChip status={reservation.status} size="small" />
                    </View>
                    
                    <Text style={styles.reservationMerchant}>{reservation.merchantName}</Text>
                    
                    {reservation.pickupCode && (
                      <View style={styles.pickupCodeContainer}>
                        <Text style={styles.pickupCodeLabel}>Pickup Code:</Text>
                        <Text style={styles.pickupCode}>{reservation.pickupCode}</Text>
                      </View>
                    )}
                    
                    {reservation.scheduledFor && (
                      <Text style={styles.reservationTime}>
                        📅 {new Date(reservation.scheduledFor).toLocaleDateString()} at{' '}
                        {new Date(reservation.scheduledFor).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Text>
                    )}
                    
                    <Text style={styles.reservationItems}>
                      {reservation.items.length} items • Total: KES {reservation.total.toLocaleString()}
                    </Text>
                    
                    <View style={styles.reservationActions}>
                      <BounceButton
                        style={styles.detailsButton}
                        onPress={() => router.push(`/nearby/reserve/${reservation.id}`)}
                      >
                        <Text style={styles.detailsButtonText}>View Details</Text>
                      </BounceButton>
                      
                      {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                        <TouchableOpacity 
                          style={styles.modifyButton}
                          onPress={() => handleReservationAction(reservation.id, 'extend')}
                        >
                          <Text style={styles.modifyButtonText}>Extend Hold</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </SlideInView>
                ))}
              </View>
            ) : (
              <NoReservations onRefresh={loadMyReservations} />
            )}
          </FadeInView>
        )}
      </ScrollView>

      {/* Reservation Modal */}
      <Modal
        visible={reservationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReservationModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setReservationModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedMerchant?.name}
            </Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          {selectedMerchant && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Select items and pickup window for your reservation
              </Text>
              
              {/* Demo reservation form - replace with actual implementation */}
              <View style={styles.demoReservationForm}>
                <Text style={styles.formSectionTitle}>Available Pickup Windows</Text>
                {selectedMerchant.pickupWindows.map(window => (
                  <TouchableOpacity
                    key={window.id}
                    style={[styles.windowOptionItem, window.status === 'full' && styles.windowOptionDisabled]}
                    disabled={window.status === 'full'}
                    onPress={() => {
                      const demoItems: ReservationItem[] = [
                        { sku: 'DEMO-001', name: 'Demo Product', qty: 1, price: 1000 }
                      ];
                      handleReservationCreate(demoItems, window);
                    }}
                  >
                    <Text style={styles.windowOptionTime}>
                      {window.timeSlot.start} - {window.timeSlot.end}
                    </Text>
                    <StatusChip 
                      status={window.status} 
                      size="small"
                      customText={window.available > 0 ? `${window.available} spots` : 'Full'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  
  // Search & Filter
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#667eea',
    marginRight: 8,
    gap: 4,
  },
  filterPillActive: {
    backgroundColor: '#667eea',
  },
  filterPillText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: 'white',
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
  
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Location Card
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
  
  // Merchants
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
  merchantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  averagePrice: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
    gap: 4,
  },
  reserveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  
  // Pickup Windows
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
  
  // Reservations
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
  reservationMerchant: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 8,
  },
  pickupCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  pickupCodeLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  pickupCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
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
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalPlaceholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  demoReservationForm: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  windowOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  windowOptionDisabled: {
    opacity: 0.5,
  },
  windowOptionTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
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