import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
  userRole?: 'brand' | 'shopper' | 'both';
}

interface QuickAccessDockProps {
  userRole?: 'brand' | 'shopper';
  onToggle?: (isOpen: boolean) => void;
}

export default function QuickAccessDock({
  userRole = 'shopper',
  onToggle,
}: QuickAccessDockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  const getQuickActions = (): QuickAction[] => {
    const commonActions: QuickAction[] = [
      {
        id: 'ai-assistant',
        title: 'AI Assistant',
        icon: 'sparkles',
        color: '#5856D6',
        onPress: () => {
          Alert.alert('AI Assistant', 'Opening your personal AI assistant...');
          // TODO: Open AI assistant modal
        },
        userRole: 'both',
      },
      {
        id: 'search',
        title: 'Smart Search',
        icon: 'search',
        color: '#007AFF',
        onPress: () => {
          router.push('/');
          // TODO: Focus search input
        },
        userRole: 'both',
      },
    ];

    const brandActions: QuickAction[] = [
      {
        id: 'export-cert',
        title: 'Export Cert',
        icon: 'document-text',
        color: '#34C759',
        onPress: () => {
          Alert.alert('Export Certificate', 'Generating export certificate...');
          // TODO: Navigate to documentation compliance
        },
        userRole: 'brand',
      },
      {
        id: 'invoice',
        title: 'Create Invoice',
        icon: 'receipt',
        color: '#FF9500',
        onPress: () => {
          Alert.alert('Invoice', 'Creating new invoice...');
          // TODO: Navigate to invoice creation
        },
        userRole: 'brand',
      },
      {
        id: 'ai-ads',
        title: 'AI Ads',
        icon: 'megaphone',
        color: '#AF52DE',
        onPress: () => {
          Alert.alert('AI Ads', 'Creating AI-powered advertisement...');
          // TODO: Navigate to AI ad generator
        },
        userRole: 'brand',
      },
      {
        id: 'payments',
        title: 'Payments',
        icon: 'card',
        color: '#1E90FF',
        onPress: () => {
          router.push('/vendor-dashboard');
        },
        userRole: 'brand',
      },
    ];

    const shopperActions: QuickAction[] = [
      {
        id: 'cart',
        title: 'My Cart',
        icon: 'bag',
        color: '#34C759',
        onPress: () => {
          router.push('/cart');
        },
        userRole: 'shopper',
      },
      {
        id: 'orders',
        title: 'My Orders',
        icon: 'receipt',
        color: '#FF9500',
        onPress: () => {
          router.push('/orders');
        },
        userRole: 'shopper',
      },
      {
        id: 'wishlist',
        title: 'Wishlist',
        icon: 'heart',
        color: '#FF3B30',
        onPress: () => {
          Alert.alert('Wishlist', 'Opening your wishlist...');
          // TODO: Navigate to wishlist
        },
        userRole: 'shopper',
      },
      {
        id: 'profile',
        title: 'Profile',
        icon: 'person',
        color: '#8E8E93',
        onPress: () => {
          router.push('/profile');
        },
        userRole: 'shopper',
      },
    ];

    // Filter actions based on user role
    const roleSpecificActions = userRole === 'brand' ? brandActions : shopperActions;
    
    return [
      ...commonActions,
      ...roleSpecificActions.filter(action => 
        action.userRole === userRole || action.userRole === 'both'
      ),
    ];
  };

  const toggleDock = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);
    onToggle?.(!isOpen);

    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(rotateValue, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderAction = (action: QuickAction, index: number) => {
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -(60 + index * 70)],
    });

    const scale = animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 1],
    });

    const opacity = animatedValue.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0, 1],
    });

    return (
      <Animated.View
        key={action.id}
        style={[
          styles.actionContainer,
          {
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: action.color }]}
          onPress={() => {
            action.onPress();
            // Auto-close dock after action
            setTimeout(() => {
              if (isOpen) toggleDock();
            }, 100);
          }}
        >
          <Ionicons name={action.icon as any} size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.actionLabel}>{action.title}</Text>
      </Animated.View>
    );
  };

  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const actions = getQuickActions();

  return (
    <View style={styles.container}>
      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => renderAction(action, index))}
      </View>

      {/* Main dock button */}
      <TouchableOpacity style={styles.dockButton} onPress={toggleDock}>
        <LinearGradient
          colors={userRole === 'brand' ? ['#0A2540', '#1E90FF'] : ['#34C759', '#32D74B']}
          style={styles.dockButtonGradient}
        >
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <Ionicons name="add" size={28} color="white" />
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>

      {/* User role indicator */}
      <View style={[
        styles.roleIndicator,
        { backgroundColor: userRole === 'brand' ? '#1E90FF' : '#34C759' }
      ]}>
        <Text style={styles.roleText}>
          {userRole === 'brand' ? '💙' : '💚'}
        </Text>
      </View>

      {/* Backdrop */}
      {isOpen && (
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: animatedValue }
          ]}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            onPress={toggleDock}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    alignItems: 'center',
  },
  actionsContainer: {
    alignItems: 'center',
  },
  actionContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dockButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  dockButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  roleText: {
    fontSize: 12,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -100,
    bottom: -100,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: -1,
  },
  backdropTouchable: {
    flex: 1,
  },
});