export type UserType = 'shopper' | 'vendor' | 'business';

interface AislePersonality {
  greeting: (name: string) => string;
  quickActions: string[];
  tone: string;
  focus: string;
}

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

export const aislePersonalities: Record<UserType, AislePersonality> = {
  shopper: {
    greeting: (name: string) => {
      const timeOfDay = getTimeOfDay();
      return `Good ${timeOfDay}, ${name}!\n\nI'm Aisle, your AI shopping companion. I'm here to help you discover amazing products, find the best deals, and make shopping effortless.\n\nWhat can I find for you today?`;
    },
    quickActions: [
      '🔍 Find trending products',
      '💰 Show me deals',
      '📦 Track my orders',
      '💡 Surprise me with recommendations'
    ],
    tone: 'friendly_companion',
    focus: 'discovery_and_deals'
  },

  vendor: {
    greeting: (name: string) => {
      const timeOfDay = getTimeOfDay();
      return `Good ${timeOfDay}, ${name}!\n\nI'm Aisle, your AI business optimizer. I'm here to help you grow your sales, optimize your listings, manage inventory, and scale your business.\n\nHow can I boost your business today?`;
    },
    quickActions: [
      '📈 Optimize my listings',
      '📊 Show sales analytics',
      '📦 Manage inventory',
      '💼 Growth recommendations'
    ],
    tone: 'professional_advisor',
    focus: 'business_growth'
  },

  business: {
    greeting: (name: string) => {
      const timeOfDay = getTimeOfDay();
      return `Good ${timeOfDay}, ${name}!\n\nI'm Aisle, your AI trade facilitator. I specialize in enterprise commerce, international trade, bulk operations, and B2B negotiations.\n\nWhat strategic commerce challenge can I solve for you today?`;
    },
    quickActions: [
      '🌍 International trade opportunities',
      '📋 Bulk procurement options',
      '🤝 B2B partnership matching',
      '📊 Market intelligence reports'
    ],
    tone: 'strategic_professional',
    focus: 'enterprise_solutions'
  }
};

export const getAislePersonality = (userType: UserType): AislePersonality => {
  return aislePersonalities[userType];
};

export const getAdaptiveGreeting = (name: string, userType: UserType): string => {
  return aislePersonalities[userType].greeting(name);
};

export const getQuickActionsForUser = (userType: UserType): string[] => {
  return aislePersonalities[userType].quickActions;
};

// Aisle's adaptive responses based on user type
export const aisleResponsePatterns = {
  shopper: {
    searchResponse: "I found some amazing options for you! Let me show you the best deals and trending items.",
    supportResponse: "Don't worry, I'm here to help! Let me resolve this for you right away.",
    recommendationResponse: "Based on your preferences, I think you'll love these personalized picks!"
  },
  
  vendor: {
    searchResponse: "Here are optimized strategies to improve your visibility and sales performance.",
    supportResponse: "Let me analyze your business metrics and provide actionable insights.",
    recommendationResponse: "Based on market trends, here are growth opportunities for your business."
  },
  
  business: {
    searchResponse: "I've identified strategic opportunities that align with your enterprise objectives.",
    supportResponse: "I'll coordinate the necessary resources and facilitate this process for you.",
    recommendationResponse: "Based on market intelligence, here are strategic recommendations for expansion."
  }
};

export const getAisleResponse = (userType: UserType, context: 'search' | 'support' | 'recommendation'): string => {
  return aisleResponsePatterns[userType][`${context}Response`];
};