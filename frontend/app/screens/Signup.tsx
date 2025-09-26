import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, TextInput, ScrollView, StyleSheet } from 'react-native';

const PRIV_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/legal/privacy-policy`;
const TOS_URL  = `${process.env.EXPO_PUBLIC_API_URL}/api/legal/terms-of-service`;

export default function Signup() {
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignup = () => {
    if (!agreed) return;
    // TODO: Implement signup logic
    console.log('Signup:', { name, email, password });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join AisleMarts and start shopping or selling</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Create a secure password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        onPress={() => setAgreed(a => !a)}
        style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          { 
            borderColor: agreed ? '#111' : '#aaa',
            backgroundColor: agreed ? '#111' : 'transparent' 
          }
        ]}>
          {agreed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxText}>
          I agree to the{' '}
          <Text 
            style={styles.linkText} 
            onPress={() => Linking.openURL(TOS_URL)}
          >
            Terms
          </Text>
          {' & '}
          <Text 
            style={styles.linkText} 
            onPress={() => Linking.openURL(PRIV_URL)}
          >
            Privacy
          </Text>
          .
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={!agreed}
        onPress={handleSignup}
        style={[
          styles.ctaButton,
          { opacity: agreed ? 1 : 0.5 }
        ]}>
        <Text style={styles.ctaButtonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink}>
        <Text style={styles.loginLinkText}>
          Already have an account? <Text style={styles.linkText}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#007AFF',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  ctaButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  },
});