// Utilidades para Lightning Network
export interface YadioResponse {
  BTC: {
    [currency: string]: number;
  };
}

export interface LNURLPayResponse {
  callback: string;
  maxSendable: number;
  minSendable: number;
  metadata: string;
  tag: string;
  commentAllowed?: number;
  verify?: string; // LUD-21: URL para verificar el estado del pago
}

export interface LNURLPayCallbackResponse {
  pr: string; // Lightning invoice
  verify?: string; // LUD-21: URL para verificar el estado del pago
  successAction?: {
    tag: string;
    message?: string;
    url?: string;
  };
  disposable?: boolean;
  routes?: any[];
}

export interface LNURLVerifyResponse {
  status: 'OK' | 'ERROR';
  settled: boolean;
  preimage?: string;
  pr: string;
}

// Extraer payment hash de una factura Lightning
export function extractPaymentHash(invoice: string): string {
  try {
    // Las facturas Lightning están codificadas en bech32
    // El payment hash está en los datos de la factura
    // Para simplificar, usaremos una implementación básica
    // En producción, se debería usar una librería como bolt11-decoder

    // Por ahora, generamos un hash simulado basado en la factura
    // En una implementación real, decodificarías la factura Lightning
    const hash = invoice.substring(4, 68); // Tomar una parte de la factura como hash simulado
    return hash;
  } catch (error) {
    console.error('Error extracting payment hash:', error);
    // Fallback: usar parte de la factura como hash
    return invoice.substring(4, 36);
  }
}

// Función para validar Lightning Address
export function isValidLightningAddress(address: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(address);
}
