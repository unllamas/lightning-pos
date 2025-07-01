'use client';

import { useState, useCallback, useEffect } from 'react';
import { LightningAddress } from '@getalby/lightning-tools';
import { webln } from '@getalby/sdk';
import { useAuth } from './use-auth';
import { convertToSatoshis } from '@/lib/lightning-utils';

interface LightningInvoice {
  pr: string;
  paymentHash?: string;
  paymentRequest?: string;
}

interface PaymentVerificationResult {
  settled: boolean;
  preimage?: string;
}

const PAYMENT_CHECK_INTERVAL = 3000; // 3 seconds

export function useLightning() {
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<string | null>(null);
  const [paymentHash, setPaymentHash] = useState<string | null>(null);
  const [isListeningForPayment, setIsListeningForPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nwcProvider, setNwcProvider] = useState<webln.NostrWebLNProvider | null>(null);

  const { authMethod, lightningAddress, nwcString, isAuthenticated } = useAuth();

  // Initialize NWC provider when needed
  useEffect(() => {
    if (authMethod === 'nwc' && nwcString && !nwcProvider) {
      try {
        const provider = new webln.NostrWebLNProvider({ nostrWalletConnectUrl: nwcString });
        setNwcProvider(provider);
      } catch (error) {
        console.error('Error initializing NWC provider:', error);
        setError('Failed to initialize NWC connection');
      }
    } else if (authMethod !== 'nwc') {
      setNwcProvider(null);
    }
  }, [authMethod, nwcString, nwcProvider]);

  // Generate invoice using Lightning Address with Alby Lightning Tools
  const generateLightningAddressInvoice = useCallback(
    async (address: string, amountSats: number, description?: string): Promise<LightningInvoice> => {
      try {
        const ln = new LightningAddress(address);
        await ln.fetch();

        // Check amount limits
        const amountMsat = amountSats * 1000;
        if (amountMsat < ln?.min || amountMsat > ln?.max) {
          throw new Error(`Amount must be between ${ln?.min / 1000} and ${ln?.max / 1000} sats`);
        }

        // Request invoice using Alby Lightning Tools
        const invoice = await ln.requestInvoice({
          satoshi: amountSats,
          comment: description || 'Lightning Payment',
        });

        return {
          pr: invoice.paymentRequest,
          paymentHash: invoice.paymentHash,
          paymentRequest: invoice.paymentRequest,
        };
      } catch (error) {
        console.error('Error generating Lightning Address invoice:', error);
        throw new Error(
          `Failed to generate Lightning Address invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
    [],
  );

  // Generate invoice using NWC with Alby SDK
  const generateNWCInvoice = useCallback(
    async (amountSats: number, description?: string): Promise<LightningInvoice> => {
      if (!nwcProvider) {
        throw new Error('NWC provider not initialized');
      }

      try {
        // Enable the provider if not already enabled
        await nwcProvider.enable();

        // Create invoice using NWC
        const invoice = await nwcProvider.makeInvoice({
          amount: amountSats * 1000, // Convert to millisats
          defaultMemo: description || 'Lightning Payment',
        });

        return {
          pr: invoice.paymentRequest,
          paymentHash: invoice.paymentHash,
          paymentRequest: invoice.paymentRequest,
        };
      } catch (error) {
        console.error('Error generating NWC invoice:', error);
        throw new Error(`Failed to generate NWC invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [nwcProvider],
  );

  // Generate invoice based on configured auth method
  const generateInvoice = useCallback(
    async (
      amount: number,
      currency: string,
      description?: string,
    ): Promise<{ invoice: string; paymentHash?: string }> => {
      if (!isAuthenticated) {
        console.log('authMethod', authMethod);
        throw new Error('Not authenticated');
      }

      setIsGeneratingInvoice(true);
      setError(null);

      try {
        const amountSats = await convertToSatoshis(amount, currency);

        let invoiceData: LightningInvoice;

        if (authMethod === 'lnaddress' && lightningAddress) {
          invoiceData = await generateLightningAddressInvoice(lightningAddress, amountSats, description);
        } else if (authMethod === 'nwc' && nwcString) {
          invoiceData = await generateNWCInvoice(amountSats, description);
        } else {
          throw new Error('No valid authentication method configured');
        }

        setCurrentInvoice(invoiceData.pr);
        setPaymentHash(invoiceData.paymentHash || null);

        return {
          invoice: invoiceData.pr,
          paymentHash: invoiceData.paymentHash,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsGeneratingInvoice(false);
      }
    },
    [authMethod, lightningAddress, nwcString, isAuthenticated, generateLightningAddressInvoice, generateNWCInvoice],
  );

  // Verify payment using Lightning Address or NWC
  const verifyPayment = useCallback(
    async (paymentHash: string): Promise<PaymentVerificationResult> => {
      if (authMethod === 'lnaddress' && lightningAddress) {
        try {
          const ln = new LightningAddress(lightningAddress);
          await ln.fetch();

          // Check if the Lightning Address supports payment verification
          if (ln.lnurlpData?.verify) {
            const response = await fetch(`${ln.lnurlpData.verify}/${paymentHash}`);
            if (!response.ok) {
              throw new Error('Payment verification request failed');
            }
            const result = await response.json();
            return { settled: result.settled || false, preimage: result.preimage };
          } else {
            // If no verification endpoint, we can't verify automatically
            throw new Error('Payment verification not supported by this Lightning Address');
          }
        } catch (error) {
          console.error('Lightning Address payment verification error:', error);
          throw new Error('Payment verification failed');
        }
      } else if (authMethod === 'nwc' && nwcProvider) {
        try {
          // Use NWC to check payment status
          await nwcProvider.enable();

          // Get invoice status - this is a simplified approach
          // In practice, you might need to track invoices differently
          const transactions = await nwcProvider.listTransactions({});
          const payment = transactions?.find((tx) => tx.payment_hash === paymentHash);

          return {
            settled: payment?.settled || false,
            preimage: payment?.preimage,
          };
        } catch (error) {
          console.error('NWC payment verification error:', error);
          throw new Error('NWC payment verification failed');
        }
      } else {
        throw new Error('No payment verification method available');
      }
    },
    [authMethod, lightningAddress, nwcProvider],
  );

  // Listen for payment completion
  const listenForPayment = useCallback(
    (onPaymentReceived: () => void) => {
      if (!paymentHash || isListeningForPayment) {
        return;
      }

      setIsListeningForPayment(true);
      setError(null);

      const checkPayment = async () => {
        try {
          const result = await verifyPayment(paymentHash);
          if (result.settled) {
            setIsListeningForPayment(false);
            onPaymentReceived();
            return true;
          }
          return false;
        } catch (error) {
          console.error('Payment verification error:', error);
          setError(error instanceof Error ? error.message : 'Payment verification failed');
          return false;
        }
      };

      // Start checking for payment
      const interval = setInterval(async () => {
        const settled = await checkPayment();
        if (settled) {
          clearInterval(interval);
        }
      }, PAYMENT_CHECK_INTERVAL);

      // Cleanup function
      return () => {
        clearInterval(interval);
        setIsListeningForPayment(false);
      };
    },
    [paymentHash, isListeningForPayment, verifyPayment],
  );

  // Reset payment state
  const resetPayment = useCallback(() => {
    setCurrentInvoice(null);
    setPaymentHash(null);
    setIsListeningForPayment(false);
    setError(null);
  }, []);

  // Get current configuration info
  const getConnectionInfo = useCallback(() => {
    return {
      authMethod,
      lightningAddress,
      nwcString,
      isAuthenticated,
      hasNwcProvider: !!nwcProvider,
    };
  }, [authMethod, lightningAddress, nwcString, isAuthenticated, nwcProvider]);

  // Get wallet info (useful for NWC)
  const getWalletInfo = useCallback(async () => {
    if (authMethod === 'nwc' && nwcProvider) {
      try {
        await nwcProvider.enable();
        const info = await nwcProvider.getInfo();
        return info;
      } catch (error) {
        console.error('Error getting wallet info:', error);
        throw new Error('Failed to get wallet information');
      }
    } else if (authMethod === 'lnaddress' && lightningAddress) {
      try {
        const ln = new LightningAddress(lightningAddress);
        await ln.fetch();
        return {
          alias: lightningAddress,
          min: ln?.min,
          max: ln?.max,
          metadata: ln.lnurlpData?.metadata,
        };
      } catch (error) {
        console.error('Error getting Lightning Address info:', error);
        throw new Error('Failed to get Lightning Address information');
      }
    }

    throw new Error('No wallet connection available');
  }, [authMethod, lightningAddress, nwcProvider]);

  return {
    // State
    isGeneratingInvoice,
    currentInvoice,
    paymentHash,
    isListeningForPayment,
    error,

    // Actions
    generateInvoice,
    listenForPayment,
    resetPayment,
    verifyPayment,
    getConnectionInfo,
    getWalletInfo,
  };
}
