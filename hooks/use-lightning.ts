'use client';

import { useState, useCallback, useEffect } from 'react';

import { useAuth } from '@/context/auth';
import { convertToSatoshis, generateLightningInvoice } from '@/lib/lightning-utils';

type Status = 'pending' | 'paid' | 'error';

export function useLightning() {
  const { lightningAddress } = useAuth();

  const [amount, setAmount] = useState<number>(0);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [verify, setVerify] = useState<string | null>(null);

  const [status, setStatus] = useState<Status>('pending');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoice || isPaid) return;
    const interval = setInterval(async () => {
      try {
        const response = await fetch(verify as string);
        const data: { settled: boolean } = await response.json();

        if (data?.settled) {
          clearInterval(interval);
          setIsPaid(true);
          setStatus('paid');
        }
      } catch (error: any) {
        setStatus('error');
        setError(error.message || 'Error polling response');
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [invoice, isPaid]);

  const handleCreateInvoice = useCallback(
    async (amount: number, currency: string): Promise<any> => {
      setStatus('pending');

      try {
        const valueInSats = await convertToSatoshis(amount, currency);
        setAmount(valueInSats);

        const data = await generateLightningInvoice(lightningAddress as string, valueInSats);

        if (!data.pr) {
          throw new Error(`Ooops`);
        }

        setInvoice(data.pr);
        setVerify(data?.verify as string);

        return new Promise((resolve) => {
          resolve({ ...data });
        });
      } catch (error: any) {
        setStatus('error');
        setError(error.message || 'Error generating invoice');
        throw error;
      }
    },
    [setIsPaid],
  );

  const clear = useCallback(() => {
    setStatus('pending');
    setError(null);
    setIsPaid(false);
    setInvoice(null);
    setVerify(null);
  }, []);

  return {
    amount,
    invoice,
    error,
    status,
    isPaid,
    createInvoice: handleCreateInvoice,
    clearInvoice: clear,
  };
}
