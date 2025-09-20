import { useState, useEffect } from 'react';
import { 
  getUserCurrency, 
  setUserCurrency as setCurrency, 
  formatCurrency as formatCurrencyUtil,
  convertCurrency,
  smartFormatCurrency,
  getSupportedCurrencies,
  currencies,
  Currency
} from '../lib/currencyEngine';

export const useCurrency = () => {
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        setIsLoading(true);
        const userCurrency = await getUserCurrency();
        setCurrentCurrency(userCurrency);
        console.log(`💱 Currency-Infinity Engine: Initialized with ${userCurrency}`);
      } catch (error) {
        console.error('Currency initialization failed:', error);
        setCurrentCurrency('USD');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCurrency();
  }, []);

  const changeCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
    setCurrentCurrency(newCurrency);
  };

  const formatCurrency = (amount: number, currencyCode?: string): string => {
    return formatCurrencyUtil(amount, currencyCode || currentCurrency);
  };

  const convertAndFormat = (amount: number, fromCurrency: string, toCurrency?: string): string => {
    const targetCurrency = toCurrency || currentCurrency;
    const convertedAmount = convertCurrency(amount, fromCurrency, targetCurrency);
    return formatCurrencyUtil(convertedAmount, targetCurrency);
  };

  const smartFormat = async (amount: number, baseCurrency: string = 'USD'): Promise<string> => {
    return await smartFormatCurrency(amount, baseCurrency);
  };

  const getCurrencyInfo = (currencyCode?: string): Currency | undefined => {
    return currencies[currencyCode || currentCurrency];
  };

  const getSupportedCurrenciesList = (): Currency[] => {
    return getSupportedCurrencies();
  };

  return {
    currentCurrency,
    isLoading,
    changeCurrency,
    formatCurrency,
    convertAndFormat,
    smartFormat,
    getCurrencyInfo,
    getSupportedCurrenciesList,
    convertCurrency,
  };
};