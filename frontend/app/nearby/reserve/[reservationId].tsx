/**
 * Phase 3: Nearby/Onsite Commerce - Reservation Status & Pickup
 * Shows reservation details, pickup code, and status tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

const API_BASE = Constants.expoConfig?.extra?.BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

interface ReservationStatus {
  reservation_id: string;
  reference: string;
  status: 'held' | 'confirmed' | 'released' | 'expired' | 'picked_up' | 'cancelled';
  items: Array<{
    sku: string;
    qty: number;
    location_id: string;
  }>;
  hold_expires_at?: string;
  pickup_code?: string;
  total_amount?: number;
  currency: string;
  created_at: string;
}

export default function ReservationScreen() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const [reservation, setReservation] = useState<ReservationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (reservationId) {
      loadReservation();
    }
  }, [reservationId]);

  const loadReservation = async () => {
    try {
      // For now, create a placeholder reservation since we need auth for real API
      const mockReservation: ReservationStatus = {
        reservation_id: reservationId || 'demo-123',
        reference: `RES-KE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        status: 'held',
        items: [
          {
            sku: 'SKU-PIXEL7-128',
            qty: 1,
            location_id: 'LOC-WESTLANDS-001'
          }
        ],
        hold_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        currency: 'KES',
        created_at: new Date().toISOString()
      };

      setReservation(mockReservation);
    } catch (error) {
      console.error('Failed to load reservation:', error);
      Alert.alert('Error', 'Failed to load reservation details');
    } finally {
      setLoading(false);
    }
  };

  const confirmReservation = async () => {
    if (!reservation) return;

    setConfirming(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const confirmedReservation: ReservationStatus = {
        ...reservation,
        status: 'confirmed',
        pickup_code: `${Math.floor(100000 + Math.random() * 900000)}` // 6-digit code
      };
      
      setReservation(confirmedReservation);
      
      Alert.alert(
        'Reservation Confirmed! ✅',
        `Your pickup code is: ${confirmedReservation.pickup_code}\n\nShow this code at the store to collect your items.`,
        [{ text: 'Got it!' }]
      );
    } catch (error) {
      console.error('Failed to confirm reservation:', error);
      Alert.alert('Error', 'Failed to confirm reservation');
    } finally {
      setConfirming(false);
    }
  };

  const cancelReservation = async () => {
    if (!reservation) return;

    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              const cancelledReservation: ReservationStatus = {
                ...reservation,
                status: 'cancelled'
              };
              
              setReservation(cancelledReservation);
              
              Alert.alert(
                'Reservation Cancelled',
                'Your reservation has been cancelled and inventory has been released.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              console.error('Failed to cancel reservation:', error);
              Alert.alert('Error', 'Failed to cancel reservation');
            }
          }
        }
      ]
    );
  };

  const sharePickupCode = async () => {
    if (!reservation?.pickup_code) return;

    try {
      await Share.share({
        message: `AisleMarts Pickup Code: ${reservation.pickup_code}\nReference: ${reservation.reference}\n\nShow this at the store to collect your items.`,
        title: 'Pickup Code'
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'held': return '#FF9500';
      case 'confirmed': return '#34C759';
      case 'picked_up': return '#007AFF';
      case 'cancelled': return '#FF3B30';
      case 'expired': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'held': return 'Items Reserved';
      case 'confirmed': return 'Ready for Pickup';
      case 'picked_up': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getRemainingTime = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const remaining = expires - now;
    
    if (remaining <= 0) return 'Expired';
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading reservation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>Reservation not found</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Reservation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
              <Text style={styles.statusText}>{getStatusText(reservation.status)}</Text>
            </View>
            <Text style={styles.referenceText}>{reservation.reference}</Text>
          </View>

          {reservation.status === 'held' && reservation.hold_expires_at && (
            <Text style={styles.expiryText}>
              ⏰ {getRemainingTime(reservation.hold_expires_at)}
            </Text>
          )}
        </View>

        {/* Pickup Code (if confirmed) */}
        {reservation.pickup_code && (
          <View style={styles.pickupCodeCard}>
            <Text style={styles.pickupCodeLabel}>Pickup Code</Text>
            <Text style={styles.pickupCode}>{reservation.pickup_code}</Text>
            <Text style={styles.pickupCodeInstructions}>
              Show this code at the store to collect your items
            </Text>
            <TouchableOpacity style={styles.shareButton} onPress={sharePickupCode}>
              <Ionicons name="share" size={16} color="#007AFF" />
              <Text style={styles.shareText}>Share Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Reserved Items</Text>
          {reservation.items.map((item, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemSku}>{item.sku}</Text>
                <Text style={styles.itemLocation}>Location: {item.location_id}</Text>
              </View>
              <Text style={styles.itemQty}>Qty: {item.qty}</Text>
            </View>
          ))}
        </View>

        {/* Location Info */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <Text style={styles.locationTitle}>Pickup Location</Text>
          </View>
          <Text style={styles.locationName}>AisleMarts Express - Westlands</Text>
          <Text style={styles.locationAddress}>Waiyaki Way, ABC Place, Nairobi</Text>
          <Text style={styles.locationHours}>Open: 8:00 AM - 8:00 PM</Text>
          
          <TouchableOpacity style={styles.mapButton}>
            <Ionicons name="map" size={16} color="#007AFF" />
            <Text style={styles.mapButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Timeline</Text>
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#34C759' }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineEventTitle}>Reservation Created</Text>
              <Text style={styles.timelineEventTime}>{formatTime(reservation.created_at)}</Text>
            </View>
          </View>

          {reservation.status === 'confirmed' && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#34C759' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineEventTitle}>Ready for Pickup</Text>
                <Text style={styles.timelineEventTime}>Pickup code generated</Text>
              </View>
            </View>
          )}

          {reservation.status === 'held' && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#8E8E93' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineEventTitle}>Awaiting Confirmation</Text>
                <Text style={styles.timelineEventTime}>Confirm to generate pickup code</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {reservation.status === 'held' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.confirmButton]} 
              onPress={confirmReservation}
              disabled={confirming}
            >
              {confirming ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Confirm Reservation</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={cancelReservation}
            >
              <Ionicons name="close-circle" size={20} color="#FF3B30" />
              <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {reservation.status === 'confirmed' && (
          <Text style={styles.confirmedText}>
            ✅ Your items are ready for pickup! Show your pickup code at the store.
          </Text>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
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
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  referenceText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  expiryText: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  pickupCodeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickupCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pickupCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
    letterSpacing: 4,
  },
  pickupCodeInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  shareText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  itemsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemSku: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  itemLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemQty: {
    fontSize: 14,
    color: '#666',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationHours: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  mapButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  timelineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineEventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timelineEventTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  confirmButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  confirmedText: {
    fontSize: 14,
    color: '#34C759',
    textAlign: 'center',
    paddingVertical: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});