/**
 * Phase 3: Nearby/Onsite Commerce - Barcode Scanner Modal
 * QR/Barcode scanning for instant product lookup and nearby offers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');
const API_BASE = Constants.expoConfig?.extra?.BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

interface ScanResult {
  barcode: string;
  resolved?: {
    gtin?: string;
    title?: string;
  };
  offers: Array<{
    sku: string;
    qty: number;
    price: {
      amount: number;
      currency: string;
    };
    location_id: string;
    distance_m: number;
  }>;
  best_offer?: {
    sku: string;
    price: {
      amount: number;
      currency: string;
    };
  };
  diagnostics: {
    latency_ms: number;
    offers_found: number;
  };
}

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setScanning(true);

    try {
      // Call backend scan API
      const response = await fetch(`${API_BASE}/api/v1/nearby/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcode: data,
          // TODO: Add user location if available
        }),
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const result: ScanResult = await response.json();
      setScanResult(result);

      if (result.offers.length > 0) {
        Alert.alert(
          'Product Found! 🎉',
          `Found ${result.offers.length} offer${result.offers.length > 1 ? 's' : ''} nearby`,
          [
            { text: 'Scan Again', onPress: resetScanner },
            { text: 'View Offers', onPress: () => showOffers(result) }
          ]
        );
      } else {
        Alert.alert(
          'No Offers Found',
          'This product is not available at nearby locations.',
          [
            { text: 'Try Again', onPress: resetScanner }
          ]
        );
      }
    } catch (error) {
      console.error('Scan processing error:', error);
      Alert.alert(
        'Scan Error',
        'Failed to process barcode. Please try again.',
        [{ text: 'Try Again', onPress: resetScanner }]
      );
    } finally {
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanResult(null);
  };

  const showOffers = (result: ScanResult) => {
    // Navigate to offers screen with result data
    // For now, just show in alert
    const bestOffer = result.best_offer;
    if (bestOffer) {
      const price = formatPrice(bestOffer.price.amount, bestOffer.price.currency);
      Alert.alert(
        'Best Offer',
        `${result.resolved?.title || 'Product'}\nBest Price: ${price}`,
        [
          { text: 'Reserve', onPress: () => router.push('/nearby') },
          { text: 'Close', onPress: resetScanner }
        ]
      );
    }
  };

  const formatPrice = (amount: number, currency: string = 'KES') => {
    if (currency === 'KES') {
      return `KSh ${(amount / 100).toLocaleString()}`;
    }
    return `${currency} ${(amount / 100).toFixed(2)}`;
  };

  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContainer}>
          <Ionicons name="camera-off" size={64} color="#666" />
          <Text style={styles.errorText}>Camera access is required for scanning</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Scan Product</Text>
        
        <TouchableOpacity onPress={toggleTorch}>
          <Ionicons 
            name={torchOn ? "flash" : "flash-off"} 
            size={28} 
            color={torchOn ? "#FFD700" : "white"} 
          />
        </TouchableOpacity>
      </View>

      {/* Scanner */}
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
          torchMode={torchOn ? 'on' : 'off'}
        />
        
        {/* Scanning overlay */}
        <View style={styles.overlay}>
          <View style={styles.scannerFrame}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Scanning animation */}
            {!scanned && (
              <View style={styles.scanLine} />
            )}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            {scanning 
              ? 'Processing barcode...' 
              : scanned 
                ? 'Barcode scanned successfully!'
                : 'Point camera at barcode or QR code'
            }
          </Text>
          
          {scanning && (
            <ActivityIndicator size="small" color="white" style={styles.scanningIndicator} />
          )}
        </View>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomContainer}>
        {scanned && !scanning && (
          <TouchableOpacity style={styles.button} onPress={resetScanner}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.tipText}>
          💡 Tip: Scan barcodes to find the best nearby prices instantly
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#007AFF',
    opacity: 0.8,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scanningIndicator: {
    marginTop: 12,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});