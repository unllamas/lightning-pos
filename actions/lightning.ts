'use server';

import { LNURLPayCallbackResponse, LNURLPayResponse, LNURLVerifyResponse, YadioResponse } from '@/lib/lightning-utils';

// Convertir monto fiat a satoshis usando Yadio
export async function convertToSatoshis(amount: number, currency: string): Promise<number> {
  try {
    // Yadio API endpoint correcto
    const response = await fetch(`https://api.yadio.io/exrates/BTC`);

    if (!response.ok) {
      throw new Error(`Yadio API error: ${response.status}`);
    }

    const data: YadioResponse = await response.json();

    console.log('Yadio API response:', data);

    // Yadio devuelve BTC rates en diferentes monedas
    const btcPrice = data.BTC?.[currency.toUpperCase()];

    if (!btcPrice) {
      throw new Error(
        `Currency ${currency.toUpperCase()} not supported. Available currencies: ${Object.keys(data.BTC || {}).join(
          ', ',
        )}`,
      );
    }

    // Convertir a satoshis
    // 1 BTC = 100,000,000 satoshis
    const satoshis = Math.round((amount / btcPrice) * 100000000);

    console.log(`Converted ${amount} ${currency} to ${satoshis} satoshis (BTC price: ${btcPrice})`);

    return satoshis;
  } catch (error) {
    console.error('Error converting to satoshis:', error);

    // Fallback: usar un precio aproximado de BTC si la API falla
    if (error instanceof Error && error.message.includes('not supported')) {
      throw error;
    }

    // Precio de fallback (aproximado)
    const fallbackPrices: { [key: string]: number } = {
      USD: 100000,
      EUR: 92000,
      ARS: 100000000,
    };

    const fallbackPrice = fallbackPrices[currency.toUpperCase()];
    if (fallbackPrice) {
      console.warn(`Using fallback BTC price for ${currency}: ${fallbackPrice}`);
      const satoshis = Math.round((amount / fallbackPrice) * 100000000);
      return satoshis;
    }

    throw new Error('Failed to convert currency to satoshis');
  }
}

// Obtener información LNURL-pay de una Lightning Address
export async function getLNURLPayInfo(lightningAddress: string): Promise<LNURLPayResponse> {
  try {
    const [username, domain] = lightningAddress.split('@');
    if (!username || !domain) {
      throw new Error('Invalid Lightning Address format');
    }

    const lnurlpUrl = `https://${domain}/.well-known/lnurlp/${username}`;

    const response = await fetch(lnurlpUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`LNURL-pay request failed: ${response.status}`);
    }

    const data: LNURLPayResponse = await response.json();

    // Validar que sea una respuesta LNURL-pay válida
    if (data.tag !== 'payRequest' || !data.callback || !data.metadata) {
      throw new Error('Invalid LNURL-pay response');
    }

    return data;
  } catch (error) {
    console.error('Error getting LNURL-pay info:', error);
    throw new Error('Failed to get Lightning payment information');
  }
}

// Generar factura Lightning usando LUD-16/LUD-21
export async function generateLightningInvoice(
  lightningAddress: string,
  amountSats: number,
  comment?: string,
): Promise<LNURLPayCallbackResponse> {
  try {
    // Primero obtener la información LNURL-pay
    const lnurlInfo = await getLNURLPayInfo(lightningAddress);

    // Convertir satoshis a millisatoshis (1 sat = 1000 millisats)
    const amountMillisats = amountSats * 1000;

    // Validar que el monto esté dentro de los límites
    if (amountMillisats < lnurlInfo.minSendable || amountMillisats > lnurlInfo.maxSendable) {
      throw new Error(
        `Amount ${amountSats} sats is outside allowed range: ${lnurlInfo.minSendable / 1000}-${
          lnurlInfo.maxSendable / 1000
        } sats`,
      );
    }

    // Preparar parámetros para el callback
    const callbackUrl = new URL(lnurlInfo.callback);
    callbackUrl.searchParams.set('amount', amountMillisats.toString());

    // Agregar comentario si está permitido y proporcionado
    if (comment && lnurlInfo.commentAllowed && comment.length <= lnurlInfo.commentAllowed) {
      callbackUrl.searchParams.set('comment', comment);
    }

    // Hacer la solicitud al callback para generar la factura
    const response = await fetch(callbackUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lightning invoice generation failed: ${response.status}`);
    }

    const invoiceData: LNURLPayCallbackResponse = await response.json();

    // Validar que tengamos una factura válida
    if (!invoiceData.pr) {
      throw new Error('No Lightning invoice received');
    }

    return invoiceData;
  } catch (error) {
    console.error('Error generating Lightning invoice:', error);
    throw new Error('Failed to generate Lightning invoice');
  }
}

// Verificar el estado de pago usando LUD-21
export async function verifyLightningPayment(verifyUrl: string, paymentHash: string): Promise<LNURLVerifyResponse> {
  try {
    const url = new URL(verifyUrl);
    url.searchParams.set('paymentHash', paymentHash);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.status}`);
    }

    const verifyData: LNURLVerifyResponse = await response.json();

    // Validar respuesta
    if (verifyData.status !== 'OK') {
      throw new Error('Payment verification returned error status');
    }

    return verifyData;
  } catch (error) {
    console.error('Error verifying Lightning payment:', error);
    throw new Error('Failed to verify payment status');
  }
}
