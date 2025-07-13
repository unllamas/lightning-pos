import React from 'react';

import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { cn } from '@/lib/utils';

export const AppFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useMobileDetection();

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center gap-4 w-full p-4',
          className,
          !isMobile ? 'flex-shrink md:max-w-md mx-auto' : '',
        )}
        {...props}
      >
        {props?.children}
      </div>
    );
  },
);
