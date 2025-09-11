// Mock Stripe for web platform
export const StripeProvider = ({ children }) => children;

export const useStripe = () => ({
  initPaymentSheet: null,
  presentPaymentSheet: null,
});

export default {
  StripeProvider,
  useStripe,
};