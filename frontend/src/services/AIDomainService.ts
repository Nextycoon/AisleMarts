import apiClient from './client';

// AI Domain Specialization Service - Trade Intelligence
export interface HSCodeSuggestion {
  hs: string;
  desc: string;
  confidence: number;
}

export interface HSCodeSuggestRequest {
  title: string;
  materials?: string;
  use?: string;
  country_origin?: string;
}

export interface LandedCostItem {
  sku: string;
  hs?: string;
  value: number;
  qty: number;
  uom: string;
  origin: string;
}

export interface LandedCostRequest {
  destination_country: string;
  incoterm: string;
  items: LandedCostItem[];
  freight_cost?: number;
  insurance_cost?: number;
  currency: string;
}

export interface FreightDimension {
  l_cm: number;
  w_cm: number;
  h_cm: number;
  qty: number;
}

export interface FreightQuoteRequest {
  mode: 'Air' | 'Sea FCL' | 'Sea LCL' | 'Road' | 'Courier';
  dimensions: FreightDimension[];
  weight_kg: number;
  origin: string;
  destination: string;
  ready_date?: string;
  service_level: 'speed' | 'balanced' | 'economy';
}

export interface ComplianceParty {
  name: string;
  country: string;
}

export interface PaymentMethodsRequest {
  country: string;
  currency: string;
  cart_total: number;
}

export interface TaxComputeItem {
  sku: string;
  category: string;
  price: number;
}

export interface TaxComputeRequest {
  country: string;
  role: 'marketplace_facilitator' | 'merchant_of_record' | 'platform_only';
  items: TaxComputeItem[];
}

export interface TradeInsightsRequest {
  query: string;
  context?: Record<string, any>;
}

class AIDomainService {
  async suggestHSCodes(request: HSCodeSuggestRequest) {
    try {
      const response = await apiClient.post('/trade/hscode-suggest', request);
      return response.data;
    } catch (error) {
      console.error('Error suggesting HS codes:', error);
      throw error;
    }
  }

  async calculateLandedCost(request: LandedCostRequest) {
    try {
      const response = await apiClient.post('/trade/landed-cost-calculate', request);
      return response.data;
    } catch (error) {
      console.error('Error calculating landed cost:', error);
      throw error;
    }
  }

  async getFreightQuote(request: FreightQuoteRequest) {
    try {
      const response = await apiClient.post('/trade/freight-quote', request);
      return response.data;
    } catch (error) {
      console.error('Error getting freight quote:', error);
      throw error;
    }
  }

  async screenCompliance(parties: ComplianceParty[]) {
    try {
      const response = await apiClient.post('/trade/compliance-screening', { parties });
      return response.data;
    } catch (error) {
      console.error('Error screening compliance:', error);
      throw error;
    }
  }

  async suggestPaymentMethods(request: PaymentMethodsRequest) {
    try {
      const response = await apiClient.post('/trade/payment-methods-suggest', request);
      return response.data;
    } catch (error) {
      console.error('Error suggesting payment methods:', error);
      throw error;
    }
  }

  async computeTax(request: TaxComputeRequest) {
    try {
      const response = await apiClient.post('/trade/tax-compute', request);
      return response.data;
    } catch (error) {
      console.error('Error computing tax:', error);
      throw error;
    }
  }

  async getTradeInsights(request: TradeInsightsRequest) {
    try {
      const response = await apiClient.post('/trade/insights', request);
      return response.data;
    } catch (error) {
      console.error('Error getting trade insights:', error);
      throw error;
    }
  }

  async getIncoterms() {
    try {
      const response = await apiClient.get('/trade/incoterms');
      return response.data;
    } catch (error) {
      console.error('Error getting Incoterms:', error);
      throw error;
    }
  }

  async getTransportModes() {
    try {
      const response = await apiClient.get('/trade/transport-modes');
      return response.data;
    } catch (error) {
      console.error('Error getting transport modes:', error);
      throw error;
    }
  }

  async getSampleHSCodes() {
    try {
      const response = await apiClient.get('/trade/sample-hs-codes');
      return response.data;
    } catch (error) {
      console.error('Error getting sample HS codes:', error);
      throw error;
    }
  }
}

export const aiDomainService = new AIDomainService();