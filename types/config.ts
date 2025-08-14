export type AvailableCurrencies = 'SAT' | 'USD' | 'ARS' | 'EUR' | 'UYU';
export const CurrenciesList: AvailableCurrencies[] = ['SAT', 'USD', 'ARS', 'UYU'];

type CurrencyMetadata = {
  locale: string;
};

export const CurrenciesMetadata: Record<AvailableCurrencies, CurrencyMetadata> = {
  ARS: {
    locale: 'es-AR',
  },
  SAT: {
    locale: 'es-AR',
  },
  USD: {
    locale: 'en-US',
  },
  EUR: {
    locale: 'en-US',
  },
  UYU: {
    locale: 'es-AR',
  },
};

export type ConfigProps = {
  hideBalance: boolean;
  currency: AvailableCurrencies;
};

export const defaultConfig: ConfigProps = {
  hideBalance: false,
  currency: 'SAT',
};
