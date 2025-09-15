import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ImagePickerRow from '../components/ImagePickerRow';
import { theme } from '../theme/theme';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function StoreProfileEditor() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [mpesaPaybill, setMpesaPaybill] = useState('');
  const [mpesaTill, setMpesaTill] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // For now, use mock data since profile API isn't implemented yet
      setTimeout(() => {
        setStoreName('My Awesome Store');
        setContactEmail('seller@example.com');
        setContactPhone('+254712345678');
        setMpesaPaybill('123456');
        setDescription('We sell amazing products in Kenya');
        setAddress('Nairobi, Kenya');
        setLoadingProfile(false);
      }, 1000);
    } catch (error) {
      console.error('Load profile error:', error);
      setLoadingProfile(false);
    }
  };

  const validateForm = () => {
    if (!storeName.trim()) {
      Alert.alert('Validation Error', 'Store name is required');
      return false;
    }
    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      Alert.alert('Validation Error', 'Valid email is required');
      return false;
    }
    if (!contactPhone.trim() || !contactPhone.startsWith('+254')) {
      Alert.alert('Validation Error', 'Valid Kenyan phone number (+254...) is required');
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const profileData = {
        store_name: storeName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        mpesa_paybill: mpesaPaybill.trim() || null,
        mpesa_till: mpesaTill.trim() || null,
        description: description.trim() || null,
        address: address.trim() || null,
        logo: logo.length > 0 ? logo[0] : null
      };

      // Mock success for now
      setTimeout(() => {
        Alert.alert(
          'Success',
          'Store profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
        setLoading(false);
      }, 1500);

      // TODO: Implement when profile API is ready
      // const response = await axios.put(`${API_BASE_URL}/api/seller/profile`, profileData);
      
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.response?.data?.detail || 'Failed to save profile';
      Alert.alert('Error', errorMessage);
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: theme.colors.textDim }}>Loading profile...</Text>
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
            Store Profile
          </Text>
          <Text style={{
            color: theme.colors.textDim,
            marginTop: 4
          }}>
            Manage your store information and payment details
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
              Store Name *
            </Text>
            <TextInput
              placeholder="Your store name"
              placeholderTextColor={theme.colors.textDim}
              value={storeName}
              onChangeText={setStoreName}
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
              Contact Email *
            </Text>
            <TextInput
              placeholder="contact@yourstore.com"
              keyboardType="email-address"
              placeholderTextColor={theme.colors.textDim}
              value={contactEmail}
              onChangeText={setContactEmail}
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
              Contact Phone *
            </Text>
            <TextInput
              placeholder="+254712345678"
              keyboardType="phone-pad"
              placeholderTextColor={theme.colors.textDim}
              value={contactPhone}
              onChangeText={setContactPhone}
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
              Store Address
            </Text>
            <TextInput
              placeholder="Nairobi, Kenya"
              placeholderTextColor={theme.colors.textDim}
              value={address}
              onChangeText={setAddress}
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
              Store Description
            </Text>
            <TextInput
              placeholder="Tell customers about your store..."
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

          {/* M-Pesa Payment Details */}
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.md,
            padding: theme.space.md,
            borderWidth: 2,
            borderColor: theme.colors.success + '30'
          }}>
            <Text style={{
              color: theme.colors.text,
              fontWeight: '700',
              fontSize: 16,
              marginBottom: theme.space.sm
            }}>
              💚 M-Pesa Payment Details
            </Text>
            <Text style={{
              color: theme.colors.textDim,
              marginBottom: theme.space.md,
              fontSize: 14
            }}>
              Add your M-Pesa details to receive payments directly
            </Text>

            <View style={{ gap: theme.space.sm }}>
              <View>
                <Text style={{
                  color: theme.colors.text,
                  fontWeight: '600',
                  marginBottom: 4
                }}>
                  M-Pesa Paybill Number
                </Text>
                <TextInput
                  placeholder="123456"
                  keyboardType="number-pad"
                  placeholderTextColor={theme.colors.textDim}
                  value={mpesaPaybill}
                  onChangeText={setMpesaPaybill}
                  style={{
                    backgroundColor: theme.colors.bg,
                    color: theme.colors.text,
                    borderRadius: theme.radius.sm,
                    padding: theme.space.sm,
                    fontSize: 16
                  }}
                />
              </View>

              <View>
                <Text style={{
                  color: theme.colors.text,
                  fontWeight: '600',
                  marginBottom: 4
                }}>
                  M-Pesa Till Number
                </Text>
                <TextInput
                  placeholder="654321"
                  keyboardType="number-pad"
                  placeholderTextColor={theme.colors.textDim}
                  value={mpesaTill}
                  onChangeText={setMpesaTill}
                  style={{
                    backgroundColor: theme.colors.bg,
                    color: theme.colors.text,
                    borderRadius: theme.radius.sm,
                    padding: theme.space.sm,
                    fontSize: 16
                  }}
                />
              </View>
            </View>
          </View>

          {/* Store Logo */}
          <View>
            <Text style={{
              color: theme.colors.text,
              fontWeight: '600',
              marginBottom: 8
            }}>
              Store Logo
            </Text>
            <ImagePickerRow
              images={logo}
              onImagesChange={setLogo}
              maxImages={1}
            />
          </View>
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
            {loading ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}