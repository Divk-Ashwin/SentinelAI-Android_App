import { useEffect, useRef, useCallback } from 'react';

export function useAutoHideScrollbar(delay = 1500) {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    element.classList.add('scrolling');

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      element.classList.remove('scrolling');
    }, delay);
  }, [delay]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  return elementRef;
}