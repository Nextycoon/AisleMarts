import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://market-launch-4.preview.emergentagent.com';

interface RFQ {
  id: string;
  business_user_id: string;
  business_name: string;
  title: string;
  category: string;
  description: string;
  specifications: {
    material?: string;
    dimensions?: string;
    color?: string;
    certifications?: string[];
    customization?: string;
    packaging?: string;
    delivery_terms?: string;
    payment_terms?: string;
    sample_required?: boolean;
  };
  quantity: number;
  target_price?: number;
  currency: string;
  deadline?: string;
  shipping_destination: string;
  attachments?: string[];
  status: string;
  quote_count: number;
  views: number;
  created_at: string;
  updated_at: string;
}

interface Quote {
  id: string;
  rfq_id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_tier: string;
  supplier_message: string;
  items: QuoteItem[];
  total_amount: number;
  currency: string;
  lead_time_days: number;
  payment_terms: string;
  shipping_terms: string;
  validity_days: number;
  certifications: string[];
  sample_available: boolean;
  sample_cost?: number;
  status: string;
  submitted_at: string;
  expires_at: string;
  response_time_hours?: number;
}

interface QuoteItem {
  description: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  lead_time_days: number;
  notes?: string;
}

interface RFQDetailResponse {
  rfq: RFQ;
  quotes: Quote[];
  quote_count: number;
}

const statusColors = {
  draft: '#999',
  published: '#34C759',
  quoted: '#FF9500',
  negotiating: '#007AFF',
  awarded: '#8E44AD',
  cancelled: '#FF3B30',
};

const tierColors = {
  VERIFIED: '#34C759',
  GOLD: '#FFD700',
  DIAMOND: '#9B59B6',
  SILVER: '#BDC3C7',
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

export default function RFQDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const fetchRFQDetails = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const response = await fetch(`${API_BASE}/api/b2b/rfq/${id}`);
      const data: RFQDetailResponse = await response.json();
      
      if (response.ok) {
        setRfq(data.rfq);
        setQuotes(data.quotes || []);
      } else {
        Alert.alert('Error', 'Failed to fetch RFQ details');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching RFQ details:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRFQDetails();
    }
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRFQDetails(false);
    setRefreshing(false);
  };

  const handleAcceptQuote = async (quoteId: string) => {
    Alert.alert(
      'Accept Quote',
      'Are you sure you want to accept this quote? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/api/b2b/rfq/${id}/quote/${quoteId}/accept`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              const result = await response.json();

              if (response.ok && result.success) {
                Alert.alert('Success!', 'Quote accepted successfully. The supplier will be notified.');
                fetchRFQDetails(false); // Refresh data
              } else {
                Alert.alert('Error', result.detail || 'Failed to accept quote.');
              }
            } catch (error) {
              console.error('Error accepting quote:', error);
              Alert.alert('Error', 'Network error. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RFQ Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading RFQ details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!rfq) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RFQ Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>RFQ Not Found</Text>
          <Text style={styles.emptyMessage}>This RFQ may have been removed or doesn't exist.</Text>
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
        <Text style={styles.headerTitle}>RFQ Details</Text>
        <TouchableOpacity 
          onPress={handleRefresh} 
          style={styles.refreshButton}
          disabled={refreshing}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color="white" 
            style={refreshing ? { opacity: 0.5 } : {}}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#667eea']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* RFQ Info Card */}
        <View style={styles.card}>
          <View style={styles.rfqHeader}>
            <View style={styles.rfqTitleContainer}>
              <Text style={styles.rfqTitle}>{rfq.title}</Text>
              <View style={styles.rfqMetaRow}>
                <Text style={styles.rfqCategory}>
                  {categoryLabels[rfq.category as keyof typeof categoryLabels] || rfq.category}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[rfq.status as keyof typeof statusColors] }]}>
                  <Text style={styles.statusText}>{rfq.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.sectionSubtitle}>Description</Text>
          <Text style={styles.description}>{rfq.description}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quantity</Text>
              <Text style={styles.detailValue}>{rfq.quantity.toLocaleString()}</Text>
            </View>
            {rfq.target_price && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Target Price</Text>
                <Text style={styles.detailValue}>{formatPrice(rfq.target_price, rfq.currency)}</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Destination</Text>
              <Text style={styles.detailValue}>{rfq.shipping_destination}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Business</Text>
              <Text style={styles.detailValue}>{rfq.business_name}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quotes</Text>
              <Text style={styles.detailValue}>{rfq.quote_count}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Views</Text>
              <Text style={styles.detailValue}>{rfq.views}</Text>
            </View>
          </View>

          {rfq.deadline && (
            <View style={styles.deadlineContainer}>
              <Ionicons name="time-outline" size={16} color="#FF9500" />
              <Text style={styles.deadlineText}>
                Deadline: {formatDate(rfq.deadline)}
              </Text>
            </View>
          )}
        </View>

        {/* Specifications Card */}
        {Object.keys(rfq.specifications).some(key => rfq.specifications[key as keyof typeof rfq.specifications]) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Product Specifications</Text>
            
            {rfq.specifications.material && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Material:</Text>
                <Text style={styles.specValue}>{rfq.specifications.material}</Text>
              </View>
            )}
            {rfq.specifications.dimensions && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Dimensions:</Text>
                <Text style={styles.specValue}>{rfq.specifications.dimensions}</Text>
              </View>
            )}
            {rfq.specifications.color && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Color:</Text>
                <Text style={styles.specValue}>{rfq.specifications.color}</Text>
              </View>
            )}
            {rfq.specifications.customization && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Customization:</Text>
                <Text style={styles.specValue}>{rfq.specifications.customization}</Text>
              </View>
            )}
            {rfq.specifications.packaging && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Packaging:</Text>
                <Text style={styles.specValue}>{rfq.specifications.packaging}</Text>
              </View>
            )}
            {rfq.specifications.delivery_terms && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Delivery Terms:</Text>
                <Text style={styles.specValue}>{rfq.specifications.delivery_terms}</Text>
              </View>
            )}
            {rfq.specifications.payment_terms && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Payment Terms:</Text>
                <Text style={styles.specValue}>{rfq.specifications.payment_terms}</Text>
              </View>
            )}
            {rfq.specifications.sample_required && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Sample Required:</Text>
                <Text style={styles.specValue}>Yes</Text>
              </View>
            )}
          </View>
        )}

        {/* Quotes Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Supplier Quotes ({quotes.length})</Text>
            <TouchableOpacity 
              style={styles.submitQuoteButton}
              onPress={() => router.push(`/b2b/rfq/${id}/quote`)}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text style={styles.submitQuoteText}>Submit Quote</Text>
            </TouchableOpacity>
          </View>

          {quotes.length === 0 ? (
            <View style={styles.noQuotesContainer}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.noQuotesTitle}>No Quotes Yet</Text>
              <Text style={styles.noQuotesMessage}>
                Be the first supplier to submit a competitive quote for this RFQ.
              </Text>
            </View>
          ) : (
            quotes.map((quote) => (
              <View key={quote.id} style={styles.quoteCard}>
                <View style={styles.quoteHeader}>
                  <View style={styles.supplierInfo}>
                    <Text style={styles.supplierName}>{quote.supplier_name}</Text>
                    <View style={[styles.tierBadge, { backgroundColor: tierColors[quote.supplier_tier as keyof typeof tierColors] || '#999' }]}>
                      <Text style={styles.tierText}>{quote.supplier_tier}</Text>
                    </View>
                  </View>
                  <Text style={styles.quoteAmount}>{formatPrice(quote.total_amount, quote.currency)}</Text>
                </View>

                <Text style={styles.supplierMessage}>{quote.supplier_message}</Text>

                <View style={styles.quoteDetails}>
                  <View style={styles.quoteDetailRow}>
                    <Text style={styles.quoteDetailLabel}>Lead Time:</Text>
                    <Text style={styles.quoteDetailValue}>{quote.lead_time_days} days</Text>
                  </View>
                  <View style={styles.quoteDetailRow}>
                    <Text style={styles.quoteDetailLabel}>Payment:</Text>
                    <Text style={styles.quoteDetailValue}>{quote.payment_terms}</Text>
                  </View>
                  <View style={styles.quoteDetailRow}>
                    <Text style={styles.quoteDetailLabel}>Shipping:</Text>
                    <Text style={styles.quoteDetailValue}>{quote.shipping_terms}</Text>
                  </View>
                  <View style={styles.quoteDetailRow}>
                    <Text style={styles.quoteDetailLabel}>Valid Until:</Text>
                    <Text style={styles.quoteDetailValue}>{formatDate(quote.expires_at)}</Text>
                  </View>
                  {quote.sample_available && (
                    <View style={styles.quoteDetailRow}>
                      <Text style={styles.quoteDetailLabel}>Sample Cost:</Text>
                      <Text style={styles.quoteDetailValue}>
                        {quote.sample_cost ? formatPrice(quote.sample_cost, quote.currency) : 'Available'}
                      </Text>
                    </View>
                  )}
                </View>

                {quote.status === 'submitted' && rfq.status !== 'awarded' && (
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptQuote(quote.id)}
                  >
                    <Text style={styles.acceptButtonText}>Accept Quote</Text>
                  </TouchableOpacity>
                )}

                {quote.status === 'accepted' && (
                  <View style={styles.acceptedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <Text style={styles.acceptedText}>ACCEPTED</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
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
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
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
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rfqHeader: {
    marginBottom: 16,
  },
  rfqTitleContainer: {
    flex: 1,
  },
  rfqTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  rfqMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rfqCategory: {
    fontSize: 14,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deadlineText: {
    fontSize: 14,
    color: '#FF9500',
    marginLeft: 8,
    fontWeight: '500',
  },
  specRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  specLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: 120,
  },
  specValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitQuoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  submitQuoteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  noQuotesContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noQuotesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  noQuotesMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  quoteCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  supplierInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  quoteAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  supplierMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  quoteDetails: {
    marginBottom: 16,
  },
  quoteDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  quoteDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  quoteDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});