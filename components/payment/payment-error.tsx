'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

import { useSettings } from '@/hooks/use-settings';

import { Button } from '@/components/ui/button';

interface PaymentErrorProps {
  error: string;
  amount: number;
  currency: string;
}

export function PaymentError({ error, amount, currency }: PaymentErrorProps) {
  const router = useRouter();

  const { settings, getCurrencySymbol } = useSettings();

  return (
    <div className='flex flex-col items-center justify-between w-full h-screen mx-auto'>
      <div className='flex-1 flex flex-col items-center justify-center w-full pt-4 bg-white border-b rounded-b-2xl'>
        <div className='w-full max-w-md px-4'>
          <div className='bg-red-50 border border-red-200 border-dashed p-6 rounded-lg mb-6 w-full'>
            <div className='flex items-center justify-center mb-4'>
              <AlertCircle className='h-12 w-12 text-red-500' />
            </div>
            <h3 className='text-lg font-medium text-red-800 text-center mb-2'>Payment Error</h3>
            <p className='text-red-600 text-center text-sm'>{error}</p>
          </div>

          <div className='text-center'>
            <div className='text-gray-500 mb-2'>Amount</div>
            <div className='text-2xl mb-4'>
              {getCurrencySymbol()}
              <b>{amount.toLocaleString()}</b> {currency}
            </div>
          </div>
        </div>
      </div>

      <div className='w-full py-4 pb-8'>
        <div className='flex flex-col gap-2 w-full max-w-md mx-auto px-4'>
          <Button className='w-full' size='lg' variant='success' asChild>
            <Link href='/'>Setup Now</Link>
          </Button>
          <Button className='w-full' size='lg' variant='secondary' onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
