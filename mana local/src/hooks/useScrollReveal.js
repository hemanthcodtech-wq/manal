import { useEffect, useRef } from 'react';

export function useScrollReveal(dependencies = []) {
  const ref = useRef(null);
  
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    // Select elements that haven't been revealed yet
    const elements = ref.current.querySelectorAll('.reveal-on-scroll:not(.is-visible), .reveal-fade-in:not(.is-visible)');
    elements.forEach(el => observer.observe(el));
    
    return () => {
      observer.disconnect();
    };
  }, dependencies);
  
  return ref;
}
