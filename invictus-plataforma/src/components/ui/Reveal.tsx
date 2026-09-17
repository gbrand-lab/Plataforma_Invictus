'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '@/lib/format';

/**
 * Fade discreto na entrada da seção.
 * O que já está na primeira dobra aparece imediatamente — nada fica preso em
 * opacity:0 esperando scroll, e `prefers-reduced-motion` desliga o efeito.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduz || el.getBoundingClientRect().top < window.innerHeight * 0.95) {
      setVisivel(true);
      return;
    }

    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            setVisivel(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cx('reveal', visivel && 'reveal-on', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
