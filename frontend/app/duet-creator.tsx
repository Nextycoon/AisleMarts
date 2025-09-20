import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import TabNavigator from './navigation/TabNavigator';

const { width, height } = Dimensions.get('window');

interface OriginalVideo {
  id: string;
  creator: {
    username: string;
    verified: boolean;
    avatar: string;
  };
  caption: string;
  hashtags: string[];
  duration: number;
  familySafe: boolean;
  mediaUrl: string;
}

export default function DuetCreatorScreen() {
  const router = useRouter();
  const [originalVideo, setOriginalVideo] = useState<OriginalVideo | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duetCaption, setDuetCaption] = useState('');
  const [duetHashtags, setDuetHashtags] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<any>(null);

  // Mock original video data
  const mockOriginalVideo: OriginalVideo = {
    id: 'original_001',
    creator: {
      username: '@LuxeFashion',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100'
    },
    caption: 'New winter collection is here! ❄️ Stay warm and stylish 🔥',
    hashtags: ['#WinterFashion', '#LuxeStyle', '#BlueWaveSafe', '#FamilyApproved'],
    duration: 30,
    familySafe: true,
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  };

  useEffect(() => {
    setOriginalVideo(mockOriginalVideo);
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    // Start timer
    recordingTimer.current = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= 60) { // Max 60 seconds
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
  };

  const saveDuet = () => {
    if (!duetCaption.trim()) {
      Alert.alert('Caption Required', 'Please add a caption for your duet');
      return;
    }

    if (recordingDuration < 3) {
      Alert.alert('Recording Too Short', 'Please record at least 3 seconds');
      return;
    }

    Alert.alert(
      'Duet Created!',
      'Your duet has been saved as a draft. You can publish it now or later.',
      [
        { text: 'Save as Draft', onPress: () => router.back() },
        { text: 'Publish Now', onPress: publishDuet }
      ]
    );
  };

  const publishDuet = () => {
    // Mock publish logic
    console.log('Publishing duet...');
    Alert.alert('Success!', 'Your duet has been published and is now live on BlueWave!');
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Duet</Text>
        <TouchableOpacity onPress={saveDuet}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Video Preview */}
      <View style={styles.videoContainer}>
        {/* Original Video (Left Side) */}
        <View style={styles.originalVideoContainer}>
          <Text style={styles.videoLabel}>Original</Text>
          {originalVideo && (
            <Video
              source={{ uri: originalVideo.mediaUrl }}
              style={styles.originalVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay={!isRecording}
              isLooping
              isMuted={false}
            />
          )}
          
          {/* Original Video Info */}
          <View style={styles.originalVideoInfo}>
            <Text style={styles.originalCreator}>
              {originalVideo?.creator.username}
              {originalVideo?.creator.verified && ' ✓'}
            </Text>
            <Text style={styles.originalCaption} numberOfLines={2}>
              {originalVideo?.caption}
            </Text>
          </View>
        </View>

        {/* Duet Video (Right Side) */}
        <View style={styles.duetVideoContainer}>
          <Text style={styles.videoLabel}>Your Duet</Text>
          <View style={styles.duetVideo}>
            {!isRecording ? (
              <View style={styles.duetPlaceholder}>
                <Text style={styles.duetPlaceholderIcon}>📹</Text>
                <Text style={styles.duetPlaceholderText}>Tap to record</Text>
              </View>
            ) : (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>REC {formatTime(recordingDuration)}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Recording Controls */}
      <View style={styles.controlsContainer}>
        {!isRecording ? (
          <TouchableOpacity 
            style={styles.recordButton}
            onPress={startRecording}
          >
            <View style={styles.recordButtonInner} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.stopButton}
            onPress={stopRecording}
          >
            <View style={styles.stopButtonInner} />
          </TouchableOpacity>
        )}
      </View>

      {/* Caption and Settings */}
      <ScrollView style={styles.settingsContainer}>
        {/* Caption Input */}
        <View style={styles.settingSection}>
          <Text style={styles.settingTitle}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            multiline
            placeholder="Add your perspective to this duet..."
            placeholderTextColor="#666666"
            value={duetCaption}
            onChangeText={setDuetCaption}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{duetCaption.length}/500</Text>
        </View>

        {/* Hashtags */}
        <View style={styles.settingSection}>
          <Text style={styles.settingTitle}>Hashtags</Text>
          <TextInput
            style={styles.hashtagInput}
            placeholder="#Duet #BlueWaveSafe #FamilyApproved"
            placeholderTextColor="#666666"
            value={duetHashtags}
            onChangeText={setDuetHashtags}
          />
        </View>

        {/* Privacy Settings */}
        <View style={styles.settingSection}>
          <Text style={styles.settingTitle}>Privacy & Safety</Text>
          <View style={styles.privacyOption}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>🛡️ Family Safe Content</Text>
              <Text style={styles.privacyDescription}>
                Content will be reviewed for family-appropriate material
              </Text>
            </View>
            <View style={styles.privacyToggle}>
              <Text style={styles.privacyStatus}>ON</Text>
            </View>
          </View>
          
          <View style={styles.privacyOption}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>👨‍👩‍👧‍👦 Parental Guidance</Text>
              <Text style={styles.privacyDescription}>
                Allow parents to review before publishing
              </Text>
            </View>
            <View style={styles.privacyToggle}>
              <Text style={styles.privacyStatus}>OFF</Text>
            </View>
          </View>
        </View>

        {/* Original Video Credit */}
        <View style={styles.settingSection}>
          <Text style={styles.settingTitle}>Original Video</Text>
          <View style={styles.creditContainer}>
            <View style={styles.creditAvatar}>
              <Text style={styles.creditAvatarText}>
                {originalVideo?.creator.username.charAt(1).toUpperCase()}
              </Text>
            </View>
            <View style={styles.creditInfo}>
              <Text style={styles.creditUsername}>
                {originalVideo?.creator.username}
                {originalVideo?.creator.verified && ' ✓'}
              </Text>
              <Text style={styles.creditCaption} numberOfLines={2}>
                {originalVideo?.caption}
              </Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Duet Tips</Text>
          <Text style={styles.tipText}>• React naturally to the original video</Text>
          <Text style={styles.tipText}>• Add your unique perspective or skills</Text>
          <Text style={styles.tipText}>• Keep content family-friendly for BlueWave</Text>
          <Text style={styles.tipText}>• Credit the original creator respectfully</Text>
        </View>
      </ScrollView>

      <TabNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  saveButton: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    flexDirection: 'row',
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  originalVideoContainer: {
    flex: 1,
    marginRight: 8,
    position: 'relative',
  },
  duetVideoContainer: {
    flex: 1,
    marginLeft: 8,
    position: 'relative',
  },
  videoLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  originalVideo: {
    flex: 1,
    borderRadius: 12,
  },
  duetVideo: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duetPlaceholder: {
    alignItems: 'center',
  },
  duetPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  duetPlaceholderText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  recordingIndicator: {
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginBottom: 8,
  },
  recordingText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
  },
  originalVideoInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
  },
  originalCreator: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  originalCaption: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 14,
  },
  controlsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 4,
    borderColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 4,
    borderColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonInner: {
    width: 24,
    height: 24,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  captionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  hashtagInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  privacyInfo: {
    flex: 1,
  },
  privacyLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  privacyDescription: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 18,
  },
  privacyToggle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyStatus: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },
  creditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  creditAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  creditAvatarText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  creditInfo: {
    flex: 1,
  },
  creditUsername: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  creditCaption: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
  },
  tipsContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 100,
  },
  tipsTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});