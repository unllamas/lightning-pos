'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { AppViewport } from '@/components/app/app-viewport';
import { AppContent } from '@/components/app/app-content';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { AppFooter } from '@/components/app/app-footer';

import { db } from '@/lib/database';
import { useRouter } from 'next/navigation';

export function LoginView() {
  const [sentEmail, setSentEmail] = useState('');

  return <>{!sentEmail ? <EmailStep onSendEmail={setSentEmail} /> : <CodeStep sentEmail={sentEmail} />}</>;
}

function EmailStep({ onSendEmail }: { onSendEmail: (email: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputEl = inputRef.current!;
    const email = inputEl.value;
    onSendEmail(email);

    if (!email) {
      alert('Please enter a valid email address.');
      onSendEmail('');
      return;
    }

    db.auth.sendMagicCode({ email }).catch((err) => {
      console.log('Error al enviar el código mágico:', err);
      alert('Uh oh :' + err.body?.message);
      onSendEmail('');
    });
  };
  return (
    <form className='w-screen h-screen' key='email' onSubmit={handleSubmit}>
      <AppViewport>
        <AppContent className='justify-center'>
          <div className='flex-1 flex flex-col justify-between gap-4 w-full max-w-md mx-auto px-4 mb-8'>
            <div className='flex mb-4'>
              <Link href='/' className='h-auto'>
                <img src='/logo.svg' alt='Lightning PoS Logo' className='h-full max-h-[40px] w-auto' />
              </Link>
            </div>
            <div className='space-y-4'>
              <h2 className='text-xl font-bold'>Let's log you in</h2>
              <p className='text-sm text-muted-foreground'>
                Enter your email, and we'll send you a verification code. We'll create an account for you too if you
                don't already have one.
              </p>
              <Input ref={inputRef} type='email' placeholder='your@email.com' required autoFocus />
            </div>
          </div>
        </AppContent>
        <AppFooter>
          <Button className='w-full' type='submit' variant='secondary'>
            Send Code
          </Button>
        </AppFooter>
      </AppViewport>
    </form>
  );
}

function CodeStep({ sentEmail }: { sentEmail: string }) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputEl = inputRef.current!;
    const code = inputEl.value;

    db.auth.signInWithMagicCode({ email: sentEmail, code }).catch((err) => {
      inputEl.value = '';
      alert('Uh oh :' + err.body?.message);
      return;
    });

    router.push('/app');
  };

  return (
    <form className='w-screen h-screen' key='code' onSubmit={handleSubmit}>
      <AppViewport>
        <AppContent className='justify-center'>
          <div className='flex-1 flex flex-col justify-between gap-4 w-full max-w-md mx-auto px-4 mb-8'>
            <div className='flex mb-4'>
              <Link href='/'>
                <img src='/logo.svg' alt='Lightning PoS Logo' className='h-[40px] w-auto' />
              </Link>
            </div>
            <div className='space-y-4'>
              <h2 className='text-xl font-bold'>Enter your code</h2>
              <p className='text-sm text-muted-foreground'>
                We sent an email to <strong className='text-foreground'>{sentEmail}</strong>. Check your email, and
                paste the code you see.
              </p>
              <InputOTP ref={inputRef} maxLength={6} required autoFocus className='w-full'>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={1} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={4} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button className='w-full' variant='ghost'>
                Paste
              </Button>
            </div>
          </div>
        </AppContent>
        <AppFooter>
          <Button className='w-full' type='submit' variant='secondary'>
            Verify Code
          </Button>
        </AppFooter>
      </AppViewport>
    </form>
  );
}
