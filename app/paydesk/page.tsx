'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Settings } from 'lucide-react';

import { useNumpad } from '@/hooks/use-numpad';
import { useSettings } from '@/hooks/use-settings';

import { Button } from '@/components/ui/button';
import { Keyboard } from '@/components/keyboard';

export default function PaydeskPage() {
  const router = useRouter();

  const { settings, getCurrencySymbol } = useSettings();
  const numpadData = useNumpad(settings?.currency);

  return (
    <div className='w-full mx-auto min-h-screen flex flex-col bg-gray-100'>
      <header className='py-4 flex bg-[#0F0F0F] border-b shadow-sm'>
        <div className='flex items-center justify-between w-full max-w-md mx-auto px-4'>
          <div className='flex items-center'>
            <Button className='mr-2' variant='default' size='icon' asChild>
              <Link href='/app'>
                <ChevronLeft className='h-4 w-4' />
                <span className='sr-only'>Back</span>
              </Link>
            </Button>
            <h1 className='text-xl font-medium text-white'>{'Paydesk'}</h1>
          </div>
          <Button size='icon' variant='default' asChild>
            <Link href='/settings'>
              <Settings className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </header>

      <div className='flex-1 flex flex-col gap-4 w-full max-w-md mx-auto px-4 pb-12'>
        <div className='flex-1 flex flex-col justify-center items-center gap-4'>
          <div className='text-3xl mb-2'>
            {getCurrencySymbol()}
            <b>{new Intl.NumberFormat().format(numpadData.intAmount[numpadData.usedCurrency])}</b> {settings.currency}
          </div>
        </div>
        <Button
          size='lg'
          onClick={() => {
            const orderId = `order-${Date.now()}`;
            router.push(
              `/payment?currency=${settings.currency}&&amount=${numpadData.intAmount[numpadData.usedCurrency]}`,
            );
          }}
          disabled={numpadData.intAmount[numpadData.usedCurrency] === 0}
        >
          Confirm
        </Button>
        <Keyboard numpadData={numpadData} />
      </div>
    </div>
  );
}
