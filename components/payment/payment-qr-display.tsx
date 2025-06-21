'use client';

import { useSettings } from '@/hooks/use-settings';

import { Skeleton } from '@/components/ui/skeleton';

interface PaymentQRDisplayProps {
  qrCodeDataUrl: string | null;
  amount: number;
  amountInSats: number | null;
  isGenerating: boolean;
}

export function PaymentQRDisplay({ qrCodeDataUrl, amount, amountInSats, isGenerating }: PaymentQRDisplayProps) {
  const { settings, getCurrencySymbol } = useSettings();

  return (
    <div className='flex-1 flex flex-col items-center w-full pt-4 bg-white border-b rounded-b-2xl'>
      <div className='w-full max-w-md mx-auto px-4'>
        <div className='mb-6'>
          {isGenerating ? (
            <Skeleton className='w-72 h-72 bg-black/10 mx-auto' />
          ) : qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl || '/placeholder.svg'}
              alt='Lightning Invoice QR Code'
              className='w-72 h-72 mx-auto'
            />
          ) : null}
        </div>

        <div className='flex-1 flex flex-col items-center text-center w-full px-4'>
          <div className='flex items-center gap-2 text-gray-500 mb-2'>
            <span>Waiting for payment</span>
          </div>

          <div className='text-3xl mb-2'>
            {getCurrencySymbol()}
            <b>{new Intl.NumberFormat().format(amount)}</b> {settings.currency}
          </div>

          {amountInSats && (
            <div className='text-lg text-gray-600 mb-4'>~ {new Intl.NumberFormat().format(amountInSats)} SAT</div>
          )}
        </div>
      </div>
    </div>
  );
}
