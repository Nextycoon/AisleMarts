/**
 * Phase 3 Week 3: Reservation Details & Management Screen
 * View reservation status, extend hold, modify, or cancel
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  getReservationStatus,
  extendReservation,
  processPartialPickup,
  cancelReservation,
  formatTimeSlot,
  formatPickupDate,
  formatReservationStatus,
  canExtendReservation,
  getTimeUntilExpiry
} from '../../../../src/lib/api/pickup';
import { Reservation, PartialPickupItem } from '../../../../src/lib/types/pickup';
import useNotifications from '../../../../src/hooks/useNotifications';

export default function ReservationDetailsScreen() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const router = useRouter();
  const { showPickupNotification } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReservation();
  }, [reservationId]);

  const loadReservation = async (showLoading: boolean = true) => {
    if (!reservationId) return;

    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const data = await getReservationStatus(reservationId);
      setReservation(data);

    } catch (error: any) {
      console.error('Failed to load reservation:', error);
      Alert.alert(
        'Loading Error',
        'Failed to load reservation details. Please try again.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExtendReservation = async () => {
    if (!reservation || !canExtendReservation(reservation)) return;

    Alert.alert(
      'Extend Hold Time',
      'Extend your reservation by 30 minutes? You can do this once per reservation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Extend',
          onPress: async () => {
            try {
              const result = await extendReservation(reservationId!, 30, 'Customer requested extension');
              
              // Show notification instead of alert for better UX
              showPickupNotification('extended', {
                minutes: 30,
                extensionsRemaining: result.extensions_remaining
              });
              
              await loadReservation(false);
            } catch (error: any) {
              Alert.alert(
                'Extension Failed',
                error.message || 'Cannot extend hold. Policy limit may be reached.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handlePartialPickup = async () => {
    if (!reservation || reservation.items.length === 0) return;

    const firstItem = reservation.items[0];
    
    Alert.alert(
      'Partial Pickup Demo',
      `Pick up 1 unit of ${firstItem.sku}? (Demo feature)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pickup 1 Unit',
          onPress: async () => {
            try {
              const partialItems: PartialPickupItem[] = [{
                sku: firstItem.sku,
                requested_qty: firstItem.qty,
                picked_up_qty: Math.min(1, firstItem.qty),
                reason_for_shortage: firstItem.qty === 1 ? undefined : 'Partial pickup demo'
              }];

              const result = await processPartialPickup(
                reservationId!,
                partialItems,
                'Demo partial pickup',
                firstItem.qty === 1 ? 'complete' : 'partial'
              );

              // Show notification for partial pickup
              showPickupNotification('partial', {
                remainingItems: result.has_remaining_items ? 
                  result.pickup_summary.remaining_items.length : 0
              });

              await loadReservation(false);
            } catch (error: any) {
              Alert.alert(
                'Pickup Failed',
                error.message || 'Failed to process partial pickup.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleCancelReservation = async () => {
    if (!reservation) return;

    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation? This action cannot be undone.',
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Cancel Reservation',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await cancelReservation(
                reservationId!,
                'customer_request',
                'Cancelled by customer via app',
                false
              );

              // Show notification for cancellation
              showPickupNotification('cancelled', {
                reason: 'customer_request',
                refundRequested: false
              });

              // Navigate back after brief delay to allow notification to show
              setTimeout(() => router.back(), 1500);

            } catch (error: any) {
              Alert.alert(
                'Cancellation Failed',
                error.message || 'Failed to cancel reservation.',
                [{ text: 'OK' }]
              );
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
        message: `AisleMarts Pickup Code: ${reservation.pickup_code}\nReservation: ${reservation.reference}\n\nShow this code at the store to collect your items.`,
        title: 'Pickup Code'
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'held': return '#FF9500';
      case 'scheduled': 
      case 'confirmed': return '#34C759';
      case 'completed': return '#007AFF';
      case 'cancelled': return '#FF3B30';
      case 'expired': return '#8E8E93';
      case 'partial_pickup': return '#AF52DE';
      default: return '#8E8E93';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading reservation details...</Text>
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
        <Text style={styles.headerTitle}>Reservation Details</Text>
        <TouchableOpacity onPress={() => loadReservation(false)}>
          <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
              <Text style={styles.statusText}>{formatReservationStatus(reservation.status)}</Text>
            </View>
            <Text style={styles.referenceText}>{reservation.reference}</Text>
          </View>

          {reservation.hold_expires_at && (
            <Text style={styles.expiryText}>
              ⏰ {getTimeUntilExpiry(reservation.hold_expires_at)}
            </Text>
          )}
        </View>

        {/* Pickup Code (if available) */}
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

        {/* Pickup Window Info */}
        {reservation.pickup_window && (
          <View style={styles.windowCard}>
            <View style={styles.windowHeader}>
              <Ionicons name="time" size={20} color="#007AFF" />
              <Text style={styles.windowTitle}>Scheduled Pickup</Text>
            </View>
            <Text style={styles.windowTime}>
              {formatTimeSlot(reservation.pickup_window.time_slot)} • {formatPickupDate(reservation.pickup_window.date)}
            </Text>
            <Text style={styles.windowLocation}>Location: {reservation.pickup_window.location_id}</Text>
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

        {/* Extension History */}
        {reservation.extension_history && reservation.extension_history.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Extension History</Text>
            {reservation.extension_history.map((extension, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyText}>
                  Extended by {extension.extension_minutes} minutes
                </Text>
                <Text style={styles.historyTime}>
                  {new Date(extension.extended_at).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Pickup Summary (if partial pickup occurred) */}
        {reservation.pickup_summary && (
          <View style={styles.pickupSummaryCard}>
            <Text style={styles.pickupSummaryTitle}>Pickup Summary</Text>
            
            {reservation.pickup_summary.fully_picked_up.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>✅ Picked Up</Text>
                {reservation.pickup_summary.fully_picked_up.map((item: any, index: number) => (
                  <Text key={index} style={styles.summaryItem}>
                    {item.sku} - {item.picked_up_qty} units
                  </Text>
                ))}
              </View>
            )}

            {reservation.pickup_summary.remaining_items.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>📦 Still Reserved</Text>
                {reservation.pickup_summary.remaining_items.map((item: any, index: number) => (
                  <Text key={index} style={styles.summaryItem}>
                    {item.sku} - {item.qty} units
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {reservation.status === 'held' && !reservation.pickup_window_id && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.scheduleButton]} 
            onPress={() => router.push(`/nearby/reserve/${reservationId}/schedule`)}
          >
            <Ionicons name="calendar" size={20} color="white" />
            <Text style={styles.actionButtonText}>Schedule Pickup</Text>
          </TouchableOpacity>
        )}

        {(reservation.status === 'held' || reservation.status === 'scheduled') && (
          <View style={styles.buttonRow}>
            {canExtendReservation(reservation) && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.extendButton]} 
                onPress={handleExtendReservation}
              >
                <Ionicons name="time" size={20} color="#FF9500" />
                <Text style={[styles.actionButtonText, { color: '#FF9500' }]}>Extend Hold</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.actionButton, styles.partialButton]} 
              onPress={handlePartialPickup}
            >
              <Ionicons name="cube" size={20} color="#AF52DE" />
              <Text style={[styles.actionButtonText, { color: '#AF52DE' }]}>Partial Pickup</Text>
            </TouchableOpacity>
          </View>
        )}

        {['held', 'scheduled', 'confirmed'].includes(reservation.status) && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={handleCancelReservation}
          >
            <Ionicons name="close-circle" size={20} color="#FF3B30" />
            <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Cancel Reservation</Text>
          </TouchableOpacity>
        )}

        {reservation.status === 'completed' && (
          <Text style={styles.completedText}>
            ✅ Your pickup is complete! Thank you for using AisleMarts.
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
  windowCard: {
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
  windowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  windowTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  windowTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  windowLocation: {
    fontSize: 14,
    color: '#666',
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
  historyCard: {
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
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyText: {
    fontSize: 14,
    color: '#333',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  pickupSummaryCard: {
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
  pickupSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summarySection: {
    marginBottom: 12,
  },
  summarySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  summaryItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
    marginBottom: 2,
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
  scheduleButton: {
    backgroundColor: '#007AFF',
  },
  extendButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  partialButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#AF52DE',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  completedText: {
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