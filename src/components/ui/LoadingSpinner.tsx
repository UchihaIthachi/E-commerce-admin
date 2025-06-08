import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: string; // e.g., 'h-8 w-8'
  className?: string; // For additional styling, like centering
}

export function LoadingSpinner({ size = 'h-8 w-8', className }: LoadingSpinnerProps) {
  return (
    <Loader2 className={cn('animate-spin text-primary', size, className)} />
  );
}

export default LoadingSpinner;
