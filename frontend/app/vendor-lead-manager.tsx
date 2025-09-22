import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: 'video' | 'post' | 'review' | 'live';
  contentTitle: string;
  interest: string;
  qualificationScore: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  value: number;
  timestamp: string;
  lastContact?: string;
  notes?: string;
}

interface PPLStats {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageValue: number;
  costPerLead: number;
  roi: number;
}

export default function VendorLeadManagerScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const [pplStats] = useState<PPLStats>({
    totalLeads: 1247,
    qualifiedLeads: 892,
    conversionRate: 18.7,
    averageValue: 89.50,
    costPerLead: 2.85,
    roi: 251.3,
  });

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0123',
      source: 'video',
      contentTitle: 'iPhone 15 Pro Max Unboxing & Review',
      interest: 'iPhone 15 Pro Max 256GB',
      qualificationScore: 92,
      status: 'qualified',
      value: 1299,
      timestamp: '2 hours ago',
      lastContact: '1 hour ago',
      notes: 'Interested in trade-in program. Ready to purchase this week.',
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      source: 'live',
      contentTitle: 'Winter Fashion Live Shopping',
      interest: 'Winter Coat Collection',
      qualificationScore: 87,
      status: 'new',
      value: 250,
      timestamp: '4 hours ago',
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      email: 'emma.r@email.com',
      phone: '+1-555-0456',
      source: 'post',
      contentTitle: 'Best Coffee Makers Under $200',
      interest: 'Breville Coffee Maker',
      qualificationScore: 78,
      status: 'contacted',
      value: 180,
      timestamp: '6 hours ago',
      lastContact: '3 hours ago',
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.w@email.com',
      source: 'review',
      contentTitle: 'Honest Laptop Review 2025',
      interest: 'MacBook Pro 16"',
      qualificationScore: 95,
      status: 'converted',
      value: 2499,
      timestamp: '1 day ago',
      lastContact: '6 hours ago',
      notes: 'Purchased MacBook Pro. Very satisfied customer.',
    },
    {
      id: '5',
      name: 'Lisa Park',
      email: 'lisa.park@email.com',
      source: 'video',
      contentTitle: 'Smart Home Setup Guide',
      interest: 'Smart Home Bundle',
      qualificationScore: 65,
      status: 'lost',
      value: 450,
      timestamp: '2 days ago',
      lastContact: '1 day ago',
      notes: 'Decided to go with competitor. Price was main factor.',
    },
  ]);

  const filters = [
    { id: 'all', name: 'All Leads', count: leads.length },
    { id: 'new', name: 'New', count: leads.filter(l => l.status === 'new').length },
    { id: 'qualified', name: 'Qualified', count: leads.filter(l => l.status === 'qualified').length },
    { id: 'contacted', name: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
    { id: 'converted', name: 'Converted', count: leads.filter(l => l.status === 'converted').length },
  ];

  const filteredLeads = selectedFilter === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === selectedFilter);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'video': return '📹';
      case 'live': return '🔴';
      case 'post': return '📝';
      case 'review': return '⭐';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#4ECDC4';
      case 'contacted': return '#FFE66D';
      case 'qualified': return '#FF8E53';
      case 'converted': return '#4ECDC4';
      case 'lost': return '#FF6B6B';
      default: return '#FFFFFF';
    }
  };

  const getQualificationColor = (score: number) => {
    if (score >= 80) return '#4ECDC4';
    if (score >= 60) return '#FFE66D';
    return '#FF6B6B';
  };

  const handleLeadAction = (leadId: string, action: string) => {
    switch (action) {
      case 'contact':
        Alert.alert(
          'Contact Lead',
          'Choose contact method:',
          [
            { text: 'Email', onPress: () => console.log('Send email') },
            { text: 'Call', onPress: () => console.log('Make call') },
            { text: 'SMS', onPress: () => console.log('Send SMS') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        break;
      case 'qualify':
        setLeads(leads.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: 'qualified' as const }
            : lead
        ));
        break;
      case 'convert':
        setLeads(leads.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: 'converted' as const }
            : lead
        ));
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderLead = ({ item: lead }: { item: Lead }) => (
    <TouchableOpacity 
      style={styles.leadCard}
      onPress={() => setSelectedLead(lead)}
    >
      <View style={styles.leadHeader}>
        <View style={styles.leadInfo}>
          <Text style={styles.leadName}>{lead.name}</Text>
          <Text style={styles.leadEmail}>{lead.email}</Text>
        </View>
        <View style={styles.leadBadges}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(lead.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(lead.status) }
            ]}>
              {lead.status.toUpperCase()}
            </Text>
          </View>
          <View style={[
            styles.qualificationBadge,
            { backgroundColor: getQualificationColor(lead.qualificationScore) + '20' }
          ]}>
            <Text style={[
              styles.qualificationText,
              { color: getQualificationColor(lead.qualificationScore) }
            ]}>
              {lead.qualificationScore}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.leadDetails}>
        <View style={styles.leadSource}>
          <Text style={styles.sourceIcon}>{getSourceIcon(lead.source)}</Text>
          <Text style={styles.sourceText}>{lead.contentTitle}</Text>
        </View>
        <Text style={styles.leadInterest}>{lead.interest}</Text>
      </View>

      <View style={styles.leadFooter}>
        <View style={styles.leadMeta}>
          <Text style={styles.leadValue}>{formatCurrency(lead.value)}</Text>
          <Text style={styles.leadTimestamp}>{lead.timestamp}</Text>
        </View>
        <View style={styles.leadActions}>
          {lead.status === 'new' && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLeadAction(lead.id, 'contact')}
            >
              <Text style={styles.actionButtonText}>Contact</Text>
            </TouchableOpacity>
          )}
          {lead.status === 'contacted' && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLeadAction(lead.id, 'qualify')}
            >
              <Text style={styles.actionButtonText}>Qualify</Text>
            </TouchableOpacity>
          )}
          {lead.status === 'qualified' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.convertButton]}
              onPress={() => handleLeadAction(lead.id, 'convert')}
            >
              <Text style={styles.convertButtonText}>Convert</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>PPL Lead Manager</Text>
          <Text style={styles.headerSubtitle}>AI-Qualified Leads • Pay Only for Results</Text>
        </View>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* PPL Stats */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pplStats.totalLeads}</Text>
              <Text style={styles.statLabel}>Total Leads</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pplStats.qualifiedLeads}</Text>
              <Text style={styles.statLabel}>Qualified</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pplStats.conversionRate}%</Text>
              <Text style={styles.statLabel}>Conversion</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${pplStats.costPerLead}</Text>
              <Text style={styles.statLabel}>Cost/Lead</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pplStats.roi}%</Text>
              <Text style={styles.statLabel}>ROI</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* AI Insight */}
      <View style={styles.aiInsightContainer}>
        <LinearGradient
          colors={['rgba(78, 205, 196, 0.1)', 'rgba(78, 205, 196, 0.05)']}
          style={styles.aiInsightGradient}
        >
          <Text style={styles.aiInsightTitle}>🤖 AI Lead Intelligence</Text>
          <Text style={styles.aiInsightText}>
            71.5% qualification rate • Video content generating highest quality leads • 
            Best contact time: 2-4 PM weekdays
          </Text>
        </LinearGradient>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.selectedFilter
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter.id && styles.selectedFilterText
                ]}>
                  {filter.name} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item.id}
        renderItem={renderLead}
        style={styles.leadsList}
        contentContainerStyle={styles.leadsListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>No Leads Found</Text>
            <Text style={styles.emptyStateText}>
              Create more content to generate qualified leads
            </Text>
          </View>
        }
      />

      {/* PPL Summary Card */}
      <View style={styles.pplSummaryCard}>
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
          style={styles.pplSummaryGradient}
        >
          <Text style={styles.pplSummaryTitle}>💰 PPL Performance Summary</Text>
          <View style={styles.pplSummaryGrid}>
            <View style={styles.pplSummaryItem}>
              <Text style={styles.pplSummaryValue}>${(pplStats.totalLeads * pplStats.costPerLead).toFixed(0)}</Text>
              <Text style={styles.pplSummaryLabel}>Total Spent</Text>
            </View>
            <View style={styles.pplSummaryItem}>
              <Text style={styles.pplSummaryValue}>${(pplStats.qualifiedLeads * pplStats.averageValue).toFixed(0)}</Text>
              <Text style={styles.pplSummaryLabel}>Revenue Generated</Text>
            </View>
          </View>
          <Text style={styles.pplSummaryNote}>
            🎉 {pplStats.roi}% ROI • Only pay for qualified leads • No wasted spend
          </Text>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButtonText: {
    fontSize: 20,
  },
  statsContainer: {
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    textAlign: 'center',
  },
  aiInsightContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  aiInsightGradient: {
    borderRadius: 12,
    padding: 16,
  },
  aiInsightTitle: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  aiInsightText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    lineHeight: 18,
  },
  filtersContainer: {
    paddingBottom: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedFilter: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  filterButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  leadsList: {
    flex: 1,
  },
  leadsListContent: {
    paddingHorizontal: 20,
  },
  leadCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  leadEmail: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  leadBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  qualificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  qualificationText: {
    fontSize: 10,
    fontWeight: '600',
  },
  leadDetails: {
    marginBottom: 12,
  },
  leadSource: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sourceText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    flex: 1,
  },
  leadInterest: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leadMeta: {},
  leadValue: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  leadTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },
  leadActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  convertButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
  },
  convertButtonText: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
  pplSummaryCard: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pplSummaryGradient: {
    padding: 16,
  },
  pplSummaryTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  pplSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  pplSummaryItem: {
    alignItems: 'center',
  },
  pplSummaryValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  pplSummaryLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  pplSummaryNote: {
    color: '#4ECDC4',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});