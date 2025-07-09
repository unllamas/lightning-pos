import { useMobileDetection } from '@/hooks/use-mobile-detection';

export function AppViewport({ children }: { children: any }) {
  const { isMobile } = useMobileDetection();

  return (
    <div className={`w-full h-full ${isMobile ? 'space-y-1' : 'flex-1 flex flex-col h-full space-y-1'}`}>
      {children}
    </div>
  );
}
