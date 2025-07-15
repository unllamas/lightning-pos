'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { useNwc } from '@/hooks/use-nwc';
import { usePrint } from '@/hooks/use-print';
import { usePOSData } from '@/hooks/use-pos-data';
import { trackPurchase } from '@/lib/gtag';

import { AppViewport } from '@/components/app/app-viewport';
import { PaymentView } from '@/components/payment-view';
import { PaymentSuccess } from '@/components/payment-success';
import { PaymentError } from '@/components/payment/payment-error';

import { PrintOrder } from '@/types/print';

export function PaymentPage() {
  const searchParams = useSearchParams();

  const _amount = searchParams.get('amt');
  const _currency = searchParams.get('cur');

  const { products, categories, cart } = usePOSData();
  const { amount, invoice, hash, createInvoice, status, error } = useNwc();
  const { print } = usePrint();

  const handleCompletePayment = () => {
    if (amount > 0) {
      // Cambiar estado
      // Generar orden de impresión
      const printOrder = {
        total: amount,
        currency: _currency,
        totalSats: amount,
      };

      const items = cart.map((item) => {
        const product = products.find((p) => p.id === item.id);
        const category = categories.find((category) => category.id === product?.categoryId);

        return {
          item_id: product?.id as string,
          item_name: product?.name as string,
          item_category: category?.name as string,
          currency: _currency as string,
          price: product?.price,
          quantity: item?.quantity,
        };
      });

      // Event for GA-4
      trackPurchase({
        transaction_id: hash as string,
        value: Number(_amount),
        currency: _currency as string,
        items,
      });

      setPrintOrder(printOrder as any);
      print(printOrder as any);
    }
  };

  const [printOrder, setPrintOrder] = useState<PrintOrder | null>(null);

  useEffect(() => {
    !invoice && createInvoice();
  }, [invoice]);

  useEffect(() => {
    if (status === 'paid') {
      handleCompletePayment();
    }
  }, [status]);

  if (error) {
    return <PaymentError error={error} amount={Number(_amount)} currency={_currency as string} />;
  }

  return (
    <Suspense>
      <AppViewport>
        {status === 'pending' && (
          <PaymentView
            invoice={invoice as string}
            amount={Number(_amount)}
            currency={String(_currency)}
            amountInSats={Number(amount)}
            isLoading={!invoice}
          />
        )}

        {status === 'paid' && (
          <PaymentSuccess amount={Number(_amount)} currency={String(_currency)} printOrder={printOrder} />
        )}
      </AppViewport>
    </Suspense>
  );
}
