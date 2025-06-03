import React from 'react';

declare global {
  interface Window {
    injectedNFC: {
      handleRead: (str: string) => void;
      handleError: (reason: string) => void;
      resolveFn?: (str: string) => void;
      rejectFn?: (reason?: string) => void;
    };
    Android?: {
      print: (str: string) => void;
      isNFCAvailable: () => boolean;
    };
  }
}
