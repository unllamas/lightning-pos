import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobileUserAgent, setIsMobileUserAgent] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState('100vh');
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWAMode = () => {
      // Check if running in standalone mode (PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check for iOS Safari standalone mode
      const isIOSStandalone = (window.navigator as any).standalone === true;
      // Check if launched from home screen
      const isFromHomeScreen = window.location.search.includes('homescreen=1');
      
      setIsPWA(isStandalone || isIOSStandalone || isFromHomeScreen);
    };

    const updateViewportHeight = () => {
      setViewportHeight(`${window.innerHeight}px`);
    };

    const checkMobile = () => {
      const ua = navigator.userAgent || navigator.vendor;
      const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
      setIsMobileUserAgent(isMobile);
      
      const isScreenMobile = window.innerWidth <= 768;
      setIsMobileScreen(isScreenMobile);
      
      // Update viewport height when mobile state changes
      if (isMobile || isScreenMobile) {
        updateViewportHeight();
      }
    };

    checkPWAMode();
    checkMobile();
    
    // Add both resize listeners
    const handleResize = () => {
      checkMobile();
      updateViewportHeight();
      checkPWAMode();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', updateViewportHeight);
    
    // Initial viewport height calculation
    updateViewportHeight();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  // Computed values for backward compatibility
  const isMobile = isMobileUserAgent || isMobileScreen;

  return { 
    isMobile, 
    isMobileUserAgent, 
    isMobileScreen, 
    viewportHeight, 
    isPWA 
  };
};