'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, DollarSign, CheckCircle, ArrowUpRight, Zap, AlertCircle, Trash2 } from 'lucide-react';

import { getLNURLPayInfo } from '@/lib/lightning-utils';
import { useSettings } from '@/hooks/use-settings';

import { AppViewport } from '@/components/app/app-viewport';
import { AppFooter } from '@/components/app/app-footer';
import { AppContent } from '@/components/app/app-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CTAButton } from '@/components/ui/button-cta';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { AvailableCurrencies } from '@/types/config';

export function SettingsPage() {
  const router = useRouter();
  const { settings, isLoading: settingsLoading, updateCurrency, updateOperator } = useSettings();

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Operador
  const [operatorInput, setOperatorInput] = useState('');
  const [operatorError, setOperatorError] = useState('');

  // Actualizar el input cuando se cargan las configuraciones
  useEffect(() => {
    if (!settingsLoading && settings.operator) {
      setOperatorInput(settings.operator);
    }
  }, [settingsLoading, settings.operator]);

  const currencies = [
    { value: 'ARS', label: 'ARS (Argentine Peso)', symbol: '$' },
    { value: 'USD', label: 'USD (US Dollar)', symbol: '$' },
    { value: 'UYU', label: 'UYU (Uruguayan Peso)', symbol: '$' },
  ];

  const showFeedback = (message?: string) => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleCurrencyChange = (newCurrency: AvailableCurrencies) => {
    updateCurrency(newCurrency);
    showFeedback();
  };

  const handleOperatorSave = async () => {
    const address = operatorInput.trim();

    const { ok, error } = await getLNURLPayInfo(address);

    if (!ok) {
      setOperatorError(error as string);
      return;
    }

    updateOperator(address);
    setOperatorError('');
    showFeedback();
  };

  const hasOperatorAddressChanges = operatorInput !== settings.operator;

  // Mostrar loading mientras cargan las configuraciones
  if (settingsLoading) {
    return (
      <div className='flex justify-center items-center w-screen h-screen text-white'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AppViewport>
      {/* Header */}
      <header className='fixed top-0 z-10 w-full py-4 border-b shadow-sm bg-background'>
        <div className='flex items-center w-full max-w-md mx-auto px-4'>
          <Button variant='outline' size='icon' onClick={() => router.back()} className='mr-2'>
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <h1 className='text-xl font-medium'>Settings</h1>
          {showSaveSuccess && (
            <div className='ml-auto flex items-center text-green-700 animate-in fade-in slide-in-from-top-4 duration-300'>
              <CheckCircle className='h-4 w-4 mr-1' />
              <span className='text-sm'>Saved</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <AppContent className='pt-20'>
        <div className='w-full max-w-md mx-auto px-4 space-y-4'>
          {/* Operator Lightning Address */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center justify-between gap-2 text-lg'>
                Operator
                <Zap className='h-4 w-4 text-gray-500' />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div>
                  <Label htmlFor='operator-address' className='text-sm font-medium text-gray-700'>
                    Lightning Address
                  </Label>
                  <div className='relative flex gap-2'>
                    <Input
                      id='operator-address'
                      type='text'
                      placeholder='operator@wallet.com'
                      value={operatorInput}
                      onChange={(e) => {
                        setOperatorInput(e.target.value);
                        setOperatorError('');
                      }}
                      className={operatorError ? 'border-red-500 flex-1' : 'flex-1'}
                    />
                    {settings.operator && (
                      <div className='absolute top-0 right-0 flex items-center h-full pr-1'>
                        <Button
                          variant='outline'
                          size='icon'
                          onClick={() => {
                            setOperatorInput('');
                            updateOperator('');
                            setOperatorError('');
                            showFeedback('Lightning Address cleared');
                          }}
                          className='px-3'
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    )}
                  </div>
                  {operatorError && (
                    <div className='flex items-center text-red-600 text-xs mt-1'>
                      <AlertCircle className='h-3 w-3 mr-1' />
                      {operatorError}
                    </div>
                  )}
                </div>

                {hasOperatorAddressChanges && (
                  <Button size='sm' onClick={handleOperatorSave} disabled={!!operatorError} className='w-full'>
                    Save
                  </Button>
                )}

                <div className='text-xs text-gray-500'>
                  <p className='mb-1'>Configure your Lightning Address to receive tips directly from customers.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currency Settings */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center justify-between gap-2 text-lg'>
                Currency
                <DollarSign className='h-4 w-4 text-gray-500' />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Select value={settings.currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select currency' />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        <div className='flex items-center'>
                          <span className='mr-2'>{curr.symbol}</span>
                          {curr.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>Default currency in the system.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clear Local Storage */}
          {/* <Card className='border-red-200'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg text-red-600'>Clear Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600 mb-4'>
                This will clear all stored data including your Settings, Products, Categories, and Cart. This action
                cannot be undone.
              </p>
              <Button variant='destructive' className='w-full' onClick={clearAllLocalData}>
                Clear All Data
              </Button>
            </CardContent>
          </Card> */}

          <div className='flex flex-col gap-2'>
            <h6 className='text-xs text-muted-foreground'>Support</h6>
            <div className='overflow-hidden flex flex-col gap-[1px] border border-input rounded-md bg-input'>
              <Button size='lg' variant='ghost' className='justify-between w-full bg-white rounded-none' asChild>
                <Link href='/support'>
                  Chat with us <ArrowUpRight className='size-4' />
                </Link>
              </Button>
              <Button size='lg' variant='ghost' className='justify-between w-full bg-white rounded-none' asChild>
                <Link href='https://github.com/unllamas/lightning-pos/issues/new/choose' target='_blank'>
                  Report a bug or feature <ArrowUpRight className='size-4' />
                </Link>
              </Button>
            </div>
          </div>

          {/* Additional Settings Placeholder */}
          {/* <Card className='opacity-50'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg text-gray-500'>Comming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-400'>Tips, languages, themes and more.</p>
            </CardContent>
          </Card> */}

          <div className='flex flex-col gap-2'>
            <h6 className='text-xs text-muted-foreground'>Advertising</h6>
            <Link href='https://geyser.fund/project/lightningpos' target='_blank' className='w-full'>
              <CTAButton variant='solid' size='md'>
                Support ⚡️ POS from $0.2
              </CTAButton>
            </Link>
          </div>
        </div>
      </AppContent>

      {/* Back Button */}
      <AppFooter>
        <div className='w-full max-w-md mx-auto px-4'>
          <Button variant='secondary' size='lg' className='w-full' onClick={() => router.back()}>
            Go to back
          </Button>
        </div>
      </AppFooter>
    </AppViewport>
  );
}
