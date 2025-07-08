'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowUpRight, ChevronLeft, Settings, ShieldAlert, X } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { useSettings } from '@/hooks/use-settings';
import { useNumpad } from '@/hooks/use-numpad';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';

import { AppViewport } from '@/components/app/app-viewport';
import { AppContent } from '@/components/app/app-content';
import { AppFooter } from '@/components/app/app-footer';
import { Button } from '@/components/ui/button';
import { Keyboard } from '@/components/keyboard';

import { AvailableCurrencies } from '@/types/config';

const LNADDRESS_ENABLE = process.env.NEXT_PUBLIC_LNADDRESS_ENABLE || false;

export default function PaydeskPage() {
  const { lnaddress } = useParams();
  const router = useRouter();
  const { validateLightningAddress, login } = useAuth();
  const { settings, getCurrencySymbol } = useSettings();
  const { convertCurrency } = useCurrencyConverter();
  const numpadData = useNumpad(settings?.currency);

  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    // async function validateAndLogin() {
    //   if (!lnaddress) return;
    //   const decodeLnAddress = decodeURIComponent(String(lnaddress));

    //   const isValid = await validateLightningAddress(decodeLnAddress as string);

    //   if (isValid) {
    //     setIsValid(true);
    //     return;
    //   }
    // }

    // validateAndLogin();

    login(decodeURIComponent(String(lnaddress))).then((res) => {
      if (res?.success) setIsValid(true);
    });
  }, [lnaddress, isValid]);

  const value = Number(numpadData.intAmount[numpadData.usedCurrency] || 0);
  const amountInSats = convertCurrency(value, settings?.currency as AvailableCurrencies, 'SAT');

  if (LNADDRESS_ENABLE !== 'true') {
    return (
      <AppViewport>
        <AppContent>
          <div className='flex flex-col gap-4 w-full max-w-md px-4'>
            <div className='bg-yellow-50 border border-yellow-200 border-dashed p-6 rounded-lg w-full'>
              <div className='flex items-center justify-center mb-4'>
                <ShieldAlert className='h-12 w-12 text-yellow-500' />
              </div>
              <h3 className='text-lg font-medium text-yellow-800 text-center mb-2'>Function temporarily disabled</h3>
              <p className='text-yellow-700 text-center text-sm'>
                {
                  "Thanks for using this feature. We're improving the experience and will be back with Lightning Address soon."
                }
              </p>
            </div>

            <Button id='btn_share_feedback' className='w-full' variant='outline' size='lg' asChild>
              <Link href='https://tally.so/r/mBoBLR' target='_blank'>
                Share feedback <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </AppContent>
        <AppFooter>
          <Button
            id='btn_lnaddress_back'
            className='w-full'
            size='lg'
            variant='secondary'
            onClick={() => router.back()}
          >
            Go home
          </Button>
        </AppFooter>
      </AppViewport>
    );
  }

  return (
    <div className='flex-1 flex flex-col w-full mx-auto h-full bg-[#0F0F0F]'>
      <header className='py-4 flex bg-background border-b shadow-sm'>
        <div className='flex items-center justify-between w-full max-w-md mx-auto px-4'>
          <div className='flex items-center'>
            <h1 className='text-xl font-medium'>{'Pay to...'}</h1>
          </div>
          <Button size='icon' variant='outline' asChild>
            <Link href='/settings'>
              <Settings className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </header>

      <div className='flex-1 flex flex-col'>
        <div className='flex-1 flex flex-col justify-center items-center gap-2 px-4 bg-white border-b rounded-b-2xl'>
          <div className='flex items-center gap-4 w-full max-w-md min-h-20 mx-auto mt-4 p-5 bg-gray-100 border rounded-lg'>
            <div className='flex flex-col gap-0 w-full'>
              <p className='font-medium text-gray-800'>{decodeURIComponent(String(lnaddress))}</p>
            </div>
          </div>
          {!isValid && (
            <div className='flex items-center gap-2 text-red-600 text-sm'>
              <AlertCircle className='min-h-4 min-w-4' />
              <span>Invalid Lightning Address. Please check that the address exists and supports payments.</span>
            </div>
          )}
          <div className='flex-1 flex flex-col items-center justify-center'>
            <div className='text-3xl'>
              {getCurrencySymbol()}
              <b>{new Intl.NumberFormat().format(numpadData.intAmount[numpadData.usedCurrency])}</b> {settings.currency}
            </div>
            <div className='text-lg text-gray-600'>~ {new Intl.NumberFormat().format(amountInSats)} SAT</div>
          </div>
        </div>
        <div className='flex flex-col gap-4 w-full max-w-md mx-auto px-4 py-8'>
          <Button
            className='w-full'
            size='lg'
            variant='success'
            onClick={() => {
              if (!isValid) return;

              const orderId = `order-${Date.now()}`;
              router.push(
                `/payment?currency=${settings.currency}&&amount=${numpadData.intAmount[numpadData.usedCurrency]}`,
              );
            }}
            disabled={!isValid || numpadData.intAmount[numpadData.usedCurrency] === 0}
          >
            Confirm
          </Button>
          <Keyboard numpadData={numpadData} />
        </div>
      </div>
    </div>
  );
}
