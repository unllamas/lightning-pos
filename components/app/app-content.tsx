import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useMemo } from 'react';

export function AppContent({ children }: { children: any }) {
  const { isMobile, isMobileUserAgent, isMobileScreen, isPWA } = useMobileDetection();

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

  return (
    <div
      className={`overflow-x-hidden overflow-y-scroll relative flex flex-col items-center justify-center w-full py-4 bg-background rounded-b-2xl ${
        isMobile ? 'mx-auto' : 'flex-grow flex-shrink-0'
      }`}
      style={cameraPreviewHeightStyle}
    >
      {children}
    </div>
  );
}
