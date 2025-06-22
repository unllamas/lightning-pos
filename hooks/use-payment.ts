'use client';

import { useState, useCallback, useEffect } from 'react';

import { useSettings } from '@/hooks/use-settings';
import { useLightningAuth } from '@/hooks/use-lightning-auth';
import { extractPaymentHash } from '@/lib/lightning-utils';

import { convertToSatoshis, generateLightningInvoice, verifyLightningPayment } from '@/lib/lightning-utils';

interface UsePayment {
  lnaddress: string;
  onComplete: () => void;
}

export type Product = {
  id: string;
  name: string;
  price: number;
};

const INTERVAL_MS = 3000; // 3 seconds

export const usePayment = ({ lnaddress, onComplete }: UsePayment) => {
  const [lightningInvoice, setLightningInvoice] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [paymentHash, setPaymentHash] = useState<string | null>(null);
  const [amountInSats, setAmountInSats] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { settings, getCurrencySymbol } = useSettings();
  const { lightningAddress, isAuthenticated } = useLightningAuth();

  const generatePayment = useCallback(
    async (amount: number, cart: { id: string; quantity: number }[] = [], products: Product[] = []) => {
      if (!isAuthenticated || !lightningAddress) {
        setError('Lightning Address not configured');
        setIsGenerating(false);
        return;
      }

      try {
        setIsGenerating(true);
        setError(null);
        setVerifyUrl(null);
        setPaymentHash(null);

        // 1. Convertir monto fiat a satoshis usando Yadio
        console.log(`Converting ${amount} ${settings.currency} to satoshis...`);
        const satsAmount = await convertToSatoshis(amount, settings.currency);
        setAmountInSats(satsAmount);
        console.log(`Converted to ${satsAmount} satoshis`);

        // 2. Generar el comentario con los detalles de los productos
        let comment = `Payment for ${getCurrencySymbol()}${amount.toLocaleString()} ${settings.currency}`;

        // Añadir detalles de productos si hay elementos en el carrito
        if (cart.length > 0 && products.length > 0) {
          // Formato estructurado para análisis de datos: POS|TOTAL:[amount]|[item1:qty]|[item2:qty]|...
          const itemsList = cart
            .map((item) => {
              const product = products.find((p) => p.id === item.id);
              if (product) {
                return `${product.name.replace(/[|:,]/g, '')}:${item.quantity}`;
              }
              return null;
            })
            .filter(Boolean);

          comment = `LNPOS|TOTAL:${getCurrencySymbol()}${amount.toLocaleString()}${settings.currency}|${itemsList.join(
            '|',
          )}`;
        }

        // 3. Generar factura Lightning usando LUD-16/LUD-21
        console.log(`Generating Lightning invoice for ${satsAmount} sats...`);
        const invoiceData = await generateLightningInvoice(
          lnaddress ? lnaddress : lightningAddress,
          satsAmount,
          comment,
        );

        setLightningInvoice(invoiceData.pr);

        // 4. Configurar verificación de pago si está disponible (LUD-21)
        if (invoiceData.verify) {
          setVerifyUrl(invoiceData.verify);
          const hash = extractPaymentHash(invoiceData.pr);
          setPaymentHash(hash);
          console.log('Payment verification enabled (LUD-21)');
        } else {
          console.log('Payment verification not available - manual confirmation required');
        }
      } catch (err) {
        console.error('Error generating payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate payment');
      } finally {
        setIsGenerating(false);
      }
    },
    [isAuthenticated, lnaddress, lightningAddress, settings.currency, getCurrencySymbol],
  );

  const resetPayment = useCallback(() => {
    setLightningInvoice(null);
    setVerifyUrl(null);
    setPaymentHash(null);
    setAmountInSats(null);
    setIsGenerating(true);
    setError(null);
  }, []);

  useEffect(() => {
    if (!verifyUrl || !paymentHash) {
      return;
    }

    let interval: NodeJS.Timeout;
    let isActive = true;

    const checkPayment = async () => {
      if (!isActive) return;

      try {
        setError(null);

        const result = await verifyLightningPayment(verifyUrl, paymentHash);

        if (result.settled) {
          console.log('Payment confirmed!', result);
          if (isActive) {
            onComplete();
          }
          return; // Detener verificación
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        if (isActive) {
          setError(error instanceof Error ? error.message : 'Verification failed');
        }
      }

      // Continuar verificando si el pago no está confirmado
      if (isActive) {
        interval = setTimeout(checkPayment, INTERVAL_MS);
      }
    };

    // Iniciar verificación
    checkPayment();

    // Cleanup
    return () => {
      isActive = false;
      if (interval) {
        clearTimeout(interval);
      }
    };
  }, [verifyUrl, paymentHash, onComplete]);

  return {
    lightningInvoice,
    amountInSats,
    isGenerating,
    error,
    generatePayment,
    resetPayment,
  };
};
