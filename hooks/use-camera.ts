'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraProps {
  onCodeDetected: (code: string) => void;
}

export function useCamera(onCodeDetected: (code: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef<boolean>(false);

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMutipleCamera, setHasMultipleCamera] = useState(false);

  // Check if multiple cameras are available
  useEffect(() => {
    const checkDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          // console.log('enumerateDevices() not supported.');
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        setHasMultipleCamera(videoDevices.length > 1);
        setHasCamera(videoDevices.length > 0);

        // console.log(`Available video devices: ${videoDevices.length}`);
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };

    checkDevices();
  }, []);

  // Function to stop the camera
  const stopCamera = useCallback(() => {
    // console.log('Stopping camera...');
    isActiveRef.current = false;

    // Stop Scan Interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
      // console.log('Scan interval stopped');
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => {
        track.stop();
        // console.log(`Track ${track.kind} stopped`);
      });
      streamRef.current = null;
    }

    // Clear the video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      // console.log('Video reference cleaned up');
    }

    // console.log('Camera completely stopped');
  }, []);

  // Ensure the camera stops when the component is removed
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // QR code scanning function
  const scanQRCode = useCallback(() => {
    if (!isActiveRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Import jsQR dynamically to avoid SSR issues
    import('jsqr')
      .then(({ default: jsQR }) => {
        try {
          // Detect QR codes in the image
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            // console.log('QR code detected:', code.data);
            onCodeDetected(code.data);
          }
        } catch (error) {
          console.error('Error detecting QR code:', error);
        }
      })
      .catch((error) => {
        console.error('Error in jsQR:', error);
      });
  }, [onCodeDetected]);

  // Function to start the camera
  const startCamera = useCallback(async () => {
    try {
      stopCamera(); // Make sure any previous streams stop
      isActiveRef.current = true;

      // Check if your browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia is not supported in this browser');
        setPermissionError('Your browser does not support camera access.');
        return false;
      }

      // console.log(`Trying to access the camera with facingMode: ${facingMode}`);

      // Try to access the camera with the preferred orientation
      const constraints = {
        video: { facingMode: facingMode },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraPermission(true);
      setPermissionError(null);

      // Start periodic scanning
      scanIntervalRef.current = setInterval(() => {
        if (isActiveRef.current) {
          scanQRCode();
        }
      }, 500);

      // console.log('Camera started successfully');
      return true;
    } catch (error: any) {
      console.error('Error accessing the camera:', error);
      isActiveRef.current = false;

      // Handling different types of errors
      if (error.name === 'NotAllowedError') {
        setCameraPermission(false);
        setPermissionError('Permission denied to access the camera');
      } else if (error.name === 'NotFoundError') {
        setHasCamera(false);
        setPermissionError('No camera found on this device');
      } else if (error.name === 'NotReadableError') {
        setPermissionError('The camera is in use by another application');
      } else {
        setPermissionError(`Error accessing the camera: ${error.message}`);
      }

      return false;
    }
  }, [facingMode, scanQRCode, stopCamera]);

  // Function to switch between cameras
  const switchCamera = useCallback(async () => {
    // Change camera mode
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);

    // Stop the current camera
    stopCamera();

    // Short pause to ensure the anterior chamber has completely stopped
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Start the new camera
    return await startCamera();
  }, [facingMode, startCamera, stopCamera]);

  return {
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
  };
}
