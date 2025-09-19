import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PermissionsOnboarding from './PermissionsOnboarding';

interface PermissionsManagerProps {
  children: React.ReactNode;
}

export default function PermissionsManager({ children }: PermissionsManagerProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem('permissions_onboarding_completed');
      
      console.log('Permissions onboarding check:', hasCompletedOnboarding);
      
      if (!hasCompletedOnboarding) {
        // Show onboarding for first-time users
        console.log('Showing permissions onboarding for first-time user');
        setShowOnboarding(true);
      } else {
        console.log('Permissions onboarding already completed');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Show onboarding on error to be safe
      console.log('Showing permissions onboarding due to error');
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (permissions: { [key: string]: boolean }) => {
    console.log('Permissions granted:', permissions);
    
    // Track permissions for analytics
    try {
      await AsyncStorage.setItem('initial_permissions', JSON.stringify(permissions));
      await AsyncStorage.setItem('permissions_onboarding_completed', 'true');
    } catch (error) {
      console.error('Error saving permissions status:', error);
    }
    
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = async () => {
    console.log('User skipped permissions onboarding');
    
    try {
      await AsyncStorage.setItem('permissions_onboarding_completed', 'true');
      await AsyncStorage.setItem('permissions_skipped', 'true');
    } catch (error) {
      console.error('Error saving skip status:', error);
    }
    
    setShowOnboarding(false);
  };

  if (isLoading) {
    // Show loading state while checking onboarding status
    return null; // Or a loading component
  }

  return (
    <>
      {children}
      <PermissionsOnboarding
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </>
  );
}