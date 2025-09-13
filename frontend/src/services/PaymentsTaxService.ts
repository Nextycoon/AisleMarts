import { API } from '../api/client';

export interface PaymentMethod {
  type: string;
  scheme: string;
  processor: string;
  display_name: string;
  icon_url: string;
  score: number;
  processing_fee: number;
  settlement_days: number;
  mobile_optimized: boolean;
  security_score: number;
}

export interface TaxCalculation {
  total_tax: number;
  lines: Array<{
    sku: string;
    category: string;
    rate: number;
    amount: number;
    tax_type: string;
    base_amount: number;
  }>;
  invoice: {
    required_fields: string[];
    threshold_amount: number;
    mandatory: boolean;
    compliance_level: string;
  };
  country: string;
  role: string;
  ai_insights: string;
  calculated_at: string;
}

export interface PaymentMethodSuggestion {
  methods: PaymentMethod[];
  ai_insights: string;
  country: string;
  currency: string;
  cart_total: number;
  recommended_count: number;
}

export interface EnhancedPaymentIntent {
  subtotal: number;
  tax_calculation: TaxCalculation;
  total_with_tax: number;
  payment_methods: PaymentMethodSuggestion;
  currency_conversion?: {
    from_currency: string;
    to_currency: string;
    amount: number;
    converted_amount: number;
    rate: number;
    ai_insights: string;
  };
  fraud_assessment: {
    risk_score: number;
    risk_level: string;
    action: string;
    risk_factors: string[];
    ai_insights: string;
  };
  optimization_focus: string;
  country: string;
  currency: string;
  role: string;
  timestamp: string;
}

export interface FraudAssessment {
  risk_score: number;
  risk_level: string;
  action: string;
  risk_factors: string[];
  ai_insights: string;
  country_risk: number;
}

export interface CurrencyConversion {
  from_currency: string;
  to_currency: string;
  amount: number;
  converted_amount: number;
  rate: number;
  ai_insights: string;
  volatility_warning: boolean;
}

class PaymentsTaxService {
  async initializeData() {
    try {
      const response = await API.post('/payments-tax/initialize');
      return response.data;
    } catch (error) {
      console.error('Failed to initialize payments/tax data:', error);
      throw error;
    }
  }

  async suggestPaymentMethods(
    country: string,
    currency: string,
    cartTotal: number,
    userType: 'B2B' | 'B2C' = 'B2C'
  ): Promise<PaymentMethodSuggestion> {
    try {
      const response = await API.post('/payments-tax/suggest-methods', {
        country,
        currency,
        cart_total: cartTotal,
        user_type: userType,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get payment method suggestions:', error);
      throw error;
    }
  }

  async computeTax(
    country: string,
    items: Array<{
      sku: string;
      category: string;
      price: number;
      quantity: number;
    }>,
    role: 'B2B' | 'B2C' = 'B2C'
  ): Promise<TaxCalculation> {
    try {
      const response = await API.post('/payments-tax/compute-tax', {
        country,
        items,
        role,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to compute tax:', error);
      throw error;
    }
  }

  async convertCurrency(
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): Promise<CurrencyConversion> {
    try {
      const response = await API.post('/payments-tax/convert-currency', {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to convert currency:', error);
      throw error;
    }
  }

  async assessFraudRisk(
    country: string,
    amount: number,
    paymentMethod: string,
    userHistory: Record<string, any> = {}
  ): Promise<FraudAssessment> {
    try {
      const response = await API.post('/payments-tax/assess-fraud-risk', {
        country,
        amount,
        payment_method: paymentMethod,
        user_history: userHistory,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to assess fraud risk:', error);
      throw error;
    }
  }

  async createEnhancedPaymentIntent(
    items: Array<{
      sku: string;
      category: string;
      price: number;
      quantity: number;
    }>,
    country: string,
    currency: string,
    role: 'B2B' | 'B2C' = 'B2C',
    paymentMethodPreference?: string,
    optimizeFor: 'cost' | 'speed' | 'security' = 'cost'
  ): Promise<EnhancedPaymentIntent> {
    try {
      const response = await API.post('/payments-tax/create-enhanced-payment-intent', {
        items,
        country,
        currency,
        role,
        payment_method_preference: paymentMethodPreference,
        optimize_for: optimizeFor,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create enhanced payment intent:', error);
      throw error;
    }
  }

  async getPaymentAnalytics(country?: string, days: number = 30) {
    try {
      const params = new URLSearchParams();
      if (country) params.append('country', country);
      params.append('days', days.toString());
      
      const response = await API.get(`/payments-tax/payment-analytics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get payment analytics:', error);
      throw error;
    }
  }

  async getTaxAnalytics(country?: string, days: number = 30) {
    try {
      const params = new URLSearchParams();
      if (country) params.append('country', country);
      params.append('days', days.toString());
      
      const response = await API.get(`/payments-tax/tax-analytics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get tax analytics:', error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await API.get('/payments-tax/health');
      return response.data;
    } catch (error) {
      console.error('Payments/Tax service health check failed:', error);
      throw error;
    }
  }
}

export const paymentsTaxService = new PaymentsTaxService();