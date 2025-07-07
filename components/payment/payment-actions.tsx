'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Check, CheckCircle, Copy, Nfc } from 'lucide-react';

import { useCard } from '@/hooks/use-card';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { ScanAction, ScanCardStatus } from '@/types/card';
import { LNURLResponse, LNURLWStatus } from '@/types/lnurl';
import { useToast } from '@/hooks/use-toast';

interface PaymentActionsProps {
  invoice: string | null;
}

export function PaymentActions({ invoice }: PaymentActionsProps) {
  const { toast } = useToast();
  const router = useRouter();

  const { isAvailable, status: scanStatus, scan, stop } = useCard();

  // Local states
  const [cardStatus, setCardStatus] = useState<LNURLWStatus>(LNURLWStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const processRegularPayment = useCallback(
    async (cardUrl: string, response: LNURLResponse) => {
      setCardStatus(LNURLWStatus.CALLBACK);
      const url = response.callback;
      const _response = await axios.get(url, {
        params: { k1: response.k1, pr: invoice },
      });

      if (_response.status < 200 || _response.status >= 300) {
        throw new Error(`Error al intentar cobrar ${_response.status}}`);
      }
      if (_response.data.status !== 'OK') {
        throw new Error(`Error al intentar cobrar ${_response.data.reason}}`);
      }

      setCardStatus(LNURLWStatus.DONE);
    },
    [invoice],
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
  useEffect(() => {
    switch (scanStatus) {
      // case ScanCardStatus.SCANNING:
      //   toast({
      //     title: '',
      //     description: `Available for NFC scanning`,
      //   });
      //   setCardStatus(LNURLWStatus.SCANNING);
      //   break;
      case ScanCardStatus.REQUESTING:
        toast({
          title: '',
          description: `Procesing...`,
          duration: 1200,
        });
        setCardStatus(LNURLWStatus.REQUESTING);
        break;
      case ScanCardStatus.ERROR:
        toast({
          title: 'Oops',
          description: `Error in: ${error}`,
        });
        setCardStatus(LNURLWStatus.ERROR);
        break;
    }
  }, [scanStatus]);

  // on Mount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const copyInvoice = async () => {
    if (invoice) {
      try {
        await navigator.clipboard.writeText(invoice);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy invoice:', err);
      }
    }
  };

  return (
    <div className='relative z-0 w-full'>
      <div className='flex flex-col gap-2 w-full max-w-md mx-auto px-4 pt-4 pb-8'>
        {isAvailable && (
          <Button
            size='lg'
            onClick={() => {
              cardStatus === LNURLWStatus.IDLE && startRead();
            }}
            disabled={!invoice || (cardStatus !== LNURLWStatus.IDLE && cardStatus !== LNURLWStatus.DONE)}
            className={`w-full ${cardStatus !== LNURLWStatus.DONE ? `bg-blue-600 hover:bg-blue-700` : `bg-green-600`} ${
              cardStatus === LNURLWStatus.DONE && 'cursor-not-allowed'
            } text-white`}
          >
            {cardStatus === LNURLWStatus.DONE ? (
              <Check className='h-4 w-4' />
            ) : cardStatus === LNURLWStatus.REQUESTING ||
              cardStatus === LNURLWStatus.SCANNING ||
              cardStatus === LNURLWStatus.CALLBACK ? (
              <LoadingSpinner />
            ) : cardStatus === LNURLWStatus.ERROR ? (
              <span>Oops! Try again</span>
            ) : (
              <>
                <Nfc className='h-4 w-4' />
                <span>Request NFC</span>
              </>
            )}
          </Button>
        )}

        {process.env.NODE_ENV === 'development' && invoice && (
          <Button variant='outline' size='lg' onClick={copyInvoice} className='w-full'>
            {copied ? (
              <>
                <CheckCircle className='h-4 w-4' />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className='h-4 w-4' />
                <span>Copy</span>
              </>
            )}
          </Button>
        )}

        <Button variant='secondary' size='lg' className='w-full' onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
