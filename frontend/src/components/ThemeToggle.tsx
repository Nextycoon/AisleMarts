import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, THEME_TRANSITION_DURATION } from '../context/ThemeContext';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: any;
}

export default function ThemeToggle({
  size = 'medium',
  showLabel = true,
  style,
}: ThemeToggleProps) {
  const { theme, isDark, themeMode, toggleTheme, setThemeMode } = useTheme();
  const animatedValue = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDark ? 1 : 0,
      duration: THEME_TRANSITION_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  const handleToggle = () => {
    // Add a tactile feedback animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    toggleTheme();
  };

  const getSize = () => {
    switch (size) {
      case 'small': return { width: 40, height: 40, iconSize: 16 };
      case 'large': return { width: 60, height: 60, iconSize: 28 };
      default: return { width: 50, height: 50, iconSize: 22 };
    }
  };

  const dimensions = getSize();

  // Animated styles
  const containerStyle = {
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.bgSecondary, theme.primaryDeep],
    }),
    borderColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.border, theme.primary],
    }),
  };

  const iconColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.gold, theme.inkOnPrimary],
  });

  const iconRotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          style={[
            styles.container,
            {
              width: dimensions.width,
              height: dimensions.height,
            },
            containerStyle,
          ]}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              transform: [{ rotate: iconRotation }],
            }}
          >
            <Animated.Text style={{ color: iconColor, fontSize: dimensions.iconSize }}>
              {isDark ? '🌙' : '☀️'}
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: theme.inkSecondary }]}>
            {themeMode === 'auto' 
              ? `Auto (${isDark ? 'Dark' : 'Light'})`
              : isDark 
                ? 'Dark Mode' 
                : 'Light Mode'
            }
          </Text>
          <Text style={[styles.subtitle, { color: theme.inkTertiary }]}>
            Blue Era {isDark ? 'Night' : 'Day'}
          </Text>
        </View>
      )}
    </View>
  );
}

// Advanced theme toggle with mode selection
interface ThemeModeSelectorProps {
  onModeChange?: (mode: 'light' | 'dark' | 'auto') => void;
}

export function ThemeModeSelector({ onModeChange }: ThemeModeSelectorProps) {
  const { theme, themeMode, setThemeMode } = useTheme();

  const modes = [
    { key: 'light', label: 'Light', icon: '☀️', description: 'Always light theme' },
    { key: 'dark', label: 'Dark', icon: '🌙', description: 'Always dark theme' },
    { key: 'auto', label: 'Auto', icon: '🔄', description: 'Follow system setting' },
  ] as const;

  const handleModeSelect = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    onModeChange?.(mode);
  };

  return (
    <View style={styles.modeSelectorContainer}>
      <Text style={[styles.modeSelectorTitle, { color: theme.ink }]}>
        Blue Era Theme
      </Text>
      
      {modes.map((mode) => (
        <TouchableOpacity
          key={mode.key}
          style={[
            styles.modeOption,
            {
              backgroundColor: themeMode === mode.key ? theme.primary : theme.bgCard,
              borderColor: themeMode === mode.key ? theme.primary : theme.border,
            },
          ]}
          onPress={() => handleModeSelect(mode.key)}
        >
          <View style={styles.modeOptionContent}>
            <Text style={styles.modeIcon}>{mode.icon}</Text>
            <View style={styles.modeTextContainer}>
              <Text
                style={[
                  styles.modeLabel,
                  {
                    color: themeMode === mode.key ? theme.inkOnPrimary : theme.ink,
                  },
                ]}
              >
                {mode.label}
              </Text>
              <Text
                style={[
                  styles.modeDescription,
                  {
                    color: themeMode === mode.key 
                      ? theme.inkOnPrimary + '80' 
                      : theme.inkSecondary,
                  },
                ]}
              >
                {mode.description}
              </Text>
            </View>
            {themeMode === mode.key && (
              <Ionicons name="checkmark-circle" size={20} color={theme.inkOnPrimary} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  modeSelectorContainer: {
    padding: 16,
  },
  modeSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modeOption: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    padding: 16,
  },
  modeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modeDescription: {
    fontSize: 14,
  },
});