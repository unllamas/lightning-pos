'use client';

import Link from 'next/link';
import { ChevronLeft, Plus, Minus, Trash2 } from 'lucide-react';

import { useSettings } from '@/hooks/use-settings';

import { Button } from '@/components/ui/button';

import type { Product } from '@/lib/types';

interface CartViewProps {
  cart: { id: string; quantity: number }[];
  products: Product[];
  totalAmount: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCheckout: () => void;
}

export function CartView({ cart, products, totalAmount, onUpdateQuantity, onCheckout }: CartViewProps) {
  const cartItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      return {
        ...item,
        product,
      };
    })
    .filter((item) => item.product !== undefined);

  const { settings, getCurrencySymbol } = useSettings();

  // Calcular el total basado en los items actuales del carrito
  const calculatedTotal = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  return (
    <div className='flex flex-col h-screen'>
      <header className='py-4 bg-[#0F0F0F] border-b shadow-sm'>
        <div className='w-full max-w-md mx-auto px-4'>
          <div className='flex items-center'>
            <Button variant='default' size='icon' className='mr-2' asChild>
              <Link href='/shop'>
                <ChevronLeft className='h-6 w-6' />
                <span className='sr-only'>Back</span>
              </Link>
            </Button>
            <h1 className='text-xl font-medium text-white'>Cart</h1>
          </div>
        </div>
      </header>

      <div className='flex-1 overflow-auto w-full max-w-md mx-auto px-4'>
        {cartItems.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full'>
            <p className='text-gray-500'>The cart is empty</p>
          </div>
        ) : (
          <div className='divide-y'>
            {cartItems.map((item) => (
              <div key={item.id} className='p-4 flex justify-between items-center'>
                <div>
                  <div className='font-medium'>{item.product?.name}</div>
                  <div className='text-sm text-gray-500'>
                    {getCurrencySymbol()}
                    {item.product?.price.toLocaleString()} {settings.currency} x {item.quantity}
                  </div>
                  <div className='font-bold'>
                    {getCurrencySymbol()}
                    {((item.product?.price || 0) * item.quantity).toLocaleString()} {settings.currency}
                  </div>
                </div>

                <div className='flex items-center'>
                  <Button variant='outline' size='icon' onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                    {item.quantity === 1 ? <Trash2 className='h-4 w-4' /> : <Minus className='h-4 w-4' />}
                  </Button>
                  <span className='w-10 text-center text-lg font-medium'>{item.quantity}</span>
                  <Button variant='outline' size='icon' onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='sticky bottom-0 bg-white border-t py-4'>
        <div className='w-full max-w-md mx-auto px-4'>
          {cartItems.length > 0 ? (
            <>
              <div className='flex justify-between items-center mb-4'>
                <span className='font-medium'>Subtotal</span>
                <span className='font-bold text-xl'>
                  {getCurrencySymbol()}
                  {calculatedTotal.toLocaleString()} {settings.currency}
                </span>
              </div>
              <Button className='w-full' onClick={onCheckout}>
                Confirm
              </Button>
            </>
          ) : (
            <Button variant='outline' className='w-full' asChild>
              <Link href='/shop'>Back</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
