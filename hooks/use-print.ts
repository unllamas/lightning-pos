import { useCallback, useEffect, useState } from 'react';

import { PrintOrder } from '@/types/print';

interface PrintReturns {
  isAvailable: boolean;
  print: (order: PrintOrder) => void;
}

export const usePrint = (): PrintReturns => {
  const [isAvailable, setIsAvailable] = useState(false);

  const print = useCallback(
    (order: PrintOrder) => {
      if (!isAvailable) {
        console.warn('No se puede imprimir, no se encuentra el objeto Android');
        return;
      }
      window!.Android!.print(JSON.stringify(order));
    },
    [isAvailable],
  );

  useEffect(() => {
    setIsAvailable(!!window.Android?.print);
  }, []);

  return {
    isAvailable,
    print,
  };
};
