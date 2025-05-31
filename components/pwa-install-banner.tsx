'use client';

import { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/use-pwa-install';

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <Card className='mb-6 border-orange-200 border-dashed bg-gradient-to-r from-orange-50 to-orange-100'>
      <CardContent className='p-4'>
        <div className='flex items-start space-x-3'>
          <div className='flex-1 min-w-0'>
            <h3 className='text-sm font-medium text-gray-900 mb-1'>⚡️ Really lightning</h3>
            <p className='text-xs text-gray-600 mb-3'>Install our web app for faster access.</p>

            <div className='flex gap-2 items-center'>
              <Button onClick={handleInstall} className='w-full bg-orange-500 hover:bg-orange-600 text-white'>
                <Download className='h-4 w-4' />
                Install
              </Button>
              <Button variant='outline' size='icon' onClick={handleDismiss}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
