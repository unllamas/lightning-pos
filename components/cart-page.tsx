'use client';

import { useRouter } from 'next/navigation';

import { usePOSData } from '@/hooks/use-pos-data';

import { CartView } from '@/components/cart-view';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function CartPage() {
  const router = useRouter();
  const { products, cart, isLoading, error, updateCartQuantity } = usePOSData();

  const totalAmount = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    const orderId = `order-${Date.now()}`;
    router.push(`/payment/${orderId}`);
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
    <div className='w-full min-h-screen bg-gray-100'>
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
