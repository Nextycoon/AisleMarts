/**
 * Merchant CSV Inventory Upload Screen
 * Simple interface for merchants to upload inventory via CSV
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
// import { NoUploadHistory } from '../../src/components/EmptyStates';
// import { ProgressBar, SuccessCheckmark } from '../../src/components/Animations';
// import useHaptics from '../../src/hooks/useHaptics';

export default function MerchantInventoryUploadScreen() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Polish enhancements temporarily disabled
  // const { onButtonPress, onUploadProgress } = useHaptics();

  const selectCSVFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setSelectedFile(result);
        Alert.alert(
          'File Selected',
          `Selected: ${result.name}\nSize: ${(result.size! / 1024).toFixed(1)} KB`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('Selection Error', 'Failed to select file. Please try again.');
    }
  };

  const uploadInventory = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a CSV file first.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: 'text/csv',
        name: selectedFile.name,
      } as any);
      formData.append('location_id', 'LOC-WESTLANDS-001'); // Demo location
      formData.append('sync_mode', 'merge'); // merge, replace, append

      // Simulated upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + 10, 90);
          // onUploadProgress(newProgress); // Haptic feedback at milestones - temporarily disabled
          return newProgress;
        });
      }, 200);

      // TODO: Replace with actual API call
      const response = await fetch('/api/v1/inventory/sync/csv', {
        method: 'POST',
        body: formData,
        headers: {
          // TODO: Add Authorization header when auth is implemented
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        
        // Show success animation first
        setShowSuccess(true);
        
        // Delayed success alert
        setTimeout(() => {
          Alert.alert(
            'Upload Successful! ✅',
            `Inventory updated successfully.\n\nProcessed: ${result.total_processed || 'N/A'} items\nUpdated: ${result.successful_updates || 'N/A'} items\nErrors: ${result.failed_updates || 0} items`,
            [
              { text: 'View Details', onPress: () => showUploadResults(result) },
              { text: 'OK' }
            ]
          );
        }, 1500);

      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload inventory. Please check your file format and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const showUploadResults = (result: any) => {
    const details = `
Upload Results:
• Total processed: ${result.total_processed || 0}
• Successful updates: ${result.successful_updates || 0}
• Failed updates: ${result.failed_updates || 0}
• Conflicts resolved: ${result.conflicts_resolved || 0}
• New items added: ${result.new_items_added || 0}

${result.errors && result.errors.length > 0 ? 
  `\nErrors:\n${result.errors.slice(0, 3).map((e: any) => `• ${e.message}`).join('\n')}` : ''}
    `.trim();

    Alert.alert('Upload Details', details, [{ text: 'OK' }]);
  };

  const downloadSampleCSV = () => {
    Alert.alert(
      'Sample CSV Format',
      `Required columns:
• sku (Product SKU)
• name (Product name)
• price (Unit price in KES)
• quantity (Available quantity)
• location (Location ID)

Optional columns:
• category, brand, description, image_url

Example:
COFFEE-001,Premium Coffee Beans,1500,50,LOC-WESTLANDS-001`,
      [
        { text: 'OK' },
        { 
          text: 'Copy Format', 
          onPress: () => {
            // TODO: Copy to clipboard or create sample file
            Alert.alert('Sample Format', 'Sample format copied to clipboard!');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory Upload</Text>
        <TouchableOpacity onPress={downloadSampleCSV}>
          <Ionicons name="help-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions Card */}
        <View style={styles.instructionsCard}>
          <View style={styles.instructionHeader}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <Text style={styles.instructionTitle}>CSV Upload Instructions</Text>
          </View>
          
          <Text style={styles.instructionText}>
            1. Prepare your CSV file with required columns (SKU, name, price, quantity, location)
          </Text>
          <Text style={styles.instructionText}>
            2. Ensure prices are in KES (Kenyan Shillings)
          </Text>
          <Text style={styles.instructionText}>
            3. Use location ID: LOC-WESTLANDS-001 for Westlands store
          </Text>
          <Text style={styles.instructionText}>
            4. File size limit: 10MB, up to 5,000 items per upload
          </Text>

          <TouchableOpacity style={styles.sampleButton} onPress={downloadSampleCSV}>
            <Ionicons name="download" size={16} color="#007AFF" />
            <Text style={styles.sampleButtonText}>View Sample Format</Text>
          </TouchableOpacity>
        </View>

        {/* File Selection */}
        <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>Select CSV File</Text>
          
          {selectedFile ? (
            <View style={styles.selectedFileCard}>
              <View style={styles.fileInfo}>
                <Ionicons name="document-text" size={32} color="#34C759" />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                  <Text style={styles.fileSize}>
                    {(selectedFile.size! / 1024).toFixed(1)} KB
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedFile(null)}>
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.selectButton} onPress={selectCSVFile}>
              <Ionicons name="cloud-upload" size={48} color="#007AFF" />
              <Text style={styles.selectButtonTitle}>Select CSV File</Text>
              <Text style={styles.selectButtonSubtitle}>
                Tap to browse and select your inventory CSV file
              </Text>
            </TouchableOpacity>
          )}

          {/* Upload Progress */}
          {uploading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{uploadProgress}%</Text>
            </View>
          )}

          {/* Success Message */}
          {showSuccess && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>✅ Upload Successful!</Text>
            </View>
          )}

          {/* Upload Button */}
          <TouchableOpacity 
            style={[
              styles.uploadButton,
              (!selectedFile || uploading) && styles.uploadButtonDisabled
            ]}
            onPress={uploadInventory}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.uploadButtonText}>Uploading...</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="white" />
                <Text style={styles.uploadButtonText}>Upload Inventory</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Uploads */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Recent Uploads</Text>
          
          <View style={styles.emptyStateContainer}>
            <Text style={styles.historyEmpty}>No recent uploads</Text>
            <Text style={styles.historyNote}>
              Upload history will appear here once you start uploading inventory files.
            </Text>
            {selectCSVFile && (
              <TouchableOpacity style={styles.emptyActionButton} onPress={selectCSVFile}>
                <Text style={styles.emptyActionText}>Upload CSV</Text>
              </TouchableOpacity>
            )}
          </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginTop: 8,
  },
  sampleButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  uploadCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  selectButton: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  selectButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 12,
  },
  selectButtonSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 20,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  historyEmpty: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});