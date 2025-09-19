// Feature flags for Phase 2 Luxury Communication Suite
export const flags = {
  // Phase 1 - Always enabled
  DIRECT_MESSAGING: true,
  
  // Phase 2 - Toggle per environment
  CALLS: true,
  CHANNELS: true,
  LIVESALE: true,
  LEADS: true,
  
  // Future features
  VIDEO_CALLS: true,
  CREATOR_TOOLS: true,
  BUSINESS_ANALYTICS: true,
};

export const isFeatureEnabled = (feature: keyof typeof flags): boolean => {
  return flags[feature] || false;
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  // Enable all features in development
  Object.keys(flags).forEach(key => {
    flags[key as keyof typeof flags] = true;
  });
}

// Production feature gates
if (process.env.NODE_ENV === 'production') {
  // Disable experimental features in production
  // flags.VIDEO_CALLS = false;
}