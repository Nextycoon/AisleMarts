import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width, height } = Dimensions.get('window');

interface WheelSegment {
  id: number;
  label: string;
  points: number;
  color: string;
  icon: string;
  probability: number;
}

export default function SpinWheelScreen() {
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [showResult, setShowResult] = useState(false);
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  const wheelSegments: WheelSegment[] = [
    { id: 1, label: 'Better Luck', points: 0, color: '#FF6B6B', icon: '😔', probability: 0.3 },
    { id: 2, label: '50 Points', points: 50, color: '#4ECDC4', icon: '🎁', probability: 0.25 },
    { id: 3, label: 'Try Again', points: 0, color: '#45B7D1', icon: '🔄', probability: 0.2 },
    { id: 4, label: '100 Points', points: 100, color: '#96CEB4', icon: '💰', probability: 0.15 },
    { id: 5, label: 'Coupon 5%', points: 0, color: '#FFEAA7', icon: '🎫', probability: 0.08 },
    { id: 6, label: '500 Points', points: 500, color: '#DDA0DD', icon: '💎', probability: 0.015 },
    { id: 7, label: 'Free Item', points: 0, color: '#98D8C8', icon: '🎉', probability: 0.004 },
    { id: 8, label: 'JACKPOT!', points: 2000, color: '#F7DC6F', icon: '🏆', probability: 0.001 },
  ];

  const getRandomResult = () => {
    const random = Math.random();
    let accumulator = 0;
    
    for (const segment of wheelSegments) {
      accumulator += segment.probability;
      if (random <= accumulator) {
        return segment;
      }
    }
    return wheelSegments[0]; // Fallback
  };

  const spinWheel = () => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    const selectedResult = getRandomResult();
    setResult(selectedResult);

    // Calculate rotation to land on the selected segment
    const segmentAngle = 360 / wheelSegments.length;
    const targetAngle = (wheelSegments.indexOf(selectedResult) * segmentAngle) + (segmentAngle / 2);
    const finalRotation = 360 * 5 + targetAngle; // 5 full rotations plus target

    Animated.timing(spinValue, {
      toValue: finalRotation,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      setSpinsLeft(prev => prev - 1);
      showResultAnimation();
    });
  };

  const showResultAnimation = () => {
    setShowResult(true);
    Animated.sequence([
      Animated.timing(resultAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(resultAnim, {
        toValue: 0,
        duration: 300,
        delay: 3000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowResult(false);
    });
  };

  const resetWheel = () => {
    spinValue.setValue(0);
    resultAnim.setValue(0);
    setResult(null);
    setSpinsLeft(3);
    setIsSpinning(false);
    setShowResult(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Spin & Win</Text>
          <TouchableOpacity onPress={resetWheel}>
            <Text style={styles.resetButton}>🔄</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        
        {/* Spins Left Counter */}
        <View style={styles.spinsCounter}>
          <Text style={styles.spinsLabel}>Spins Remaining</Text>
          <View style={styles.spinsDisplay}>
            {[...Array(3)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.spinDot,
                  index < spinsLeft ? styles.activeDot : styles.inactiveDot
                ]}
              />
            ))}
          </View>
          <Text style={styles.spinsText}>Free spins reset daily</Text>
        </View>

        {/* Wheel Container */}
        <View style={styles.wheelContainer}>
          
          {/* Pointer */}
          <View style={styles.pointer}>
            <View style={styles.pointerTriangle} />
          </View>

          {/* Wheel */}
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [{
                  rotate: spinValue.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              },
            ]}
          >
            {wheelSegments.map((segment, index) => {
              const rotation = (360 / wheelSegments.length) * index;
              return (
                <View
                  key={segment.id}
                  style={[
                    styles.segment,
                    {
                      transform: [{ rotate: `${rotation}deg` }],
                      backgroundColor: segment.color,
                    },
                  ]}
                >
                  <View style={styles.segmentContent}>
                    <Text style={styles.segmentIcon}>{segment.icon}</Text>
                    <Text style={styles.segmentText}>{segment.label}</Text>
                    {segment.points > 0 && (
                      <Text style={styles.segmentPoints}>+{segment.points}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </Animated.View>

          {/* Center Circle */}
          <View style={styles.centerCircle}>
            <Text style={styles.centerIcon}>🎰</Text>
          </View>
        </View>

        {/* Spin Button */}
        <TouchableOpacity
          style={[
            styles.spinButton,
            (isSpinning || spinsLeft <= 0) && styles.disabledButton
          ]}
          onPress={spinWheel}
          disabled={isSpinning || spinsLeft <= 0}
        >
          <Text style={styles.spinButtonText}>
            {isSpinning ? 'SPINNING...' : spinsLeft > 0 ? 'SPIN NOW!' : 'NO SPINS LEFT'}
          </Text>
          <Text style={styles.spinButtonSubtext}>
            {spinsLeft > 0 && !isSpinning && 'Tap to spin the wheel'}
          </Text>
        </TouchableOpacity>

        {/* More Spins Info */}
        {spinsLeft === 0 && (
          <View style={styles.noSpinsContainer}>
            <Text style={styles.noSpinsTitle}>🕐 Out of Spins?</Text>
            <Text style={styles.noSpinsText}>Get more spins by:</Text>
            <View style={styles.earnSpinsList}>
              <Text style={styles.earnSpinsItem}>• Make a purchase (+1 spin)</Text>
              <Text style={styles.earnSpinsItem}>• Write a review (+1 spin)</Text>
              <Text style={styles.earnSpinsItem}>• Refer a friend (+3 spins)</Text>
              <Text style={styles.earnSpinsItem}>• Watch daily reset at midnight</Text>
            </View>
          </View>
        )}

      </View>

      {/* Result Animation */}
      {showResult && result && (
        <View style={styles.resultOverlay}>
          <Animated.View
            style={[
              styles.resultContainer,
              {
                opacity: resultAnim,
                transform: [{
                  scale: resultAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                }],
              },
            ]}
          >
            <Text style={styles.resultIcon}>{result.icon}</Text>
            <Text style={styles.resultTitle}>{result.label}</Text>
            {result.points > 0 && (
              <Text style={styles.resultPoints}>+{result.points} Points Earned!</Text>
            )}
            <Text style={styles.resultSubtext}>
              {result.points > 0 ? 'Points added to your account' : 'Try again next time!'}
            </Text>
          </Animated.View>
        </View>
      )}

      <TabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetButton: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  spinsCounter: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  spinsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  spinsDisplay: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  spinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#D4AF37',
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  spinsText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  wheelContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pointer: {
    position: 'absolute',
    top: -10,
    zIndex: 10,
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#D4AF37',
  },
  wheel: {
    width: 280,
    height: 280,
    borderRadius: 140,
    position: 'relative',
    borderWidth: 4,
    borderColor: '#D4AF37',
  },
  segment: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    top: '50%',
    left: '50%',
    transformOrigin: '0% 0%',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  segmentContent: {
    position: 'absolute',
    top: 20,
    left: 10,
    alignItems: 'center',
    transform: [{ rotate: '22.5deg' }],
  },
  segmentIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  segmentText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 1,
  },
  segmentPoints: {
    fontSize: 7,
    fontWeight: '700',
    color: '#000000',
  },
  centerCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  centerIcon: {
    fontSize: 24,
  },
  spinButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#F4E869',
  },
  disabledButton: {
    backgroundColor: '#666666',
    borderColor: '#888888',
  },
  spinButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  spinButtonSubtext: {
    fontSize: 12,
    color: '#333333',
  },
  noSpinsContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  noSpinsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noSpinsText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  earnSpinsList: {
    alignItems: 'flex-start',
  },
  earnSpinsItem: {
    fontSize: 12,
    color: '#D4AF37',
    marginBottom: 4,
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  resultContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
    padding: 40,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultPoints: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
  },
  resultSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});