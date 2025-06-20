import React, { useState } from 'react';

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gradient' | 'solid' | 'outline';
  className?: string;
  disabled?: boolean;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  children,
  onClick,
  size = 'lg',
  variant = 'gradient',
  className = '',
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  };

  const baseClasses = `
    relative inline-flex items-center justify-center gap-2 w-full font-semibold
    rounded-md transition-all duration-300 ease-out
    transform-gpu will-change-transform
    focus:outline-none focus:ring-4 focus:ring-purple-500/30
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
    hover:scale-105
    ${sizeClasses[size]}
  `;

  const variantClasses = {
    gradient: `
      bg-gradient-to-r from-purple-500 via-purple-600 to-blue-500
      text-white shadow-lg shadow-purple-500/25
      hover:shadow-xl hover:shadow-purple-500/40
      hover:from-purple-400 hover:via-purple-500 hover:to-blue-400
      before:absolute before:inset-0 before:rounded-md
      before:bg-gradient-to-r before:from-white/20 before:to-transparent
      before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
    `,
    solid: `
      bg-orange-600 text-white shadow-lg shadow-orange-600/25
      hover:bg-orange-500 hover:shadow-xl hover:shadow-orange-600/40
    `,
    outline: `
      border-2 border-purple-500 text-purple-600 bg-transparent
      hover:bg-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/25
      
    `,
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${isPressed ? 'scale-95' : ''}
        ${className}
        group overflow-hidden
      `}
    >
      {/* Animated background overlay */}
      {/* <div className='absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out' /> */}

      {/* Button text */}
      <span className='relative z-10 tracking-wide'>{children}</span>

      {/* Ripple effect */}
      {/* <div className='absolute inset-0 rounded-full opacity-0 group-active:opacity-100 group-active:animate-ping bg-white/20 transition-opacity duration-150' /> */}

      {/* Glow effect */}
      {/* <div className='absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300' /> */}
    </button>
  );
};
