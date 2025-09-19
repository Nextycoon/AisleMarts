import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function OnboardingLandingScreen() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<Video>(null);

  const handleSignUp = () => {
    console.log('🚀 Sign Up pressed');
    router.push('/onboarding-auth?type=signup');
  };

  const handleSignIn = () => {
    console.log('🔑 Sign In pressed');
    router.push('/onboarding-auth?type=signin');
  };

  const handleVideoPress = () => {
    setShowControls(!showControls);
    setTimeout(() => setShowControls(true), 3000);
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        ref={videoRef}
        style={styles.backgroundVideo}
        source={{
          // Placeholder for promotional video - replace with actual video URL
          uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        }}
        shouldPlay
        isLooping
        isMuted
        resizeMode={ResizeMode.COVER}
        onLoad={() => setIsVideoLoaded(true)}
      />

      {/* Overlay Gradient */}
      <LinearGradient
        colors={['rgba(15,15,35,0.7)', 'rgba(15,15,35,0.4)', 'rgba(15,15,35,0.8)']}
        style={styles.overlay}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>AisleMarts</Text>
            <Text style={styles.tagline}>Luxury Shopping Redefined</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.videoTouchArea}
            onPress={handleVideoPress}
            activeOpacity={1}
          >
            {showControls && (
              <View style={styles.videoControls}>
                <View style={styles.playButton}>
                  <Ionicons name="play" size={24} color="#fff" />
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Hero Text */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Experience the Future of{'\n'}AI-Powered Shopping
            </Text>
            <Text style={styles.heroSubtitle}>
              Meet Aisle, your personal AI shopping assistant powered by ChatGPT-5. 
              Discover products through voice, get personalized recommendations, 
              and shop with unprecedented luxury.
            </Text>

            {/* Features */}
            <View style={styles.features}>
              <View style={styles.feature}>
                <Ionicons name="mic-outline" size={20} color="#EBD6A0" />
                <Text style={styles.featureText}>Voice Shopping</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="sparkles-outline" size={20} color="#EBD6A0" />
                <Text style={styles.featureText}>AI Recommendations</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="diamond-outline" size={20} color="#EBD6A0" />
                <Text style={styles.featureText}>Luxury Experience</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#EBD6A0', '#D4C078']}
              style={styles.buttonGradient}
            >
              <Text style={styles.signUpButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#0f0f23" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>I Already Have an Account</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#EBD6A0',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '300',
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  videoTouchArea: {
    position: 'absolute',
    top: -100,
    left: -24,
    right: -24,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoControls: {
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(235,214,160,0.2)',
    borderWidth: 2,
    borderColor: '#EBD6A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: '#EBD6A0',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomActions: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  signUpButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f0f23',
    marginRight: 8,
  },
  signInButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  bottomInfo: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  bottomInfoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
});