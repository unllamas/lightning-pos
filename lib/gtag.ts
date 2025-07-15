// gtag.ts

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GOOGLE_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || '';

type GtagEventParams = Record<string, any>;

export function pageview(url: string) {
  if (typeof window === 'undefined' || !window.gtag || !GOOGLE_TAG_ID) return;
  window.gtag('event', 'page_view', {
    page_location: url,
    send_to: GOOGLE_TAG_ID,
  });
}

export function event(action: string, params: GtagEventParams = {}) {
  if (typeof window === 'undefined' || !window.gtag || !GOOGLE_TAG_ID) return;
  window.gtag('event', action, {
    ...params,
    send_to: GOOGLE_TAG_ID,
  });
}

// --- Ecommerce Event Types ---

export interface GtagItem {
  item_id: string;
  item_name: string;
  currency?: string;
  price?: number;
  quantity?: number;
  item_category?: string;
  item_variant?: string;
  [key: string]: any;
}

export interface GtagPurchaseParams {
  transaction_id: string;
  value: number;
  currency: string;
  tax?: number;
  shipping?: number;
  items: GtagItem[];
  coupon?: string;
}

export interface GtagBeginCheckoutParams {
  currency: string;
  value: number;
  items: GtagItem[];
  coupon?: string;
}

export interface GtagAddToCartParams {
  currency: string;
  value: number;
  items: GtagItem[];
}

// --- Ecommerce Event Functions ---

export function trackPurchase(params: GtagPurchaseParams) {
  event('purchase', params);
}

export function trackBeginCheckout(params: GtagBeginCheckoutParams) {
  event('begin_checkout', params);
}

export function trackAddToCart(params: GtagAddToCartParams) {
  event('add_to_cart', params);
}
