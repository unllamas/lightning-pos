'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Nfc } from 'lucide-react';

import { ScanCardStatus } from '@/hooks/use-nfc';
import { useCard } from '@/hooks/use-card';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { ScanAction } from '@/types/card';
import { LNURLResponse, LNURLWStatus } from '@/types/lnurl';

interface PaymentActionsProps {
  lightningInvoice: string | null;
  onCancel: () => void;
}

export function PaymentActions({ lightningInvoice, onCancel }: PaymentActionsProps) {
  const { isAvailable, permission, status: scanStatus, scan, stop } = useCard();

  const [cardStatus, setCardStatus] = useState<LNURLWStatus>(LNURLWStatus.IDLE);

  const processRegularPayment = useCallback(
    async (cardUrl: string, response: LNURLResponse) => {
      setCardStatus(LNURLWStatus.CALLBACK);
      const url = response.callback;
      const _response = await axios.get(url, {
        params: { k1: response.k1, pr: lightningInvoice },
      });

      if (_response.status < 200 || _response.status >= 300) {
        throw new Error(`Error al intentar cobrar ${_response.status}}`);
      }
      if (_response.data.status !== 'OK') {
        throw new Error(`Error al intentar cobrar ${_response.data.reason}}`);
      }
      setCardStatus(LNURLWStatus.DONE);
    },
    [lightningInvoice],
  );

  const startRead = useCallback(async () => {
    try {
      const { cardUrl, lnurlResponse } = await scan(ScanAction.PAY_REQUEST);
      await processRegularPayment(cardUrl, lnurlResponse);
    } catch (e) {
      setCardStatus(LNURLWStatus.ERROR);
      // setError((e as Error).message);
    }
  }, [processRegularPayment, scan]);

  useEffect(() => {
    switch (scanStatus) {
      case ScanCardStatus.SCANNING:
        setCardStatus(LNURLWStatus.SCANNING);
        break;
      case ScanCardStatus.REQUESTING:
        setCardStatus(LNURLWStatus.REQUESTING);
        break;
      case ScanCardStatus.ERROR:
        setCardStatus(LNURLWStatus.ERROR);
        break;
    }
  }, [scanStatus]);

  const handleStatusNFC = useCallback(() => {
    switch (scanStatus) {
      case ScanCardStatus.IDLE:
        return (
          <>
            <Nfc className='h-4 w-4' />
            <span>Pay via NFC</span>
          </>
        );
      case ScanCardStatus.SCANNING:
        return <LoadingSpinner />;
      case ScanCardStatus.REQUESTING:
        return <LoadingSpinner />;
      case ScanCardStatus.DONE:
        return <Check className='h-4 w-4' />;
      case ScanCardStatus.ERROR:
        stop();
        return <>Oops</>;
      default:
        return <span>:)</span>;
    }
  }, [scanStatus]);

  return (
    <div className='relative z-0 w-full py-4 bg-white border-t'>
      <div className='flex flex-col gap-2 w-full max-w-md mx-auto px-4'>
        {isAvailable && (
          <Button
            onClick={startRead}
            disabled={
              cardStatus === LNURLWStatus.SCANNING ||
              cardStatus === LNURLWStatus.REQUESTING ||
              cardStatus === LNURLWStatus.CALLBACK ||
              cardStatus === LNURLWStatus.DONE ||
              !lightningInvoice
            }
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white`}
          >
            {handleStatusNFC()}
          </Button>
        )}

        <Button variant='outline' className='w-full' onClick={onCancel}>
          Cancel
        </Button>

        {/* Botón para simular pago exitoso - solo en desarrollo o si no hay verificación automática
        {(process.env.NODE_ENV === "development" || !verifyUrl) && (
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={onCompletePayment}>
            {verifyUrl ? "Simulate Payment" : "Mark as Paid"}
          </Button>
        )} */}
      </div>
    </div>
  );
}
