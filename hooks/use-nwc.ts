'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LN, webln } from '@getalby/sdk';

import { convertToSatoshis } from '@/lib/lightning-utils';
import { getLocal } from '@/lib/localStorage';
import { trackPurchase } from '@/lib/gtag';

type Status = 'pending' | 'paid' | 'error';

export function useNwc() {
  const searchParams = useSearchParams();

  const _amount = searchParams.get('amt');
  const _currency = searchParams.get('cur');

  const [amount, setAmount] = useState<number>(0);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('pending');
  const [error, setError] = useState<string | null>(null);

  const authData = getLocal('lnpos-auth');

  // Verify payment using Lightning Address or NWC
  const verifyPayment = useCallback(async (): Promise<any> => {
    if (status === 'paid') {
      return;
    }

    try {
      // Use NWC to check payment status
      const provider = new webln.NostrWebLNProvider({ nostrWalletConnectUrl: authData?.nwcString });
      await provider.enable();

      const transactions: any = await provider.listTransactions({});

      const payment = transactions?.transactions?.find((tx: any) => {
        return tx.payment_hash === hash;
      });

      console.log('Payment found:', payment);

      if (payment && payment.state === 'settled') {
        console.log('Payment confirmed!');
        setStatus('paid');
        return;
      }
    } catch (error: any) {
      console.error('NWC payment verification error:', error);
      setError(error.message ?? 'Error in verify invoice');
      setStatus('error');
      return;
    }
  }, [authData?.nwcString, hash, status]);

  const createInvoice = useCallback(
    async (description?: string): Promise<any> => {
      if (invoice) {
        throw new Error('Oops...');
      }

      if (!authData?.nwcString) {
        setError('Error in NWC');
        throw new Error('Error in NWC');
      }

      const ln = new LN(authData?.nwcString);

      try {
        const result = await convertToSatoshis(Number(_amount), _currency as string);
        setAmount(result);

        const request = await ln.requestPayment({ satoshi: result });
        const { invoice } = request;

        // Extract payment hash from the invoice if not provided
        if (!invoice?.paymentRequest) {
          console.warn('Could not extract payment hash from invoice');
          throw new Error('Could not extract payment hash from invoice');
        }

        setInvoice(invoice?.paymentRequest);
        setHash(invoice?.paymentHash);

        // Event for GA-4
        trackPurchase({
          transaction_id: invoice?.paymentHash,
          value: Number(_amount),
          currency: _currency as string,
          items: [],
        });
      } catch (error: any) {
        setError(error.message ?? 'Error generating invoice');
        setStatus('error');
        return;
      }
    },
    [_amount, _currency, authData, invoice],
  );

  useEffect(() => {
    if (!hash || status === 'paid' || status === 'error') return;

    const interval = setInterval(() => {
      verifyPayment();
    }, 1200);

    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, [hash, status, verifyPayment]);

  return {
    amount,
    invoice,
    status,
    error,
    createInvoice,
  };
}
