'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Copy, HandHeart, Printer } from 'lucide-react';
import ReactQRCode from 'react-qr-code';

import { convertToSatoshis, generateLightningInvoice } from '@/lib/lightning-utils';
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [percentageTip, setPercentageTip] = useState<number>(0);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [paymentListener, setPaymentListener] = useState<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Función para limpiar el listener de pagos
  const clearPaymentListener = useCallback(() => {
    if (paymentListener) {
      clearInterval(paymentListener);
      setPaymentListener(null);
    }
  }, [paymentListener]);

  // Función para iniciar la escucha de pagos
  const startPaymentListener = useCallback(
    (verifyUrl: string) => {
      // Limpiar cualquier listener existente
      clearPaymentListener();

      const interval = setInterval(async () => {
        try {
          const response = await fetch(verifyUrl);
          const data: { settled: boolean } = await response.json();

          if (response.ok && data.settled) {
            // Pago confirmado
            clearInterval(interval);
            setPaymentListener(null);
            setIsPaid(true);
            console.log('Payment confirmed!');
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 1200); // Verificar cada 1200ms

      setPaymentListener(interval);
    },
    [clearPaymentListener],
  );

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

  // Limpiar el listener cuando se cierra el modal
  useEffect(() => {
    if (!isOpen && paymentListener) {
      clearPaymentListener();
    }
  }, [isOpen, paymentListener, clearPaymentListener]);

  // Limpiar el listener cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (paymentListener) {
        clearPaymentListener();
      }
    };
  }, [paymentListener, clearPaymentListener]);

  const handleGenerateTip = async (value: number | 0) => {
    if (!value || value === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);
    const percentageDiscount = TIPS[value as keyof typeof TIPS];

    try {
      const valueInSats = await convertToSatoshis(amount, currency);
      const tipInSats = Number((valueInSats * percentageDiscount).toFixed(0));

      const data = await generateLightningInvoice(settings?.operator, tipInSats, 'Tip!');

      if (!data?.pr) {
        return;
      }

      setInvoice(data?.pr);
      if (data?.verify) {
        startPaymentListener(data.verify);
      }
    } catch (error: any) {
      setIsLoading(false);
      setError(error?.message);
      console.log('error', error?.message);
    }
  };

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
              <Dialog open={isOpen}>
                <DialogTrigger asChild>
                  <Button
                    id='btn-generate-tip'
                    className={`w-full mt-4`}
                    size='lg'
                    variant='outline'
                    onClick={() => setIsOpen(true)}
                  >
                    <HandHeart />
                    Generate Tip
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
                      <Button
                        id='btn-10-percentage'
                        className='w-full'
                        size='lg'
                        variant={'default'}
                        disabled={!!error || isLoading}
                        onClick={() => handleGenerateTip(10)}
                      >
                        10%
                      </Button>
                      <Button
                        id='btn-15-percentage'
                        className='w-full'
                        size='lg'
                        variant={'default'}
                        disabled={!!error || isLoading}
                        onClick={() => handleGenerateTip(15)}
                      >
                        15%
                      </Button>
                      <Button
                        id='btn-20-percentage'
                        className='w-full'
                        size='lg'
                        variant={'default'}
                        disabled={!!error || isLoading}
                        onClick={() => handleGenerateTip(20)}
                      >
                        20%
                      </Button>
                    </div>
                  )}

                  {error && (
                    <div className='flex items-center gap-2 text-red-600 text-sm'>
                      <AlertCircle className='min-h-4 min-w-4' />
                      <span>{error}</span>
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

                  <DialogClose asChild>
                    <Button
                      id='btn-cancel-tip'
                      type='button'
                      variant='outline'
                      size='lg'
                      onClick={() => {
                        setIsOpen(false);
                        setPercentageTip(0);
                        setInvoice(null);
                        setError(null);
                        setIsPaid(false);
                        clearPaymentListener();
                        setIsLoading(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
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

        <Button id='btn-go-back' className='w-full' size='lg' variant='secondary' onClick={() => router.back()}>
          Go back
        </Button>
      </AppFooter>
    </>
  );
}
