import * as bolt11 from 'bolt11';

export interface DecodedInvoice {
  paymentHash: string;
  amount?: number;
  description?: string;
  timestamp: number;
  expiry: number;
}

/**
 * Decode a BOLT11 Lightning invoice to extract payment hash and other details
 */
export function decodeBolt11Invoice(paymentRequest: string): DecodedInvoice {
  try {
    const decoded = bolt11.decode(paymentRequest);

    // Extract payment hash from tags
    const paymentHashTag = decoded.tags.find((tag) => tag.tagName === 'payment_hash');
    if (!paymentHashTag || !paymentHashTag.data) {
      throw new Error('Payment hash not found in invoice');
    }

    // Extract amount (in millisatoshis)
    const amount = decoded.millisatoshis ? Math.floor(Number(decoded?.millisatoshis) / 1000) : undefined;

    // Extract description
    const descriptionTag = decoded.tags.find((tag) => tag.tagName === 'description');
    const description = descriptionTag?.data as string | undefined;

    // Extract expiry
    const expiryTag = decoded.tags.find((tag) => tag.tagName === 'expire_time');
    const expiry = (expiryTag?.data as number) || 3600; // Default 1 hour

    return {
      paymentHash: paymentHashTag.data as string,
      amount,
      description,
      timestamp: decoded.timestamp || Math.floor(Date.now() / 1000),
      expiry,
    };
  } catch (error) {
    console.error('Error decoding BOLT11 invoice:', error);
    throw new Error(`Failed to decode invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract only the payment hash from a BOLT11 invoice
 */
export function extractPaymentHash(paymentRequest: string): string {
  const decoded = decodeBolt11Invoice(paymentRequest);
  return decoded.paymentHash;
}

/**
 * Validate if a string is a valid BOLT11 invoice
 */
export function isValidBolt11Invoice(paymentRequest: string): boolean {
  try {
    bolt11.decode(paymentRequest);
    return true;
  } catch {
    return false;
  }
}
