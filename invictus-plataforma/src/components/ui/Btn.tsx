import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/format';

export type BtnVariant = 'primary' | 'dark' | 'outline' | 'ghost';
export type BtnSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 ease-invictus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-45';

const sizes: Record<BtnSize, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-[14px]',
  lg: 'h-[52px] px-6 text-[15px]',
};

const variants: Record<BtnVariant, string> = {
  primary: 'bg-brand text-white shadow-[0_1px_2px_rgba(18,19,22,.08)] hover:bg-brandDeep active:translate-y-[1px]',
  dark: 'bg-ink text-white hover:bg-[#26282D] active:translate-y-[1px]',
  outline: 'border border-line bg-white text-ink hover:border-ink/35 hover:bg-ground',
  ghost: 'text-ink hover:bg-ground',
};

export const btnClass = (variant: BtnVariant = 'primary', size: BtnSize = 'md', className = '') =>
  cx(base, sizes[size], variants[variant], className);

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  children: ReactNode;
}

export function Btn({ variant = 'primary', size = 'md', className = '', children, ...rest }: BtnProps) {
  return (
    <button className={btnClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

interface BtnLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  children: ReactNode;
}

export function BtnLink({ variant = 'primary', size = 'md', className = '', children, ...rest }: BtnLinkProps) {
  return (
    <a className={btnClass(variant, size, className)} {...rest}>
      {children}
    </a>
  );
}
