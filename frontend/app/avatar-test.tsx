import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AvatarTestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Choose your Aisle.</Text>
        <Text style={styles.title}>Define your journey.</Text>
        <Text style={styles.subtitle}>Your avatar is your key. It unlocks your path.</Text>
        
        <View style={styles.roleGrid}>
          <View style={styles.roleCard}>
            <Text style={styles.roleTitle}>Buyer</Text>
            <Text style={styles.roleSubtitle}>Discover nearby stock, reserve, pick up fast.</Text>
          </View>
          
          <View style={styles.roleCard}>
            <Text style={styles.roleTitle}>Seller</Text>
            <Text style={styles.roleSubtitle}>List inventory, set pickup windows, grow revenue.</Text>
          </View>
          
          <View style={styles.roleCard}>
            <Text style={styles.roleTitle}>Hybrid</Text>
            <Text style={styles.roleSubtitle}>Shop and sell from one account.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  roleGrid: {
    width: '100%',
    gap: 16,
  },
  roleCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  roleSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});