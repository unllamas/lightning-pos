'use server';

import { LNURLPayCallbackResponse, LNURLPayResponse, LNURLVerifyResponse, YadioResponse } from '@/lib/lightning-utils';

// Convertir monto fiat a satoshis usando Yadio
export async function convertToSatoshis(amount: number, currency: string): Promise<number> {
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
}

// Obtener información LNURL-pay de una Lightning Address
export async function getLNURLPayInfo(lightningAddress: string): Promise<LNURLPayResponse> {
  const [username, domain] = lightningAddress.split('@');
  if (!username || !domain) throw new Error('Invalid Lightning Address format');

  const lnurlpUrl = `https://${domain}/.well-known/lnurlp/${username}`;

  const response = await fetch(lnurlpUrl, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`LNURL-pay request failed: ${response.status}`);

  const data: LNURLPayResponse = await response.json();
  if (data.tag !== 'payRequest' || !data.callback || !data.metadata) throw new Error('Invalid LNURL-pay response');

  return data;
}

// Generar factura Lightning usando LUD-16/LUD-21
export async function generateLightningInvoice(
  lightningAddress: string,
  amountSats: number,
  comment?: string,
): Promise<LNURLPayCallbackResponse> {
  // Primero obtener la información LNURL-pay
  const lnurlInfo = await getLNURLPayInfo(lightningAddress);

  // Convertir satoshis a millisatoshis (1 sat = 1000 millisats)
  const amountMillisats = amountSats * 1000;
  if (amountMillisats < lnurlInfo.minSendable || amountMillisats > lnurlInfo.maxSendable) {
    throw new Error(
      `Your wallet accepts a minimum of ${lnurlInfo.minSendable / 1000} and a maximum of ${
        lnurlInfo.maxSendable / 1000
      } SATs`,
    );
  }

  // Preparar parámetros para el callback
  const callbackUrl = new URL(lnurlInfo.callback);
  callbackUrl.searchParams.set('amount', amountMillisats.toString());
  if (comment && lnurlInfo.commentAllowed && comment.length <= lnurlInfo.commentAllowed) {
    callbackUrl.searchParams.set('comment', comment);
  }

  // Hacer la solicitud al callback para generar la factura
  const response = await fetch(callbackUrl.toString(), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Lightning invoice generation failed: ${response.status}`);

  // Validar que tengamos una factura válida
  const invoiceData: LNURLPayCallbackResponse = await response.json();
  if (!invoiceData.pr) throw new Error('No Lightning invoice received');

  return invoiceData;
}

// Verificar el estado de pago usando LUD-21
export async function verifyLightningPayment(verifyUrl: string, paymentHash: string): Promise<LNURLVerifyResponse> {
  const url = new URL(verifyUrl);
  url.searchParams.set('paymentHash', paymentHash);

  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Payment verification failed: ${response.status}`);

  const verifyData: LNURLVerifyResponse = await response.json();
  if (verifyData.status !== 'OK') throw new Error('Payment verification returned error status');

  return verifyData;
}
