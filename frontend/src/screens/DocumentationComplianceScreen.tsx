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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { documentationComplianceService, TradeDocument, CreateDocumentRequest } from '../services/DocumentationComplianceService';

const DocumentationComplianceScreen: React.FC = () => {
  const [documents, setDocuments] = useState<TradeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<TradeDocument | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [serviceHealth, setServiceHealth] = useState<any>(null);

  // Create document form state
  const [documentForm, setDocumentForm] = useState<CreateDocumentRequest>({
    document_type: 'commercial_invoice',
    title: '',
    country: 'US',
    currency: 'USD',
    incoterm: 'FOB',
    parties: [],
    items: [],
    terms: {},
    totals: {},
    tags: [],
    ai_generated: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load service health
      const healthResult = await documentationComplianceService.getHealthCheck();
      if (healthResult.success) {
        setServiceHealth(healthResult.data);
      }

      // Load documents
      const documentsResult = await documentationComplianceService.getUserDocuments();
      if (documentsResult.success) {
        setDocuments(documentsResult.data.documents || []);
      } else {
        Alert.alert('Error', 'Failed to load documents');
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

  const handleCreateDocument = async () => {
    try {
      if (!documentForm.title.trim()) {
        Alert.alert('Error', 'Please enter a document title');
        return;
      }

      const result = await documentationComplianceService.createDocument(documentForm);
      if (result.success) {
        Alert.alert('Success', 'Document created successfully');
        setShowCreateModal(false);
        resetForm();
        loadData();
      } else {
        Alert.alert('Error', result.error || 'Failed to create document');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create document');
    }
  };

  const handleSubmitDocument = async (documentId: string) => {
    try {
      const result = await documentationComplianceService.submitDocument(documentId);
      if (result.success) {
        Alert.alert('Success', 'Document submitted for review');
        loadData();
      } else {
        Alert.alert('Error', result.error || 'Failed to submit document');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit document');
    }
  };

  const handleGenerateAI = async () => {
    try {
      const result = await documentationComplianceService.generateDocumentAI({
        document_type: documentForm.document_type,
        context: {
          country: documentForm.country,
          currency: documentForm.currency,
          incoterm: documentForm.incoterm
        }
      });

      if (result.success) {
        Alert.alert('Success', 'AI document generated');
        // You could populate the form with AI-generated content here
      } else {
        Alert.alert('Error', result.error || 'Failed to generate document');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate AI document');
    }
  };

  const resetForm = () => {
    setDocumentForm({
      document_type: 'commercial_invoice',
      title: '',
      country: 'US',
      currency: 'USD',
      incoterm: 'FOB',
      parties: [],
      items: [],
      terms: {},
      totals: {},
      tags: [],
      ai_generated: false
    });
  };

  const renderServiceHealth = () => (
    <View style={styles.healthCard}>
      <View style={styles.healthHeader}>
        <Ionicons name="heart-outline" size={20} color="#10B981" />
        <Text style={styles.healthTitle}>Service Status</Text>
      </View>
      {serviceHealth && (
        <View style={styles.healthStats}>
          <Text style={styles.healthStat}>
            📄 {serviceHealth.document_types} Document Types
          </Text>
          <Text style={styles.healthStat}>
            🌍 {serviceHealth.supported_countries?.length || 0} Countries
          </Text>
          <Text style={styles.healthStat}>
            ✅ {serviceHealth.capabilities?.length || 0} Capabilities
          </Text>
        </View>
      )}
    </View>
  );

  const renderDocumentCard = (document: TradeDocument) => (
    <TouchableOpacity
      key={document._id}
      style={styles.documentCard}
      onPress={() => {
        setSelectedDocument(document);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.documentHeader}>
        <View style={styles.documentTitleRow}>
          <Text style={styles.documentTitle}>{document.title}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: documentationComplianceService.getStatusColor(document.status) }
          ]}>
            <Text style={styles.statusText}>
              {documentationComplianceService.getStatusDisplayName(document.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.documentType}>
          {documentationComplianceService.getDocumentTypeDisplayName(document.document_type)}
        </Text>
      </View>

      <View style={styles.documentMeta}>
        <Text style={styles.metaText}>
          📅 {documentationComplianceService.formatDate(document.created_at)}
        </Text>
        <Text style={styles.metaText}>
          💰 {document.currency} {document.totals?.total || 0}
        </Text>
        <Text style={styles.metaText}>
          📦 v{document.version}
        </Text>
      </View>

      {document.compliance_checks && document.compliance_checks.length > 0 && (
        <View style={styles.complianceChecks}>
          <Text style={styles.complianceTitle}>Compliance Status:</Text>
          <View style={styles.checksList}>
            {document.compliance_checks.slice(0, 3).map((check, index) => (
              <Text key={index} style={styles.checkItem}>
                {documentationComplianceService.getComplianceCheckIcon(check.status)} {check.check_type}
              </Text>
            ))}
          </View>
        </View>
      )}

      <View style={styles.documentActions}>
        {document.status === 'draft' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSubmitDocument(document._id)}
          >
            <Text style={styles.actionButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Document</Text>
          <TouchableOpacity onPress={handleCreateDocument}>
            <Text style={styles.saveButton}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Document Title</Text>
            <TextInput
              style={styles.input}
              value={documentForm.title}
              onChangeText={(text) => setDocumentForm(prev => ({ ...prev, title: text }))}
              placeholder="Enter document title"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Document Type</Text>
            <TouchableOpacity style={styles.picker}>
              <Text style={styles.pickerText}>
                {documentationComplianceService.getDocumentTypeDisplayName(documentForm.document_type)}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Country</Text>
              <TouchableOpacity style={styles.picker}>
                <Text style={styles.pickerText}>{documentForm.country}</Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Currency</Text>
              <TouchableOpacity style={styles.picker}>
                <Text style={styles.pickerText}>{documentForm.currency}</Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Incoterm</Text>
            <TouchableOpacity style={styles.picker}>
              <Text style={styles.pickerText}>{documentForm.incoterm}</Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.aiButton} onPress={handleGenerateAI}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            <Text style={styles.aiButtonText}>Generate with AI</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );

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
          <Text style={styles.modalTitle}>Document Details</Text>
          <View />
        </View>

        {selectedDocument && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>{selectedDocument.title}</Text>
              <Text style={styles.detailSubtitle}>
                {documentationComplianceService.getDocumentTypeDisplayName(selectedDocument.document_type)}
              </Text>
              
              <View style={styles.detailMeta}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: documentationComplianceService.getStatusColor(selectedDocument.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {documentationComplianceService.getStatusDisplayName(selectedDocument.status)}
                  </Text>
                </View>
                <Text style={styles.detailVersion}>Version {selectedDocument.version}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Document Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Currency</Text>
                  <Text style={styles.infoValue}>{selectedDocument.currency}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Created</Text>
                  <Text style={styles.infoValue}>
                    {documentationComplianceService.formatDate(selectedDocument.created_at)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Updated</Text>
                  <Text style={styles.infoValue}>
                    {documentationComplianceService.formatDate(selectedDocument.updated_at)}
                  </Text>
                </View>
              </View>
            </View>

            {selectedDocument.compliance_checks && selectedDocument.compliance_checks.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Compliance Checks</Text>
                {selectedDocument.compliance_checks.map((check, index) => (
                  <View key={index} style={styles.complianceItem}>
                    <Text style={styles.complianceIcon}>
                      {documentationComplianceService.getComplianceCheckIcon(check.status)}
                    </Text>
                    <View style={styles.complianceContent}>
                      <Text style={styles.complianceType}>{check.check_type}</Text>
                      <Text style={styles.complianceMessage}>{check.message}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {selectedDocument.tags && selectedDocument.tags.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {selectedDocument.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documentation Compliance</Text>
        <Text style={styles.headerSubtitle}>International Trade Documents</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderServiceHealth()}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Documents</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading documents...</Text>
            </View>
          ) : documents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Documents Yet</Text>
              <Text style={styles.emptyText}>
                Create your first trade document to get started with compliance management.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.emptyButtonText}>Create Document</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.documentsList}>
              {documents.map(renderDocumentCard)}
            </View>
          )}
        </View>
      </ScrollView>

      {renderCreateModal()}
      {renderDetailModal()}
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
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280'
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
    textAlign: 'center',
    marginBottom: 24
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500'
  },
  documentsList: {
    padding: 16
  },
  documentCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  documentHeader: {
    marginBottom: 12
  },
  documentTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8
  },
  documentType: {
    fontSize: 14,
    color: '#6B7280'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500'
  },
  documentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280'
  },
  complianceChecks: {
    marginBottom: 12
  },
  complianceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4
  },
  checksList: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  checkItem: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 12,
    marginBottom: 2
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500'
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
  formGroup: {
    marginBottom: 16
  },
  formRow: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827'
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12
  },
  pickerText: {
    fontSize: 16,
    color: '#111827'
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    marginTop: 16
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8
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
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12
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
  complianceItem: {
    flexDirection: 'row',
    marginBottom: 12
  },
  complianceIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2
  },
  complianceContent: {
    flex: 1
  },
  complianceType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2
  },
  complianceMessage: {
    fontSize: 12,
    color: '#6B7280'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8
  },
  tagText: {
    fontSize: 12,
    color: '#374151'
  }
});

export default DocumentationComplianceScreen;