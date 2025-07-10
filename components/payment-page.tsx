'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { useNwc } from '@/hooks/use-nwc';
import { usePrint } from '@/hooks/use-print';

import { AppViewport } from '@/components/app/app-viewport';
import { PaymentView } from '@/components/payment-view';
import { PaymentSuccess } from '@/components/payment-success';
import { PaymentError } from '@/components/payment/payment-error';

import { PrintOrder } from '@/types/print';

export function PaymentPage() {
  const searchParams = useSearchParams();

  const _amount = searchParams.get('amount');
  const _currency = searchParams.get('currency');

  const { amount, invoice, createInvoice, status, error } = useNwc();
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
