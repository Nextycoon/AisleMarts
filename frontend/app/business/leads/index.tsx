import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LeadsAPI } from '../../../lib/api';
import { isFeatureEnabled } from '../../../lib/featureFlags';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 3; // Account for padding and gaps

interface Lead {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  conversation_id: string;
  stage: 'new' | 'engaged' | 'qualified' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  source: string;
  value_estimate?: number;
  last_activity_at: string;
  created_at: string;
  notes_count: number;
  activities_count: number;
}

interface KanbanColumn {
  title: string;
  count: number;
  color: string;
}

interface KanbanSummary {
  columns: {
    new: KanbanColumn;
    engaged: KanbanColumn;
    qualified: KanbanColumn;
    won: KanbanColumn;
    lost: KanbanColumn;
  };
  totals: {
    total_leads: number;
    conversion_rate: number;
    total_revenue: number;
  };
}

export default function BusinessLeadsScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [kanbanSummary, setKanbanSummary] = useState<KanbanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    if (!isFeatureEnabled('LEADS')) {
      router.back();
      return;
    }
    
    loadLeads();
    loadKanbanSummary();
  }, [selectedStage]);

  const loadLeads = async () => {
    try {
      const stage = selectedStage || undefined;
      const data = await LeadsAPI.list(stage, undefined, 50);
      setLeads(data || []);
    } catch (error) {
      console.error('Failed to load leads:', error);
      Alert.alert('Error', 'Failed to load leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadKanbanSummary = async () => {
    try {
      const summary = await LeadsAPI.getKanbanSummary();
      setKanbanSummary(summary);
    } catch (error) {
      console.error('Failed to load kanban summary:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeads();
    await loadKanbanSummary();
  };

  const handleLeadPress = (lead: Lead) => {
    router.push(`/business/leads/${lead.id}`);
  };

  const handleStagePress = (stage: string) => {
    setSelectedStage(selectedStage === stage ? '' : stage);
  };

  const moveLeadStage = async (leadId: string, newStage: string) => {
    try {
      await LeadsAPI.moveStage(leadId, newStage);
      Alert.alert('Success', 'Lead moved successfully');
      loadLeads();
      loadKanbanSummary();
    } catch (error) {
      console.error('Failed to move lead:', error);
      Alert.alert('Error', 'Failed to move lead');
    }
  };

  const initiateCall = async (lead: Lead) => {
    try {
      const result = await LeadsAPI.initiateCall(lead.id);
      Alert.alert(
        'Call Initiated',
        `Starting call with ${lead.customer_name || 'customer'}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Call', onPress: () => router.push('/calls') }
        ]
      );
    } catch (error) {
      console.error('Failed to initiate call:', error);
      Alert.alert('Error', 'Failed to initiate call');
    }
  };

  const jumpToDM = async (lead: Lead) => {
    try {
      const result = await LeadsAPI.jumpToDM(lead.id);
      router.push(`/chat/${result.conversation_id}`);
    } catch (error) {
      console.error('Failed to jump to DM:', error);
      Alert.alert('Error', 'Failed to open conversation');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#D4AF37';
      case 'low': return '#4169E1';
      default: return '#999999';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return '#D4AF37';
      case 'engaged': return '#4169E1';
      case 'qualified': return '#8A2BE2';
      case 'won': return '#228B22';
      case 'lost': return '#DC143C';
      default: return '#999999';
    }
  };

  const formatValue = (value?: number) => {
    if (!value) return 'No value';
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
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

  const renderKanbanColumn = (stage: string, column: KanbanColumn) => {
    const columnLeads = leads.filter(lead => lead.stage === stage);
    
    return (
      <View key={stage} style={[styles.kanbanColumn, { width: COLUMN_WIDTH }]}>
        <TouchableOpacity
          style={[styles.columnHeader, { borderTopColor: column.color }]}
          onPress={() => handleStagePress(stage)}
        >
          <Text style={styles.columnTitle}>{column.title}</Text>
          <View style={[styles.countBadge, { backgroundColor: column.color }]}>
            <Text style={styles.countText}>{column.count}</Text>
          </View>
        </TouchableOpacity>

        <ScrollView 
          style={styles.columnContent}
          showsVerticalScrollIndicator={false}
        >
          {columnLeads.map((lead) => (
            <TouchableOpacity
              key={lead.id}
              style={styles.leadCard}
              onPress={() => handleLeadPress(lead)}
            >
              <View style={styles.leadHeader}>
                <Text style={styles.leadCustomer} numberOfLines={1}>
                  {lead.customer_name || lead.customer_email || 'Unknown'}
                </Text>
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(lead.priority) }]} />
              </View>

              <Text style={styles.leadSource}>{lead.source}</Text>
              
              {lead.value_estimate && (
                <Text style={styles.leadValue}>{formatValue(lead.value_estimate)}</Text>
              )}

              <View style={styles.leadFooter}>
                <Text style={styles.leadActivity}>
                  {formatDate(lead.last_activity_at)}
                </Text>
                <View style={styles.leadActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => jumpToDM(lead)}
                  >
                    <Ionicons name="chatbubble" size={16} color="#D4AF37" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => initiateCall(lead)}
                  >
                    <Ionicons name="call" size={16} color="#4169E1" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderListItem = ({ item }: { item: Lead }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleLeadPress(item)}
    >
      <View style={styles.listItemContent}>
        <View style={styles.listItemHeader}>
          <Text style={styles.listItemCustomer}>
            {item.customer_name || item.customer_email || 'Unknown'}
          </Text>
          <View style={styles.listItemBadges}>
            <View style={[styles.stageBadge, { backgroundColor: getStageColor(item.stage) }]}>
              <Text style={styles.stageBadgeText}>{item.stage.toUpperCase()}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.priorityBadgeText}>{item.priority.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.listItemDetails}>
          <Text style={styles.listItemSource}>{item.source}</Text>
          {item.value_estimate && (
            <Text style={styles.listItemValue}>{formatValue(item.value_estimate)}</Text>
          )}
          <Text style={styles.listItemActivity}>
            Last activity: {formatDate(item.last_activity_at)}
          </Text>
        </View>

        <View style={styles.listItemActions}>
          <TouchableOpacity
            style={styles.listActionButton}
            onPress={() => jumpToDM(item)}
          >
            <Ionicons name="chatbubble" size={18} color="#D4AF37" />
            <Text style={styles.listActionText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.listActionButton}
            onPress={() => initiateCall(item)}
          >
            <Ionicons name="call" size={18} color="#4169E1" />
            <Text style={styles.listActionText}>Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading leads...</Text>
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
        
        <Text style={styles.headerTitle}>Business Leads</Text>
        
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
        >
          <Ionicons 
            name={viewMode === 'kanban' ? 'list' : 'grid'} 
            size={24} 
            color="#D4AF37" 
          />
        </TouchableOpacity>
      </View>

      {/* Analytics Summary */}
      {kanbanSummary && (
        <View style={styles.analytics}>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{kanbanSummary.totals.total_leads}</Text>
            <Text style={styles.analyticsLabel}>Total Leads</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>
              {(kanbanSummary.totals.conversion_rate * 100).toFixed(1)}%
            </Text>
            <Text style={styles.analyticsLabel}>Conversion</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>
              ${kanbanSummary.totals.total_revenue.toLocaleString()}
            </Text>
            <Text style={styles.analyticsLabel}>Revenue</Text>
          </View>
        </View>
      )}

      {/* Content */}
      {viewMode === 'kanban' ? (
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kanbanContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
              colors={['#D4AF37']}
            />
          }
        >
          {kanbanSummary && Object.entries(kanbanSummary.columns).map(([stage, column]) => 
            renderKanbanColumn(stage, column)
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={leads}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
          contentContainerStyle={leads.length === 0 ? styles.emptyContainer : undefined}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
              colors={['#D4AF37']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No leads found</Text>
              <Text style={styles.emptySubtitle}>
                Leads from customer conversations will appear here
              </Text>
            </View>
          }
        />
      )}
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
  viewToggle: {
    padding: 8,
  },
  analytics: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  analyticsItem: {
    flex: 1,
    alignItems: 'center',
  },
  analyticsValue: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '700',
  },
  analyticsLabel: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  kanbanContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  kanbanColumn: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    minHeight: 400,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  columnTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  columnContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  leadCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leadCustomer: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  leadSource: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  leadValue: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  leadFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leadActivity: {
    color: '#666',
    fontSize: 10,
  },
  leadActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  listItemContent: {
    gap: 12,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemCustomer: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  listItemBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  stageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  listItemDetails: {
    gap: 4,
  },
  listItemSource: {
    color: '#999',
    fontSize: 14,
  },
  listItemValue: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  listItemActivity: {
    color: '#666',
    fontSize: 12,
  },
  listItemActions: {
    flexDirection: 'row',
    gap: 16,
  },
  listActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  listActionText: {
    color: '#CCCCCC',
    fontSize: 14,
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