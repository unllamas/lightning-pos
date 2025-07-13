import React, { useMemo } from 'react';

import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { cn } from '@/lib/utils';

export const AppContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isMobile, isMobileUserAgent, isMobileScreen, isPWA } = useMobileDetection();

    const heightStyle = useMemo(() => {
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
        ref={ref}
        style={heightStyle}
        className={cn(
          'overflow-x-hidden overflow-y-scroll relative flex flex-col items-center w-full py-4 bg-background rounded-b-2xl',
          className,
          isMobile ? 'mx-auto' : 'flex-grow flex-shrink-0',
        )}
        {...props}
      >
        {props?.children}
      </div>
    );
  },
);
