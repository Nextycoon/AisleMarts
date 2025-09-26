import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://marketplace-docs.preview.emergentagent.com';

interface RFQ {
  id: string;
  title: string;
  category: string;
  description: string;
  quantity: number;
  target_price?: number;
  currency: string;
  shipping_destination: string;
  status: string;
  quote_count: number;
  views: number;
  created_at: string;
  updated_at: string;
  deadline?: string;
}

interface RFQListResponse {
  rfqs: RFQ[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

const statusColors = {
  draft: '#999',
  published: '#34C759',
  quoted: '#FF9500',
  negotiating: '#007AFF',
  awarded: '#8E44AD',
  cancelled: '#FF3B30',
};

const statusLabels = {
  draft: 'Draft',
  published: 'Published',
  quoted: 'Quoted',
  negotiating: 'Negotiating',
  awarded: 'Awarded',
  cancelled: 'Cancelled',
};

const categoryLabels = {
  electronics: 'Electronics',
  fashion: 'Fashion',
  home_garden: 'Home & Garden',
  machinery: 'Machinery',
  chemicals: 'Chemicals',
  textiles: 'Textiles',
  automotive: 'Automotive',
  packaging: 'Packaging',
};

export default function RFQListScreen() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const fetchRFQs = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('limit', '20');
      
      const url = `${API_BASE}/api/b2b/rfq${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url);
      const data: RFQListResponse = await response.json();
      
      if (response.ok) {
        setRfqs(data.rfqs || []);
      } else {
        Alert.alert('Error', 'Failed to fetch RFQs');
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRFQs();
    }, [selectedCategory, selectedStatus])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRFQs(false);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const renderRFQCard = (rfq: RFQ) => (
    <TouchableOpacity
      key={rfq.id}
      style={styles.rfqCard}
      onPress={() => router.push(`/b2b/rfq/${rfq.id}`)}
    >
      <View style={styles.rfqHeader}>
        <View style={styles.rfqTitleContainer}>
          <Text style={styles.rfqTitle} numberOfLines={2}>{rfq.title}</Text>
          <Text style={styles.rfqCategory}>
            {categoryLabels[rfq.category as keyof typeof categoryLabels] || rfq.category}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[rfq.status as keyof typeof statusColors] }]}>
          <Text style={styles.statusText}>
            {statusLabels[rfq.status as keyof typeof statusLabels] || rfq.status}
          </Text>
        </View>
      </View>
      
      <Text style={styles.rfqDescription} numberOfLines={3}>
        {rfq.description}
      </Text>
      
      <View style={styles.rfqDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Qty: {rfq.quantity.toLocaleString()}</Text>
        </View>
        {rfq.target_price && (
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Target: {formatPrice(rfq.target_price, rfq.currency)}
            </Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText} numberOfLines={1}>
            {rfq.shipping_destination}
          </Text>
        </View>
      </View>
      
      <View style={styles.rfqFooter}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="document-text-outline" size={16} color="#667eea" />
            <Text style={styles.statText}>{rfq.quote_count} quotes</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#667eea" />
            <Text style={styles.statText}>{rfq.views} views</Text>
          </View>
        </View>
        <Text style={styles.dateText}>Created: {formatDate(rfq.created_at)}</Text>
      </View>
      
      {rfq.deadline && (
        <View style={styles.deadlineContainer}>
          <Ionicons name="time-outline" size={14} color="#FF9500" />
          <Text style={styles.deadlineText}>
            Deadline: {formatDate(rfq.deadline)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Browse RFQs</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading RFQs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse RFQs</Text>
        <TouchableOpacity onPress={() => router.push('/b2b/rfq/create')} style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
            onPress={() => setSelectedCategory('')}
          >
            <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>
              All Categories
            </Text>
          </TouchableOpacity>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, selectedCategory === key && styles.filterChipActive]}
              onPress={() => setSelectedCategory(selectedCategory === key ? '' : key)}
            >
              <Text style={[styles.filterChipText, selectedCategory === key && styles.filterChipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* RFQ List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#667eea']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {rfqs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No RFQs Found</Text>
            <Text style={styles.emptyMessage}>
              {selectedCategory || selectedStatus 
                ? 'Try adjusting your filters or create a new RFQ.'
                : 'Be the first to create an RFQ and connect with suppliers worldwide.'}
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/b2b/rfq/create')}
            >
              <Text style={styles.createButtonText}>Create First RFQ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.rfqList}>
            {rfqs.map(renderRFQCard)}
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
  addButton: {
    padding: 8,
  },
  filterSection: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  content: {
    flex: 1,
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
  rfqList: {
    padding: 16,
  },
  rfqCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rfqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rfqTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  rfqTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rfqCategory: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
    marginBottom: 16,
  },
  rfqDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  rfqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deadlineText: {
    fontSize: 12,
    color: '#FF9500',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});