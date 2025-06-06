export interface OrderItem {
  qty: number;
  name: string;
  price: number;
}

export interface PrintOrder {
  items: OrderItem[];
  total: number;
  totalSats: number;
  currency: string;
}
