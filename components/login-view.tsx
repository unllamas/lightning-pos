'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, LoaderCircle } from 'lucide-react';

import { useLightningAuth } from '@/hooks/use-lightning-auth';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PWAInstallBanner } from '@/components/pwa-install-banner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function LoginView() {
  const router = useRouter();
  const { lightningAddress, isAuthenticated, isLoading, login } = useLightningAuth();
  const [inputAddress, setInputAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-login si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && lightningAddress) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/app');
      }, 1500);
    }
  }, [isAuthenticated, lightningAddress, router]);

  const handleSetup = async () => {
    if (!inputAddress.trim()) {
      setError('Please enter a Lightning Address');
      return;
    }

    setError('');
    setIsValidating(true);

    const result = await login(inputAddress.trim().toLowerCase());

    setIsValidating(false);

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/app');
      }, 1500);
    } else {
      setError(result.error || 'Error setting up Lightning Address');
    }
  };

  // Mostrar loading mientras verifica sesión existente
  if (isLoading) {
    <div className='flex justify-center items-center w-screen h-screen'>
      <LoadingSpinner />
    </div>;
  }

  // Mostrar pantalla de éxito
  if (showSuccess && lightningAddress) {
    return (
      <div className='w-full bg-white min-h-screen flex flex-col items-center justify-center p-8'>
        <div className='max-w-md mx-auto text-center mb-8'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <CheckCircle className='h-8 w-8 text-green-600' />
          </div>
          <h1 className='text-2xl font-bold mb-2'>Welcome!</h1>
          <p className='text-gray-600'>Logged in as {lightningAddress}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-full flex flex-col items-center justify-center py-4'>
      <div className='flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 text-center mb-8'>
        <div className='flex justify-center mb-4'>
          <img
            src='/logo.svg'
            alt='Lightning PoS Logo'
            className='h-[60px] w-auto'
            style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))' }}
          />
        </div>
        <p className='text-gray-600'>
          Point of Sale System <br /> with Lightning Network
        </p>
      </div>

      <div className='w-full max-w-md mx-auto px-4 space-y-4'>
        <PWAInstallBanner />
        <div className='space-y-3'>
          <Input
            type='email'
            placeholder='you@lightning.address'
            value={inputAddress}
            onChange={(e) => {
              setInputAddress(e.target.value);
              setError(''); // Clear error when typing
            }}
            disabled={isValidating}
            className={error ? 'border-red-500' : ''}
          />

          {error && (
            <div className='flex items-center gap-2 text-red-600 text-sm'>
              <AlertCircle className='min-h-4 min-w-4' />
              <span>{error}</span>
            </div>
          )}
        </div>

        <Button
          className='w-full'
          variant='default'
          size='lg'
          onClick={handleSetup}
          disabled={isValidating || !inputAddress.trim()}
        >
          {isValidating ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4'>
                <LoaderCircle className='h-4 w-4' />
              </div>
              Validating...
            </>
          ) : (
            'Setup'
          )}
        </Button>

        {/* <div className='text-center'>
          <span className='text-gray-500'>or</span>
        </div>

        <Button variant='outline' className='w-full' size='lg' asChild>
          <Link href='/app'>Try Now</Link>
        </Button> */}

        <Button className='w-full' variant='link' size='lg' asChild>
          <Link href='/'>Back to Home</Link>
        </Button>

        {/*
        <div className="text-xs text-gray-500 text-center mt-4">
          <p>We'll verify your Lightning Address by checking if it supports Lightning payments.</p>
        </div> */}
      </div>
    </div>
  );
}
