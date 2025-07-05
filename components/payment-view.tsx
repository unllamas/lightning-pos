import ReactQRCode from 'react-qr-code';

import { useSettings } from '@/hooks/use-settings';
import { PaymentActions } from '@/components/payment/payment-actions';

import { Skeleton } from '@/components/ui/skeleton';

interface PaymentViewProps {
  invoice: string;
  amount: number;
  currency: string;
  amountInSats: number;
  isLoading: boolean;
}

export function PaymentView({ invoice, amount, currency, amountInSats, isLoading }: PaymentViewProps) {
  const { getCurrencySymbol } = useSettings();

  return (
    <div className='flex flex-col items-center justify-between w-full h-screen mx-auto relative bg-[#0F0F0F]'>
      <div className='flex-1 flex flex-col items-center w-full pt-4 bg-white border-b rounded-b-2xl'>
        <div className='w-full max-w-md mx-auto px-4'>
          <div className='mb-6'>
            {isLoading ? (
              <Skeleton className='w-72 h-72 bg-black/10 mx-auto' />
            ) : invoice ? (
              <div className='w-full flex justify-center'>
                <ReactQRCode value={invoice} size={280} fgColor={'#000'} bgColor={'#fff'} />
              </div>
            ) : null}
          </div>

          <div className='flex-1 flex flex-col items-center text-center w-full px-4'>
            <div className='flex items-center gap-2 text-gray-500 mb-2'>
              <span>Waiting for payment</span>
            </div>

            <div className='text-3xl mb-2'>
              {getCurrencySymbol()}
              <b>{new Intl.NumberFormat().format(amount)}</b> {currency}
            </div>

            <div className='flex items-center gap-2 text-lg text-gray-600'>
              <span>~</span>
              {!amountInSats || amountInSats === 0 ? (
                <Skeleton className='relative w-12 h-6 top-0.5 bg-black/10 rounded-full' />
              ) : (
                new Intl.NumberFormat().format(amountInSats)
              )}
              <span>SAT</span>
            </div>
          </div>
        </div>
      </div>

      <PaymentActions lightningInvoice={invoice} />
    </div>
  );
}
