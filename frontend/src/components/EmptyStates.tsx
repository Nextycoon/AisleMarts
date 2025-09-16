import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionText,
  onAction,
  icon = 'help-circle-outline'
}) => (
  <Animated.View entering={FadeIn.delay(300)} style={styles.container}>
    <BlurView intensity={15} style={styles.emptyBlur}>
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={styles.emptyGradient}
      >
        <Animated.View entering={ZoomIn.delay(500)}>
          <Ionicons name={icon as any} size={64} color="rgba(255,255,255,0.3)" />
        </Animated.View>
        
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
        
        {actionText && onAction && (
          <TouchableOpacity style={styles.actionButton} onPress={onAction}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.actionGradient}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.actionText}>{actionText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </BlurView>
  </Animated.View>
);

export const EmptyStates = {
  NoWindows: (props: { onCreateWindows: () => void; title: string; message: string; actionText: string }) => (
    <EmptyState
      {...props}
      onAction={props.onCreateWindows}
      icon="calendar-outline"
    />
  ),
  
  NoUploads: (props: { onUpload: () => void; title: string; message: string; actionText: string }) => (
    <EmptyState
      {...props}
      onAction={props.onUpload}
      icon="cloud-upload-outline"
    />
  ),

  Generic: EmptyState
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: '100%',
  },
  emptyGradient: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});