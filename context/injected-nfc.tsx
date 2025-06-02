import { createContext, useCallback, useEffect, useState } from 'react';

// Interface
export interface InjectedNFCContext {
  isAvailable: boolean;
  subscribe: () => Promise<string>;
  unsubscribe: () => Promise<void>;
}

// Context
export const InjectedNFCContext = createContext<InjectedNFCContext>({
  isAvailable: false,
  subscribe: function (): Promise<string> {
    throw new Error('Function not implemented.');
  },
  unsubscribe: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
});

const injectFunctionstoWindow = () => {
  if (!window.Android?.isNFCAvailable?.()) {
    console.warn('No injected NFC found');
    return false;
  }
  window.injectedNFC = {
    handleRead: (data: string) => {
      if (!window.injectedNFC.resolveFn) {
        console.warn('No callback function found');
        return;
      }

      window.injectedNFC.resolveFn(data);
      clearFunctions();
    },

    handleError: (reason: any) => {
      if (!window.injectedNFC.rejectFn) {
        console.warn('No callback function found');
        return;
      }

      window.injectedNFC.rejectFn(reason);
      clearFunctions();
    },
  };
  return true;
};

const clearFunctions = () => {
  window.injectedNFC.resolveFn = undefined;
  window.injectedNFC.rejectFn = undefined;
};

interface InjectedNFCProviderProps {
  children: React.ReactNode;
}

export const InjectedNFCProvider = ({ children }: InjectedNFCProviderProps) => {
  const [isAvailable, setIsAvailable] = useState(false);

  const subscribe = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      window.injectedNFC.resolveFn = resolve;
      window.injectedNFC.rejectFn = reject;
    });
  }, []);

  const unsubscribe = useCallback(async () => {
    window.injectedNFC.handleError('User unsubscribed from NFC');
  }, []);

  useEffect(() => {
    setIsAvailable(injectFunctionstoWindow());
  }, []);

  return (
    <InjectedNFCContext.Provider value={{ isAvailable, subscribe, unsubscribe }}>
      {children}
    </InjectedNFCContext.Provider>
  );
};
