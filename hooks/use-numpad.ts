import { decimalsToUse } from '@/lib/formatter';
import { AvailableCurrencies, CurrenciesList } from '@/types/config';
import { useEffect, useState } from 'react';
import { useCurrencyConverter } from './use-currency-converter';

type AmountType = Record<AvailableCurrencies, number>;
const defaultIntAmount: AmountType = { SAT: 0, ARS: 0, USD: 0, EUR: 0, UYU: 0 };

export interface IUseNumpad {
  usedCurrency: AvailableCurrencies;
  intAmount: AmountType;
  deleteNumber: () => void;
  concatNumber: (strNumber: string) => void;
  handleNumpad: (value: string) => void;
  resetAmount: () => void;
  modifyCurrency: (currency: AvailableCurrencies) => void;
  setCustomAmount: (amount: number, currency: AvailableCurrencies) => void;
  updateNumpadAmount: (new_amount: string) => void;
}

export const useNumpad = (currency: AvailableCurrencies, maxAmount: number = -1): IUseNumpad => {
  const { convertCurrency } = useCurrencyConverter();
  const [usedCurrency, setUsedCurrency] = useState<AvailableCurrencies>(currency);

  const modifyCurrency = (new_currency: AvailableCurrencies) => {
    setCustomAmount(intAmount[new_currency], new_currency);
    setUsedCurrency(new_currency);
  };

  const multiplier = (currency: AvailableCurrencies) => 10 ** decimalsToUse(currency);

  const [intAmount, setIntAmount] = useState<AmountType>(defaultIntAmount);
  const [strAmount, setStrAmount] = useState<string>('0');

  const updateNumpadAmount = (new_amount: string) => {
    const castAmount: number = Number(new_amount);

    const updatedAmount: number = castAmount ? castAmount / multiplier(usedCurrency) : 0;

    const formattedAmounts: AmountType = { ...defaultIntAmount };

    CurrenciesList.map((currency) => {
      if (currency === usedCurrency) {
        formattedAmounts[usedCurrency] = updatedAmount;
      } else {
        const convertedAmount: number = convertCurrency(updatedAmount, usedCurrency, currency);

        formattedAmounts[currency] = convertedAmount;
      }
    });

    setStrAmount(new_amount);
    setIntAmount(formattedAmounts);
  };

  const concatNumber = (strNumber: string) => {
    const concatedStr = strAmount.concat(strNumber.toString());
    if (concatedStr.length >= 12) return alert('MAX_AMOUNT');

    if (maxAmount !== -1) {
      const scaledMaxAmount = maxAmount * multiplier(usedCurrency);
      if (Number(concatedStr) > scaledMaxAmount) {
        updateNumpadAmount(scaledMaxAmount.toFixed(0));
        return;
      }
    }

    strAmount.length === 1 && strAmount === '0' ? updateNumpadAmount(strNumber) : updateNumpadAmount(concatedStr);
  };

  const deleteNumber = () => {
    if (strAmount.length === 1 && strAmount !== '0') {
      updateNumpadAmount('0');
    } else {
      if (strAmount.length > 1) updateNumpadAmount(strAmount.substring(0, strAmount.length - 1));
    }
  };

  const resetAmount = () => updateNumpadAmount('0');

  const setCustomAmount = (amount: number, currency: AvailableCurrencies) => {
    setStrAmount((amount * multiplier(currency)).toFixed(0).toString());
  };

  const handleNumpad = (value: string) => {
    switch (value) {
      case '0':
        if (strAmount !== '0') concatNumber('0');
        break;

      default:
        concatNumber(value);
    }
  };

  useEffect(() => {
    if (usedCurrency !== currency) modifyCurrency(currency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, usedCurrency]);

  return {
    usedCurrency,
    intAmount,
    deleteNumber,
    concatNumber,
    handleNumpad,
    resetAmount,
    modifyCurrency,
    setCustomAmount,
    updateNumpadAmount,
  };
};
