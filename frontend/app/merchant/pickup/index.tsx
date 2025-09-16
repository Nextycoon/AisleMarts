/**
 * Phase 3 Week 3: Merchant Staff Pickup View
 * Staff interface for managing pickup windows and processing customer pickups
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
  TextInput,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  getPickupWindows,
  getReservationStatus,
  processPartialPickup,
  createPickupWindows,
  getWindowAnalytics,
  formatTimeSlot,
  formatPickupDate,
  getAvailableCapacity
} from '../../../src/lib/api/pickup';
import { PickupWindow } from '../../../src/lib/types/pickup';
import StatusChip from '../../../src/components/StatusChip';
import { NoPickupWindows } from '../../../src/components/EmptyStates';
import { PickupWindowSkeleton, FadeInView } from '../../../src/components/Animations';
import useHaptics from '../../../src/hooks/useHaptics';
import { getAccessibleButtonProps, getAccessibleInputProps, SCREEN_READER_LABELS } from '../../../src/utils/accessibility';

export default function MerchantPickupScreen() {
  const [locationId, setLocationId] = useState('LOC-WESTLANDS-001'); // Default for demo
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Today
  const [windows, setWindows] = useState<PickupWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickupCode, setPickupCode] = useState('');
  const [processingCode, setProcessingCode] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Polish enhancements
  const { onPickupCompleted, onScanSuccess, onScanError, onButtonPress } = useHaptics();

  useEffect(() => {
    if (locationId && date) {
      loadPickupWindows();
    }
  }, [locationId, date]);

  const loadPickupWindows = async () => {
    try {
      setLoading(true);
      const windowsData = await getPickupWindows(locationId, date);
      setWindows(windowsData.windows);

      // Load analytics for the same period
      try {
        const analyticsData = await getWindowAnalytics(locationId, date, date);
        setAnalytics(analyticsData);
      } catch (analyticsError) {
        // Analytics might fail due to auth, but windows should still work
        console.log('Analytics unavailable:', analyticsError);
      }

    } catch (error: any) {
      console.error('Failed to load pickup windows:', error);
      Alert.alert('Loading Error', 'Failed to load pickup windows. Please check location ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const createTodaysWindows = async () => {
    Alert.alert(
      'Create Pickup Windows',
      'Create standard pickup windows for today?\n\n• 09:00-10:00 (8 slots)\n• 14:00-15:00 (8 slots)\n• 17:00-18:00 (8 slots)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Windows',
          onPress: async () => {
            try {
              const windowData = {
                location_id: locationId,
                date: date,
                time_slots: [
                  { start_time: '09:00', end_time: '10:00' },
                  { start_time: '14:00', end_time: '15:00' },
                  { start_time: '17:00', end_time: '18:00' }
                ],
                capacity_per_slot: 8,
                notes: 'Standard pickup windows created by staff'
              };

              await createPickupWindows(windowData);
              Alert.alert('Success', 'Pickup windows created successfully!');
              await loadPickupWindows();

            } catch (error: any) {
              Alert.alert('Creation Failed', error.message || 'Failed to create pickup windows.');
            }
          }
        }
      ]
    );
  };

  const processPickupByCode = async () => {
    if (!pickupCode.trim()) {
      Alert.alert('Missing Code', 'Please enter a pickup code or reservation ID.');
      return;
    }

    try {
      setProcessingCode(true);
      
      // Try to get reservation by code/ID
      const reservation = await getReservationStatus(pickupCode.trim());
      
      // Success haptic feedback
      onScanSuccess();
      
      Alert.alert(
        'Reservation Found',
        `Status: ${reservation.status}\nReference: ${reservation.reference}\nItems: ${reservation.items.length}\n\nProcess pickup?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Process Pickup',
            onPress: async () => {
              try {
                // Demo: Mark all items as picked up
                const partialItems = reservation.items.map(item => ({
                  sku: item.sku,
                  requested_qty: item.qty,
                  picked_up_qty: item.qty, // Full pickup
                  reason_for_shortage: undefined
                }));

                const result = await processPartialPickup(
                  reservation.reservation_id,
                  partialItems,
                  'Processed by merchant staff',
                  'complete'
                );

                // Pickup completed haptic feedback
                onPickupCompleted();

                Alert.alert(
                  'Pickup Completed ✅',
                  `All items have been picked up successfully.\n\nStatus: ${result.pickup_status}`,
                  [{ text: 'OK' }]
                );

                setPickupCode('');
                await loadPickupWindows(); // Refresh to update window capacity

              } catch (pickupError: any) {
                Alert.alert('Pickup Processing Failed', pickupError.message || 'Failed to process pickup.');
              }
            }
          }
        ]
      );

    } catch (error: any) {
      // Error haptic feedback
      onScanError();
      
      Alert.alert(
        'Code Not Found',
        'Invalid pickup code or reservation not found. Please check the code and try again.'
      );
    } finally {
      setProcessingCode(false);
    }
  };

  const renderPickupWindow = ({ item: window }: { item: PickupWindow }) => {
    const availableCapacity = getAvailableCapacity(window);
    const utilizationPercent = ((window.reserved / window.capacity) * 100) || 0;

    return (
      <FadeInView style={styles.windowItem}>
        <View style={styles.windowHeader}>
          <Text style={styles.windowTime}>
            {formatTimeSlot(window.time_slot)}
          </Text>
          <StatusChip 
            status={window.status} 
            size="small"
            {...getAccessibleButtonProps(
              SCREEN_READER_LABELS.statusChip(window.status),
              'view_status',
              false
            )}
          />
        </View>

        <View style={styles.windowStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{window.reserved}</Text>
            <Text style={styles.statLabel}>Reserved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{availableCapacity}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{window.capacity}</Text>
            <Text style={styles.statLabel}>Total Capacity</Text>
          </View>
        </View>

        <View style={styles.utilizationBar}>
          <View 
            style={[
              styles.utilizationFill,
              { 
                width: `${utilizationPercent}%`,
                backgroundColor: utilizationPercent > 80 ? '#FF3B30' : utilizationPercent > 60 ? '#FF9500' : '#34C759'
              }
            ]} 
          />
        </View>
        <Text style={styles.utilizationText}>
          {utilizationPercent.toFixed(0)}% utilized
        </Text>

        {window.notes && (
          <Text style={styles.windowNotes}>📝 {window.notes}</Text>
        )}
      </FadeInView>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Today's Analytics</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.total_windows_created}</Text>
            <Text style={styles.analyticsLabel}>Windows</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.total_capacity_offered}</Text>
            <Text style={styles.analyticsLabel}>Total Slots</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.total_reservations_made}</Text>
            <Text style={styles.analyticsLabel}>Reserved</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.utilization_rate.toFixed(0)}%</Text>
            <Text style={styles.analyticsLabel}>Utilization</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Pickup Windows</Text>
      <Text style={styles.emptyMessage}>
        No pickup windows found for this date and location.
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={createTodaysWindows}>
        <Ionicons name="add-circle" size={20} color="white" />
        <Text style={styles.createButtonText}>Create Standard Windows</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pickup Management</Text>
          <TouchableOpacity onPress={loadPickupWindows}>
            <Ionicons name="refresh" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controlsCard}>
          <Text style={styles.controlsTitle}>Location & Date</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location ID</Text>
              <TextInput
                style={styles.textInput}
                value={locationId}
                onChangeText={setLocationId}
                placeholder="LOC-WESTLANDS-001"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.textInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.loadButton} 
            onPress={loadPickupWindows}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="download" size={16} color="white" />
                <Text style={styles.loadButtonText}>Load Windows</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Pickup Code Processing */}
        <View style={styles.pickupCard}>
          <Text style={styles.pickupTitle}>Process Pickup</Text>
          
          <View style={styles.codeInputRow}>
            <TextInput
              style={styles.codeInput}
              value={pickupCode}
              onChangeText={setPickupCode}
              placeholder="Enter pickup code or reservation ID"
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={processPickupByCode}
            />
            <TouchableOpacity 
              style={styles.processButton}
              onPress={processPickupByCode}
              disabled={processingCode || !pickupCode.trim()}
            >
              {processingCode ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.processButtonText}>Process</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Analytics */}
        {renderAnalytics()}

        {/* Pickup Windows List */}
        <View style={styles.windowsContainer}>
          <View style={styles.windowsHeader}>
            <Text style={styles.windowsTitle}>Pickup Windows</Text>
            {windows.length > 0 && (
              <TouchableOpacity style={styles.createSmallButton} onPress={createTodaysWindows}>
                <Ionicons name="add" size={16} color="#007AFF" />
                <Text style={styles.createSmallButtonText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading pickup windows...</Text>
            </View>
          ) : windows.length > 0 ? (
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
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  controlsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  loadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  loadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pickupCard: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  codeInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  processButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  analyticsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsItem: {
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  windowsContainer: {
    flex: 1,
    padding: 16,
  },
  windowsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  windowsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  createSmallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 4,
  },
  createSmallButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
  },
  windowsList: {
    paddingBottom: 16,
  },
  windowItem: {
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
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  windowTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  windowStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  utilizationBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 6,
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 3,
  },
  utilizationText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  windowNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});