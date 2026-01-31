import { cn } from '@/shared/utils/cn';
import { type ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-bold transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95';

  const variants = {
    primary: 'bg-primary text-white shadow-md hover:bg-primary-hover hover:shadow-lg',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 shadow-sm',
    accent: 'bg-accent text-white hover:bg-accent/90 shadow-md',
    ghost: 'bg-transparent text-text-main hover:bg-gray-100',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props} />;
}
