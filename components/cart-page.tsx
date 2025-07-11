'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { usePOSData } from '@/hooks/use-pos-data';
import { useSettings } from '@/hooks/use-settings';

import { CartView } from '@/components/cart-view';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function CartPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const { products, cart, isLoading, error, updateCartQuantity } = usePOSData();

  useEffect(() => {
    if (!isLoading && cart?.length === 0) {
      router.push('/shop');
    }
  }, [cart]);

  const totalAmount = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    router.push(`/payment?cur=${settings?.currency}&amt=${totalAmount}`);
  };

  if (isLoading) {
    <div className='flex justify-center items-center w-screen h-screen'>
      <LoadingSpinner />
    </div>;
  }

  if (error) {
    return (
      <div className='w-full max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-8'>
        <p className='text-red-500 text-center'>Error: {error}</p>
        <button onClick={() => window.location.reload()} className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className='w-full h-full'>
      <CartView
        cart={cart}
        products={products}
        totalAmount={totalAmount}
        onUpdateQuantity={updateCartQuantity}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
