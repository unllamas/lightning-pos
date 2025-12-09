'use client';

import { createContext, useCallback, useEffect, useState } from 'react';

// Interface
export interface ErrorContext {
  isAvailable: boolean;
}

// Context
export const ErrorContext = createContext<ErrorContext>({
  isAvailable: false,
});

interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider = ({ children }: ErrorProviderProps) => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(true);
  }, []);

  return <ErrorContext.Provider value={{ isAvailable }}>{children}</ErrorContext.Provider>;
};
