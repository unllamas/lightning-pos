'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { HandHeart, Printer } from 'lucide-react';
import ReactQRCode from 'react-qr-code';

import { convertToSatoshis, generateLightningInvoice, listenPayment } from '@/lib/lightning-utils';
import { useSettings } from '@/hooks/use-settings';
import { usePrint } from '@/hooks/use-print';

import { AppContent } from '@/components/app/app-content';
import { AppFooter } from '@/components/app/app-footer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import type { PrintOrder } from '@/types/print';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import animationCheck from './payment/animation-check.json';

interface PaymentSuccessProps {
  amount: number;
  currency: string;
  printOrder?: PrintOrder | null;
}

const TIPS = {
  10: 0.1,
  15: 0.15,
  20: 0.2,
};

export function PaymentSuccess({ amount, currency, printOrder }: PaymentSuccessProps) {
  const router = useRouter();
  const { settings, getCurrencySymbol } = useSettings();
  const { print, isAvailable } = usePrint();

  const [isPrinting, setIsPrinting] = useState(false);
  const [percentageTip, setPercentageTip] = useState<number>(0);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [verify, setVerify] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);

  useEffect(() => {
    if (verify) {
      listenPayment({
        verifyUrl: verify,
        intervalMs: 1200,
        maxRetries: 48,
        onPaymentConfirmed: async (isPaid: any) => {
          if (isPaid) {
            setIsPaid(true);
          }
        },
        onPaymentFailed: () => {
          console.log('Payment verification failed after maximum retries.');
        },
      });
    }
  }, [verify, setIsPaid]);

  const handlePrint = useCallback(() => {
    if (!isAvailable || isPrinting) {
      console.warn('Cannot print: no print order or printer not available');
      return;
    }

    print(printOrder!);

    // Simular un pequeño delay para cambiar el estado de impresión
    setTimeout(() => {
      setIsPrinting(false);
    }, 1200);
  }, [isAvailable, isPrinting]);

  const handleGenerateTip = async (value: number | 0) => {
    if (!value || value === 0) {
      return;
    }

    const percentageDiscount = TIPS[value as keyof typeof TIPS];

    try {
      const valueInSats = await convertToSatoshis(amount, currency);
      const tipInSats = Number((valueInSats * percentageDiscount).toFixed(0));

      const data = await generateLightningInvoice(settings?.operator, tipInSats, 'Tip!');

      if (!data?.pr) {
        return;
      }

      setInvoice(data?.pr);
      setVerify(data?.verify as string);
    } catch (error: any) {
      console.log('error', error?.message);
    }
  };

  return (
    <>
      <AppContent className='justify-center'>
        <div className='w-full max-w-md mx-auto px-4'>
          <div className='flex justify-center items-center w-40 h-40 mx-auto rounded-lg'>
            <Lottie animationData={animationCheck} loop={false} />
          </div>
          <div className='flex flex-col justify-center gap-2 text-center'>
            <p className='text-gray-500'>Payment credited</p>
            <div className='text-4xl'>
              {getCurrencySymbol(currency)}
              <b>{amount.toLocaleString()}</b> {currency}
            </div>
          </div>

          {settings?.operator && !isPaid && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className={`w-full mt-4`} size='lg' variant='outline' onClick={() => {}}>
                    <HandHeart />
                    Generate TIP
                  </Button>
                </DialogTrigger>
                <DialogContent
                  onEscapeKeyDown={(e) => e.preventDefault()}
                  onPointerDown={(e) => e.preventDefault()}
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <DialogHeader>
                    <DialogTitle>
                      Purchase of {getCurrencySymbol(currency)} <b>{amount.toLocaleString()}</b> {currency}
                    </DialogTitle>
                    <DialogDescription>Add tip to your purchase.</DialogDescription>
                  </DialogHeader>
                  {percentageTip === 0 && !invoice && (
                    <div className='flex gap-2 w-full'>
                      <Button className='w-full' size='lg' variant={'default'} onClick={() => handleGenerateTip(10)}>
                        10%
                      </Button>
                      <Button className='w-full' size='lg' variant={'default'} onClick={() => handleGenerateTip(15)}>
                        15%
                      </Button>
                      <Button className='w-full' size='lg' variant={'default'} onClick={() => handleGenerateTip(20)}>
                        20%
                      </Button>
                    </div>
                  )}

                  {percentageTip !== 0 ||
                    (invoice && (
                      <div className='flex flex-col items-center w-full'>
                        {!isPaid ? (
                          <ReactQRCode value={invoice} size={280} fgColor={'#000'} bgColor={'#fff'} />
                        ) : (
                          <div className='flex justify-center items-center w-40 h-40 mx-auto rounded-lg'>
                            <Lottie animationData={animationCheck} loop={false} />
                          </div>
                        )}
                      </div>
                    ))}

                  <Button variant='outline' size='lg' asChild>
                    <DialogClose onClick={() => setPercentageTip(0)}>Cancel</DialogClose>
                  </Button>
                </DialogContent>
              </Dialog>

              <div className='mt-2 text-sm text-gray-500 text-center'>For {settings?.operator}</div>
            </>
          )}

          {isPaid && <div className='mt-2 text-sm text-green-600 text-center'>Tip received.</div>}

          {/* Información adicional si hay orden de impresión */}
          {/* {isAvailable && printOrder && (
            <div className='text-center text-sm text-gray-500 mt-4'>
              <p>Order ID: {printOrder?.orderId}</p>
              <p>{new Date(printOrder?.timestamp!).toLocaleString()}</p>
            </div>
          )} */}
        </div>
      </AppContent>

      <AppFooter>
        {isAvailable && printOrder && (
          <Button
            className='w-full flex items-center justify-center gap-2'
            size='lg'
            onClick={() => {
              setIsPrinting(true);
              handlePrint();
            }}
            disabled={isPrinting}
            variant='success'
          >
            {isPrinting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                <span>Printing...</span>
              </>
            ) : (
              <>
                <Printer className='h-4 w-4' />
                <span>Print receipt</span>
              </>
            )}
          </Button>
        )}

        <Button className='w-full' size='lg' variant='secondary' onClick={() => router.back()}>
          Go back
        </Button>
      </AppFooter>
    </>
  );
}
