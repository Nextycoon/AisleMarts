/**
 * 🧪 PERMISSION TESTING SCREEN
 * Test all the beautiful glass-morphism permission screens
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { 
  PermissionScreen,
  CameraPermissionScreen,
  MicrophonePermissionScreen,
  SpeechPermissionScreen,
  PhotosPermissionScreen,
  LocationPermissionScreen,
  NotificationsPermissionScreen
} from '../src/components/PermissionScreens';

export default function TestPermissionsScreen() {
  const [activePermission, setActivePermission] = useState<string | null>(null);

  const permissions = [
    { type: 'camera', icon: 'camera-outline', title: 'Camera Permission', component: CameraPermissionScreen },
    { type: 'microphone', icon: 'mic-outline', title: 'Microphone Permission', component: MicrophonePermissionScreen },
    { type: 'speech', icon: 'musical-notes-outline', title: 'Speech Recognition', component: SpeechPermissionScreen },
    { type: 'photos', icon: 'images-outline', title: 'Photos Permission', component: PhotosPermissionScreen },
    { type: 'location', icon: 'location-outline', title: 'Location Permission', component: LocationPermissionScreen },
    { type: 'notifications', icon: 'notifications-outline', title: 'Notifications Permission', component: NotificationsPermissionScreen },
  ];

  const showPermission = (type: string) => {
    setActivePermission(type);
  };

  const hidePermission = () => {
    setActivePermission(null);
  };

  const handleContinue = () => {
    console.log(`✅ User clicked Continue for ${activePermission}`);
    hidePermission();
  };

  const handleNotNow = () => {
    console.log(`❌ User clicked Not Now for ${activePermission}`);
    hidePermission();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>🧪 Permission Screens Test</Text>
        <Text style={styles.subtitle}>Test all the beautiful glass-morphism permission screens</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {permissions.map((permission) => (
          <TouchableOpacity
            key={permission.type}
            style={styles.testButton}
            onPress={() => showPermission(permission.type)}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Ionicons name={permission.icon as any} size={32} color="#4facfe" />
              <Text style={styles.buttonText}>{permission.title}</Text>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.6)" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dynamic Permission Screen Renderer */}
      {activePermission && (
        <PermissionScreen
          visible={true}
          type={activePermission as any}
          onClose={hidePermission}
          onContinue={handleContinue}
          onNotNow={handleNotNow}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  buttonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 16,
  },
});