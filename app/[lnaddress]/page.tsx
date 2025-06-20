'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Settings, X } from 'lucide-react';

import { useNumpad } from '@/hooks/use-numpad';
import { useSettings } from '@/hooks/use-settings';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';

import { Button } from '@/components/ui/button';
import { Keyboard } from '@/components/keyboard';
import { AvailableCurrencies } from '@/types/config';
import { useLightningAuth } from '@/hooks/use-lightning-auth';
import { useEffect } from 'react';

export default function PaydeskPage() {
  const { lnaddress } = useParams();
  const router = useRouter();

  const { settings, getCurrencySymbol } = useSettings();
  const { convertCurrency } = useCurrencyConverter();
  const numpadData = useNumpad(settings?.currency);
  const { login } = useLightningAuth();

  useEffect(() => {
    if (lnaddress) {
      login(decodeURIComponent(String(lnaddress)));
    }
  }, [lnaddress]);

  const value = Number(numpadData.intAmount[numpadData.usedCurrency] || 0);
  const amountInSats = convertCurrency(value, settings?.currency as AvailableCurrencies, 'SAT');

  return (
    <div className='flex-1 flex flex-col w-full mx-auto h-full'>
      <header className='py-4 flex bg-[#0F0F0F] border-b shadow-sm'>
        <div className='flex items-center justify-between w-full max-w-md mx-auto px-4'>
          <div className='flex items-center'>
            {/* <Button className='mr-2' variant='default' size='icon' asChild>
              <Link href='/app'>
                <ChevronLeft className='h-4 w-4' />
                <span className='sr-only'>Back</span>
              </Link>
            </Button> */}
            <h1 className='text-xl font-medium text-white'>{'Pay to...'}</h1>
          </div>
          <Button size='icon' variant='default' asChild>
            <Link href='/settings'>
              <Settings className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </header>

      <div className='flex-1 flex flex-col gap-4'>
        <div className='flex-1 flex flex-col justify-center items-center gap-2 px-4 bg-white border-b rounded-b-2xl'>
          <div className='flex items-center gap-4 w-full max-w-md mx-auto mt-4 px-5 py-4 bg-gray-100 border rounded-lg'>
            {/* <div className='min-w-10 h-10 rounded-full bg-white border'></div> */}
            <div className='flex flex-col gap-0 w-full'>
              {/* <p className='text-muted-foreground'>{'Jona'}</p> */}
              <p className='font-medium text-gray-800'>{decodeURIComponent(String(lnaddress))}</p>
            </div>
            <Button size='icon' variant='outline' asChild>
              <Link href='/'>
                <X />
              </Link>
            </Button>
          </div>
          <div className='flex-1 flex flex-col items-center justify-center'>
            <div className='text-3xl'>
              {getCurrencySymbol()}
              <b>{new Intl.NumberFormat().format(numpadData.intAmount[numpadData.usedCurrency])}</b> {settings.currency}
            </div>
            <div className='text-lg text-gray-600'>~ {new Intl.NumberFormat().format(amountInSats)} SAT</div>
          </div>
        </div>
        <div className='flex flex-col gap-4 w-full max-w-md mx-auto px-4 pb-4'>
          <Button
            className='w-full'
            size='lg'
            onClick={() => {
              const orderId = `order-${Date.now()}`;
              router.push(
                `/payment?currency=${settings.currency}&&amount=${
                  numpadData.intAmount[numpadData.usedCurrency]
                }&lnaddress=${decodeURIComponent(String(lnaddress))}`,
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
