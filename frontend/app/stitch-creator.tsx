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
  Slider,
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

export default function StitchCreatorScreen() {
  const router = useRouter();
  const [originalVideo, setOriginalVideo] = useState<OriginalVideo | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stitchCaption, setStitchCaption] = useState('');
  const [stitchHashtags, setStitchHashtags] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [clipStartTime, setClipStartTime] = useState(0);
  const [clipEndTime, setClipEndTime] = useState(15);
  const [isEditingClip, setIsEditingClip] = useState(false);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<any>(null);

  // Mock original video data
  const mockOriginalVideo: OriginalVideo = {
    id: 'original_001',
    creator: {
      username: '@HealthyFamily',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68650e3?w=100'
    },
    caption: 'Quick healthy snacks for busy families! 🥗🍎 Nutrition made simple #BlueWaveApproved',
    hashtags: ['#HealthyEating', '#FamilyNutrition', '#QuickSnacks', '#BlueWaveApproved'],
    duration: 45,
    familySafe: true,
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
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

  const saveStitch = () => {
    if (!stitchCaption.trim()) {
      Alert.alert('Caption Required', 'Please add a caption for your stitch');
      return;
    }

    if (recordingDuration < 3) {
      Alert.alert('Recording Too Short', 'Please record at least 3 seconds');
      return;
    }

    Alert.alert(
      'Stitch Created!',
      'Your stitch has been saved as a draft. You can publish it now or later.',
      [
        { text: 'Save as Draft', onPress: () => router.back() },
        { text: 'Publish Now', onPress: publishStitch }
      ]
    );
  };

  const publishStitch = () => {
    // Mock publish logic
    console.log('Publishing stitch...');
    Alert.alert('Success!', 'Your stitch has been published and is now live on BlueWave!');
    router.back();
  };

  const handleClipEdit = () => {
    setIsEditingClip(!isEditingClip);
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
        <Text style={styles.headerTitle}>Create Stitch</Text>
        <TouchableOpacity onPress={saveStitch}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Video Preview */}
      <View style={styles.videoContainer}>
        {/* Original Video Clip */}
        <View style={styles.originalVideoContainer}>
          <Text style={styles.videoLabel}>
            Original Clip ({formatTime(clipEndTime - clipStartTime)})
          </Text>
          {originalVideo && (
            <Video
              ref={videoRef}
              source={{ uri: originalVideo.mediaUrl }}
              style={styles.originalVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay={!isRecording && !isEditingClip}
              isLooping
              isMuted={false}
            />
          )}
          
          {/* Clip Edit Button */}
          <TouchableOpacity 
            style={styles.editClipButton}
            onPress={handleClipEdit}
          >
            <Text style={styles.editClipButtonText}>✂️ Edit Clip</Text>
          </TouchableOpacity>
        </View>

        {/* Your Response */}
        <View style={styles.stitchVideoContainer}>
          <Text style={styles.videoLabel}>Your Response</Text>
          <View style={styles.stitchVideo}>
            {!isRecording ? (
              <View style={styles.stitchPlaceholder}>
                <Text style={styles.stitchPlaceholderIcon}>📹</Text>
                <Text style={styles.stitchPlaceholderText}>Tap to record your response</Text>
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

      {/* Clip Editor */}
      {isEditingClip && (
        <View style={styles.clipEditor}>
          <Text style={styles.clipEditorTitle}>Select Clip Portion</Text>
          <View style={styles.timelineContainer}>
            <Text style={styles.timeLabel}>{formatTime(clipStartTime)}</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={originalVideo?.duration || 45}
                value={clipStartTime}
                onValueChange={setClipStartTime}
                minimumTrackTintColor="#D4AF37"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="#D4AF37"
              />
              <Slider
                style={styles.slider}
                minimumValue={clipStartTime + 1}
                maximumValue={originalVideo?.duration || 45}
                value={clipEndTime}
                onValueChange={setClipEndTime}
                minimumTrackTintColor="#D4AF37"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="#D4AF37"
              />
            </View>
            <Text style={styles.timeLabel}>{formatTime(clipEndTime)}</Text>
          </View>
          <Text style={styles.clipDuration}>
            Clip Duration: {formatTime(clipEndTime - clipStartTime)}
          </Text>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => setIsEditingClip(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recording Controls */}
      {!isEditingClip && (
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
      )}

      {/* Caption and Settings */}
      <ScrollView style={styles.settingsContainer}>
        {/* Caption Input */}
        <View style={styles.settingSection}>
          <Text style={styles.settingTitle}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            multiline
            placeholder="Share your thoughts on this content..."
            placeholderTextColor="#666666"
            value={stitchCaption}
            onChangeText={setStitchCaption}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{stitchCaption.length}/500</Text>
        </View>

        {/* Hashtags */}
        <View style={styles.settingSection}>
          <Text style={styles.settingTitle}>Hashtags</Text>
          <TextInput
            style={styles.hashtagInput}
            placeholder="#Stitch #BlueWaveSafe #FamilyApproved"
            placeholderTextColor="#666666"
            value={stitchHashtags}
            onChangeText={setStitchHashtags}
          />
        </View>

        {/* Stitch Settings */}
        <View style={styles.settingSection}>
          <Text style={styles.settingTitle}>Stitch Settings</Text>
          <View style={styles.stitchOption}>
            <View style={styles.stitchInfo}>
              <Text style={styles.stitchLabel}>📺 Show Original First</Text>
              <Text style={styles.stitchDescription}>
                Play original clip before your response
              </Text>
            </View>
            <View style={styles.stitchToggle}>
              <Text style={styles.stitchStatus}>ON</Text>
            </View>
          </View>
          
          <View style={styles.stitchOption}>
            <View style={styles.stitchInfo}>
              <Text style={styles.stitchLabel}>🔊 Keep Original Audio</Text>
              <Text style={styles.stitchDescription}>
                Include audio from the original clip
              </Text>
            </View>
            <View style={styles.stitchToggle}>
              <Text style={styles.stitchStatus}>ON</Text>
            </View>
          </View>
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
          <Text style={styles.tipsTitle}>💡 Stitch Tips</Text>
          <Text style={styles.tipText}>• Select the best part of the original video</Text>
          <Text style={styles.tipText}>• Add value with your unique perspective</Text>
          <Text style={styles.tipText}>• Keep your response focused and engaging</Text>
          <Text style={styles.tipText}>• Maintain family-friendly content standards</Text>
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
    height: 300,
    margin: 16,
  },
  originalVideoContainer: {
    height: 150,
    marginBottom: 8,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  stitchVideoContainer: {
    height: 142,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
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
  editClipButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  editClipButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  stitchVideo: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stitchPlaceholder: {
    alignItems: 'center',
  },
  stitchPlaceholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  stitchPlaceholderText: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
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
  clipEditor: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  clipEditorTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  timelineContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  sliderContainer: {
    width: '100%',
    marginVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 4,
  },
  clipDuration: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  doneButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
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
  stitchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  stitchInfo: {
    flex: 1,
  },
  stitchLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  stitchDescription: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 18,
  },
  stitchToggle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stitchStatus: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
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