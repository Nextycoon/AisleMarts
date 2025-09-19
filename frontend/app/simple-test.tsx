import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';

export default function SimpleTestScreen() {
  const [count, setCount] = useState(0);

  const handleButtonPress = () => {
    console.log('Button pressed!');
    setCount(count + 1);
    
    Alert.alert(
      'Button Works!',
      `You pressed the button ${count + 1} times. Platform: ${Platform.OS}`,
      [
        {
          text: 'Great!',
          onPress: () => console.log('Alert dismissed')
        }
      ]
    );
  };

  const handlePermissionTest = () => {
    console.log('Permission test pressed!');
    
    Alert.alert(
      'Permission Test',
      'This is a simple permission test. Choose what to simulate:',
      [
        {
          text: 'Grant Permission',
          onPress: () => {
            Alert.alert('Success!', 'Permission would be granted on mobile device');
          }
        },
        {
          text: 'Deny Permission',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Denied', 'Permission would be denied');
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Test Screen</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>
      <Text style={styles.counter}>Button pressed: {count} times</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
        <Text style={styles.buttonText}>Test Button (Tap Me!)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.permissionButton} onPress={handlePermissionTest}>
        <Text style={styles.buttonText}>Test Permission Dialog</Text>
      </TouchableOpacity>
      
      <View style={styles.info}>
        <Text style={styles.infoText}>
          If these buttons work, the permissions system should work too!
        </Text>
        <Text style={styles.infoText}>
          Check the browser console for log messages.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EBD6A0',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9FE7F5',
    marginBottom: 16,
    textAlign: 'center',
  },
  counter: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#EBD6A0',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 200,
  },
  permissionButton: {
    backgroundColor: '#9FE7F5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 32,
    minWidth: 200,
  },
  buttonText: {
    color: '#0f0f23',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  info: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 4,
  },
});