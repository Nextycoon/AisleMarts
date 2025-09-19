import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CallsAPI } from '../../lib/api';
import { isFeatureEnabled } from '../../lib/featureFlags';

const { width } = Dimensions.get('window');

interface Call {
  id: string;
  call_id: string;
  caller_id: string;
  callee_id: string;
  mode: 'voice' | 'video';
  status: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
}

export default function CallsScreen() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<any>(null);

  useEffect(() => {
    if (!isFeatureEnabled('CALLS')) {
      router.back();
      return;
    }
    
    loadCalls();
    checkActiveCall();
  }, []);

  const loadCalls = async () => {
    try {
      const callHistory = await CallsAPI.getHistory();
      setCalls(callHistory || []);
    } catch (error) {
      console.error('Failed to load calls:', error);
      Alert.alert('Error', 'Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const checkActiveCall = async () => {
    try {
      const active = await CallsAPI.getActive();
      if (active?.active_calls && Object.keys(active.active_calls).length > 0) {
        setActiveCall(Object.values(active.active_calls)[0]);
      }
    } catch (error) {
      console.error('Failed to check active calls:', error);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'No answer';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffInDays < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getCallIcon = (call: Call) => {
    if (call.status === 'ended' && !call.duration_seconds) return 'call-outline'; // missed
    if (call.mode === 'video') return 'videocam';
    return 'call';
  };

  const getCallColor = (call: Call) => {
    if (call.status === 'ended' && !call.duration_seconds) return '#DC143C'; // missed
    if (call.mode === 'video') return '#D4AF37'; // video
    return '#4169E1'; // voice
  };

  const handleCallPress = (call: Call) => {
    if (call.status === 'connected') {
      router.push(`/calls/${call.call_id}`);
    } else {
      // Show call details or initiate new call
      Alert.alert(
        'Call Details',
        `${call.mode === 'video' ? 'Video' : 'Voice'} call\nDuration: ${formatDuration(call.duration_seconds)}\nStatus: ${call.status}`,
        [
          { text: 'OK', style: 'default' },
          { text: 'Call Again', onPress: () => initiateNewCall(call) }
        ]
      );
    }
  };

  const initiateNewCall = (originalCall: Call) => {
    // This would initiate a new call to the same person
    Alert.alert('Feature Coming Soon', 'Call initiation will be implemented with contact integration');
  };

  const renderCall = ({ item }: { item: Call }) => (
    <TouchableOpacity
      style={styles.callItem}
      onPress={() => handleCallPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.callContent}>
        <View style={[styles.callIcon, { backgroundColor: `${getCallColor(item)}20` }]}>
          <Ionicons 
            name={getCallIcon(item)} 
            size={24} 
            color={getCallColor(item)} 
          />
        </View>
        
        <View style={styles.callInfo}>
          <View style={styles.callHeader}>
            <Text style={styles.callTitle}>
              {item.mode === 'video' ? 'Video Call' : 'Voice Call'}
            </Text>
            <Text style={styles.callTime}>
              {formatTime(item.started_at)}
            </Text>
          </View>
          
          <View style={styles.callDetails}>
            <Text style={styles.callDuration}>
              {formatDuration(item.duration_seconds)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getCallColor(item) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call" size={20} color="#D4AF37" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading calls...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Calls</Text>
        
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      {/* Active Call Banner */}
      {activeCall && (
        <TouchableOpacity
          style={styles.activeCallBanner}
          onPress={() => router.push(`/calls/${activeCall.call_id}`)}
        >
          <View style={styles.activeCallIndicator}>
            <View style={styles.pulsingDot} />
            <Text style={styles.activeCallText}>Active Call - Tap to return</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
        </TouchableOpacity>
      )}

      {/* Calls List */}
      <FlatList
        data={calls}
        renderItem={renderCall}
        keyExtractor={(item) => item.call_id}
        style={styles.callsList}
        contentContainerStyle={calls.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="call-outline" size={64} color="#666" />
            <Text style={styles.emptyTitle}>No calls yet</Text>
            <Text style={styles.emptySubtitle}>Your call history will appear here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  activeCallBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  activeCallIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D4AF37',
    marginRight: 8,
    // Animation would be added with Animated API
  },
  activeCallText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  callsList: {
    flex: 1,
  },
  callItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  callContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  callInfo: {
    flex: 1,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  callTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  callTime: {
    color: '#999',
    fontSize: 12,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  callDuration: {
    color: '#999',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  callButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});