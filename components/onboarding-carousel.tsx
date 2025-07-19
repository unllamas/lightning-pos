'use client';

import type React from 'react';
import { Cloud, FolderSyncIcon as Sync, BarChart3, Shield } from 'lucide-react';

import { useSwipeCarousel } from '@/hooks/use-swipe-carousel';

import { Logo } from '@/components/ui/logo';

interface Slide {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const slides: Slide[] = [
  {
    id: 'cloud',
    title: 'Coming soon',
    description: 'Access your point of sale with real-time synchronization.',
    icon: Logo,
  },
  {
    id: 'sync',
    title: 'Synchronization',
    description: 'Connect multiple devices and keep your inventory up to date.',
    icon: Sync,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Get details about your business with advanced reports and metrics.',
    icon: BarChart3,
  },
  {
    id: 'backup',
    title: 'Backups',
    description: 'Your data is always safe with automatic cloud backups.',
    icon: Shield,
  },
];

export function OnboardingCarousel() {
  const { currentSlide, isDragging, translateX, handlers } = useSwipeCarousel({
    totalSlides: slides.length,
    autoPlay: false,
    autoPlayInterval: 12000,
  });

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <div
      className={`overflow-hidden relative flex-1 flex items-center h-full 
       select-none`}
      {...handlers}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Background decorative elements */}
      {/* <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-1/4 right-1/4 w-32 h-32 bg-black/10 rounded-full blur-xl'></div>
        <div className='absolute bottom-1/3 left-1/4 w-24 h-24 bg-black/10 rounded-full blur-lg'></div>
        <div className='absolute top-1/2 left-1/2 w-40 h-40 bg-black/5 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2'></div>
      </div> */}

      {/* Main content */}
      <div
        className='relative z-10 h-full flex-1 flex flex-col items-center justify-end p-8 text-center transition-transform duration-300 ease-out'
        style={{
          transform: `translateX(${translateX}px)`,
        }}
      >
        <div className='flex flex-col items-center justify-center h-full'>
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
            <IconComponent className={`w-8 h-8`} />
          </div>

          {/* Title */}
          <h2 className='text-2xl font-bold mb-4 max-w-xs leading-tight'>{currentSlideData.title}</h2>

          {/* Description */}
          <p className='text-sm leading-relaxed max-w-sm mb-8'>{currentSlideData.description}</p>
        </div>

        {/* Slide indicators */}
        <div className='flex space-x-2'>
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-black w-6' : 'bg-black/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Slide counter (optional) */}
      <div className='absolute top-6 right-6 bg-black backdrop-blur-sm rounded-full px-3 py-1'>
        <span className='text-white text-xs font-medium'>
          {currentSlide + 1} / {slides.length}
        </span>
      </div>
    </div>
  );
}
