import { useMobileDetection } from '@/hooks/use-mobile-detection';

export function AppFooter({ children }: { children: any }) {
  const { isMobile } = useMobileDetection();

  return (
    <div
      className={`flex items-center justify-center gap-4 w-full p-4 ${
        !isMobile ? 'flex-shrink md:max-w-md mx-auto' : ''
      }`}
    >
      {children}
    </div>
  );
}
