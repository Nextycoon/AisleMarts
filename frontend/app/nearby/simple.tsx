import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SimpleNearbyCommerceScreen() {
  const [activeTab, setActiveTab] = useState('discover');
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setMerchants([
        {
          id: '1',
          name: 'TechHub Westlands',
          category: 'Electronics & Technology',
          distance: 0.5,
          status: 'open'
        },
        {
          id: '2', 
          name: 'SuperMart Westlands',
          category: 'Grocery & Household',
          distance: 1.2,
          status: 'open'
        }
      ]);
      
      setReservations([
        {
          id: 'RES001',
          merchantName: 'TechHub Westlands',
          status: 'confirmed',
          total: 52000
        }
      ]);
      
      setLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
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
        {['discover', 'pickup', 'reservations'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'discover' ? 'Discover' : tab === 'pickup' ? 'Windows' : 'My Orders'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'discover' && (
          <View>
            {/* Location Card */}
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={24} color="#667eea" />
                <Text style={styles.locationTitle}>Current Location</Text>
              </View>
              <Text style={styles.locationText}>📍 Westlands, Nairobi, Kenya</Text>
              <Text style={styles.locationSubtext}>
                {merchants?.length || 0} nearby merchants
              </Text>
            </View>

            {/* Merchants List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Finding nearby merchants...</Text>
              </View>
            ) : (
              <View style={styles.merchantList}>
                {merchants && merchants.map((merchant, index) => (
                  <View key={merchant.id} style={styles.merchantItem}>
                    <View style={styles.merchantHeader}>
                      <Text style={styles.merchantName}>{merchant.name}</Text>
                      <View style={styles.distanceBadge}>
                        <Text style={styles.distanceText}>{merchant.distance} km</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.merchantCategory}>{merchant.category}</Text>
                    
                    <View style={styles.merchantActions}>
                      <TouchableOpacity style={styles.reserveButton}>
                        <Ionicons name="bookmark" size={16} color="white" />
                        <Text style={styles.reserveButtonText}>Reserve Items</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'pickup' && (
          <View>
            <Text style={styles.sectionTitle}>Available Pickup Windows</Text>
            <View style={styles.windowsList}>
              <View style={styles.windowItem}>
                <Text style={styles.windowTime}>Today, 2:00 PM - 3:00 PM</Text>
                <Text style={styles.windowLocation}>TechHub Westlands</Text>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book Window</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'reservations' && (
          <View>
            <Text style={styles.sectionTitle}>My Reservations</Text>
            {reservations && reservations.length > 0 ? (
              <View style={styles.reservationsList}>
                {reservations.map((reservation, index) => (
                  <View key={reservation.id} style={styles.reservationItem}>
                    <Text style={styles.reservationId}>#{reservation.id}</Text>
                    <Text style={styles.reservationMerchant}>{reservation.merchantName}</Text>
                    <Text style={styles.reservationItems}>
                      Total: KES {reservation.total.toLocaleString()}
                    </Text>
                    <TouchableOpacity style={styles.detailsButton}>
                      <Text style={styles.detailsButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyStateText}>No reservations found</Text>
            )}
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
  locationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
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
  merchantList: {
    gap: 16,
  },
  merchantItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  windowsList: {
    gap: 16,
  },
  windowItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  windowTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  bookButtonText: {
    color: 'white',
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
  },
  reservationId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  reservationMerchant: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 8,
  },
  reservationItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  detailsButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    paddingVertical: 32,
  },
});