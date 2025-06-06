'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { usePOSData } from '@/hooks/use-pos-data';
import { useSettings } from '@/hooks/use-settings';
import { usePrint } from '@/hooks/use-print';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';

import { PaymentView } from '@/components/payment-view';
import { PaymentSuccess } from '@/components/payment-success';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PrintOrder } from '@/types/print';

interface PaymentPageProps {
  orderId: string;
}

export function PaymentPage({ orderId }: PaymentPageProps) {
  const router = useRouter();

  const { settings } = useSettings();
  const { convertCurrency } = useCurrencyConverter();
  const { products, cart, isLoading, error, clearCart } = usePOSData();
  const { print } = usePrint();

  const [paymentStatus, setPaymentStatus] = useState<'selecting' | 'pending' | 'success'>('selecting');
  const [tipOption, setTipOption] = useState<'with-tip' | 'without-tip' | null>(null);
  const [finalAmount, setFinalAmount] = useState(0);
  const [printOrder, setPrintOrder] = useState<PrintOrder | null>(null);

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const operatorHasLightningAddress = settings.operatorLightningAddress?.trim() !== '';

  // Auto-redirect si no hay Lightning Address del operador
  useEffect(() => {
    if (!isLoading && !operatorHasLightningAddress && subtotal > 0) {
      setFinalAmount(subtotal);
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
        subtotal: finalAmount,
        total: convertCurrency(finalAmount, 'SAT', 'ARS'),
        totalSats: finalAmount,
        currency: settings?.currency,
        currencySymbol: settings?.currency,
        items: [
          {
            name: 'Caja',
            price: 100,
            qty: 1,
          },
        ],
        orderId,
      };

      // const printOrder = {
      //   subtotal: 69,
      //   total: 100,
      //   currency: 'PES',
      //   currencySymbol: 'TEST',
      //   items: [
      //     {
      //       name: 'Test Product',
      //       quantity: 1,
      //       price: 69,
      //       total: 69,
      //     },
      //   ],
      //   orderId,
      // };

      setPrintOrder(printOrder);
      print(printOrder);

      // Limpiar carrito
      clearCart();
    }
  };

  const handleBackToShop = () => {
    router.push('/shop');
  };

  const handleCancel = () => {
    if (paymentStatus === 'selecting') {
      router.push('/cart');
    } else {
      if (operatorHasLightningAddress) {
        setPaymentStatus('selecting');
        setTipOption(null);
        setFinalAmount(0);
      } else {
        router.push('/cart');
      }
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
    <div className='w-full bg-gray-100 min-h-screen'>
      {paymentStatus === 'pending' && (
        <PaymentView
          amount={finalAmount}
          cart={cart}
          products={products}
          onCancel={handleCancel}
          onCompletePayment={handleCompletePayment}
        />
      )}

      {paymentStatus === 'success' && (
        <PaymentSuccess amount={finalAmount} printOrder={printOrder} onBackToShop={handleBackToShop} />
      )}
    </div>
  );
}
