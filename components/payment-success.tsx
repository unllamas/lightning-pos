'use client';

import { useState } from 'react';
import { CheckCircle, Printer, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { usePrint } from '@/hooks/use-print';
import type { PrintOrder } from '@/types/print';

interface PaymentSuccessProps {
  amount: number;
  printOrder?: PrintOrder;
  onBackToShop: () => void;
}

export function PaymentSuccess({ amount, printOrder, onBackToShop }: PaymentSuccessProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);
  const { settings, getCurrencySymbol } = useSettings();
  const { isAvailable: isPrintAvailable, print } = usePrint();

  const handlePrint = async () => {
    if (!printOrder || !isPrintAvailable) {
      console.warn('Cannot print: no print order or printer not available');
      return;
    }

    try {
      setIsPrinting(true);
      print(printOrder);

      // Simular un pequeño delay para mostrar el estado de impresión
      setTimeout(() => {
        setIsPrinting(false);
        setHasPrinted(true);
      }, 1500);
    } catch (error) {
      console.error('Print error:', error);
      setIsPrinting(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-between w-full h-screen mx-auto'>
      <div className='flex-1 flex flex-col items-center justify-center gap-4 w-full max-w-md px-4'>
        <CheckCircle className='h-24 w-24 text-gray-400' />
        <div className='flex flex-col justify-center gap-2 text-center'>
          <p className='text-gray-500'>Payment credited</p>
          <div className='text-4xl'>
            {getCurrencySymbol()}
            <b>{amount.toLocaleString()}</b> {settings.currency}
          </div>
        </div>

        {/* Información adicional si hay orden de impresión */}
        {printOrder && (
          <div className='text-center text-sm text-gray-500 mt-4'>
            <p>Order ID: {printOrder.orderId}</p>
            <p>{new Date(printOrder.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className='w-full py-4 bg-white border-t'>
        <div className='flex flex-col gap-2 w-full max-w-md mx-auto px-4'>
          {/* Botón de impresión - solo mostrar si hay impresora disponible y orden */}
          {isPrintAvailable && printOrder && (
            <Button
              className='w-full flex items-center justify-center gap-2'
              onClick={handlePrint}
              disabled={isPrinting || hasPrinted}
              variant={hasPrinted ? 'outline' : 'default'}
            >
              {isPrinting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  <span>Printing...</span>
                </>
              ) : hasPrinted ? (
                <>
                  <Check className='h-4 w-4 text-green-600' />
                  <span>Printed</span>
                </>
              ) : (
                <>
                  <Printer className='h-4 w-4' />
                  <span>Print receipt</span>
                </>
              )}
            </Button>
          )}

          <Button className='w-full' variant='default' onClick={onBackToShop}>
            Go to Shop
          </Button>
        </div>
      </div>
    </div>
  );
}
