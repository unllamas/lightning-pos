'use client';

import { useEffect } from 'react';

import { useSettings } from '@/hooks/use-settings';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';
import { usePaymentGeneration } from '@/hooks/use-payment-generation';
import { usePaymentVerification } from '@/lib/lightning-utils';

import { PaymentError } from '@/components/payment/payment-error';
import { PaymentQRDisplay } from '@/components/payment/payment-qr-display';
import { PaymentActions } from '@/components/payment/payment-actions';

import type { Product } from '@/lib/types';
import { AvailableCurrencies } from '@/types/config';

// Primero, añadir los props necesarios
interface PaymentViewProps {
  amount: number;
  cart?: { id: string; quantity: number }[];
  products?: Product[];
  onCancel: () => void;
  onCompletePayment: () => void;
}

// Luego, actualizar la desestructuración de props
export function PaymentView({ amount, cart = [], products = [], onCancel, onCompletePayment }: PaymentViewProps) {
  const { settings } = useSettings();
  const { convertCurrency } = useCurrencyConverter();
  const {
    qrCodeDataUrl,
    lightningInvoice,
    verifyUrl,
    paymentHash,
    amountInSats,
    isGenerating,
    error,
    generatePayment,
    resetPayment,
  } = usePaymentGeneration();

  // Hook para verificar el pago automáticamente
  const { isVerifying, verificationError } = usePaymentVerification(
    verifyUrl,
    paymentHash,
    onCompletePayment,
    3000, // Verificar cada 3 segundos
  );

  // Finalmente, actualizar la llamada a generatePayment
  useEffect(() => {
    generatePayment(amount, cart, products);
  }, [amount, cart, products, generatePayment]);

  const retryGeneration = () => {
    resetPayment();
    generatePayment(amount);
  };

  if (error) {
    return <PaymentError error={error} amount={amount} onRetry={retryGeneration} onCancel={onCancel} />;
  }

  return (
    <div className='flex flex-col items-center justify-between w-full h-screen mx-auto relative'>
      <PaymentQRDisplay
        qrCodeDataUrl={qrCodeDataUrl}
        amount={amount}
        amountInSats={convertCurrency(amount, settings?.currency as AvailableCurrencies, 'SAT')}
        lightningInvoice={lightningInvoice}
        isGenerating={isGenerating}
      />

      <PaymentActions lightningInvoice={lightningInvoice} onCancel={onCancel} />
    </div>
  );
}
