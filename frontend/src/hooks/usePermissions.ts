import { useState, useCallback } from 'react';
import { PermissionManager, PermissionResult } from '../utils/permissions';

export interface PermissionHookReturn {
  requestPermission: (
    type: 'camera' | 'microphone' | 'photos' | 'location' | 'notifications',
    context: string
  ) => Promise<PermissionResult>;
  isLoading: boolean;
}

export const usePermissions = (): PermissionHookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPermissionType, setCurrentPermissionType] = useState<string | null>(null);
  const [showPrePrompt, setShowPrePrompt] = useState(false);
  const [prePromptResolver, setPrePromptResolver] = useState<((value: boolean) => void) | null>(null);

  const showPermissionPrePrompt = useCallback((type: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setCurrentPermissionType(type);
      setPrePromptResolver(() => resolve);
      setShowPrePrompt(true);
    });
  }, []);

  const handlePrePromptContinue = useCallback(() => {
    setShowPrePrompt(false);
    if (prePromptResolver) {
      prePromptResolver(true);
    }
    setPrePromptResolver(null);
  }, [prePromptResolver]);

  const handlePrePromptNotNow = useCallback(() => {
    setShowPrePrompt(false);
    if (prePromptResolver) {
      prePromptResolver(false);
    }
    setPrePromptResolver(null);
  }, [prePromptResolver]);

  const requestPermission = useCallback(async (
    type: 'camera' | 'microphone' | 'photos' | 'location' | 'notifications',
    context: string
  ): Promise<PermissionResult> => {
    setIsLoading(true);
    
    try {
      const result = await PermissionManager.requestWithPrePrompt(
        type,
        context,
        showPermissionPrePrompt
      );
      
      return result;
    } catch (error) {
      console.error('Permission request error:', error);
      return 'denied';
    } finally {
      setIsLoading(false);
      setCurrentPermissionType(null);
    }
  }, [showPermissionPrePrompt]);

  return {
    requestPermission,
    isLoading,
    // Expose pre-prompt state for UI components
    showPrePrompt,
    currentPermissionType,
    onPrePromptContinue: handlePrePromptContinue,
    onPrePromptNotNow: handlePrePromptNotNow,
  } as PermissionHookReturn & {
    showPrePrompt: boolean;
    currentPermissionType: string | null;
    onPrePromptContinue: () => void;
    onPrePromptNotNow: () => void;
  };
};

// Helper hook for specific permission types with built-in UI
export const useCameraPermission = () => {
  const { requestPermission, isLoading } = usePermissions();
  
  const requestCamera = useCallback(async (context = 'scan') => {
    return await requestPermission('camera', context);
  }, [requestPermission]);
  
  return { requestCamera, isLoading };
};

export const useMicrophonePermission = () => {
  const { requestPermission, isLoading } = usePermissions();
  
  const requestMicrophone = useCallback(async (context = 'voice') => {
    return await requestPermission('microphone', context);
  }, [requestPermission]);
  
  return { requestMicrophone, isLoading };
};

export const useLocationPermission = () => {
  const { requestPermission, isLoading } = usePermissions();
  
  const requestLocation = useCallback(async (context = 'nearby') => {
    return await requestPermission('location', context);
  }, [requestPermission]);
  
  return { requestLocation, isLoading };
};

export const usePhotosPermission = () => {
  const { requestPermission, isLoading } = usePermissions();
  
  const requestPhotos = useCallback(async (context = 'upload') => {
    return await requestPermission('photos', context);
  }, [requestPermission]);
  
  return { requestPhotos, isLoading };
};

export const useNotificationsPermission = () => {
  const { requestPermission, isLoading } = usePermissions();
  
  const requestNotifications = useCallback(async (context = 'alerts') => {
    return await requestPermission('notifications', context);
  }, [requestPermission]);
  
  return { requestNotifications, isLoading };
};