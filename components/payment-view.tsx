'use client';

import { useEffect } from 'react';

import { usePaymentGeneration } from '@/hooks/use-payment-generation';
import { useNFCPayment } from '@/hooks/use-nfc-payment';
import { usePaymentVerification } from '@/lib/lightning-utils';

import { PaymentError } from '@/components/payment/payment-error';
import { PaymentQRDisplay } from '@/components/payment/payment-qr-display';
// import { NFCAlert } from '@/components/payment/nfc-alert';
import { PaymentActions } from '@/components/payment/payment-actions';
// import { NFCPermissionRequest } from '@/components/payment/nfc-permission-request';

import type { Product } from '@/lib/types';

// Primero, añadir los props necesarios
interface PaymentViewProps {
  amount: number;
  cart?: { id: string; quantity: number }[];
  products?: Product[];
  onCancel: () => void;
  onCompletePayment: () => void;
}

// Luego, actualizar la desestructuración de props
export function PaymentView({ amount, cart = [], products = [], onCancel, onCompletePayment }: PaymentViewProps) {
  const {
    qrCodeDataUrl,
    lightningInvoice,
    verifyUrl,
    paymentHash,
    amountInSats,
    isGenerating,
    error,
    generatePayment,
    resetPayment,
  } = usePaymentGeneration();

  // Hook para verificar el pago automáticamente
  const { isVerifying, verificationError } = usePaymentVerification(
    verifyUrl,
    paymentHash,
    onCompletePayment,
    3000, // Verificar cada 3 segundos
  );

  const {
    isNFCAvailable,
    nfcEnabled,
    nfcStatus,
    nfcError,
    showNFCAlert,
    showPermissionRequest,
    isNFCButtonDisabled,
    requestNFCPermission,
    handlePermissionGranted,
    handlePermissionDenied,
    handleNFCScan,
    dismissNFCAlert,
  } = useNFCPayment();

  // Finalmente, actualizar la llamada a generatePayment
  useEffect(() => {
    generatePayment(amount, cart, products);
  }, [amount, cart, products, generatePayment]);

  // Solicitar permisos NFC cuando se genere el pago exitosamente
  useEffect(() => {
    if (!isGenerating && !error && lightningInvoice && isNFCAvailable) {
      requestNFCPermission();
    }
  }, [isGenerating, error, lightningInvoice, isNFCAvailable, requestNFCPermission]);

  const retryGeneration = () => {
    resetPayment();
    generatePayment(amount);
  };

  const handleNFCPayment = () => {
    if (lightningInvoice) {
      handleNFCScan(lightningInvoice, onCompletePayment);
    }
  };

  if (error) {
    return <PaymentError error={error} amount={amount} onRetry={retryGeneration} onCancel={onCancel} />;
  }

  return (
    <div className='flex flex-col items-center justify-between w-full h-screen mx-auto relative'>
      {/* Solicitud de permisos NFC */}
      {/* {showPermissionRequest && (
        <NFCPermissionRequest
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
        />
      )} */}

      {/* Alerta flotante de NFC - posicionada en la parte inferior */}
      {/* {showNFCAlert && <NFCAlert status={nfcStatus} nfcError={nfcError} onDismiss={dismissNFCAlert} />} */}

      <PaymentQRDisplay
        qrCodeDataUrl={qrCodeDataUrl}
        amount={amount}
        amountInSats={amountInSats}
        lightningInvoice={lightningInvoice}
        isGenerating={isGenerating}
      />

      <PaymentActions
        isNFCAvailable={isNFCAvailable && nfcEnabled}
        isNFCButtonDisabled={isNFCButtonDisabled || !lightningInvoice}
        nfcStatus={nfcStatus}
        lightningInvoice={lightningInvoice}
        verifyUrl={verifyUrl}
        onNFCScan={handleNFCPayment}
        onCancel={onCancel}
        onCompletePayment={onCompletePayment}
      />
    </div>
  );
}
