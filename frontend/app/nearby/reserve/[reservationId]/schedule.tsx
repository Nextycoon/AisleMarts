/**
 * Phase 3 Week 3: Pickup Window Scheduling Screen
 * Select pickup time slot for reservation
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { 
  getPickupWindows, 
  scheduleReservation, 
  getReservationStatus,
  formatTimeSlot,
  formatPickupDate,
  getAvailableCapacity,
  isWindowAvailable,
  getTimeUntilExpiry 
} from '../../../../src/lib/api/pickup';
import { PickupWindow, Reservation } from '../../../../src/lib/types/pickup';
import useNotifications from '../../../src/hooks/useNotifications';

export default function SchedulePickupScreen() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const router = useRouter();
  const { showPickupNotification } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [windows, setWindows] = useState<PickupWindow[]>([]);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<PickupWindow | null>(null);

  useEffect(() => {
    loadData();
  }, [reservationId]);

  const loadData = async () => {
    if (!reservationId) return;

    try {
      setLoading(true);
      
      // Get reservation details first
      const reservationData = await getReservationStatus(reservationId);
      setReservation(reservationData);

      // Get available pickup windows for tomorrow (assuming today is too late)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];

      // Use first item's location for windows (assuming all items same location)
      const locationId = reservationData.items[0]?.location_id;
      if (locationId) {
        const windowsData = await getPickupWindows(locationId, dateString);
        setWindows(windowsData.windows);
      }

    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert(
        'Loading Error',
        'Failed to load pickup windows. Please try again.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReservation = async (window: PickupWindow) => {
    if (!reservationId || scheduling) return;

    try {
      setScheduling(true);
      setSelectedWindow(window);

      const result = await scheduleReservation(reservationId, window.id);
      
      // Show notification for successful scheduling
      showPickupNotification('scheduled', {
        timeSlot: formatTimeSlot(result.scheduled_slot.time_slot),
        pickupCode: result.confirmation_code
      });

      // Navigate to details after brief delay
      setTimeout(() => {
        router.replace(`/nearby/reserve/${reservationId}/details`);
      }, 1500);

    } catch (error: any) {
      console.error('Scheduling failed:', error);
      Alert.alert(
        'Scheduling Failed',
        error.message || 'Unable to schedule pickup. Please try another slot.',
        [{ text: 'OK' }]
      );
    } finally {
      setScheduling(false);
      setSelectedWindow(null);
    }
  };

  const renderPickupWindow = ({ item: window }: { item: PickupWindow }) => {
    const availableCapacity = getAvailableCapacity(window);
    const isAvailable = isWindowAvailable(window);
    const isSelected = selectedWindow?.id === window.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.windowItem,
          !isAvailable && styles.windowItemUnavailable,
          isSelected && styles.windowItemSelected
        ]}
        disabled={!isAvailable || scheduling}
        onPress={() => handleScheduleReservation(window)}
      >
        <View style={styles.windowHeader}>
          <Text style={[
            styles.windowTime,
            !isAvailable && styles.windowTimeUnavailable
          ]}>
            {formatTimeSlot(window.time_slot)}
          </Text>
          <Text style={[
            styles.windowDate,
            !isAvailable && styles.windowDateUnavailable
          ]}>
            {formatPickupDate(window.date)}
          </Text>
        </View>

        <View style={styles.windowFooter}>
          <Text style={[
            styles.windowCapacity,
            !isAvailable && styles.windowCapacityUnavailable
          ]}>
            {availableCapacity} of {window.capacity} spots available
          </Text>
          
          {window.status !== 'active' && (
            <Text style={styles.windowStatus}>• Closed</Text>
          )}
        </View>

        {isSelected && scheduling && (
          <View style={styles.schedulingOverlay}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.schedulingText}>Scheduling...</Text>
          </View>
        )}

        {isAvailable && (
          <View style={styles.availableIndicator}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Pickup Windows Available</Text>
      <Text style={styles.emptyMessage}>
        There are no available pickup slots for tomorrow. Please try again later or contact the store.
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={loadData}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading pickup windows...</Text>
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
        <Text style={styles.headerTitle}>Schedule Pickup</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Reservation Info */}
      {reservation && (
        <View style={styles.reservationInfo}>
          <Text style={styles.reservationTitle}>Reservation {reservation.reference}</Text>
          <Text style={styles.reservationExpiry}>
            {getTimeUntilExpiry(reservation.hold_expires_at || '')}
          </Text>
          <Text style={styles.reservationNote}>
            Choose a pickup window. Slots show remaining capacity in real time. 
            You can extend your hold once if needed.
          </Text>
        </View>
      )}

      {/* Pickup Windows List */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Available Pickup Windows</Text>
        
        {windows.length > 0 ? (
          <FlatList
            data={windows}
            renderItem={renderPickupWindow}
            keyExtractor={(window) => window.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.windowsList}
          />
        ) : (
          renderEmptyState()
        )}
      </View>

      {/* Policy Info */}
      <View style={styles.policyContainer}>
        <Text style={styles.policyTitle}>Pickup Policy</Text>
        <Text style={styles.policyText}>
          • Arrive within your selected window{'\n'}
          • Bring your confirmation code{'\n'}  
          • You may extend your hold once{'\n'}
          • Uncollected reservations auto-release at expiry
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
  reservationInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reservationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reservationExpiry: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
    marginBottom: 8,
  },
  reservationNote: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  windowsList: {
    paddingBottom: 16,
  },
  windowItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  windowItemUnavailable: {
    backgroundColor: '#f8f8f8',
    borderColor: '#ddd',
  },
  windowItemSelected: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  windowTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  windowTimeUnavailable: {
    color: '#999',
  },
  windowDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  windowDateUnavailable: {
    color: '#999',
  },
  windowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windowCapacity: {
    fontSize: 14,
    color: '#666',
  },
  windowCapacityUnavailable: {
    color: '#999',
  },
  windowStatus: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  schedulingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  schedulingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  availableIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  policyContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  policyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});