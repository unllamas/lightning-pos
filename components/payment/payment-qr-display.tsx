'use client';

import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';

import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PaymentQRDisplayProps {
  qrCodeDataUrl: string | null;
  amount: number;
  amountInSats: number | null;
  lightningInvoice: string | null;
  isGenerating: boolean;
}

export function PaymentQRDisplay({
  qrCodeDataUrl,
  amount,
  amountInSats,
  lightningInvoice,
  isGenerating,
}: PaymentQRDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { settings, getCurrencySymbol } = useSettings();

  const copyInvoice = async () => {
    if (lightningInvoice) {
      try {
        await navigator.clipboard.writeText(lightningInvoice);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy invoice:', err);
      }
    }
  };

  return (
    <div className='flex-1 flex flex-col items-center w-full pt-4'>
      <div className='bg-white p-4 rounded-lg mb-6 shadow-lg'>
        {isGenerating ? (
          <div className='flex flex-col items-center justify-center gap-4 rounded-lg w-72 h-72'>
            <LoadingSpinner />
            <p className='text-gray-600 text-center text-sm'>Generating invoice...</p>
          </div>
        ) : qrCodeDataUrl ? (
          <img src={qrCodeDataUrl || '/placeholder.svg'} alt='Lightning Invoice QR Code' className='w-72 h-72' />
        ) : null}
      </div>

      <div className='flex-1 flex flex-col items-center text-center max-w-md px-4'>
        <div className='flex items-center gap-2 text-gray-500 mb-2'>
          <span>Waiting for payment</span>
        </div>

        <div className='text-3xl mb-2'>
          {getCurrencySymbol()}
          <b>{new Intl.NumberFormat().format(amount)}</b> {settings.currency}
        </div>

        {amountInSats && (
          <div className='text-lg text-gray-600 mb-4'>≈ {new Intl.NumberFormat().format(amountInSats)} SAT</div>
        )}

        {process.env.NODE_ENV === 'development' && lightningInvoice && (
          <div className='w-full mt-4'>
            <Button variant='outline' onClick={copyInvoice} className='w-full flex items-center justify-center gap-2'>
              {copied ? (
                <>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className='h-4 w-4' />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
