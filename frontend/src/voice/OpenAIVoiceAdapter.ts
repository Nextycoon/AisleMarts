import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { VOICE } from '../config/voice';

interface VoiceResponse {
  transcript: string;
  reply: string;
  audioUri?: string;
}

export class OpenAIVoiceAdapter {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private isRecording = false;
  
  // Use Emergent LLM key for seamless integration
  private readonly apiKey = 'sk-emergent-35d93F3CeFf0c7aD50';

  async startConversation(): Promise<VoiceResponse> {
    try {
      // 1) Record mic audio and transcribe
      const transcript = await this.recordAndTranscribe();
      
      // 2) Get AI reply
      const reply = await this.chat(transcript);
      
      // 3) Optional: Convert reply to speech
      const audioUri = await this.tts(reply);
      
      return { transcript, reply, audioUri };
    } catch (error) {
      console.error('Voice conversation error:', error);
      throw error;
    }
  }

  async recordAndTranscribe(): Promise<string> {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission denied');
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      // Start recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await this.recording.startAsync();
      this.isRecording = true;

      // Record for 5 seconds (in production, this would be push-to-talk or voice detection)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await this.stopRecording();

      const uri = this.recording.getURI();
      if (!uri) {
        throw new Error('Recording failed - no audio file created');
      }

      // Transcribe using OpenAI Whisper
      return await this.transcribeAudio(uri);
    } catch (error) {
      this.isRecording = false;
      throw error;
    }
  }

  private async transcribeAudio(audioUri: string): Promise<string> {
    try {
      // Prepare form data for OpenAI Whisper API
      const formData = new FormData();
      
      // Get audio file info
      const audioInfo = await FileSystem.getInfoAsync(audioUri);
      if (!audioInfo.exists) {
        throw new Error('Audio file does not exist');
      }

      formData.append('file', {
        uri: audioUri,
        name: 'voice.m4a',
        type: 'audio/m4a',
      } as any);
      formData.append('model', VOICE.openai.sttModel);
      formData.append('language', 'en'); // Can be made dynamic later

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error?.message || `Transcription failed: ${response.status}`);
      }

      const result = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async chat(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: VOICE.openai.chatModel,
          messages: [
            {
              role: 'system',
              content: 'You are Aisle, an AI shopping companion for AisleMarts. You help users find products, compare prices, and make shopping decisions. Keep responses conversational, helpful, and concise for voice interaction.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150, // Keep responses short for voice
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error?.message || `Chat failed: ${response.status}`);
      }

      const result = await response.json();
      return result.choices?.[0]?.message?.content || 'I apologize, I couldn\'t process that request.';
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async tts(text: string): Promise<string | null> {
    if (!text || text.trim().length === 0) {
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1', // OpenAI TTS model
          voice: VOICE.openai.ttsVoice,
          input: text,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        console.warn('TTS failed, continuing without audio');
        return null;
      }

      // Save audio file
      const audioFileName = `aisle-tts-${Date.now()}.mp3`;
      const audioUri = FileSystem.cacheDirectory + audioFileName;
      
      const audioBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      
      await FileSystem.writeAsStringAsync(audioUri, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return audioUri;
    } catch (error) {
      console.warn('TTS error:', error);
      return null; // Non-critical, continue without audio
    }
  }

  async play(audioUri: string): Promise<void> {
    if (!audioUri) return;

    try {
      // Unload previous sound if exists
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // Load and play new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, volume: 1.0 }
      );
      
      this.sound = sound;

      // Set up playback status update
      this.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.sound?.unloadAsync();
          this.sound = null;
        }
      });
    } catch (error) {
      console.warn('Audio playback error:', error);
      // Non-critical, continue without audio playback
    }
  }

  async stop(): Promise<void> {
    try {
      // Stop recording if active
      if (this.recording && this.isRecording) {
        await this.stopRecording();
      }

      // Stop audio playback if active
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.warn('Stop operation error:', error);
    }
  }

  private async stopRecording(): Promise<void> {
    if (this.recording && this.isRecording) {
      try {
        await this.recording.stopAndUnloadAsync();
        this.isRecording = false;
      } catch (error) {
        console.warn('Stop recording error:', error);
        this.isRecording = false;
      }
    }
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    await this.stop();
    this.recording = null;
  }
}