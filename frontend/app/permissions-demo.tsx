import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PermissionsOnboarding from '../src/components/PermissionsOnboarding';

export default function PermissionsDemoScreen() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleComplete = (permissions: { [key: string]: boolean }) => {
    console.log('Permissions demo completed:', permissions);
    setShowOnboarding(false);
  };

  const handleSkip = () => {
    console.log('Permissions demo skipped');
    setShowOnboarding(false);
  };

  return (
    <View style={styles.container}>
      <PermissionsOnboarding
        visible={showOnboarding}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
});