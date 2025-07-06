import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

import { pwaManager } from '@/utils/pwa';

interface InstallPromptProps {
  onClose?: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ onClose }) => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleInstallAvailable = (available: boolean) => {
      setCanInstall(available);
      if (available && !pwaManager.isAppInstalled()) {
        // Show prompt after a delay to not be intrusive
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    pwaManager.onInstallAvailable(handleInstallAvailable);

    return () => {
      pwaManager.removeInstallCallback(handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);

    try {
      const installed = await pwaManager.promptInstall();
      if (installed) {
        setShowPrompt(false);
        onClose?.();
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    onClose?.();
  };

  if (!canInstall || !showPrompt || pwaManager.isAppInstalled()) {
    return null;
  }

  return (
    <div className='fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm'>
      <div className='bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-xl p-4 shadow-2xl'>
        <div className='flex items-start space-x-3'>
          <div className='flex-shrink-0'>
            <div className='overflow-hidden flex items-center justify-center w-10 h-10 bg-background rounded-lg'>
              <img src='/iso-white.svg' alt='App Icon' className='h-10 w-10' />
            </div>
          </div>

          <div className='flex-1 min-w-0'>
            <h3 className='text-sm font-semibold text-white mb-1'>Install Lightning POS</h3>
            <p className='text-xs text-zinc-400 mb-3'>Add to your home screen for quick access and offline use</p>

            <div className='flex space-x-2'>
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className='flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1'
              >
                {isInstalling ? (
                  <>
                    <div className='animate-spin rounded-full h-3 w-3 border-b border-white'></div>
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <Download className='h-3 w-3' />
                    <span>Install</span>
                  </>
                )}
              </button>

              <button
                onClick={handleClose}
                className='text-zinc-400 hover:text-white p-2 rounded-lg transition-colors duration-200'
              >
                <X className='h-3 w-3' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
