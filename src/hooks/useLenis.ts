import { useEffect } from 'react';
import Lenis from 'lenis';

export const useLenis = () => {
  useEffect(() => {
    // Initialize Lenis with iOS 18 inspired settings
    const lenis = new Lenis({
      lerp: 0.08, // Smooth interpolation
      duration: 1.2, // Duration for programmatic scrolling
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // iOS-like easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false, // Disable on touch for better mobile performance
      touchMultiplier: 2,
    });

    // Bind Lenis to requestAnimationFrame
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Optional: Add scroll event listeners for other components
    const handleScroll = (e: any) => {
      // Custom scroll events can be handled here
      document.dispatchEvent(new CustomEvent('lenis-scroll', { detail: e }));
    };

    lenis.on('scroll', handleScroll);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);
};
