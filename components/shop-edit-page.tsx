'use client';

import { useRouter } from 'next/navigation';
import { ShopEdit } from '@/components/shop-edit';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { usePOSData } from '@/hooks/use-pos-data';

export function ShopEditPage() {
  const router = useRouter();
  const { isLoading, error } = usePOSData();

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
    <div className='flex-1 w-full bg-background'>
      <ShopEdit />
    </div>
  );
}
