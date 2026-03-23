import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps page content with a slide-in animation on mount.
 * Uses CSS animations for native-feeling transitions.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger animation on next frame for reliable transition
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div
      className={cn(
        'flex-1 flex flex-col min-h-0',
        mounted ? 'animate-page-slide-in' : 'opacity-0 translate-x-4',
        className
      )}
    >
      {children}
    </div>
  );
}
