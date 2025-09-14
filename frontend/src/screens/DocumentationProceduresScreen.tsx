import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  documentationProceduresService, 
  DocumentProcedure,
  CreateProcedureRequest
} from '../services/DocumentationProceduresService';

const DocumentationProceduresScreen: React.FC = () => {
  const [procedures, setProcedures] = useState<DocumentProcedure[]>([]);
  const [pendingReviews, setPendingReviews] = useState<DocumentProcedure[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<DocumentProcedure | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [comment, setComment] = useState('');
  const [serviceHealth, setServiceHealth] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load service health
      const healthResult = await documentationProceduresService.getHealthCheck();
      if (healthResult.success) {
        setServiceHealth(healthResult.data);
      }

      // Load user procedures
      const proceduresResult = await documentationProceduresService.getMyProcedures();
      if (proceduresResult.success) {
        setProcedures(proceduresResult.data.procedures || []);
      }

      // Load pending reviews
      const reviewsResult = await documentationProceduresService.getPendingReviews();
      if (reviewsResult.success) {
        setPendingReviews(reviewsResult.data.procedures || []);
      }

      // Load analytics
      const analyticsResult = await documentationProceduresService.getWorkflowAnalytics();
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApprove = async (procedureId: string) => {
    Alert.alert(
      'Approve Document',
      'Are you sure you want to approve this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              const result = await documentationProceduresService.approveDocument(procedureId, {
                approver_name: 'Current User',
                approver_role: 'compliance_officer',
                comments: 'Document approved'
              });

              if (result.success) {
                Alert.alert('Success', 'Document approved successfully');
                loadData();
              } else {
                Alert.alert('Error', result.error || 'Failed to approve document');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to approve document');
            }
          }
        }
      ]
    );
  };

  const handleReject = async (procedureId: string) => {
    Alert.alert(
      'Reject Document',
      'Are you sure you want to reject this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: async () => {
            try {
              const result = await documentationProceduresService.rejectDocument(procedureId, {
                reviewer_name: 'Current User',
                reviewer_role: 'compliance_officer',
                comments: 'Document does not meet requirements'
              });

              if (result.success) {
                Alert.alert('Success', 'Document rejected');
                loadData();
              } else {
                Alert.alert('Error', result.error || 'Failed to reject document');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to reject document');
            }
          }
        }
      ]
    );
  };

  const handleRequestRevision = async (procedureId: string) => {
    try {
      const result = await documentationProceduresService.requestRevision(procedureId, {
        reviewer_name: 'Current User',
        reviewer_role: 'compliance_officer',
        comments: 'Please make the following revisions...'
      });

      if (result.success) {
        Alert.alert('Success', 'Revision requested');
        loadData();
      } else {
        Alert.alert('Error', result.error || 'Failed to request revision');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request revision');
    }
  };

  const handleAddComment = async () => {
    if (!selectedProcedure || !comment.trim()) return;

    try {
      const result = await documentationProceduresService.addComment(selectedProcedure._id, {
        comment: comment.trim(),
        user_name: 'Current User',
        user_role: 'user',
        is_internal: false
      });

      if (result.success) {
        Alert.alert('Success', 'Comment added');
        setComment('');
        setShowCommentModal(false);
        loadData();
      } else {
        Alert.alert('Error', result.error || 'Failed to add comment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleGenerateInsights = async () => {
    try {
      const result = await documentationProceduresService.generateWorkflowInsights({
        procedures_count: procedures.length,
        pending_reviews: pendingReviews.length,
        analytics: analytics
      });

      if (result.success) {
        setAiInsights(result.data.insights);
        setShowInsightsModal(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate insights');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate AI insights');
    }
  };

  const handleEscalate = async (procedureId: string) => {
    Alert.alert(
      'Escalate Procedure',
      'This will escalate the procedure to a higher approval level. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Escalate',
          onPress: async () => {
            try {
              const result = await documentationProceduresService.escalateProcedure(procedureId, {
                reason: 'Manual escalation requested',
                escalated_by: 'current_user'
              });

              if (result.success) {
                Alert.alert('Success', 'Procedure escalated');
                loadData();
              } else {
                Alert.alert('Error', result.error || 'Failed to escalate procedure');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to escalate procedure');
            }
          }
        }
      ]
    );
  };

  const renderServiceHealth = () => (
    <View style={styles.healthCard}>
      <View style={styles.healthHeader}>
        <Ionicons name="pulse-outline" size={20} color="#10B981" />
        <Text style={styles.healthTitle}>Workflow Status</Text>
      </View>
      {serviceHealth && (
        <View style={styles.healthStats}>
          <Text style={styles.healthStat}>
            🔄 {serviceHealth.workflow_states} States
          </Text>
          <Text style={styles.healthStat}>
            ⚡ {serviceHealth.approval_levels} Levels
          </Text>
          <Text style={styles.healthStat}>
            👥 {serviceHealth.reviewer_roles} Roles
          </Text>
        </View>
      )}
    </View>
  );

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Workflow Analytics</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticItem}>
            <Text style={styles.analyticNumber}>{analytics.total_procedures}</Text>
            <Text style={styles.analyticLabel}>Total Procedures</Text>
          </View>
          <View style={styles.analyticItem}>
            <Text style={[styles.analyticNumber, { color: '#10B981' }]}>
              {analytics.metrics?.approval_rate?.toFixed(1) || 0}%
            </Text>
            <Text style={styles.analyticLabel}>Approval Rate</Text>
          </View>
          <View style={styles.analyticItem}>
            <Text style={[styles.analyticNumber, { color: '#EF4444' }]}>
              {analytics.metrics?.rejection_rate?.toFixed(1) || 0}%
            </Text>
            <Text style={styles.analyticLabel}>Rejection Rate</Text>
          </View>
          <View style={styles.analyticItem}>
            <Text style={[styles.analyticNumber, { color: '#3B82F6' }]}>
              {analytics.metrics?.pending || 0}
            </Text>
            <Text style={styles.analyticLabel}>Pending</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderProcedureCard = (procedure: DocumentProcedure, isPendingReview: boolean = false) => {
    const slaStatus = documentationProceduresService.getSLAStatus(procedure);
    
    return (
      <TouchableOpacity
        key={procedure._id}
        style={styles.procedureCard}
        onPress={() => {
          setSelectedProcedure(procedure);
          setShowDetailModal(true);
        }}
      >
        <View style={styles.procedureHeader}>
          <View style={styles.procedureTitleRow}>
            <Text style={styles.procedureTitle}>{procedure.document_title}</Text>
            <View style={[
              styles.stateBadge,
              { backgroundColor: documentationProceduresService.getStateColor(procedure.current_state) }
            ]}>
              <Text style={styles.stateText}>
                {documentationProceduresService.getStateDisplayName(procedure.current_state)}
              </Text>
            </View>
          </View>
          <Text style={styles.procedureType}>{procedure.document_type}</Text>
        </View>

        <View style={styles.procedureMeta}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Priority:</Text>
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityIcon}>
                {documentationProceduresService.getPriorityIcon(procedure.priority)}
              </Text>
              <Text style={[
                styles.priorityText,
                { color: documentationProceduresService.getPriorityColor(procedure.priority) }
              ]}>
                {documentationProceduresService.getPriorityDisplayName(procedure.priority)}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Approval Level:</Text>
            <Text style={styles.metaValue}>
              {documentationProceduresService.getApprovalLevelDisplayName(procedure.approval_level_required)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Risk Score:</Text>
            <View style={styles.riskContainer}>
              <View style={[
                styles.riskDot,
                { backgroundColor: documentationProceduresService.getRiskScoreColor(procedure.risk_score) }
              ]} />
              <Text style={styles.riskText}>
                {documentationProceduresService.getRiskScoreLabel(procedure.risk_score)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.slaContainer}>
          <View style={[styles.slaIndicator, { backgroundColor: slaStatus.color }]} />
          <Text style={styles.slaText}>{slaStatus.message}</Text>
          {procedure.due_date && (
            <Text style={styles.dueDateText}>
              {documentationProceduresService.formatDueDate(procedure.due_date)}
            </Text>
          )}
        </View>

        {isPendingReview && (
          <View style={styles.reviewActions}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApprove(procedure._id)}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleReject(procedure._id)}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.revisionButton}
              onPress={() => handleRequestRevision(procedure._id)}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Revise</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.procedureFooter}>
          <Text style={styles.footerText}>
            Updated {documentationProceduresService.formatDate(procedure.updated_at)}
          </Text>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              setSelectedProcedure(procedure);
              setShowDetailModal(true);
            }}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => (
    <Modal
      visible={showDetailModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowDetailModal(false)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Procedure Details</Text>
          <TouchableOpacity onPress={() => setShowCommentModal(true)}>
            <Ionicons name="chatbubble-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {selectedProcedure && (
          <ScrollView style={styles.modalContent}>
            {/* Header Info */}
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>{selectedProcedure.document_title}</Text>
              <Text style={styles.detailSubtitle}>{selectedProcedure.document_type}</Text>
              
              <View style={styles.detailBadges}>
                <View style={[
                  styles.stateBadge,
                  { backgroundColor: documentationProceduresService.getStateColor(selectedProcedure.current_state) }
                ]}>
                  <Text style={styles.stateText}>
                    {documentationProceduresService.getStateDisplayName(selectedProcedure.current_state)}
                  </Text>
                </View>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: documentationProceduresService.getPriorityColor(selectedProcedure.priority) }
                ]}>
                  <Text style={styles.priorityBadgeText}>
                    {documentationProceduresService.getPriorityDisplayName(selectedProcedure.priority)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Workflow Info */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Workflow Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Approval Level</Text>
                  <Text style={styles.infoValue}>
                    {documentationProceduresService.getApprovalLevelDisplayName(selectedProcedure.approval_level_required)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Risk Score</Text>
                  <Text style={[
                    styles.infoValue,
                    { color: documentationProceduresService.getRiskScoreColor(selectedProcedure.risk_score) }
                  ]}>
                    {(selectedProcedure.risk_score * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Created</Text>
                  <Text style={styles.infoValue}>
                    {documentationProceduresService.formatDateTime(selectedProcedure.created_at)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Due Date</Text>
                  <Text style={styles.infoValue}>
                    {selectedProcedure.due_date ? 
                      documentationProceduresService.formatDueDate(selectedProcedure.due_date) : 
                      'No due date'
                    }
                  </Text>
                </View>
              </View>
            </View>

            {/* Comments */}
            {selectedProcedure.comments && selectedProcedure.comments.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Comments ({selectedProcedure.comments.length})</Text>
                {selectedProcedure.comments.map((comment, index) => (
                  <View key={index} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.user_name}</Text>
                      <Text style={styles.commentDate}>
                        {documentationProceduresService.formatDateTime(comment.timestamp)}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{comment.comment}</Text>
                    {comment.is_internal && (
                      <View style={styles.internalBadge}>
                        <Text style={styles.internalText}>Internal</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* State History */}
            {selectedProcedure.state_history && selectedProcedure.state_history.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>State History</Text>
                {selectedProcedure.state_history.slice(-5).map((history, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyState}>
                      {documentationProceduresService.getStateIcon(history.state)} {documentationProceduresService.getStateDisplayName(history.state)}
                    </Text>
                    <Text style={styles.historyDate}>
                      {documentationProceduresService.formatDateTime(history.timestamp)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.detailActions}>
              <TouchableOpacity
                style={styles.escalateButton}
                onPress={() => handleEscalate(selectedProcedure._id)}
              >
                <Ionicons name="arrow-up-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.escalateButtonText}>Escalate</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const renderCommentModal = () => (
    <Modal
      visible={showCommentModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCommentModal(false)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Comment</Text>
          <TouchableOpacity onPress={handleAddComment}>
            <Text style={styles.saveButton}>Post</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Enter your comment..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderInsightsModal = () => (
    <Modal
      visible={showInsightsModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowInsightsModal(false)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Workflow Insights</Text>
          <View />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.insightsContainer}>
            <View style={styles.insightsHeader}>
              <Ionicons name="analytics" size={24} color="#8B5CF6" />
              <Text style={styles.insightsTitle}>AI-Powered Analysis</Text>
            </View>
            <Text style={styles.insightsText}>{aiInsights}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading procedures...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documentation Procedures</Text>
        <Text style={styles.headerSubtitle}>Workflow Management & Approvals</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderServiceHealth()}
        {renderAnalytics()}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.insightsButton} onPress={handleGenerateInsights}>
            <Ionicons name="analytics" size={20} color="#FFFFFF" />
            <Text style={styles.insightsButtonText}>AI Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Reviews ({pendingReviews.length})</Text>
            </View>
            <View style={styles.proceduresList}>
              {pendingReviews.map(procedure => renderProcedureCard(procedure, true))}
            </View>
          </View>
        )}

        {/* My Procedures */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Procedures ({procedures.length})</Text>
          </View>
          
          {procedures.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Procedures</Text>
              <Text style={styles.emptyText}>
                You don't have any document procedures yet.
              </Text>
            </View>
          ) : (
            <View style={styles.proceduresList}>
              {procedures.map(procedure => renderProcedureCard(procedure))}
            </View>
          )}
        </View>
      </ScrollView>

      {renderDetailModal()}
      {renderCommentModal()}
      {renderInsightsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280'
  },
  content: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280'
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  healthStat: {
    fontSize: 12,
    color: '#6B7280'
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  analyticItem: {
    alignItems: 'center'
  },
  analyticNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  analyticLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center'
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16
  },
  insightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  insightsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  },
  proceduresList: {
    padding: 16
  },
  procedureCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  procedureHeader: {
    marginBottom: 12
  },
  procedureTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  procedureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8
  },
  procedureType: {
    fontSize: 14,
    color: '#6B7280'
  },
  stateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  stateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500'
  },
  procedureMeta: {
    marginBottom: 12
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280'
  },
  metaValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500'
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  priorityIcon: {
    fontSize: 12,
    marginRight: 4
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500'
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4
  },
  riskText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500'
  },
  slaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  slaIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8
  },
  slaText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1
  },
  dueDateText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic'
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginRight: 4,
    justifyContent: 'center'
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center'
  },
  revisionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginLeft: 4,
    justifyContent: 'center'
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  },
  procedureFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280'
  },
  viewButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6'
  },
  modalContent: {
    flex: 1,
    padding: 16
  },
  detailSection: {
    marginBottom: 24
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  detailSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16
  },
  detailBadges: {
    flexDirection: 'row'
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8
  },
  priorityBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500'
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  infoItem: {
    width: '50%',
    marginBottom: 12
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827'
  },
  commentItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827'
  },
  commentDate: {
    fontSize: 12,
    color: '#6B7280'
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20
  },
  internalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4
  },
  internalText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '500'
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  historyState: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500'
  },
  historyDate: {
    fontSize: 12,
    color: '#6B7280'
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16
  },
  escalateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  escalateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 120
  },
  insightsContainer: {
    padding: 16
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8
  },
  insightsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151'
  }
});

export default DocumentationProceduresScreen;