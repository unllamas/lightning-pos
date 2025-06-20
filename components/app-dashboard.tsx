'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calculator, Store, Settings, X, User } from 'lucide-react';

import { useLightningAuth } from '@/hooks/use-lightning-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JoinCloud } from '@/components/join-cloud';

export function AppDashboard() {
  const router = useRouter();
  const { lightningAddress, isAuthenticated, logout } = useLightningAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const dashboardCards = [
    {
      title: 'Shop',
      description: 'Complete Point of Sale',
      icon: Store,
      href: '/shop',
      color: 'bg-green-500',
      status: 'ACTIVE',
    },
    {
      title: 'Paydesk',
      description: 'Calculator for quick collections',
      icon: Calculator,
      href: '/paydesk',
      color: 'bg-blue-500',
      status: 'ACTIVE',
    },
  ];

  return (
    <div className='flex flex-col w-full h-full mx-auto'>
      {/* Header */}
      <header className='w-full py-4 bg-[#0F0F0F] border-b shadow-sm'>
        <div className='flex items-center justify-between w-full max-w-md mx-auto px-4'>
          <Button variant='default' onClick={handleLogout} className='mr-2'>
            <div className='flex gap-2 items-center justify-center min-w-0'>
              {isAuthenticated && lightningAddress ? (
                <>
                  <User className='h-4 w-4 flex-shrink-0' />
                  <span className='truncate text-sm'>{lightningAddress}</span>
                </>
              ) : (
                <>
                  <User className='h-4 w-4 flex-shrink-0' />
                  <span className='text-sm'>Guest Mode</span>
                </>
              )}
              <X className='h-4 w-4 text-destructive flex-shrink-0' />
              <span className='sr-only'>Log out</span>
            </div>
          </Button>
          <Button size='icon' variant='default' asChild>
            <Link href='/settings'>
              <Settings className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </header>

      <div className='flex flex-col gap-4 w-full max-w-md mx-auto p-4'>
        {process.env.NODE_ENV === 'development' && <JoinCloud />}

        {/* Main Content */}
        <div className='flex-1 flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-lg font-medium text-gray-900'>Control Panel</h2>
            {!isAuthenticated && (
              <p className='text-sm text-gray-500'>
                Running in guest mode.{' '}
                <Link href='/' className='text-blue-600 hover:underline'>
                  Setup now
                </Link>
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            {dashboardCards.map((card) => {
              const IconComponent = card.icon;
              const isDisabled = card.status === 'DISABLED';

              if (isDisabled) {
                return (
                  <Card
                    key={card.title}
                    className={
                      card?.status === 'ACTIVE'
                        ? `cursor-pointer hover:shadow-md transition-shadow`
                        : 'relative opacity-40'
                    }
                  >
                    <CardContent className='p-6'>
                      <div className='flex items-center space-x-4'>
                        <div className={`p-3 rounded-lg ${card.color}`}>
                          <IconComponent className='h-6 w-6 text-white' />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-1'>
                            <h3 className='font-medium text-gray-900'>{card.title}</h3>
                            {card?.status === 'DISABLED' && <span className='text-sm'>(Soon)</span>}
                          </div>
                          <p className='text-sm text-gray-600'>{card.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Link key={card.title} href={card.href} className='rounded-lg'>
                  <Card
                    className={
                      card?.status === 'ACTIVE'
                        ? `cursor-pointer hover:shadow-md transition-shadow`
                        : 'relative opacity-40'
                    }
                  >
                    <CardContent className='p-6'>
                      <div className='flex items-center space-x-4'>
                        <div className={`p-3 rounded-lg ${card.color}`}>
                          <IconComponent className='h-6 w-6 text-white' />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-1'>
                            <h3 className='font-medium text-gray-900'>{card.title}</h3>
                            {card?.status === 'DISABLED' && <span className='text-sm'>(Soon)</span>}
                          </div>
                          <p className='text-sm text-gray-600'>{card.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
