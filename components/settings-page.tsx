'use client';

import type React from 'react';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, DollarSign, CheckCircle } from 'lucide-react';

import { useSettings } from '@/hooks/use-settings';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CTAButton } from '@/components/ui/button-cta';

import { AvailableCurrencies } from '@/types/config';

export function SettingsPage() {
  const router = useRouter();
  const { settings, isLoading: settingsLoading, updateCurrency } = useSettings();

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const currencies = [
    { value: 'ARS', label: 'ARS (Argentine Peso)', symbol: '$' },
    { value: 'USD', label: 'USD (US Dollar)', symbol: '$' },
    // { value: 'EUR', label: 'EUR (Euro)', symbol: '€' },
  ];

  const showFeedback = (message?: string) => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleCurrencyChange = (newCurrency: AvailableCurrencies) => {
    updateCurrency(newCurrency);
    showFeedback();
  };

  const clearAllLocalData = useCallback(async () => {
    // Mostrar confirmación antes de proceder
    if (!window.confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
      return;
    }

    try {
      // 1. Limpiar localStorage
      localStorage.clear();

      // 2. Limpiar IndexedDB
      const databases = await window.indexedDB.databases();
      databases.forEach((db) => {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      });

      // 3. Limpiar Cache API si está disponible
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      // 4. Redirigir a la página de inicio
      router.push('/');
    } catch (error) {
      console.error('Error clearing local data:', error);
      alert('There was an error clearing the data. Please try again.');
    }
  }, [router]);

  // Mostrar loading mientras cargan las configuraciones
  if (settingsLoading) {
    return (
      <div className='flex justify-center items-center w-screen h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='w-full h-full flex flex-col bg-[#0F0F0F]'>
      {/* Header */}
      <header className='py-4 border-b shadow-sm bg-background'>
        <div className='flex items-center w-full max-w-md mx-auto px-4'>
          <Button variant='outline' size='icon' onClick={() => router.back()} className='mr-2'>
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <h1 className='text-xl font-medium'>Settings</h1>
          {showSaveSuccess && (
            <div className='ml-auto flex items-center text-green-500 animate-in fade-in slide-in-from-top-4 duration-300'>
              <CheckCircle className='h-4 w-4 mr-1' />
              <span className='text-sm'>Saved</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className='flex-1 bg-background border-b rounded-b-2xl'>
        <div className='w-full max-w-md mx-auto p-4 space-y-4'>
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
                  <span>This will be the default currency displayed in the system</span>
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

          {/* Additional Settings Placeholder */}
          <Card className='opacity-50'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg text-gray-500'>Comming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-400'>Tips, languages, themes and more.</p>
            </CardContent>
          </Card>

          <div className='flex flex-col gap-2'>
            <h6 className='text-xs text-muted-foreground'>Advertising</h6>
            <Link href='https://geyser.fund/project/lightningpos' target='_blank' className='w-full'>
              <CTAButton variant='solid' size='md'>
                Support ⚡️ POS from $0.2
              </CTAButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className='py-8'>
        <div className='w-full max-w-md mx-auto px-4'>
          <Button variant='secondary' size='lg' className='w-full' onClick={() => router.back()}>
            Go to back
          </Button>
        </div>
      </div>
    </div>
  );
}
