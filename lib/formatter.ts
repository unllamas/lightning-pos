// @ts-nocheck

import { format } from 'date-fns';
import { AvailableCurrencies, CurrenciesMetadata } from '@/types/config';
import { enUS, es } from 'date-fns/locale';
import { AvailableLanguages } from '@/translations';

export const formatter = (minDecimals: number = 2, maxDecimals: number = 2, currency?: string): Intl.NumberFormat =>
  new Intl.NumberFormat(currency ? CurrenciesMetadata[currency].locale : 'es-AR', {
    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: minDecimals, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: maxDecimals, // (causes 2500.99 to be printed as $2,501)
  });

export const decimalsToUse = (currency: AvailableCurrencies): number => {
  switch (currency) {
    case 'SAT':
      return 0;

    case 'ARS':
      return 0;

    default:
      return 2;
  }
};

export const roundToDown = (num: number, decimals: number): number => {
  const t = Math.pow(10, decimals);
  return Number(
    (Math.floor(num * t + (decimals > 0 ? 1 : 0) * (Math.sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(
      decimals,
    ),
  );
};

export const roundNumber = (num: number, decimales: number = 5): number => {
  const signo: number = num >= 0 ? 1 : -1;
  num = num * signo;
  if (decimales === 0) return signo * Math.round(num);

  const multiplicador: number = Math.pow(10, decimales);
  num = Math.round(num * multiplicador) / multiplicador;

  return signo * num;
};

export const formatAddress = (address: string, size: number = 22): string => {
  if (address) {
    const formattedAddress: string = `${address.substring(0, size)}...${address.substring(
      address.length - 4,
      address.length,
    )}`;

    return formattedAddress;
  }

  return address;
};

export const dateFormatter = (lng: AvailableLanguages, date: Date | number, strFormat?: string): string => {
  return format(date, strFormat ?? 'MMM d, yyyy. HH:mm a', {
    locale: lng === 'es' ? es : enUS,
  });
};

export const upperText = (text: string): string => (text ? text.toUpperCase() : '');
export const lowerText = (text: string): string => (text ? text.toLowerCase() : '');

export const formatToPreference = (currency: AvailableCurrencies, amount: number, round?: boolean): string => {
  const maxDecimals: number = decimalsToUse(currency);
  const minDecimals: number = round ? 2 : maxDecimals;

  return formatter(minDecimals, maxDecimals, currency).format(amount);
};
