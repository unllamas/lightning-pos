export interface PrintItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PrintOrder {
  orderId: string;
  timestamp?: string;
  items: PrintItem[];
  subtotal: number;
  tip?: number;
  total: number;
  currency: string;
  currencySymbol: string;
  paymentMethod?: 'lightning' | 'cash';
  lightningAddress?: string;
  operatorLightningAddress?: string;
  status?: 'paid' | 'pending';
}
