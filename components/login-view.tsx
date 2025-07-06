'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, LoaderCircle } from 'lucide-react';

import { useAuth } from '@/context/auth';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PWAInstallBanner } from '@/components/pwa-install-banner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CameraModal } from '@/components/camera-modal';
import { InstallPrompt } from '@/components/install-prompt';

export function LoginView() {
  const router = useRouter();
  const { lightningAddress, login, isLoading, isAuthenticated } = useAuth();

  // const [inputAddress, setInputAddress] = useState<string | null>(null);
  const [nwc, setNwc] = useState<string | null>(null);

  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [showCameraModal, setShowCameraModal] = useState(false);

  // Auto-login si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/app');
      }, 1500);
    }
  }, [isAuthenticated]);

  const startCamera = () => {
    if (typeof window !== 'undefined') {
      setShowCameraModal(true);
    }
  };

  const stopCamera = () => {
    setShowCameraModal(false);
  };

  const handleScan = (code: string) => {
    stopCamera();

    login(code).then((res) => {
      setIsValidating(true);

      if (!res?.success) {
        setError(res?.error as string);
        setIsValidating(false);
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push('/app');
      }, 1500);
    });
  };

  // Mostrar loading mientras verifica sesión existente
  if (isLoading) {
    return (
      <div className='flex justify-center items-center w-screen h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  // Mostrar pantalla de éxito
  if (showSuccess) {
    return (
      <div className='w-full bg-white min-h-screen flex flex-col items-center justify-center p-8'>
        <div className='max-w-md mx-auto text-center mb-8'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <CheckCircle className='h-8 w-8 text-green-600' />
          </div>
          <h1 className='text-2xl font-bold mb-2'>Welcome!</h1>
          {lightningAddress && <p className='text-gray-600'>Logged in as {lightningAddress}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col items-center justify-center w-full py-4 pb-12 bg-background'>
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
        <Tabs className='w-full' defaultValue='nwc'>
          {/* <TabsList className='w-full'>
            <TabsTrigger className='w-full' value='lnaddress' disabled>
              Lightning
            </TabsTrigger>
            <TabsTrigger className='w-full' value='nwc'>
              NWC
            </TabsTrigger>
          </TabsList> */}
          {/* <TabsContent className='space-y-2' value='lnaddress' aria-disabled>
            <Input
              type='email'
              placeholder='you@lightning.address'
              defaultValue={inputAddress as string}
              onChange={(e) => {
                setInputAddress(e.target.value);
                setError('');
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

            <Button
              className='w-full'
              variant='default'
              size='lg'
              onClick={() => {
                if (!inputAddress) return;

                login(inputAddress).then((res) => {
                  setIsValidating(true);

                  if (!res?.success) {
                    setError(res?.error as string);
                    setIsValidating(false);
                  }

                  setShowSuccess(true);
                  setTimeout(() => {
                    router.push('/app');
                  }, 1500);
                });
              }}
              disabled={isValidating || !inputAddress?.trim()}
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
          </TabsContent> */}
          <TabsContent className='space-y-2' value='nwc'>
            <Input
              type='text'
              placeholder='nostr+walletconnect://...'
              defaultValue={nwc as string}
              onChange={(e) => setNwc(e.target.value)}
              disabled={isValidating}
              className={error ? 'border-red-500' : ''}
            />

            {error && (
              <div className='flex items-center gap-2 text-red-600 text-sm'>
                <AlertCircle className='min-h-4 min-w-4' />
                <span>{error}</span>
              </div>
            )}

            <Button
              className='w-full'
              variant='default'
              size='lg'
              onClick={() => {
                if (!nwc) return;

                login(nwc).then((res) => {
                  setIsValidating(true);

                  if (!res?.success) {
                    setError(res?.error as string);
                    setIsValidating(false);
                  }

                  setShowSuccess(true);
                  setTimeout(() => {
                    router.push('/app');
                  }, 1500);
                });
              }}
              disabled={isValidating || !nwc}
            >
              Setup
            </Button>
          </TabsContent>
        </Tabs>

        <div className='text-center'>
          <span className='text-gray-500'>or</span>
        </div>

        <Button variant='outline' className='w-full' size='lg' onClick={startCamera}>
          Scan QR Code
        </Button>
      </div>

      {showCameraModal && <CameraModal onClose={stopCamera} onScan={handleScan} />}

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
