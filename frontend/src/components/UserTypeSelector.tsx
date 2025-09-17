import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useUser } from '../state/user';
import { colors } from '../theme/tokens';
import { Glass } from './Glass';

type UserType = 'shopper' | 'vendor' | 'business';

const userTypes = [
  {
    type: 'shopper' as UserType,
    icon: '🛒',
    title: 'Shopper',
    subtitle: 'Discover, buy, enjoy',
    description: 'AI companion for effortless shopping'
  },
  {
    type: 'vendor' as UserType,
    icon: '🛍️',
    title: 'Vendor', 
    subtitle: 'Sell, grow, succeed',
    description: 'AI optimizer for business growth'
  },
  {
    type: 'business' as UserType,
    icon: '🏢',
    title: 'Business',
    subtitle: 'Scale, trade, expand',
    description: 'AI facilitator for enterprise commerce'
  }
];

export default function UserTypeSelector() {
  const { role, setRole } = useUser();

  const handleTypeSelect = (type: UserType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRole(type);
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
        <Text style={styles.title}>Choose your Aisle.{'\n'}Define your journey.</Text>
        <Text style={styles.subtitle}>Your interface is your key.{'\n'}It unlocks your path.</Text>
      </Animated.View>

      <View style={styles.options}>
        {userTypes.map((userType, index) => (
          <Animated.View
            key={userType.type}
            entering={FadeInDown.delay(400 + index * 100)}
          >
            <TouchableOpacity
              style={[
                styles.option,
                role === userType.type && styles.selectedOption
              ]}
              onPress={() => handleTypeSelect(userType.type)}
            >
              <Glass style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>{userType.icon}</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{userType.title}</Text>
                  <Text style={styles.optionSubtitle}>{userType.subtitle}</Text>
                  <Text style={styles.optionDescription}>{userType.description}</Text>
                </View>
                {role === userType.type && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkIcon}>✓</Text>
                  </View>
                )}
              </Glass>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  options: {
    gap: 16,
  },
  option: {
    borderRadius: 16,
  },
  selectedOption: {
    transform: [{ scale: 1.02 }],
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.glass.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  optionSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
    opacity: 0.8,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkIcon: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});