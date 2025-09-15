import React, { lazy, Suspense } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';

// Loading component for lazy-loaded screens
const LazyLoadingFallback = ({ screenName }: { screenName?: string }) => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bg
  }}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
    <Text style={{
      color: theme.colors.text,
      marginTop: theme.space.md,
      fontSize: 16
    }}>
      {screenName ? `Loading ${screenName}...` : 'Loading...'}
    </Text>
  </View>
);

// HOC for lazy loading with error boundary
export const withLazyLoading = (
  LazyComponent: React.LazyExoticComponent<React.ComponentType<any>>,
  screenName?: string
) => {
  return (props: any) => (
    <Suspense fallback={<LazyLoadingFallback screenName={screenName} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy load heavy screens to improve startup time
export const LazySellerDashboard = lazy(() => import('../screens/SellerDashboard'));
export const LazyProductEditor = lazy(() => import('../screens/ProductEditor'));
export const LazyCommissionPanel = lazy(() => import('../screens/CommissionPanel'));
export const LazyVendorDashboard = lazy(() => import('../screens/VendorDashboard'));
export const LazyEnhancedCheckoutScreen = lazy(() => import('../screens/EnhancedCheckoutScreen'));

// AI screens - these are heavy with LLM calls
export const LazyAIDomainScreen = lazy(() => import('../screens/AIDomainScreen'));
export const LazyDocumentationComplianceScreen = lazy(() => import('../screens/DocumentationComplianceScreen'));
export const LazyProceduresByCategoryScreen = lazy(() => import('../screens/ProceduresByCategoryScreen'));

// Wrapped components ready for use
export const SellerDashboard = withLazyLoading(LazySellerDashboard, 'Seller Dashboard');
export const ProductEditor = withLazyLoading(LazyProductEditor, 'Product Editor');
export const CommissionPanel = withLazyLoading(LazyCommissionPanel, 'Commission Panel');
export const VendorDashboard = withLazyLoading(LazyVendorDashboard, 'Vendor Dashboard');
export const EnhancedCheckoutScreen = withLazyLoading(LazyEnhancedCheckoutScreen, 'Checkout');
export const AIDomainScreen = withLazyLoading(LazyAIDomainScreen, 'AI Domain');
export const DocumentationComplianceScreen = withLazyLoading(LazyDocumentationComplianceScreen, 'Documentation');
export const ProceduresByCategoryScreen = withLazyLoading(LazyProceduresByCategoryScreen, 'Procedures');