'use client';

import React, { useState } from 'react';
import {
  Zap,
  Store,
  Truck,
  User,
  Utensils,
  BarChart3,
  Lock,
  ArrowUpRight,
  Plus,
  Minus,
  BadgePercent,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface FAQItem {
  question: string;
  answer: string;
}

interface UseCase {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: 'available' | 'coming-soon';
}

const useCases: UseCase[] = [
  {
    icon: <Store />,
    title: 'Retail stores',
    description: 'Accept with zero complexity.',
  },
  {
    icon: <Truck />,
    title: 'Market vendors',
    description: 'Mobile-friendly solution for sellers.',
  },
  {
    icon: <User />,
    title: 'Professionals',
    description: 'Simple payment solution for independent.',
  },
  {
    icon: <Utensils />,
    title: 'Establishments',
    description: 'Seamless payments for dining.',
  },
];

const features: Feature[] = [
  {
    icon: <Store />,
    title: 'Shop',
    description: 'Manage your products directly in the app.',
    status: 'available',
  },
  {
    icon: <BarChart3 />,
    title: 'Paydesk',
    description: 'Advanced payment terminal functionality.',
    status: 'available',
  },
  {
    icon: <BarChart3 />,
    title: 'Analytics',
    description: 'Track your sales and payment.',
    status: 'coming-soon',
  },
  {
    icon: <Lock />,
    title: 'Synchronization',
    description: 'Connect multiple devices.',
    status: 'coming-soon',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'What is a Lightning Address?',
    answer: 'A <b>Lightning POS</b> is like an email. It’s a simple way to receive Bitcoin payments.',
  },
  {
    question: 'Do I need to install anything?',
    answer:
      'No. You don’t need to install anything. <b>Lightning POS</b> is a web application that works directly in your browser.',
  },
  {
    question: 'Can I use it without technical knowledge?',
    answer: 'Absolutely. <b>Lightning POS</b> is designed to be ultra-simple.',
  },
  {
    question: 'What are the costs?',
    answer: '<b>Lightning POS</b> is completely free.',
  },
];

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className='relative overflow-y-scroll min-h-screen bg-[#0F0F0F]'>
      {/* Header */}
      <header className='w-full py-4 bg-background'>
        <div className='flex items-center justify-between w-full max-w-md mx-auto px-4'>
          <img
            src='/logo.svg'
            alt='Lightning PoS Logo'
            className='h-[30px] w-auto'
            style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))' }}
          />
          <Button variant='link' asChild>
            <Link href='/login'>
              Get Started <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className='relative z-10 flex justify-center items-center py-20 pb-0 bg-background'>
        <div className='max-w-xl mx-auto px-4'>
          <div className='flex flex-col gap-12 items-center'>
            <div className='flex flex-col gap-8 items-center text-center'>
              <Badge variant='default'>Public Beta Active</Badge>
              <h1 className='text-6xl md:text-9xl uppercase font-bold text-foreground tracking-tight'>
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600'>
                  Accept Bitcoin
                </span>{' '}
                Payments
              </h1>
              <p className='text-2xl text-muted-foreground'>Transform your business NOW.</p>

              {/* <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button variant='default' size='lg' asChild>
                  <Link href='/jona@breez.fun'>
                    Try Now <ArrowRight />
                  </Link>
                </Button>
              </div> */}

              <div className='relative overflow-hidden w-auto mt-8'>
                {/* <div className='absolute z-10 bottom-0 left-0 w-full h-64 bg-gradient-to-b from-white/0 to-white'></div> */}
                <img className='w-full max-w-lg h-full' src='/screen.png' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className='relative z-10 py-20 bg-background'>
        <div className='max-w-xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>Why?</h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>The simplest way.</p>
          </div>
          <div className='flex flex-col md:flex-row gap-8'>
            <div className='flex flex-col items-center justify-center gap-4 text-center'>
              <div className='size-6 mt-1 text-muted-foreground font-bold'>
                <Zap />
              </div>
              <div className='flex flex-col gap-2 w-full'>
                <h3 className='text-lg font-bold text-text'>Ultra-fast</h3>
                <p className='text-muted-foreground'>Lightning transactions.</p>
              </div>
            </div>
            <div className='flex flex-col items-center justify-center gap-4 text-center'>
              <div className='size-6 mt-1 text-muted-foreground font-bold'>
                <BadgePercent />
              </div>
              <div className='flex flex-col gap-2 w-full'>
                <h3 className='text-lg font-bold text-text'>No fees</h3>
                <p className='text-muted-foreground'>Keep 100% of your revenue.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className='relative z-10 py-20 bg-background'>
        <div className='max-w-xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>For All</h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              We adapt to the needs of small and growing businesses.
            </p>
          </div>
          <div className='grid md:grid-cols-2 gap-8'>
            {useCases.map((useCase, index) => (
              <div key={index} className='flex flex-col justify-center items-center gap-4 text-center'>
                <div className='size-6 text-muted-foreground'>{useCase.icon}</div>
                <h3 className='text-lg font-bold text-text'>{useCase.title}</h3>
                <p className='text-muted-foreground'>{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className='relative z-10 py-20 bg-background'>
        <div className='max-w-xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>Get Started in Seconds</h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>Three simple steps to start today.</p>
          </div>
          <div className='flex flex-col gap-8 mb-12'>
            <div className='flex gap-4'>
              <div className='w-12 mt-1 text-muted-foreground text-lg'>1.</div>
              <div className='flex flex-col gap-2 w-full'>
                <h3 className='text-lg font-bold text-gray-900'>Set up your account</h3>
                <p className='text-muted-foreground'>Lightning Address or NWC.</p>
              </div>
            </div>
            <div className='flex gap-4'>
              <div className='w-12 mt-1 text-muted-foreground text-lg'>2.</div>
              <div className='flex flex-col gap-2 w-full'>
                <h3 className='text-lg font-bold text-gray-900'>Generate your first sale</h3>
                <p className='text-muted-foreground'>Show the QR code to your customer.</p>
              </div>
            </div>
            <div className='flex gap-4'>
              <div className='w-12 mt-1 text-muted-foreground text-lg'>3.</div>
              <div className='flex flex-col gap-2 w-full'>
                <h3 className='text-lg font-bold text-gray-900'>Paid instantly</h3>
                <p className='text-muted-foreground'>No waiting, no fees, no complications.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='relative z-10 py-20 bg-background'>
        <div className='flex flex-col max-w-xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-4xl font-bold text-text mb-4'>Everything You Need</h2>
            <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
              A complete point-of-sale solution with all the businesses need.
            </p>
          </div>
          <div className='grid md:grid-cols-2 gap-8'>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative ${
                  feature.status === 'coming-soon' ? 'opacity-35' : ''
                } flex flex-col items-center gap-4 text-center`}
              >
                <div className='size-6 text-muted-foreground'>{feature.icon}</div>
                <div className='flex flex-col items-center gap-2'>
                  {feature.status === 'coming-soon' && (
                    <Badge variant='outline' className='ml-2'>
                      Soon
                    </Badge>
                  )}
                  <h3 className='text-xl font-bold text-text'>{feature.title}</h3>
                </div>
                <p className='text-text-muted-foreground'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Generation Form */}
      {/* <section className='relative z-20 pt-20 bg-gradient-to-br from-orange-300 to-orange-500 text-black'>
        <div className='flex flex-col items-center justify-center gap-8'>
          <div className='max-w-md px-4 text-center'>
            <h2 className='text-3xl lg:text-4xl font-bold mb-4'>Accepting Today</h2>
            <p className='text-xl'>Get early access and join several of merchants already.</p>
          </div>
          <div className='relative max-w-xl -mb-12 px-4'>
            {!formSubmitted ? (
              <form onSubmit={handleFormSubmit}>
                <Card>
                  <CardContent className='p-6'>
                    <div className='grid md:grid-cols-2 gap-6 mb-6'>
                      <div>
                        <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
                          Name *
                        </label>
                        <input
                          type='text'
                          id='name'
                          name='name'
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200'
                          placeholder='Your full name'
                        />
                      </div>
                      <div>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                          Email *
                        </label>
                        <input
                          type='email'
                          id='email'
                          name='email'
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200'
                          placeholder='your@email.com'
                        />
                      </div>
                    </div>
                    <div className='mb-6'>
                      <label htmlFor='message' className='block text-sm font-medium text-gray-700 mb-2'>
                        Message
                      </label>
                      <textarea
                        id='message'
                        name='message'
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200'
                        placeholder='Tell us about your business and how you plan to use LightningPOS...'
                      ></textarea>
                    </div>
                    <Button className='w-full' type='submit' size='lg'>
                      Get Early Access
                    </Button>
                  </CardContent>
                </Card>
              </form>
            ) : (
              <Card>
                <CardContent className='p-6'>
                  <div className='size-6 text-muted-foreground mb-4'>
                    <CheckCircle />
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 mb-4'>Thank you!</h3>
                  <p className='text-gray-600 text-lg'>
                    We've received your request and will get back to you within 24 hours. Welcome to the future of
                    Bitcoin payments!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section> */}

      {/* FAQ */}
      <section className='relative z-10 overflow-hidden pb-20 bg-background border-b rounded-b-2xl'>
        <div className='max-w-xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-4xl font-bold text-text mb-4'>FAQs</h2>
            <p className='text-xl text-muted-foreground'>Everything you need to know.</p>
          </div>
          <div className='overflow-hidden flex flex-col gap-[1px] bg-border border border-gray-200 rounded-lg'>
            {faqs.map((faq, index) => (
              <div key={index} className='bg-background'>
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className={`w-full px-6 py-4 text-left flex items-center justify-between ${
                    openFAQ !== index && 'hover:bg-gray-50'
                  } transition-colors duration-200`}
                >
                  <span className='font-semibold text-text'>{faq.question}</span>
                  {openFAQ === index ? (
                    <Minus className='w-5 h-5 text-muted-foreground' />
                  ) : (
                    <Plus className='w-5 h-5 text-muted-foreground' />
                  )}
                </button>
                {openFAQ === index && (
                  <div className='px-6 pb-4'>
                    <p className='text-muted-foreground' dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='w-full pt-16 pb-8 bg-[#0F0F0F] text-white'>
        <div className='max-w-xl mx-auto px-4'>
          <div className='flex flex-col gap-8'>
            <div className='flex flex-col gap-2'>
              <div className='flex'>
                <img src='/iso.svg' alt='Lightning PoS Logo' className='h-[60px]' />
              </div>
              <p className='text-white'>The simplest way to accept Bitcoin payments.</p>
            </div>
            <div className='flex flex-col md:flex-row w-full'>
              <div className='w-full'>
                <h6 className='mb-4 px-4 text-xs text-muted-foreground'>Social</h6>
                <ul className='flex flex-col justify-between gap-2 text-gray-400'>
                  <li>
                    <Button className='text-white' variant='link' asChild>
                      <Link
                        href='https://njump.me/nprofile1qqsxphhzhhxepm2csvpfgcs2zselmgst7v8k2fs5k58j35hw605c8wgtxthlw'
                        target='_blank'
                      >
                        Nostr
                        <ArrowUpRight />
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button className='text-white' variant='link' asChild>
                      <Link href='https://t.me/lnpos' target='_blank'>
                        Telegram
                        <ArrowUpRight />
                      </Link>
                    </Button>
                  </li>
                </ul>
              </div>
              <div className='w-full'>
                <h6 className='mb-4 px-4 text-xs text-muted-foreground'>About us</h6>
                <ul className='flex flex-col justify-between gap-2 text-gray-400'>
                  <li>
                    <Button className='text-white' variant='link' asChild>
                      <Link href='https://github.com/unllamas/lightning-pos/' target='_blank'>
                        Documentation
                        <ArrowUpRight />
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button className='text-white' variant='link' asChild>
                      <Link
                        className='hover:text-white transition-colors duration-200'
                        href='https://geyser.fund/project/lightningpos'
                        target='_blank'
                      >
                        Donate
                        <ArrowUpRight />
                      </Link>
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className='border-t border-white/10 mt-4 pt-4'>
            <p className='text-sm text-muted-foreground text-center'>© 2025 ⚡️ POS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
