import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TaskCompletionUIProps {
  title: string;
  description: string;
  actions: Array<{
    label: string;
    type: 'primary' | 'secondary' | 'success';
    onPress: () => void;
  }>;
}

export const TaskCompletionUI: React.FC<TaskCompletionUIProps> = ({
  title,
  description,
  actions,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        style={styles.successBanner}
      >
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Task Completed Successfully!</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.action,
                action.type === 'primary' && styles.primaryAction,
                action.type === 'success' && styles.successAction,
                action.type === 'secondary' && styles.secondaryAction,
              ]}
              onPress={action.onPress}
            >
              <Text
                style={[
                  styles.actionText,
                  action.type === 'primary' && styles.primaryActionText,
                  action.type === 'success' && styles.successActionText,
                  action.type === 'secondary' && styles.secondaryActionText,
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  successBanner: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionsContainer: {
    gap: 12,
  },
  action: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: '#3b82f6',
  },
  successAction: {
    backgroundColor: '#10b981',
  },
  secondaryAction: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryActionText: {
    color: '#ffffff',
  },
  successActionText: {
    color: '#ffffff',
  },
  secondaryActionText: {
    color: '#374151',
  },
});