// Comprehensive Stripe mock for web platform
export const StripeProvider = ({ children }) => children;

export const useStripe = () => ({
  initPaymentSheet: null,
  presentPaymentSheet: null,
});

// Mock all Stripe components and functions
export const CardField = () => null;
export const CardForm = () => null;
export const PaymentSheet = {
  present: async () => ({ error: null }),
  dismiss: async () => true,
};

export const initStripe = () => Promise.resolve();
export const createPaymentMethod = () => Promise.resolve({ error: null });
export const confirmPayment = () => Promise.resolve({ error: null });
export const retrievePaymentIntent = () => Promise.resolve({ error: null });

// Default export with all mocked functions
export default {
  StripeProvider,
  useStripe,
  CardField,
  CardForm,
  PaymentSheet,
  initStripe,
  createPaymentMethod,
  confirmPayment,
  retrievePaymentIntent,
};