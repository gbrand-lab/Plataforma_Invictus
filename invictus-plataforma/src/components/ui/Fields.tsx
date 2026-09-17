import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/lib/format';

export const inputCls =
  'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink transition-colors placeholder:text-muted/80 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

export const selectCls = cx(
  inputCls,
  'cursor-pointer appearance-none bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat pr-9',
);

/** Seta do select desenhada inline para não depender de imagem externa. */
export const selectStyle: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2386888E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
};

export function Campo({
  label,
  erro,
  hint,
  htmlFor,
  children,
  className = '',
}: {
  label: string;
  erro?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cx('flex flex-col gap-1.5', className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">{label}</span>
      {children}
      {erro ? <span className="text-[12px] font-medium text-brandDeep">{erro}</span> : null}
      {!erro && hint ? <span className="text-[12px] text-muted">{hint}</span> : null}
    </label>
  );
}
