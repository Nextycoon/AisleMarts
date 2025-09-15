import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ImagePickerRow from '../components/ImagePickerRow';
import VariantRow, { Variant } from '../components/VariantRow';
import { theme } from '../theme/theme';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function ProductEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const editing = !!id;
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(editing);

  useEffect(() => {
    if (editing && id) {
      loadProduct(id as string);
    }
  }, [editing, id]);

  const addVariant = () => {
    const newVariant: Variant = {
      id: Date.now().toString(),
      name: '',
      sku: '',
      priceDelta: 0,
      stock: 0
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (id: string, updatedVariant: Variant) => {
    setVariants(variants.map(v => v.id === id ? updatedVariant : v));
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const loadProduct = async (productId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/seller/products/${productId}`);
      if (response.data.success) {
        const product = response.data.product;
        setTitle(product.title || '');
        setPrice(product.price?.toString() || '');
        setStock(product.stock?.toString() || '');
        setSku(product.sku || '');
        setDescription(product.description || '');
        setCategory(product.category || '');
      }
    } catch (error) {
      console.error('Load product error:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoadingProduct(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Product title is required');
      return false;
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Validation Error', 'Valid price is required');
      return false;
    }
    if (!stock.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
      Alert.alert('Validation Error', 'Valid stock quantity is required');
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const productData = {
        title: title.trim(),
        price: Number(price),
        stock: Number(stock),
        sku: sku.trim() || undefined,
        description: description.trim() || undefined,
        category: category.trim() || undefined
      };

      let response;
      if (editing) {
        response = await axios.put(`${API_BASE_URL}/api/seller/products/${id}`, productData);
      } else {
        response = await axios.post(`${API_BASE_URL}/api/seller/products`, productData);
      }

      if (response.data.success) {
        Alert.alert(
          'Success', 
          editing ? 'Product updated successfully' : 'Product created successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.response?.data?.detail || 'Failed to save product';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: theme.colors.textDim }}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView style={{ flex: 1, padding: theme.space.md }}>
        {/* Header */}
        <View style={{ marginBottom: theme.space.lg }}>
          <Text style={{
            color: theme.colors.text, 
            fontSize: 24, 
            fontWeight: '800'
          }}>
            {editing ? 'Edit Product' : 'Add Product'}
          </Text>
          <Text style={{
            color: theme.colors.textDim, 
            marginTop: 4
          }}>
            {editing ? 'Update product details' : 'Create a new product for your store'}
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: theme.space.md }}>
          <View>
            <Text style={{
              color: theme.colors.text, 
              fontWeight: '600',
              marginBottom: 8
            }}>
              Product Title *
            </Text>
            <TextInput 
              placeholder="Enter product title" 
              placeholderTextColor={theme.colors.textDim} 
              value={title} 
              onChangeText={setTitle} 
              style={{
                backgroundColor: theme.colors.card, 
                color: theme.colors.text, 
                borderRadius: theme.radius.sm, 
                padding: theme.space.md,
                fontSize: 16
              }} 
            />
          </View>

          <View>
            <Text style={{
              color: theme.colors.text, 
              fontWeight: '600',
              marginBottom: 8
            }}>
              Price (KES) *
            </Text>
            <TextInput 
              placeholder="0.00" 
              keyboardType="decimal-pad" 
              placeholderTextColor={theme.colors.textDim} 
              value={price} 
              onChangeText={setPrice} 
              style={{
                backgroundColor: theme.colors.card, 
                color: theme.colors.text, 
                borderRadius: theme.radius.sm, 
                padding: theme.space.md,
                fontSize: 16
              }} 
            />
          </View>

          <View>
            <Text style={{
              color: theme.colors.text, 
              fontWeight: '600',
              marginBottom: 8
            }}>
              Stock Quantity *
            </Text>
            <TextInput 
              placeholder="0" 
              keyboardType="number-pad" 
              placeholderTextColor={theme.colors.textDim} 
              value={stock} 
              onChangeText={setStock} 
              style={{
                backgroundColor: theme.colors.card, 
                color: theme.colors.text, 
                borderRadius: theme.radius.sm, 
                padding: theme.space.md,
                fontSize: 16
              }} 
            />
          </View>

          <View>
            <Text style={{
              color: theme.colors.text, 
              fontWeight: '600',
              marginBottom: 8
            }}>
              SKU (Optional)
            </Text>
            <TextInput 
              placeholder="Product SKU" 
              placeholderTextColor={theme.colors.textDim} 
              value={sku} 
              onChangeText={setSku} 
              style={{
                backgroundColor: theme.colors.card, 
                color: theme.colors.text, 
                borderRadius: theme.radius.sm, 
                padding: theme.space.md,
                fontSize: 16
              }} 
            />
          </View>

          <View>
            <Text style={{
              color: theme.colors.text, 
              fontWeight: '600',
              marginBottom: 8
            }}>
              Category (Optional)
            </Text>
            <TextInput 
              placeholder="Product category" 
              placeholderTextColor={theme.colors.textDim} 
              value={category} 
              onChangeText={setCategory} 
              style={{
                backgroundColor: theme.colors.card, 
                color: theme.colors.text, 
                borderRadius: theme.radius.sm, 
                padding: theme.space.md,
                fontSize: 16
              }} 
            />
          </View>

          <View>
            <Text style={{
              color: theme.colors.text, 
              fontWeight: '600',
              marginBottom: 8
            }}>
              Description (Optional)
            </Text>
            <TextInput 
              placeholder="Product description" 
              placeholderTextColor={theme.colors.textDim} 
              value={description} 
              onChangeText={setDescription} 
              multiline 
              numberOfLines={4} 
              style={{
                backgroundColor: theme.colors.card, 
                color: theme.colors.text, 
                borderRadius: theme.radius.sm, 
                padding: theme.space.md, 
                minHeight: 100,
                fontSize: 16,
                textAlignVertical: 'top'
              }} 
            />
          </View>

          {/* Product Images */}
          <View>
            <Text style={{
              color: theme.colors.text, 
              fontWeight: '600',
              marginBottom: 8
            }}>
              Product Images
            </Text>
            <ImagePickerRow
              images={images}
              onImagesChange={setImages}
              maxImages={5}
            />
          </View>
        </View>

        {/* Product Variants */}
        <View style={{ marginTop: theme.space.lg }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.space.md
          }}>
            <View>
              <Text style={{
                color: theme.colors.text,
                fontWeight: '700',
                fontSize: 18
              }}>
                Product Variants
              </Text>
              <Text style={{
                color: theme.colors.textDim,
                fontSize: 14,
                marginTop: 2
              }}>
                Add variations like size, color, or specifications
              </Text>
            </View>
            <TouchableOpacity 
              onPress={addVariant}
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: theme.space.md,
                paddingVertical: theme.space.sm,
                borderRadius: theme.radius.sm
              }}
            >
              <Text style={{
                color: 'white',
                fontWeight: '600',
                fontSize: 14
              }}>
                + Add Variant
              </Text>
            </TouchableOpacity>
          </View>

          {variants.length === 0 ? (
            <View style={{
              backgroundColor: theme.colors.card,
              borderRadius: theme.radius.md,
              padding: theme.space.lg,
              alignItems: 'center',
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: theme.colors.textDim + '40'
            }}>
              <Text style={{
                color: theme.colors.textDim,
                fontSize: 16,
                textAlign: 'center'
              }}>
                No variants yet{'\n'}
                Add variants for different sizes, colors, or specifications
              </Text>
            </View>
          ) : (
            variants.map(variant => (
              <VariantRow
                key={variant.id}
                variant={variant}
                onChange={(updatedVariant) => updateVariant(variant.id, updatedVariant)}
                onRemove={() => removeVariant(variant.id)}
              />
            ))
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          onPress={save}
          disabled={loading}
          style={{
            marginTop: theme.space.lg,
            marginBottom: theme.space.xl,
            backgroundColor: loading ? theme.colors.textDim : theme.colors.primary, 
            padding: theme.space.md, 
            borderRadius: theme.radius.md, 
            alignItems: 'center'
          }}
        >
          <Text style={{
            color: 'white', 
            fontWeight: '700',
            fontSize: 16
          }}>
            {loading ? 
              (editing ? 'Updating...' : 'Creating...') : 
              (editing ? 'Save Changes' : 'Create Product')
            }
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}