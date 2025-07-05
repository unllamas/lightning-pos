'use client';

import { useEffect, useState, useCallback } from 'react';
import { XIcon, RefreshCcw, Camera, FlipHorizontal } from 'lucide-react';
import { QrCodeIcon as QrScanIcon } from 'lucide-react';

import { useCamera } from '@/hooks/use-camera';

import { Button } from '@/components/ui/button';

interface CameraModalProps {
  onClose: () => void;
  onScan: (code: string) => void;
}

export function CameraModal({ onClose, onScan }: CameraModalProps) {
  const [cameraStarted, setCameraStarted] = useState(false);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    switchCamera,
    hasCamera,
    cameraPermission,
    permissionError,
    facingMode,
    hasMutipleCamera,
  } = useCamera((code) => {
    handleClose();
    onScan(code);
  });

  const handleClose = useCallback(() => {
    if (isClosing) return;

    setIsClosing(true);
    stopCamera();

    setTimeout(() => {
      onClose();
    }, 100);
  }, [onClose, stopCamera, isClosing]);

  useEffect(() => {
    const initCamera = async () => {
      const success = await startCamera();
      if (!success) {
        console.log('The camera could not be started.');
      }

      setCameraStarted(true);
    };

    initCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose]);

  const handleRetry = async () => {
    setCameraStarted(false);
    const success = await startCamera();
    setCameraStarted(true);
  };

  const handleSwitchCamera = async () => {
    if (isSwitchingCamera) return;

    setIsSwitchingCamera(true);
    setCameraStarted(false);

    try {
      const success = await switchCamera();
      setCameraStarted(true);
    } catch (error) {
      console.error('Error when switching cameras:', error);
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  return (
    <div
      className='fixed z-50 top-0 inset-0 bg-background bg-opacity-90 flex items-center justify-center'
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className='relative w-full h-full md:w-auto md:h-auto md:max-w-2xl md:max-h-[80vh]'>
        <div className='absolute top-4 right-4 z-10 flex space-x-2'>
          {/* Button to switch cameras (only visible if there are multiple cameras and the camera is active) */}
          {hasMutipleCamera && (
            <Button
              variant='default'
              size='icon'
              onClick={handleSwitchCamera}
              disabled={isSwitchingCamera || isClosing}
              title={`Cambiar a cámara ${facingMode === 'environment' ? 'frontal' : 'trasera'}`}
            >
              <FlipHorizontal className={`h-4 w-4 ${isSwitchingCamera ? 'animate-spin' : ''}`} />
              <span className='sr-only'>Change camera</span>
            </Button>
          )}

          <Button variant='default' size='icon' onClick={handleClose} disabled={isClosing}>
            <XIcon className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </Button>
        </div>

        <div className='w-full h-full md:rounded-lg overflow-hidden'>
          <div className='relative w-full h-full'>
            {(!cameraStarted || isSwitchingCamera || isClosing) && (
              <div className='absolute inset-0 flex flex-col items-center justify-center bg-background p-6'>
                <div className='text-foreground text-center p-4 max-w-md'>
                  {isClosing ? (
                    <div className='mb-4'>
                      <p className='text-xl mb-2'>Closing camera...</p>
                    </div>
                  ) : !hasCamera ? (
                    <>
                      <Camera className='w-16 h-16 mx-auto mb-4 text-muted-foreground' />
                      <p className='text-xl mb-2'>Camera not available</p>
                      <p className='text-muted-foreground mb-4'>
                        Your device doesn't have a camera available or your browser doesn't allow access to it.
                      </p>
                      <Button onClick={handleClose} className='mt-2'>
                        Close
                      </Button>
                    </>
                  ) : cameraPermission === false ? (
                    <>
                      <div className='bg-surface p-6 rounded-xl mb-6 border border-border'>
                        <h3 className='text-xl font-semibold mb-4'>Camera permissions denied</h3>
                        <p className='text-muted-foreground mb-4'>
                          To scan QR codes, we need access to your camera. Please follow these steps:
                        </p>
                        <ol className='list-decimal pl-5 space-y-2 text-sm text-muted-foreground mb-4'>
                          <li>Click the lock or information icon in the address bar.</li>
                          <li>Find the camera permissions and change them to "Allow."</li>
                          <li>Reload the page and try again.</li>
                        </ol>
                        <div className='flex flex-col space-y-2'>
                          <Button onClick={handleRetry} className='w-full'>
                            <RefreshCcw className='mr-2 h-4 w-4' />
                            Try again
                          </Button>
                          <Button variant='outline' onClick={handleClose} className='w-full'>
                            Close
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='mb-4'>
                        <Camera className='w-5 h-5 mx-auto text-primary' />
                      </div>
                      <p className='text-xl mb-2'>{isSwitchingCamera ? 'Changing camera...' : 'Starting camera...'}</p>
                      <p className='text-sm text-muted-foreground'>
                        {!isSwitchingCamera && 'Please accept camera access.'}
                      </p>
                      {permissionError && (
                        <div className='mt-4 p-3 bg-surface border border-border rounded-lg'>
                          <p className='text-sm text-muted-foreground'>{permissionError}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <video ref={videoRef} className='w-full h-full object-cover' playsInline autoPlay muted />
            <canvas ref={canvasRef} className='absolute top-0 left-0 w-full h-full hidden' />

            {/* Enhanced scanning overlay */}
            {cameraStarted && !isSwitchingCamera && !isClosing && (
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <div className='w-64 h-64 border-2 border-primary rounded-lg opacity-70'></div>
                <div className='absolute'>
                  <div className='animate-pulse rounded-lg'>
                    <QrScanIcon className='h-24 w-24 text-primary drop-shadow-lg' />
                  </div>
                </div>
              </div>
            )}

            {cameraStarted && !isSwitchingCamera && !isClosing && (
              <div className='absolute bottom-8 left-0 right-0 text-center'>
                <p className='text-foreground text-lg font-medium drop-shadow-lg'>Position the QR code in the center</p>
                <p className='text-sm text-muted-foreground mt-2'>
                  {facingMode === 'environment' ? 'Using rear camera' : 'Using front camera'}
                  {hasMutipleCamera && ' - You can switch cameras with the top button'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
