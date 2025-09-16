import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VoiceSettings {
  enabled: boolean;
  rate: number;
  pitch: number;
  language: string;
  volume: number;
}

class VoiceService {
  private static instance: VoiceService;
  private defaultSettings: VoiceSettings = {
    enabled: false, // Default off - requires user consent
    rate: 0.98, // Slightly slower for warmth
    pitch: 1.02, // Slightly higher for friendliness
    language: 'en-US',
    volume: 0.8,
  };

  private currentSettings: VoiceSettings = { ...this.defaultSettings };
  private isInitialized = false;

  private constructor() {
    this.initializeSettings();
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private async initializeSettings() {
    try {
      const savedSettings = await AsyncStorage.getItem('aisle_voice_settings');
      if (savedSettings) {
        this.currentSettings = { ...this.defaultSettings, ...JSON.parse(savedSettings) };
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to load voice settings:', error);
      this.isInitialized = true;
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem('aisle_voice_settings', JSON.stringify(this.currentSettings));
    } catch (error) {
      console.error('Failed to save voice settings:', error);
    }
  }

  /**
   * Enable voice mode with user consent
   */
  async enableVoice(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initializeSettings();
    }

    this.currentSettings.enabled = true;
    await this.saveSettings();
    return true;
  }

  /**
   * Disable voice mode
   */
  async disableVoice(): Promise<void> {
    this.currentSettings.enabled = false;
    await this.saveSettings();
    await this.stopSpeaking();
  }

  /**
   * Check if voice is enabled
   */
  isVoiceEnabled(): boolean {
    return this.currentSettings.enabled;
  }

  /**
   * Get current voice settings
   */
  getSettings(): VoiceSettings {
    return { ...this.currentSettings };
  }

  /**
   * Update voice settings
   */
  async updateSettings(newSettings: Partial<VoiceSettings>): Promise<void> {
    this.currentSettings = { ...this.currentSettings, ...newSettings };
    await this.saveSettings();
  }

  /**
   * Main method to make Aisle speak
   */
  async speakAisle(text: string, options?: {
    priority?: 'low' | 'normal' | 'high';
    skipIfDisabled?: boolean;
  }): Promise<void> {
    const { priority = 'normal', skipIfDisabled = true } = options || {};

    // Check if voice is enabled
    if (!this.currentSettings.enabled && skipIfDisabled) {
      return;
    }

    // Platform check
    if (Platform.OS === 'web') {
      console.log('Voice not available on web platform');
      return;
    }

    // Check system volume/silent mode (iOS)
    if (Platform.OS === 'ios') {
      try {
        const isSilent = await this.isSystemSilent();
        if (isSilent && priority !== 'high') {
          console.log('System is in silent mode, skipping speech');
          return;
        }
      } catch (error) {
        console.warn('Could not check silent mode:', error);
      }
    }

    // Stop any current speech
    await this.stopSpeaking();

    // Prepare speech options
    const speechOptions: Speech.SpeechOptions = {
      language: this.currentSettings.language,
      pitch: this.currentSettings.pitch,
      rate: this.currentSettings.rate,
      volume: this.currentSettings.volume,
      onStart: () => {
        console.log('Aisle started speaking');
      },
      onDone: () => {
        console.log('Aisle finished speaking');
        // Track completion metric
        this.trackSpeechMetric('completed', text.length);
      },
      onStopped: () => {
        console.log('Aisle speech stopped');
      },
      onError: (error) => {
        console.error('Aisle speech error:', error);
        this.trackSpeechMetric('error', text.length);
      },
    };

    try {
      await Speech.speak(text, speechOptions);
      this.trackSpeechMetric('started', text.length);
    } catch (error) {
      console.error('Speech failed:', error);
    }
  }

  /**
   * Stop current speech
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  }

  /**
   * Check if Aisle is currently speaking
   */
  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('Failed to check speech status:', error);
      return false;
    }
  }

  /**
   * Get available voices (for advanced settings)
   */
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      if (Platform.OS === 'web') return [];
      return await Speech.getAvailableVoicesAsync();
    } catch (error) {
      console.error('Failed to get available voices:', error);
      return [];
    }
  }

  /**
   * Check if system is in silent mode (iOS only)
   */
  private async isSystemSilent(): Promise<boolean> {
    // This would need a native module for proper implementation
    // For now, we'll assume not silent
    return false;
  }

  /**
   * Track speech metrics
   */
  private trackSpeechMetric(event: 'started' | 'completed' | 'error', textLength: number) {
    // In a real app, this would send analytics
    console.log(`Voice metric - ${event}: ${textLength} characters`);
  }

  /**
   * Aisle-specific greeting with warmth
   */
  async speakGreeting(greeting: string): Promise<void> {
    const warmGreeting = this.addWarmth(greeting);
    await this.speakAisle(warmGreeting, { priority: 'normal' });
  }

  /**
   * Aisle-specific insight with enthusiasm
   */
  async speakInsight(insight: string): Promise<void> {
    const enthusiasticInsight = this.addEnthusiasm(insight);
    await this.speakAisle(enthusiasticInsight, { priority: 'low' });
  }

  /**
   * Welcome message with special warmth
   */
  async speakWelcome(): Promise<void> {
    const welcomeMessage = "Hi, I'm Aisle. I'm here to help you succeed today.";
    await this.speakAisle(welcomeMessage, { priority: 'high', skipIfDisabled: false });
  }

  /**
   * Add warmth to text for speech
   */
  private addWarmth(text: string): string {
    // Add natural pauses and warmth cues
    return text
      .replace(/\./g, '... ') // Add pauses after sentences
      .replace(/!/g, '! ') // Excitement pauses
      .replace(/\?/g, '? '); // Question pauses
  }

  /**
   * Add enthusiasm to insights
   */
  private addEnthusiasm(text: string): string {
    // Make insights sound more conversational
    const enthusiasticPrefixes = [
      "Here's something interesting: ",
      "I discovered: ",
      "Good news: ",
      "Here's what I found: ",
    ];
    
    const prefix = enthusiasticPrefixes[Math.floor(Math.random() * enthusiasticPrefixes.length)];
    return prefix + text;
  }

  /**
   * Request voice permission from user
   */
  async requestVoicePermission(): Promise<{ granted: boolean; message: string }> {
    // This would typically show a modal or alert
    // For now, we'll return a structure that the UI can use
    return {
      granted: false, // Will be set by UI component
      message: "Let Aisle speak? I can provide audio guidance and read insights aloud."
    };
  }
}

// Export singleton instance (commented out for web compatibility)
// export const voiceService = VoiceService.getInstance();
// export default voiceService;

// Temporary stub for web compatibility
export const voiceService = {
  isVoiceEnabled: () => false,
  requestVoicePermission: () => Promise.resolve({ granted: false, message: 'Voice disabled for web compatibility' }),
  enableVoice: () => Promise.resolve(),
  speakAisle: () => Promise.resolve()
};
export default voiceService;