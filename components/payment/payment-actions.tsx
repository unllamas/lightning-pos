'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Nfc } from 'lucide-react';

import { useCard } from '@/hooks/use-card';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { ScanAction, ScanCardStatus } from '@/types/card';
import { LNURLResponse, LNURLWStatus } from '@/types/lnurl';
import { useToast } from '@/hooks/use-toast';

interface PaymentActionsProps {
  lightningInvoice: string | null;
  onCancel: () => void;
}

export function PaymentActions({ lightningInvoice, onCancel }: PaymentActionsProps) {
  const { toast } = useToast();

  const { isAvailable, status: scanStatus, scan, stop } = useCard();

  // Local states
  const [cardStatus, setCardStatus] = useState<LNURLWStatus>(LNURLWStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

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
    setCardStatus(LNURLWStatus.SCANNING);

    try {
      const { cardUrl, lnurlResponse } = await scan(ScanAction.PAY_REQUEST);
      await processRegularPayment(cardUrl, lnurlResponse);
    } catch (e) {
      setCardStatus(LNURLWStatus.ERROR);
      setError((e as Error).message);
      toast({
        title: 'Oops',
        description: (e as Error).message,
      });
    }
  }, [processRegularPayment, scan]);

  // on card scanStatus change
  // useEffect(() => {
  //   switch (scanStatus) {
  //     case ScanCardStatus.SCANNING:
  //       toast({
  //         title: '',
  //         description: `Available for NFC scanning`,
  //       });
  //       setCardStatus(LNURLWStatus.SCANNING);
  //       break;
  //     case ScanCardStatus.REQUESTING:
  //       toast({
  //         title: '',
  //         description: `Procesing...`,
  //       });
  //       setCardStatus(LNURLWStatus.REQUESTING);
  //       break;
  //     case ScanCardStatus.ERROR:
  //       toast({
  //         title: 'Oops',
  //         description: `Error in: ${error}`,
  //       });
  //       setCardStatus(LNURLWStatus.ERROR);
  //       break;
  //   }
  // }, [scanStatus]);

  // on Mount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <div className='relative z-0 w-full py-4 bg-white border-t'>
      <div className='flex flex-col gap-2 w-full max-w-md mx-auto px-4'>
        {isAvailable && (
          <Button
            onClick={startRead}
            disabled={!lightningInvoice || cardStatus === LNURLWStatus.SCANNING || cardStatus === LNURLWStatus.DONE}
            className={`w-full ${
              cardStatus !== LNURLWStatus.DONE ? `bg-blue-600 hover:bg-blue-700` : `bg-green-600`
            } text-white`}
          >
            {cardStatus === LNURLWStatus.DONE ? (
              <>
                <Check className='h-4 w-4' />
                {/* <span>Done</span> */}
              </>
            ) : cardStatus === LNURLWStatus.REQUESTING || cardStatus === LNURLWStatus.SCANNING ? (
              <LoadingSpinner />
            ) : cardStatus === LNURLWStatus.ERROR ? (
              <span>Error: {error}</span>
            ) : (
              <>
                <Nfc className='h-4 w-4' />
                <span>Request NFC</span>
              </>
            )}
          </Button>
        )}

        <Button variant='outline' className='w-full' onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
