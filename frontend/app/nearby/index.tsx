import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NearbyCommerceScreen() {
  const [activeTab, setActiveTab] = useState('discover');

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
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
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