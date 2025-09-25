import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://aislemarts.preview.emergentagent.com';

interface RFQFormData {
  title: string;
  category: string;
  description: string;
  quantity: string;
  targetPrice: string;
  currency: string;
  shippingDestination: string;
  specifications: {
    material: string;
    dimensions: string;
    color: string;
    customization: string;
    packaging: string;
    deliveryTerms: string;
    paymentTerms: string;
    sampleRequired: boolean;
  };
}

const categories = [
  { label: 'Select Category', value: '' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Home & Garden', value: 'home_garden' },
  { label: 'Machinery', value: 'machinery' },
  { label: 'Chemicals', value: 'chemicals' },
  { label: 'Textiles', value: 'textiles' },
  { label: 'Automotive', value: 'automotive' },
  { label: 'Packaging', value: 'packaging' },
];

export default function CreateRFQScreen() {
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [formData, setFormData] = useState<RFQFormData>({
    title: '',
    category: '',
    description: '',
    quantity: '',
    targetPrice: '',
    currency: 'USD',
    shippingDestination: '',
    specifications: {
      material: '',
      dimensions: '',
      color: '',
      customization: '',
      packaging: '',
      deliveryTerms: '',
      paymentTerms: '',
      sampleRequired: false,
    },
  });

  const updateField = (field: keyof RFQFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSpecification = (field: keyof RFQFormData['specifications'], value: any) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [field]: value }
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your RFQ');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!formData.quantity || isNaN(Number(formData.quantity))) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return false;
    }
    if (!formData.shippingDestination.trim()) {
      Alert.alert('Error', 'Please enter shipping destination');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        specifications: formData.specifications,
        quantity: parseInt(formData.quantity),
        target_price: formData.targetPrice ? parseFloat(formData.targetPrice) : null,
        currency: formData.currency,
        shipping_destination: formData.shippingDestination,
        attachments: []
      };

      const response = await fetch(`${API_BASE}/api/b2b/rfq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert(
          'Success!', 
          'Your RFQ has been created successfully. Suppliers will start submitting quotes shortly.',
          [
            {
              text: 'View RFQ',
              onPress: () => router.push(`/b2b/rfq/${result.rfq.id}`)
            },
            {
              text: 'Create Another',
              onPress: () => {
                // Reset form
                setFormData({
                  title: '',
                  category: '',
                  description: '',
                  quantity: '',
                  targetPrice: '',
                  currency: 'USD',
                  shippingDestination: '',
                  specifications: {
                    material: '',
                    dimensions: '',
                    color: '',
                    customization: '',
                    packaging: '',
                    deliveryTerms: '',
                    paymentTerms: '',
                    sampleRequired: false,
                  },
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.detail || 'Failed to create RFQ. Please try again.');
      }
    } catch (error) {
      console.error('RFQ creation error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create RFQ</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => updateField('title', value)}
                placeholder="e.g., Custom Bluetooth Speakers - 5000 Units"
                maxLength={200}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={[styles.categoryText, !formData.category && styles.placeholderText]}>
                  {formData.category 
                    ? categories.find(cat => cat.value === formData.category)?.label
                    : 'Select Category'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder="Detailed description of your requirements..."
                multiline
                numberOfLines={4}
                maxLength={2000}
              />
              <Text style={styles.charCount}>{formData.description.length}/2000</Text>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.quantity}
                  onChangeText={(value) => updateField('quantity', value)}
                  placeholder="e.g., 5000"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Target Price</Text>
                <TextInput
                  style={styles.input}
                  value={formData.targetPrice}
                  onChangeText={(value) => updateField('targetPrice', value)}
                  placeholder="e.g., 15.50"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shipping Destination *</Text>
              <TextInput
                style={styles.input}
                value={formData.shippingDestination}
                onChangeText={(value) => updateField('shippingDestination', value)}
                placeholder="e.g., Los Angeles, CA, USA"
              />
            </View>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Specifications</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Material</Text>
              <TextInput
                style={styles.input}
                value={formData.specifications.material}
                onChangeText={(value) => updateSpecification('material', value)}
                placeholder="e.g., Plastic + Fabric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dimensions</Text>
              <TextInput
                style={styles.input}
                value={formData.specifications.dimensions}
                onChangeText={(value) => updateSpecification('dimensions', value)}
                placeholder="e.g., 15cm x 8cm x 8cm"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color Options</Text>
              <TextInput
                style={styles.input}
                value={formData.specifications.color}
                onChangeText={(value) => updateSpecification('color', value)}
                placeholder="e.g., Black, White, Navy Blue"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customization Requirements</Text>
              <TextInput
                style={styles.input}
                value={formData.specifications.customization}
                onChangeText={(value) => updateSpecification('customization', value)}
                placeholder="e.g., Logo embossing + custom packaging"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Packaging Requirements</Text>
              <TextInput
                style={styles.input}
                value={formData.specifications.packaging}
                onChangeText={(value) => updateSpecification('packaging', value)}
                placeholder="e.g., Individual gift boxes"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Delivery Terms</Text>
                <TextInput
                  style={styles.input}
                  value={formData.specifications.deliveryTerms}
                  onChangeText={(value) => updateSpecification('deliveryTerms', value)}
                  placeholder="e.g., FOB Shanghai"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Payment Terms</Text>
                <TextInput
                  style={styles.input}
                  value={formData.specifications.paymentTerms}
                  onChangeText={(value) => updateSpecification('paymentTerms', value)}
                  placeholder="e.g., 30% deposit, 70% before shipping"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateSpecification('sampleRequired', !formData.specifications.sampleRequired)}
            >
              <View style={[styles.checkbox, formData.specifications.sampleRequired && styles.checkboxChecked]}>
                {formData.specifications.sampleRequired && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Sample required before bulk order</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="white" />
                <Text style={styles.submitButtonText}>Create RFQ</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#667eea',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  submitContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});