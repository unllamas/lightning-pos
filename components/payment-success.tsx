'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { HandHeart, Printer } from 'lucide-react';
import ReactQRCode from 'react-qr-code';

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

export function PaymentSuccess({ amount, currency, printOrder }: PaymentSuccessProps) {
  const router = useRouter();
  const { settings, getCurrencySymbol } = useSettings();
  const { print, isAvailable } = usePrint();

  const [isPrinting, setIsPrinting] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

          {settings?.operator && (
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
                      Total: {getCurrencySymbol(currency)} <b>{amount.toLocaleString()}</b> {currency}
                    </DialogTitle>
                    <DialogDescription>
                      Suggested tip of {getCurrencySymbol(currency)} <b>{(amount * 0.1).toLocaleString()}</b> {currency}{' '}
                      (10%)
                    </DialogDescription>
                  </DialogHeader>

                  <div className='flex flex-col items-center w-full'>
                    <ReactQRCode value={settings?.operator} size={280} fgColor={'#000'} bgColor={'#fff'} />
                  </div>

                  <DialogClose asChild>
                    <Button
                      id='btn-cancel-tip'
                      type='button'
                      variant='outline'
                      size='lg'
                      onClick={() => {
                        setIsOpen(false);
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
