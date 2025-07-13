import React from 'react';

import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { cn } from '@/lib/utils';

export const AppViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useMobileDetection();

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full h-full',
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
