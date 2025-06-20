'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { usePOSData } from '@/hooks/use-pos-data';
import { useSettings } from '@/hooks/use-settings';
import { usePrint } from '@/hooks/use-print';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';

import { PaymentView } from '@/components/payment-view';
import { PaymentSuccess } from '@/components/payment-success';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { PrintOrder } from '@/types/print';
import { AvailableCurrencies } from '@/types/config';

export function PaymentPage() {
  const searchParams = useSearchParams();

  const amount = searchParams.get('amount');

  const { settings } = useSettings();
  const { convertCurrency } = useCurrencyConverter();
  const { products, cart, isLoading, error, clearCart } = usePOSData();
  const { print } = usePrint();

  const [paymentStatus, setPaymentStatus] = useState<'selecting' | 'pending' | 'success'>('selecting');
  // const [tipOption, setTipOption] = useState<'with-tip' | 'without-tip' | null>(null);
  const [finalAmount, setFinalAmount] = useState(0);
  const [printOrder, setPrintOrder] = useState<PrintOrder | null>(null);

  const operatorHasLightningAddress = settings.operatorLightningAddress?.trim() !== '';

  // Auto-redirect si no hay Lightning Address del operador
  useEffect(() => {
    if (!isLoading && !operatorHasLightningAddress && Number(amount) > 0) {
      setFinalAmount(Number(amount));
      setPaymentStatus('pending');
    }
  }, [isLoading, operatorHasLightningAddress]);

  const handleCompletePayment = () => {
    if (finalAmount > 0) {
      // Calcular tip amount si aplica
      // const tipAmount = tipOption === 'with-tip' ? subtotal * 0.1 : undefined;

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

  if (isLoading) {
    <div className='flex justify-center items-center w-screen h-screen'>
      <LoadingSpinner />
    </div>;
  }

  if (!isLoading && error) {
    return (
      <div className='w-full max-w-md mx-auto bg-gray-100 min-h-screen flex flex-col items-center justify-center p-8'>
        <p className='text-red-500 text-center'>Error: {error}</p>
        <button onClick={() => window.location.reload()} className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'>
          Try again
        </button>
      </div>
    );
  }

  return (
    <Suspense>
      <div className='w-full h-full'>
        {paymentStatus === 'pending' && (
          <PaymentView
            amount={Number(amount)}
            cart={cart}
            products={products}
            onCompletePayment={handleCompletePayment}
          />
        )}

        {paymentStatus === 'success' && <PaymentSuccess amount={finalAmount} printOrder={printOrder} />}
      </div>
    </Suspense>
  );
}
