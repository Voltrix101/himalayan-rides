import { useEffect, useState } from 'react';

interface TouchInteractionOptions {
  onTouch?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  hapticFeedback?: boolean;
  preventScroll?: boolean;
}

export function useTouchInteraction(options: TouchInteractionOptions = {}) {
  const [isTouching, setIsTouching] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const triggerHaptic = () => {
    if (options.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTouching(true);
    setTouchStartTime(Date.now());
    
    if (options.preventScroll) {
      e.preventDefault();
    }
    
    if (options.hapticFeedback) {
      triggerHaptic();
    }
    
    options.onTouchStart?.();
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    const touchDuration = Date.now() - touchStartTime;
    
    // Only trigger touch if it was a quick tap (not a scroll)
    if (touchDuration < 500) {
      options.onTouch?.();
    }
    
    options.onTouchEnd?.();
  };

  const touchProps = isMobile ? {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  } : {};

  return {
    isTouching,
    isMobile,
    touchProps,
    triggerHaptic
  };
}
