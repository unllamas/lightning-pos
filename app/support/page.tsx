'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { AppContent } from '@/components/app/app-content';
import { AppViewport } from '@/components/app/app-viewport';
import { Button } from '@/components/ui/button';

export default function Page() {
  const router = useRouter();
  return (
    <>
      <AppViewport>
        {/* Header */}
        <header className='w-full py-4 bg-background'>
          <div className='flex items-center gap-2 w-full max-w-md mx-auto px-4'>
            <img
              src='/logo.svg'
              alt='Lightning PoS Logo'
              className='h-[30px] w-auto'
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))' }}
            />
            <Button variant='link' onClick={() => router.back()}>
              <ArrowLeft /> Go back
            </Button>
          </div>
        </header>
        <AppContent className='rounded-none p-0'>
          <iframe className='w-full h-full' src='https://tawk.to/chat/689b79e511275a1926b3083e/1j2fl8a17'></iframe>
        </AppContent>
      </AppViewport>
    </>
  );
}
