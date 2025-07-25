'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, LoaderCircle } from 'lucide-react';

import { useAuth } from '@/context/auth';
import { useCamera } from '@/hooks/use-camera';

import { AppViewport } from '@/components/app/app-viewport';
import { AppContent } from '@/components/app/app-content';
import { AppFooter } from '@/components/app/app-footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CameraModal } from '@/components/camera-modal';
import { InstallPrompt } from '@/components/install-prompt';

export function LoginView() {
  const router = useRouter();
  const { lightningAddress, login, isLoading, isAuthenticated } = useAuth();
  const { hasCamera } = useCamera(() => null);

  const [inputAddress, setInputAddress] = useState<string | null>(null);
  const [nwc, setNwc] = useState<string | null>(null);

  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);

    if (!code.includes('@')) {
      setError('Invalid Lightning Address');
      return;
    }

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

  // const handlePaste = async () => {
  //   setError('');
  //   try {
  //     const text = await navigator.clipboard.readText();

  //     if (!isValidNWC(text)) {
  //       setError('Invalid value');
  //       return;
  //     }

  //     setNwc(text);
  //   } catch (error) {
  //     console.log('error', error);
  //   }
  // };

  // const isValidNWC = (value: string) => {
  //   const prefix = 'nostr+walletconnect://';
  //   return typeof value === 'string' && value.startsWith(prefix);
  // };

  // Mostrar loading mientras verifica sesión existente
  if (isLoading) {
    return (
      <div className='flex justify-center items-center w-screen h-screen text-white'>
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
    <AppViewport>
      <AppContent>
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
          <Tabs className='w-full' defaultValue='lnaddress'>
            <TabsList className='w-full'>
              <TabsTrigger className='w-full' value='lnaddress'>
                Lightning
              </TabsTrigger>
              <TabsTrigger className='w-full' value='nwc' disabled>
                NWC (Soon)
              </TabsTrigger>
            </TabsList>
            <TabsContent className='space-y-2' value='lnaddress' aria-disabled>
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
                    const { success, error } = res;
                    setIsValidating(true);

                    if (!success) {
                      setError(error as string);
                      setIsValidating(false);
                      return;
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
            </TabsContent>
            {/* <TabsContent className='space-y-2' value='nwc' aria-disabled={true}>
              <div className='relative'>
                <Input
                  type='text'
                  placeholder='nostr+walletconnect://...'
                  defaultValue={nwc as string}
                  readOnly
                  className={`${nwc ? 'pr-14' : 'pr-20'} ${error ? 'border-red-500' : ''}`}
                />
                <div className='absolute top-0 right-0 flex items-center h-full pr-[4px]'>
                  {!!nwc ? (
                    <Button variant='outline' size='icon' onClick={() => setNwc(null)}>
                      <Trash2 />
                    </Button>
                  ) : (
                    <Button variant='outline' onClick={handlePaste} disabled={!!nwc}>
                      Paste
                    </Button>
                  )}
                </div>
              </div>

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

                  if (!isValidNWC(nwc)) {
                    setError('Invalid value');
                    return;
                  }

                  setIsValidating(true);

                  login(nwc).then((res) => {
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
                {isValidating ? <LoadingSpinner /> : 'Setup'}
              </Button>
            </TabsContent> */}
          </Tabs>

          {hasCamera && (
            <div className='text-center'>
              <span className='text-gray-500'>or</span>
            </div>
          )}
        </div>

        {showCameraModal && <CameraModal onClose={stopCamera} onScan={handleScan} />}

        {/* PWA Install Prompt */}
        <InstallPrompt />
      </AppContent>
      {hasCamera && (
        <AppFooter>
          <Button variant='outline' className='w-full' size='lg' onClick={startCamera}>
            Scan QR Code
          </Button>
        </AppFooter>
      )}
    </AppViewport>
  );
}
