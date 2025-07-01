'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Settings } from 'lucide-react';

import { useNumpad } from '@/hooks/use-numpad';
import { useSettings } from '@/hooks/use-settings';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';

import { Button } from '@/components/ui/button';
import { Keyboard } from '@/components/keyboard';
import { AvailableCurrencies } from '@/types/config';

export default function PaydeskPage() {
  const router = useRouter();

  const { settings, getCurrencySymbol } = useSettings();
  const { convertCurrency } = useCurrencyConverter();
  const numpadData = useNumpad(settings?.currency);

  const value = Number(numpadData.intAmount[numpadData.usedCurrency] || 0);
  const amountInSats = convertCurrency(value, settings?.currency as AvailableCurrencies, 'SAT');

  return (
    <div className='flex-1 flex flex-col w-full mx-auto h-full bg-[#0F0F0F]'>
      <header className='py-4 flex bg-background border-b shadow-sm'>
        <div className='flex items-center justify-between w-full max-w-md mx-auto px-4'>
          <div className='flex items-center'>
            <Button className='mr-2' variant='outline' size='icon' asChild>
              <Link href='/app'>
                <ChevronLeft className='h-4 w-4' />
                <span className='sr-only'>Back</span>
              </Link>
            </Button>
            <h1 className='text-xl font-medium'>{'Paydesk'}</h1>
          </div>
          <Button size='icon' variant='outline' asChild>
            <Link href='/settings'>
              <Settings className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </header>

      <div className='flex-1 flex flex-col'>
        <div className='flex-1 flex flex-col justify-center items-center gap-2 bg-white border-b rounded-b-2xl'>
          <div className='text-3xl'>
            {getCurrencySymbol()}
            <b>{new Intl.NumberFormat().format(numpadData.intAmount[numpadData.usedCurrency])}</b> {settings.currency}
          </div>
          <div className='text-lg text-gray-600'>~ {new Intl.NumberFormat().format(amountInSats)} SAT</div>
        </div>
        <div className='flex flex-col gap-4 w-full max-w-md mx-auto px-4 py-8'>
          <Button
            className='w-full'
            size='lg'
            variant='success'
            onClick={() => {
              const orderId = `order-${Date.now()}`;
              router.push(
                `/payment?currency=${settings.currency}&amount=${numpadData.intAmount[numpadData.usedCurrency]}`,
              );
            }}
            disabled={numpadData.intAmount[numpadData.usedCurrency] === 0}
          >
            Confirm
          </Button>
          <Keyboard numpadData={numpadData} />
        </div>
      </div>
    </div>
  );
}
