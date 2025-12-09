import React, { useMemo } from 'react';

import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { cn } from '@/lib/utils';

export const AppViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useMobileDetection();

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-x-hidden flex-1 w-full h-full',
          className,
          isMobile ? 'space-y-1' : 'flex-1 flex flex-col h-full space-y-1',
        )}
        {...props}
      >
        {props?.children}
      </div>
    );
  },
);

AppViewport.displayName = 'AppViewport';

export const AppNavbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useMobileDetection();

    return (
      <div
        ref={ref}
        className={cn('relative w-full h-16', !isMobile ? 'flex-shrink md:max-w-md mx-auto' : '')}
        {...props}
      >
        <div className={cn('container flex items-center gap-2 w-full h-full', className)}>{props?.children}</div>
      </div>
    );
  },
);

AppNavbar.displayName = 'AppNavbar';

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
          'overflow-x-hidden overflow-y-scroll relative flex flex-col w-full py-4',
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

AppContent.displayName = 'AppContent';

export const AppFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useMobileDetection();

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center gap-4 w-full py-4',
          !isMobile ? 'flex-shrink md:max-w-md mx-auto' : '',
        )}
        {...props}
      >
        <div className={cn('container flex items-center gap-2 w-full h-full', className)}>{props?.children}</div>
      </div>
    );
  },
);

AppFooter.displayName = 'AppFooter';
