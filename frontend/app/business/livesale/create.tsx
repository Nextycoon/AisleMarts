import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LiveSaleAPI } from '../../../lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  discount_percent?: number;
  quantity_available: number;
}

export default function CreateLiveSaleScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [duration, setDuration] = useState('60');
  const [maxViewers, setMaxViewers] = useState('100');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const handleCreateLiveSale = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your LiveSale');
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert('Error', 'Please add at least one product to your LiveSale');
      return;
    }

    setLoading(true);
    try {
      const liveSaleData = {
        title: title.trim(),
        description: description.trim(),
        starts_at: scheduledDate.toISOString(),
        duration_minutes: parseInt(duration),
        max_viewers: parseInt(maxViewers),
        thumbnail_url: thumbnailUrl.trim() || null,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        is_private: isPrivate,
        products: selectedProducts.map(product => ({
          product_id: product.id,
          name: product.name,
          original_price: product.price,
          drop_price: product.price * (1 - (product.discount_percent || 0) / 100),
          quantity_available: product.quantity_available
        }))
      };

      const result = await LiveSaleAPI.Business.create(liveSaleData);
      
      Alert.alert(
        'Success!',
        'Your LiveSale has been created successfully',
        [
          {
            text: 'View LiveSale',
            onPress: () => {
              router.replace(`/livesale/${result.id}`);
            }
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setScheduledDate(new Date());
              setDuration('60');
              setMaxViewers('100');
              setThumbnailUrl('');
              setTags('');
              setIsPrivate(false);
              setSelectedProducts([]);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to create LiveSale:', error);
      Alert.alert('Error', 'Failed to create LiveSale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSampleProducts = () => {
    // Add some sample products for demonstration
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        price: 299.99,
        discount_percent: 20,
        quantity_available: 50
      },
      {
        id: '2',
        name: 'Smart Fitness Watch',
        price: 199.99,
        discount_percent: 15,
        quantity_available: 30
      },
      {
        id: '3',
        name: 'Luxury Leather Wallet',
        price: 89.99,
        discount_percent: 25,
        quantity_available: 100
      }
    ];
    setSelectedProducts(sampleProducts);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(scheduledDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setScheduledDate(newDate);
    }
  };

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
        
        <Text style={styles.headerTitle}>Create LiveSale</Text>
        
        <TouchableOpacity
          style={[styles.createButton, { opacity: loading ? 0.5 : 1 }]}
          onPress={handleCreateLiveSale}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter LiveSale title"
                placeholderTextColor="#666"
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your LiveSale event"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thumbnail URL</Text>
              <TextInput
                style={styles.textInput}
                value={thumbnailUrl}
                onChangeText={setThumbnailUrl}
                placeholder="https://example.com/thumbnail.jpg"
                placeholderTextColor="#666"
                keyboardType="url"
              />
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {scheduledDate.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#D4AF37" />
                </TouchableOpacity>
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Time</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Ionicons name="time" size={20} color="#D4AF37" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.textInput}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="60"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Max Viewers</Text>
                <TextInput
                  style={styles.textInput}
                  value={maxViewers}
                  onChangeText={setMaxViewers}
                  placeholder="100"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Products</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addSampleProducts}
              >
                <Ionicons name="add" size={20} color="#D4AF37" />
                <Text style={styles.addButtonText}>Add Sample</Text>
              </TouchableOpacity>
            </View>

            {selectedProducts.length === 0 ? (
              <View style={styles.emptyProducts}>
                <Ionicons name="bag-outline" size={48} color="#666" />
                <Text style={styles.emptyProductsText}>No products added</Text>
                <Text style={styles.emptyProductsSubtext}>
                  Add products to feature in your LiveSale
                </Text>
              </View>
            ) : (
              <View style={styles.productsList}>
                {selectedProducts.map((product, index) => (
                  <View key={product.id} style={styles.productItem}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <View style={styles.productDetails}>
                        <Text style={styles.productPrice}>
                          ${product.price.toFixed(2)}
                        </Text>
                        {product.discount_percent && (
                          <Text style={styles.productDiscount}>
                            -{product.discount_percent}%
                          </Text>
                        )}
                        <Text style={styles.productQuantity}>
                          Qty: {product.quantity_available}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeProduct(product.id)}
                    >
                      <Ionicons name="close" size={20} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Additional Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Settings</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tags (comma separated)</Text>
              <TextInput
                style={styles.textInput}
                value={tags}
                onChangeText={setTags}
                placeholder="fashion, deals, electronics"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Private LiveSale</Text>
                <Text style={styles.switchSubtext}>
                  Only invited viewers can join
                </Text>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: '#333', true: '#D4AF37' }}
                thumbColor={isPrivate ? '#FFFFFF' : '#666'}
              />
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={scheduledDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={scheduledDate}
          mode="time"
          display="default"
          onChange={onTimeChange}
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
  createButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyProductsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptyProductsSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
  productsList: {
    gap: 12,
  },
  productItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productPrice: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  productDiscount: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  productQuantity: {
    color: '#999',
    fontSize: 12,
  },
  removeButton: {
    padding: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  switchSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 2,
  },
  bottomPadding: {
    height: 50,
  },
});