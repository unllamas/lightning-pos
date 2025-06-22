'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { usePOSData } from '@/hooks/use-pos-data';
import { useSettings } from '@/hooks/use-settings';
import { usePrint } from '@/hooks/use-print';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';
import { usePayment } from '@/hooks/use-payment';

import { PaymentView } from '@/components/payment-view';
import { PaymentSuccess } from '@/components/payment-success';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { PrintOrder } from '@/types/print';
import { AvailableCurrencies } from '@/types/config';
import { PaymentError } from './payment/payment-error';

export function PaymentPage() {
  const searchParams = useSearchParams();

  const amount = searchParams.get('amount');
  const lnaddress = searchParams.get('lnaddress');

  const { settings } = useSettings();
  const { convertCurrency } = useCurrencyConverter();
  const { products, cart, isLoading, error: errorPos, clearCart } = usePOSData();
  const { print } = usePrint();

  const handleCompletePayment = () => {
    if (finalAmount > 0) {
      // Cambiar estado
      setPaymentStatus('success');

      // Generar orden de impresión
      const printOrder = {
        total: finalAmount,
        currency: settings?.currency,
        totalSats: convertCurrency(finalAmount, settings?.currency as AvailableCurrencies, 'SAT'),
        // items: cartItems.map((item) => ({
        //   name: item?.product?.name,
        //   price: item?.product?.price,
        //   qty: item?.quantity,
        // })),
      };

      setPrintOrder(printOrder as any);
      print(printOrder as any);

      // Limpiar carrito
      clearCart();
    }
  };

  // Payment
  const { lightningInvoice, amountInSats, isGenerating, error, generatePayment, resetPayment } = usePayment({
    lnaddress: lnaddress as string,
    onComplete: handleCompletePayment,
  });

  const [paymentStatus, setPaymentStatus] = useState<'selecting' | 'pending' | 'success'>('selecting');
  const [finalAmount, setFinalAmount] = useState(0);
  const [printOrder, setPrintOrder] = useState<PrintOrder | null>(null);

  // Finalmente, actualizar la llamada a generatePayment
  useEffect(() => {
    generatePayment(Number(amount), cart, products);
  }, [amount, cart, products]);

  // Auto-redirect si no hay Lightning Address del operador
  useEffect(() => {
    if (!isLoading && Number(amount) > 0) {
      setFinalAmount(Number(amount));
      setPaymentStatus('pending');
    }
  }, [isLoading, amount]);

  const retryGeneration = () => {
    resetPayment();
    generatePayment(Number(amount));
  };

  if (error) {
    return (
      <div className='w-full h-full bg-[#0F0F0F]'>
        <PaymentError error={error} amount={Number(amount)} onRetry={retryGeneration} />
      </div>
    );
  }

  if (isLoading) {
    <div className='flex justify-center items-center w-screen h-screen'>
      <LoadingSpinner />
    </div>;
  }

  if (!isLoading && errorPos) {
    return (
      <div className='w-full max-w-md mx-auto bg-gray-100 min-h-screen flex flex-col items-center justify-center p-8'>
        <p className='text-red-500 text-center'>Error: {errorPos}</p>
        <button onClick={() => window.location.reload()} className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'>
          Try again
        </button>
      </div>
    );
  }

  return (
    <Suspense>
      <div className='w-full h-full bg-[#0F0F0F]'>
        {paymentStatus === 'pending' && (
          <PaymentView
            invoice={lightningInvoice as string}
            amount={Number(amount)}
            amountInSats={Number(amountInSats)}
            isLoading={isGenerating}
          />
        )}

        {paymentStatus === 'success' && <PaymentSuccess amount={finalAmount} printOrder={printOrder} />}
      </div>
    </Suspense>
  );
}
