import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function OnboardingAuthScreen() {
  const { type } = useLocalSearchParams<{ type: 'signin' | 'signup' }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isSignUp = type === 'signup';

  const handleSocialAuth = (provider: string) => {
    console.log(`🔗 ${provider} authentication pressed`);
    Alert.alert(
      `${provider} Authentication`,
      `This would integrate with ${provider} authentication. For demo purposes, we'll proceed to permissions.`,
      [
        {
          text: 'Continue',
          onPress: () => router.push('/onboarding-permissions')
        }
      ]
    );
  };

  const handleEmailAuth = () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    console.log(`📧 Email ${isSignUp ? 'sign up' : 'sign in'} pressed`);
    Alert.alert(
      'Authentication',
      `${isSignUp ? 'Account created' : 'Signed in'} successfully! Welcome to AisleMarts.`,
      [
        {
          text: 'Continue',
          onPress: () => router.push('/onboarding-permissions')
        }
      ]
    );
  };

  const handleBackToLanding = () => {
    router.back();
  };

  const switchAuthMode = () => {
    const newType = isSignUp ? 'signin' : 'signup';
    router.setParams({ type: newType });
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a3a', '#2d2d5f']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLanding}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#EBD6A0" />
            </TouchableOpacity>
            
            <View style={styles.titleSection}>
              <Text style={styles.title}>
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </Text>
              <Text style={styles.subtitle}>
                {isSignUp 
                  ? 'Join AisleMarts and start your luxury shopping journey'
                  : 'Sign in to continue your shopping experience'
                }
              </Text>
            </View>
          </View>

          {/* Social Authentication */}
          <View style={styles.socialSection}>
            <Text style={styles.sectionTitle}>Continue with</Text>
            
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialAuth('Apple')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-apple" size={20} color="#000" />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={() => handleSocialAuth('Google')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color="#fff" />
              <Text style={[styles.socialButtonText, { color: '#fff' }]}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.facebookButton]}
              onPress={() => handleSocialAuth('Facebook')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-facebook" size={20} color="#fff" />
              <Text style={[styles.socialButtonText, { color: '#fff' }]}>Continue with Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.twitterButton]}
              onPress={() => handleSocialAuth('Twitter')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-twitter" size={20} color="#fff" />
              <Text style={[styles.socialButtonText, { color: '#fff' }]}>Continue with Twitter</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Authentication */}
          <View style={styles.emailSection}>
            <Text style={styles.sectionTitle}>Continue with Email</Text>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9FE7F5" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Full Name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#9FE7F5" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email Address"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9FE7F5" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#9FE7F5" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmailAuth}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#EBD6A0', '#D4C078']}
                style={styles.emailButtonGradient}
              >
                <Text style={styles.emailButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Switch Auth Mode */}
          <View style={styles.switchSection}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={switchAuthMode}>
              <Text style={styles.switchLink}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(235,214,160,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#EBD6A0',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  socialSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 48,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  twitterButton: {
    backgroundColor: '#1DA1F2',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 16,
  },
  emailSection: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 16,
  },
  passwordToggle: {
    padding: 4,
  },
  emailButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  emailButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f0f23',
  },
  switchSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 4,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EBD6A0',
  },
  termsSection: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#9FE7F5',
    textDecorationLine: 'underline',
  },
});