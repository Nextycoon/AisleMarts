/**
 * Auto-Personalized Greeting System
 * Dynamic time-based greetings with locale awareness
 */

export const getGreeting = (now = new Date()) => {
  const hour = now.getHours();
  
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Good night";
};

export const getTimeOfDay = (now = new Date()) => {
  const hour = now.getHours();
  
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
};

export const getLocationContext = () => {
  // In production, get from user location or settings
  // For now, default to Kenya context
  return {
    city: "Nairobi",
    country: "Kenya",
    flag: "🇰🇪",
    timezone: "EAT"
  };
};

export const getPersonalizedGreeting = (now = new Date()) => {
  const greeting = getGreeting(now);
  const location = getLocationContext();
  
  return {
    greeting,
    location: `${location.city}, ${location.country}`,
    flag: location.flag,
    timeOfDay: getTimeOfDay(now),
    fullGreeting: `${greeting}${location.city ? `, ${location.city}` : ""}`,
  };
};

// Utility for activity-based greetings
export const getActivityGreeting = (now = new Date()) => {
  const hour = now.getHours();
  
  if (hour < 6) return "Still awake?";
  if (hour < 9) return "Early bird!";
  if (hour < 12) return "Ready to shop?";
  if (hour < 14) return "Lunch break?";
  if (hour < 18) return "Afternoon browsing?";
  if (hour < 21) return "Evening shopping?";
  return "Night owl mode";
};

export default { getGreeting, getPersonalizedGreeting, getActivityGreeting };