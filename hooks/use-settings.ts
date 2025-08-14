'use client';

import { useState, useEffect, useCallback } from 'react';

import { AvailableCurrencies } from '@/types/config';

interface Settings {
  currency: AvailableCurrencies;
  language: string;
  operator: string;
}

const defaultSettings: Settings = {
  currency: 'USD',
  language: 'EN',
  operator: '',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar configuraciones desde localStorage al inicializar
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('lightning-pos-settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({
            currency: parsedSettings.currency || defaultSettings.currency,
            language: parsedSettings.language || defaultSettings.language,
            operator: parsedSettings.operator || defaultSettings.operator,
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // En caso de error, usar configuraciones por defecto
        setSettings(defaultSettings);
      } finally {
        setIsLoaded(true);
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Función para actualizar configuraciones
  const updateSettings = useCallback(
    (newSettings: Partial<Settings>) => {
      const updatedSettings = {
        ...settings,
        ...newSettings,
      };

      setSettings(updatedSettings);

      try {
        localStorage.setItem('lightning-pos-settings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }

      return updatedSettings;
    },
    [settings],
  );

  // Función para actualizar solo la moneda
  const updateCurrency = useCallback(
    (currency: AvailableCurrencies) => {
      return updateSettings({ currency });
    },
    [updateSettings],
  );

  // Función para actualizar solo el idioma
  const updateLanguage = useCallback(
    (language: string) => {
      return updateSettings({ language });
    },
    [updateSettings],
  );

  // Función para actualizar solo la Lightning Address del operador
  const updateOperator = useCallback(
    (operator: string) => {
      return updateSettings({ operator });
    },
    [updateSettings],
  );

  // Función para resetear configuraciones
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('lightning-pos-settings');
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }, []);

  // Función para obtener el símbolo de la moneda
  const getCurrencySymbol = useCallback(
    (currency?: string) => {
      const curr = currency || settings.currency;
      switch (curr) {
        case 'SAT':
          return '₿';
        case 'USD':
        case 'ARS':
        case 'UYU':
          return '$';
        case 'EUR':
          return '€';
        default:
          return '$';
      }
    },
    [settings.currency],
  );

  // Función para obtener el nombre completo de la moneda
  const getCurrencyName = useCallback(
    (currency?: string) => {
      const curr = currency || settings.currency;
      switch (curr) {
        case 'SAT':
          return 'Satoshis';
        case 'USD':
          return 'US Dollar';
        case 'ARS':
          return 'Argentine Peso';
        case 'EUR':
          return 'Euro';
        case 'UYU':
          return 'Uruguayan Peso';
        default:
          return 'US Dollar';
      }
    },
    [settings.currency],
  );

  // Función para obtener el nombre del idioma
  const getLanguageName = useCallback(
    (language?: string) => {
      const lang = language || settings.language;
      switch (lang) {
        case 'ES':
          return 'Español';
        case 'EN':
          return 'English';
        case 'PT':
          return 'Português';
        default:
          return 'English';
      }
    },
    [settings.language],
  );

  // Función para validar Lightning Address
  const validateLightningAddress = useCallback((address: string) => {
    if (!address.trim()) return true; // Permitir vacío
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(address);
  }, []);

  // Función para verificar si el operador tiene Lightning Address configurada
  const hasOperator = useCallback(() => {
    return settings.operator.trim() !== '';
  }, [settings.operator]);

  return {
    settings,
    isLoaded,
    isLoading,
    updateSettings,
    updateCurrency,
    updateLanguage,
    updateOperator,
    resetSettings,
    getCurrencySymbol,
    getCurrencyName,
    getLanguageName,
    validateLightningAddress,
    hasOperator,
  };
}
