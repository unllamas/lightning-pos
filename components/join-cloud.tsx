import Link from 'next/link';
import { Cloud } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function JoinCloud() {
  return (
    <Link href='/waitlist' tabIndex={-1}>
      <Card className='relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform bg-black border-0'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-30 blur-xl'></div>
          <div className='absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-20 blur-lg transform -translate-x-1/2 -translate-y-1/2'></div>
        </div>
        <CardContent className='p-6 text-white relative'>
          <div className='absolute top-0 right-0 w-32 h-32 opacity-20'>
            <Cloud className='w-full h-full' />
          </div>

          <div className='relative z-10'>
            <div className='flex items-center mb-3'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center'>
                  <img src='/logo-white.svg' alt='Lightning PoS Logo' className='h-6 w-auto mr-2' />
                  <span className='font-bold text-lg'>Cloud</span>
                </div>
                <span className='text-xs bg-orange-900/40 px-2 py-1 rounded-full font-medium text-orange-500'>
                  Soon
                </span>
              </div>
            </div>

            <p className='text-white/90 text-sm mb-4 leading-relaxed'>
              Sync your store across devices and get advanced business analytics
            </p>

            <div className='w-full'>
              <Button
                variant='secondary'
                size='sm'
                className='w-full bg-orange-500 text-white hover:bg-orange-600 font-medium border-0'
              >
                See More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
