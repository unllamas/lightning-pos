'use client';

import { ChevronLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';

import { useRouter } from 'next/navigation';
import { AppFooter } from './app/app-footer';
import { AppContent } from './app/app-content';

interface TipSelectorProps {
  amount: number;
  currency: string;
  selectedOption: 'with-tip' | 'without-tip' | null;
  onSelectTip: (option: 'with-tip' | 'without-tip') => void;
}

export function TipSelector({ amount, currency, selectedOption, onSelectTip }: TipSelectorProps) {
  const router = useRouter();
  const { getCurrencySymbol } = useSettings();

  const tipAmount = amount * 0.1;
  const totalWithTip = amount + tipAmount;

  const tipOptions = [
    {
      id: 'with-tip',
      title: 'With tip',
      amount: totalWithTip,
      description: '+10% tip',
      selected: selectedOption === 'with-tip',
    },
    {
      id: 'without-tip',
      title: 'No tip',
      amount: amount,
      description: 'Base price',
      selected: selectedOption === 'without-tip',
    },
  ];

  return (
    <>
      <header className='fixed top-0 z-10 flex w-full py-4 bg-background border-b shadow-sm'>
        <div className='flex items-center justify-between w-full max-w-md mx-auto px-4'>
          <div className='flex items-center'>
            <Button className='mr-2' variant='outline' size='icon' onClick={() => router.back()}>
              <ChevronLeft className='h-4 w-4' />
              <span className='sr-only'>Back</span>
            </Button>
            <h1 className='text-xl font-medium'>{'Summary'}</h1>
          </div>
        </div>
      </header>

      <AppContent className='pt-20'>
        <div className='flex-1 flex flex-col w-full max-w-md mx-auto px-4'>
          {/* Subtotal Section */}
          <div className='flex-1 flex flex-col justify-center items-center text-center'>
            <h2 className='text-xl'>Subtotal</h2>
            <div className='text-4xl'>
              <p>
                {getCurrencySymbol()}
                <strong>{amount.toLocaleString()}</strong>
                <span className='ml-2 text-muted-foreground'>{currency}</span>
              </p>
            </div>
          </div>

          {/* Total Section */}
          <div className='flex flex-col gap-4 w-full'>
            <h3 className='text-xl font-semibold'>Total</h3>

            <div className='grid grid-cols-2 gap-4 w-full'>
              {tipOptions.map((option: any) => (
                <Card
                  key={option.id}
                  className={`w-full cursor-pointer transition-all ${
                    option.selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => onSelectTip(option.id as 'with-tip' | 'without-tip')}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between mb-3'>
                      <h4 className='font-medium'>{option.title}</h4>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          option.selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}
                      >
                        {option.selected && <div className='w-2 h-2 bg-white rounded-full'></div>}
                      </div>
                    </div>

                    <div className='flex items-end gap-1 mb-1'>
                      <p className='text-2xl'>
                        {getCurrencySymbol()}
                        <strong>{option.amount.toLocaleString()}</strong>
                      </p>
                    </div>
                    <div className='text-sm text-gray-500'>{option.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AppContent>

      {/* Generate Payment Button */}
      <AppFooter>
        <Button className={`w-full`} size='lg' variant='success' disabled={!selectedOption} onClick={() => {}}>
          Generate payment
        </Button>
      </AppFooter>
    </>
  );
}
