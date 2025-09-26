import { Linking, Platform } from 'react-native';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const LEGAL = {
  privacy: `${process.env.EXPO_PUBLIC_API_URL}/api/legal/privacy-policy`,
  terms: `${process.env.EXPO_PUBLIC_API_URL}/api/legal/terms-of-service`,
};

function open(url: string) {
  // Use in-app webview if you have one; otherwise Linking
  Linking.openURL(url);
}

export default function SettingsLegal() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Legal</Text>

      <TouchableOpacity onPress={() => open(LEGAL.privacy)} style={{ paddingVertical: 14 }}>
        <Text style={{ fontSize: 16 }}>Privacy Policy</Text>
      </TouchableOpacity>

      <View style={{ height: 1, backgroundColor: '#eee' }} />

      <TouchableOpacity onPress={() => open(LEGAL.terms)} style={{ paddingVertical: 14 }}>
        <Text style={{ fontSize: 16 }}>Terms of Service</Text>
      </TouchableOpacity>

      <Text style={{ color: '#888', marginTop: 16, fontSize: 12 }}>
        Last updated links are served from AisleMarts secure endpoints.
      </Text>
    </ScrollView>
  );
}