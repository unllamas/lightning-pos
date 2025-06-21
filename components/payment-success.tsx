'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Printer } from 'lucide-react';

import { useSettings } from '@/hooks/use-settings';
import { usePrint } from '@/hooks/use-print';

import { Button } from '@/components/ui/button';

import type { PrintOrder } from '@/types/print';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import animationCheck from './payment/animation-check.json';

interface PaymentSuccessProps {
  amount: number;
  printOrder?: PrintOrder | null;
}

export function PaymentSuccess({ amount, printOrder }: PaymentSuccessProps) {
  const router = useRouter();
  const { settings, getCurrencySymbol } = useSettings();
  const { print, isAvailable } = usePrint();

  const [isPrinting, setIsPrinting] = useState(false);

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
    <div className='flex flex-col items-center justify-between w-full h-screen mx-auto'>
      <div className='flex-1 flex flex-col items-center justify-center gap-4 w-full bg-white border-b rounded-b-2xl'>
        <div className='w-full max-w-md mx-auto px-4'>
          <div className='flex justify-center items-center w-40 h-40 mx-auto rounded-lg'>
            <Lottie animationData={animationCheck} loop={false} />
          </div>
          <div className='flex flex-col justify-center gap-2 text-center'>
            <p className='text-gray-500'>Payment credited</p>
            <div className='text-4xl'>
              {getCurrencySymbol()}
              <b>{amount.toLocaleString()}</b> {settings.currency}
            </div>
          </div>

          {/* Información adicional si hay orden de impresión */}
          {/* {isAvailable && printOrder && (
            <div className='text-center text-sm text-gray-500 mt-4'>
              <p>Order ID: {printOrder?.orderId}</p>
              <p>{new Date(printOrder?.timestamp!).toLocaleString()}</p>
            </div>
          )} */}
        </div>
      </div>

      <div className='w-full py-4 pb-8'>
        <div className='flex flex-col gap-2 w-full max-w-md mx-auto px-4'>
          {/* Botón de impresión - solo mostrar si hay impresora disponible y orden */}
          {isAvailable && printOrder && (
            <Button
              className='w-full flex items-center justify-center gap-2'
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

          <Button
            className='w-full'
            size='lg'
            variant={isAvailable ? 'outline' : 'secondary'}
            onClick={() => router.back()}
          >
            Go to back
          </Button>
        </div>
      </div>
    </div>
  );
}
