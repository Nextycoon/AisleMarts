import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme/theme';

interface ImagePickerRowProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImagePickerRow({ images, onImagesChange, maxImages = 5 }: ImagePickerRowProps) {
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageBase64 = `data:image/jpeg;base64,${asset.base64}`;
        
        if (images.length < maxImages) {
          onImagesChange([...images, imageBase64]);
        } else {
          Alert.alert('Limit reached', `You can only add up to ${maxImages} images`);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <View style={{
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.sm,
      padding: theme.space.md,
      marginBottom: theme.space.sm
    }}>
      <Text style={{
        color: theme.colors.text,
        fontWeight: '600',
        marginBottom: theme.space.sm
      }}>
        Product Images ({images.length}/{maxImages})
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
        {images.map((uri, index) => (
          <View key={index} style={{ position: 'relative' }}>
            <Image 
              source={{ uri }} 
              style={{
                width: 64,
                height: 64,
                borderRadius: theme.radius.sm
              }} 
            />
            <TouchableOpacity
              onPress={() => removeImage(index)}
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: theme.colors.warning,
                borderRadius: 12,
                width: 24,
                height: 24,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {images.length < maxImages && (
          <TouchableOpacity
            onPress={pickImage}
            style={{
              width: 64,
              height: 64,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.textDim + '20',
              borderWidth: 2,
              borderColor: theme.colors.textDim,
              borderStyle: 'dashed',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{
              color: theme.colors.primary,
              fontSize: 24,
              fontWeight: 'bold'
            }}>
              +
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}