import { cn } from '@/shared/utils/cn';
import { type ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'destructive' | 'destructive-outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
};

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-bold transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95';

  const variants = {
    primary: 'bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
      'bg-white text-black border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
    outline:
      'bg-transparent border border-gray-200 text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
    accent: 'bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
    destructive: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed',
    'destructive-outline':
      'bg-transparent border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10 text-sm',
  };

  return <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props} />;
}
