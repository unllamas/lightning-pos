'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { XIcon, Camera, FlipHorizontal } from 'lucide-react';

import { useCamera } from '@/hooks/use-camera';

import { Button } from '@/components/ui/button';
import { useMobileDetection } from '@/hooks/use-mobile-detection';

interface CameraModalProps {
  onClose: () => void;
  onScan: (code: string) => void;
}

export function CameraModal({ onClose, onScan }: CameraModalProps) {
  const { isPWA, isMobile, isMobileUserAgent, isMobileScreen } = useMobileDetection();

  const [cameraStarted, setCameraStarted] = useState(false);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Calculate camera height based on device type and PWA status
  const cameraPreviewHeightStyle = useMemo(() => {
    // Special case: Desktop browser with mobile screen width (narrow window)
    if (!isMobileUserAgent && isMobileScreen) {
      return { height: isPWA ? '90vh' : '88vh' };
    }

    // Mobile devices (actual mobile user agent or mobile screen width)
    if (isMobile) {
      return { height: isPWA ? '82vh' : '76vh' };
    }

    // Desktop with wide window - use flexbox
    return {};
  }, [isMobileUserAgent, isMobileScreen, isMobile, isPWA]);

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
      className={`fixed z-50 top-0 w-full h-full bg-black ${isMobile ? 'space-y-1' : 'flex flex-col h-full space-y-1'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className={`overflow-hidden relative w-full bg-background rounded-b-2xl shadow-2xl ${
          isMobile ? 'mx-auto' : 'border border-zinc-700 flex-grow flex-shrink-0'
        }`}
        style={cameraPreviewHeightStyle}
      >
        {cameraStarted && (
          <>
            <video ref={videoRef} className='w-full h-full object-cover' playsInline autoPlay muted />
            <canvas ref={canvasRef} className='absolute top-0 left-0 w-full h-full hidden' />
          </>
        )}

        {/* Camera Error State */}
        {(!cameraStarted || !hasCamera || cameraPermission === false) && (
          <div className='absolute inset-0 bg-background flex items-center justify-center text-black'>
            <div className='flex flex-col items-center gap-4 text-center px-6'>
              <Camera className='h-8 w-8' />
              <p className='text-lg font-semibold mb-2'>Camera Error</p>
              <p className='text-sm mb-6'>{permissionError}</p>
              <Button onClick={isPWA ? handleRetry : () => window.location.reload()}>
                {isPWA ? 'Retry Camera' : 'Try Again'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls Section - Below camera feed */}
      <div className={`flex items-center justify-center gap-4 w-full px-6 pt-4 pb-4 ${!isMobile ? 'flex-shrink' : ''}`}>
        {/* Camera Switch for Mobile - Left */}
        {hasMutipleCamera && (
          <Button
            className='w-full'
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

        <Button className='w-full' variant='default' size='icon' onClick={handleClose} disabled={isClosing}>
          <XIcon className='h-4 w-4' />
          <span className='sr-only'>Close</span>
        </Button>
      </div>
    </div>
  );
}
