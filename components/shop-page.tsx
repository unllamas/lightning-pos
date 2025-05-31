'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Pencil } from 'lucide-react';

import { usePOSData } from '@/hooks/use-pos-data';

import { Button } from '@/components/ui/button';
import { ProductList } from '@/components/product-list';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function ShopPage() {
  const router = useRouter();
  const { categories, products, cart, isLoading, error, addToCart, updateCartQuantity, clearCart } = usePOSData();

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
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className='w-full mx-auto min-h-screen flex flex-col bg-gray-100'>
      <header className='py-4 flex bg-[#0F0F0F] border-b shadow-sm'>
        <div className='flex items-center justify-between w-full max-w-md mx-auto px-4'>
          <div className='flex items-center'>
            <Button className='mr-2' variant='default' size='icon' asChild>
              <Link href='/app'>
                <ChevronLeft className='h-4 w-4' />
                <span className='sr-only'>Back</span>
              </Link>
            </Button>
            <h1 className='text-xl font-medium text-white'>{'Shop'}</h1>
          </div>
          <Button variant='default' size='icon' asChild>
            <Link href='/shop/edit'>
              <Pencil className='h-4 w-4' />
              <span className='sr-only'>Edit</span>
            </Link>
          </Button>
        </div>
      </header>

      <ProductList
        categories={categories}
        products={products}
        onAddToCart={addToCart}
        cart={cart}
        updateQuantity={updateCartQuantity}
        onCartClick={() => router.push('/cart')}
        onClearCart={clearCart}
      />
    </div>
  );
}
