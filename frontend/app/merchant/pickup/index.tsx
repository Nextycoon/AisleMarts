/**
 * Phase 3 Week 3: Merchant Staff Pickup View
 * Staff interface for managing pickup windows and processing customer pickups
 * POLISH PASS: Enhanced with glass-morphism, haptics, animations, and status chips
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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';
import { StatusChip } from '@/src/components/StatusChip';
import { EmptyStates } from '@/src/components/EmptyStates';
import { useHaptics } from '@/src/hooks/useHaptics';

// Define basic types for now
interface PickupWindow {
  id: string;
  time_slot: {
    start_time: string;
    end_time: string;
  };
  capacity: number;
  reserved: number;
  status: 'active' | 'full' | 'closed';
  notes?: string;
}

export default function MerchantPickupScreen() {
  const [locationId, setLocationId] = useState('LOC-WESTLANDS-001'); // Default for demo
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Today
  const [windows, setWindows] = useState<PickupWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickupCode, setPickupCode] = useState('');
  const [processingCode, setProcessingCode] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const { triggerHaptic, onButtonPress, onFormSubmit } = useHaptics();

  useEffect(() => {
    if (locationId && date) {
      loadPickupWindows();
    }
  }, [locationId, date]);

  const loadPickupWindows = async () => {
    try {
      setLoading(true);
      triggerHaptic('selection'); // Haptic feedback on load
      
      // Demo data for now - replace with API call later
      const demoWindows: PickupWindow[] = [
        {
          id: '1',
          time_slot: { start_time: '09:00', end_time: '10:00' },
          capacity: 8,
          reserved: 5,
          status: 'active',
          notes: 'Morning pickup window'
        },
        {
          id: '2', 
          time_slot: { start_time: '14:00', end_time: '15:00' },
          capacity: 8,
          reserved: 8,
          status: 'full'
        },
        {
          id: '3',
          time_slot: { start_time: '17:00', end_time: '18:00' },
          capacity: 8,
          reserved: 2,
          status: 'active',
          notes: 'Evening pickup window'
        }
      ];
      
      setWindows(demoWindows);
      
      // Demo analytics
      setAnalytics({
        total_windows_created: 3,
        total_capacity_offered: 24,
        total_reservations_made: 15,
        utilization_rate: 62.5
      });

    } catch (error: any) {
      console.error('Failed to load pickup windows:', error);
      triggerHaptic('error');
      Alert.alert('Loading Error', 'Failed to load pickup windows. Please check location ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const createTodaysWindows = async () => {
    onButtonPress();
    Alert.alert(
      'Create Pickup Windows',
      'Create standard pickup windows for today?\n\n• 09:00-10:00 (8 slots)\n• 14:00-15:00 (8 slots)\n• 17:00-18:00 (8 slots)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Windows',
          onPress: async () => {
            try {
              triggerHaptic('success');
              Alert.alert('Success', 'Pickup windows created successfully!');
              await loadPickupWindows();

            } catch (error: any) {
              triggerHaptic('error');
              Alert.alert('Creation Failed', error.message || 'Failed to create pickup windows.');
            }
          }
        }
      ]
    );
  };

  const processPickupByCode = async () => {
    if (!pickupCode.trim()) {
      triggerHaptic('warning');
      Alert.alert('Missing Code', 'Please enter a pickup code or reservation ID.');
      return;
    }

    try {
      setProcessingCode(true);
      onFormSubmit();
      
      // Demo: simulate finding a reservation
      const demoReservation = {
        reservation_id: pickupCode.trim(),
        status: 'confirmed',
        reference: 'REF-' + pickupCode,
        items: [
          { sku: 'DEMO-001', qty: 2, name: 'Demo Product 1' },
          { sku: 'DEMO-002', qty: 1, name: 'Demo Product 2' }
        ]
      };
      
      Alert.alert(
        'Reservation Found',
        `Status: ${demoReservation.status}\nReference: ${demoReservation.reference}\nItems: ${demoReservation.items.length}\n\nProcess pickup?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Process Pickup',
            onPress: async () => {
              try {
                triggerHaptic('success');
                Alert.alert(
                  'Pickup Completed ✅',
                  `All items have been picked up successfully.\n\nStatus: completed`,
                  [{ text: 'OK' }]
                );

                setPickupCode('');
                await loadPickupWindows(); // Refresh to update window capacity

              } catch (pickupError: any) {
                triggerHaptic('error');
                Alert.alert('Pickup Processing Failed', pickupError.message || 'Failed to process pickup.');
              }
            }
          }
        ]
      );

    } catch (error: any) {
      triggerHaptic('error');
      Alert.alert(
        'Code Not Found',
        'Invalid pickup code or reservation not found. Please check the code and try again.'
      );
    } finally {
      setProcessingCode(false);
    }
  };

  const renderPickupWindow = ({ item: window, index }: { item: PickupWindow; index: number }) => {
    const availableCapacity = window.capacity - window.reserved;
    const utilizationPercent = ((window.reserved / window.capacity) * 100) || 0;

    const formatTimeSlot = (timeSlot: { start_time: string; end_time: string }) => {
      return `${timeSlot.start_time} - ${timeSlot.end_time}`;
    };

    return (
      <Animated.View entering={SlideInRight.delay(index * 100)}>
        <BlurView intensity={20} style={styles.windowItem}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.windowGradient}
          >
            <View style={styles.windowHeader}>
              <Text style={styles.windowTime}>
                {formatTimeSlot(window.time_slot)}
              </Text>
              <StatusChip
                status={window.status}
                variant={window.status === 'active' ? 'success' : 
                        window.status === 'full' ? 'warning' : 'error'}
              />
            </View>

            <View style={styles.windowStats}>
              <Animated.View entering={ZoomIn.delay(index * 100 + 200)} style={styles.statItem}>
                <Text style={styles.statValue}>{window.reserved}</Text>
                <Text style={styles.statLabel}>Reserved</Text>
              </Animated.View>
              <Animated.View entering={ZoomIn.delay(index * 100 + 300)} style={styles.statItem}>
                <Text style={styles.statValue}>{availableCapacity}</Text>
                <Text style={styles.statLabel}>Available</Text>
              </Animated.View>
              <Animated.View entering={ZoomIn.delay(index * 100 + 400)} style={styles.statItem}>
                <Text style={styles.statValue}>{window.capacity}</Text>
                <Text style={styles.statLabel}>Total Capacity</Text>
              </Animated.View>
            </View>

            <View style={styles.utilizationBar}>
              <Animated.View 
                entering={SlideInRight.delay(index * 100 + 500)}
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
          </LinearGradient>
        </BlurView>
      </Animated.View>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <Animated.View entering={FadeInUp.delay(300)}>
        <BlurView intensity={25} style={styles.analyticsCard}>
          <LinearGradient
            colors={['rgba(102,126,234,0.1)', 'rgba(79,172,254,0.05)']}
            style={styles.analyticsGradient}
          >
            <Text style={styles.analyticsTitle}>Today's Analytics</Text>
            <View style={styles.analyticsGrid}>
              <Animated.View entering={ZoomIn.delay(400)} style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics.total_windows_created}</Text>
                <Text style={styles.analyticsLabel}>Windows</Text>
              </Animated.View>
              <Animated.View entering={ZoomIn.delay(500)} style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics.total_capacity_offered}</Text>
                <Text style={styles.analyticsLabel}>Total Slots</Text>
              </Animated.View>
              <Animated.View entering={ZoomIn.delay(600)} style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics.total_reservations_made}</Text>
                <Text style={styles.analyticsLabel}>Reserved</Text>
              </Animated.View>
              <Animated.View entering={ZoomIn.delay(700)} style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics.utilization_rate.toFixed(0)}%</Text>
                <Text style={styles.analyticsLabel}>Utilization</Text>
              </Animated.View>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <EmptyStates.NoWindows 
      onCreateWindows={createTodaysWindows}
      title="No Pickup Windows"
      message="No pickup windows found for this date and location."
      actionText="Create Standard Windows"
    />
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0C0F14', '#1a1a2e', '#16213e']}
          style={StyleSheet.absoluteFill}
        />
        <StatusBar style="light" />
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <BlurView intensity={30} style={styles.headerBlur}>
            <TouchableOpacity onPress={() => {
              onButtonPress();
              router.back();
            }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pickup Management</Text>
            <TouchableOpacity onPress={() => {
              onButtonPress();
              loadPickupWindows();
            }}>
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        {/* Controls */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <BlurView intensity={20} style={styles.controlsCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.controlsGradient}
            >
              <Text style={styles.controlsTitle}>Location & Date</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Location ID</Text>
                  <TextInput
                    style={styles.textInput}
                    value={locationId}
                    onChangeText={setLocationId}
                    placeholder="LOC-WESTLANDS-001"
                    placeholderTextColor="rgba(255,255,255,0.5)"
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
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.loadButton} 
                onPress={() => {
                  onButtonPress();
                  loadPickupWindows();
                }}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.loadButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="download" size={16} color="white" />
                      <Text style={styles.loadButtonText}>Load Windows</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Pickup Code Processing */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <BlurView intensity={20} style={styles.pickupCard}>
            <LinearGradient
              colors={['rgba(52,199,89,0.1)', 'rgba(52,199,89,0.05)']}
              style={styles.pickupGradient}
            >
              <Text style={styles.pickupTitle}>Process Pickup</Text>
              
              <View style={styles.codeInputRow}>
                <TextInput
                  style={styles.codeInput}
                  value={pickupCode}
                  onChangeText={setPickupCode}
                  placeholder="Enter pickup code or reservation ID"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  autoCapitalize="characters"
                  returnKeyType="done"
                  onSubmitEditing={processPickupByCode}
                />
                <TouchableOpacity 
                  style={styles.processButton}
                  onPress={processPickupByCode}
                  disabled={processingCode || !pickupCode.trim()}
                >
                  <LinearGradient
                    colors={['#34C759', '#30D158']}
                    style={styles.processButtonGradient}
                  >
                    {processingCode ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text style={styles.processButtonText}>Process</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Analytics */}
        {renderAnalytics()}

        {/* Pickup Windows List */}
        <View style={styles.windowsContainer}>
          <Animated.View entering={FadeInUp.delay(400)} style={styles.windowsHeader}>
            <Text style={styles.windowsTitle}>Pickup Windows</Text>
            {windows.length > 0 && (
              <TouchableOpacity 
                style={styles.createSmallButton} 
                onPress={() => {
                  onButtonPress();
                  createTodaysWindows();
                }}
              >
                <Ionicons name="add" size={16} color="#4facfe" />
                <Text style={styles.createSmallButtonText}>Add</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {loading ? (
            <Animated.View entering={FadeInUp.delay(500)} style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4facfe" />
              <Text style={styles.loadingText}>Loading pickup windows...</Text>
            </Animated.View>
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
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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