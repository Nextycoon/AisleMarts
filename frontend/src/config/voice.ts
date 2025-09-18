import Constants from 'expo-constants';

// Voice chat configuration with feature flags
export const VOICE = {
  enabled: Constants.expoConfig?.extra?.VOICE_ENABLED === 'true' || false,
  devOnly: Constants.expoConfig?.extra?.VOICE_DEV_ONLY === 'true' || true,
  teaser: Constants.expoConfig?.extra?.VOICE_TEASER === 'true' || false,
  provider: Constants.expoConfig?.extra?.VOICE_PROVIDER || 'openai',
  openai: {
    key: Constants.expoConfig?.extra?.OPENAI_API_KEY || '',
    sttModel: Constants.expoConfig?.extra?.OPENAI_STT_MODEL || 'whisper-1',
    chatModel: Constants.expoConfig?.extra?.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
    ttsVoice: Constants.expoConfig?.extra?.OPENAI_TTS_VOICE || 'alloy',
  }
};

// Helper to check if voice features should be visible
export const shouldShowVoice = (isDev: boolean, voiceUnlocked: boolean): boolean => {
  if (!VOICE.enabled) return false;
  if (!VOICE.devOnly) return true;
  return isDev || voiceUnlocked;
};