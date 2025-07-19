'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight } from 'lucide-react';

import { setLocal } from '@/lib/localStorage';
import { sendEmail } from '@/actions/email';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OnboardingCarousel } from '@/components/onboarding-carousel';
import { AppViewport } from '@/components/app/app-viewport';
import { AppContent } from '@/components/app/app-content';
import { AppFooter } from '@/components/app/app-footer';

export function WaitlistPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        throw new Error('Invalid email address');
      }

      const res = await sendEmail({ email });
      if (res?.status === 400) {
        throw new Error('Oops! Something went wrong. Please try again later.');
      }

      setIsSubmitted(true);
      setIsSubmitting(false);
      setLocal('waitlist-email', email);
    } catch (error) {
      console.error('Email validation error:', error);
      setIsSubmitting(false);
      return;
    }
  };

  const isFormValid = email?.trim() && email?.includes('@');

  if (isSubmitted) {
    return (
      <div className='w-full min-h-screen bg-black flex flex-col relative overflow-hidden'>
        <div className='flex-1 flex flex-col w-full max-w-sm mx-auto px-4'>
          <div className='flex-1 flex flex-col items-center justify-center gap-4 py-8 px-4 text-white relative z-10'>
            <Check className='h-8 w-8 text-green-500' />

            <h1 className='text-3xl font-bold text-center'>Thanks!</h1>
            <p className='text-white/90 text-center '>We'll notify you when ⚡️ POS Cloud is available.</p>

            <Button variant='secondary' onClick={() => router.push('/app?utm_source=waitlist')}>
              Go App <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppViewport>
      <AppContent className=''>
        <OnboardingCarousel />
      </AppContent>
      <AppFooter>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 w-full'>
          <Input
            id='email'
            name='email'
            type='email'
            placeholder='you@email.com'
            defaultValue={email as string}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className='flex gap-4 w-full'>
            <Button className='w-full' size='lg' type='button' variant='default' asChild>
              <Link href='/app'>Cancel</Link>
            </Button>

            <Button
              className='w-full'
              size='lg'
              variant='success'
              type='submit'
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Join Now'}
            </Button>
          </div>
        </form>
      </AppFooter>
    </AppViewport>
  );
}
