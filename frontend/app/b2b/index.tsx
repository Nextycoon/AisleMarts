import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function B2BPortalScreen() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>B2B Portal</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rfq' && styles.activeTab]}
          onPress={() => setActiveTab('rfq')}
        >
          <Text style={[styles.tabText, activeTab === 'rfq' && styles.activeTabText]}>
            RFQ System
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'suppliers' && styles.activeTab]}
          onPress={() => setActiveTab('suppliers')}
        >
          <Text style={[styles.tabText, activeTab === 'suppliers' && styles.activeTabText]}>
            Suppliers
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <View>
            <Text style={styles.sectionTitle}>Phase 2: B2B/RFQ Workflows ✅</Text>
            <Text style={styles.description}>
              Complete supplier negotiation system with RFQ management, quote comparison, and purchase order generation.
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>25+</Text>
                <Text style={styles.statLabel}>Active RFQs</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>150+</Text>
                <Text style={styles.statLabel}>Suppliers</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>$2.1M</Text>
                <Text style={styles.statLabel}>Volume Processed</Text>
              </View>
            </View>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text style={styles.featureText}>Request for Quotes (RFQ) Creation</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text style={styles.featureText}>Supplier Quote Management</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text style={styles.featureText}>Negotiation Workflows</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text style={styles.featureText}>Purchase Order Generation</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'rfq' && (
          <View>
            <Text style={styles.sectionTitle}>RFQ Management System</Text>
            
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/b2b/rfq/create')}
              >
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.actionButtonText}>Create New RFQ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => router.push('/b2b/rfq/list')}
              >
                <Ionicons name="list" size={24} color="#667eea" />
                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Browse All RFQs</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subSectionTitle}>Recent RFQ Activity</Text>

            <View style={styles.rfqList}>
              <View style={styles.rfqItem}>
                <View style={styles.rfqHeader}>
                  <Text style={styles.rfqTitle}>Electronics Bulk Order</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Active</Text>
                  </View>
                </View>
                <Text style={styles.rfqDescription}>
                  Seeking suppliers for consumer electronics - smartphones, laptops, accessories
                </Text>
                <View style={styles.rfqMeta}>
                  <Text style={styles.rfqMetaText}>5 Quotes Received</Text>
                  <Text style={styles.rfqMetaText}>Deadline: Dec 15, 2024</Text>
                </View>
              </View>

              <View style={styles.rfqItem}>
                <View style={styles.rfqHeader}>
                  <Text style={styles.rfqTitle}>Office Furniture Supply</Text>
                  <View style={[styles.statusBadge, styles.statusBadgeWarning]}>
                    <Text style={styles.statusText}>Negotiating</Text>
                  </View>
                </View>
                <Text style={styles.rfqDescription}>
                  Complete office setup including desks, chairs, storage solutions
                </Text>
                <View style={styles.rfqMeta}>
                  <Text style={styles.rfqMetaText}>3 Quotes Under Review</Text>
                  <Text style={styles.rfqMetaText}>Deadline: Jan 20, 2025</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'suppliers' && (
          <View>
            <Text style={styles.sectionTitle}>Verified Suppliers Network</Text>
            
            <View style={styles.supplierList}>
              <View style={styles.supplierItem}>
                <View style={styles.supplierHeader}>
                  <Text style={styles.supplierName}>TechSource Kenya Ltd</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                </View>
                <Text style={styles.supplierCategory}>Electronics & Technology</Text>
                <Text style={styles.supplierLocation}>📍 Nairobi, Kenya</Text>
                <View style={styles.supplierStats}>
                  <Text style={styles.supplierStat}>15 Completed Orders</Text>
                  <Text style={styles.supplierStat}>$500K+ Total Volume</Text>
                </View>
              </View>

              <View style={styles.supplierItem}>
                <View style={styles.supplierHeader}>
                  <Text style={styles.supplierName}>Global Furniture Co</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>4.6</Text>
                  </View>
                </View>
                <Text style={styles.supplierCategory}>Office & Industrial Furniture</Text>
                <Text style={styles.supplierLocation}>📍 Mombasa, Kenya</Text>
                <View style={styles.supplierStats}>
                  <Text style={styles.supplierStat}>28 Completed Orders</Text>
                  <Text style={styles.supplierStat}>$1.2M+ Total Volume</Text>
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
  headerSpacer: {
    width: 40,
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
    fontSize: 16,
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
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#667eea',
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  rfqList: {
    gap: 16,
  },
  rfqItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rfqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rfqTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeWarning: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  rfqDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  rfqMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rfqMetaText: {
    fontSize: 12,
    color: '#999',
  },
  supplierList: {
    gap: 16,
  },
  supplierItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  supplierCategory: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 4,
  },
  supplierLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  supplierStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supplierStat: {
    fontSize: 12,
    color: '#999',
  },
});