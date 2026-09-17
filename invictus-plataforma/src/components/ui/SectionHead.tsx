import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '@/lib/format';

export function SectionHead({
  eyebrow,
  titulo,
  sub,
  acao,
  className = '',
}: {
  eyebrow?: string;
  titulo: string;
  sub?: string;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="max-w-[54ch]">
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
        ) : null}
        <h2 className="text-balance text-[26px] font-semibold leading-[1.12] tracking-[-0.025em] text-ink sm:text-[32px]">
          {titulo}
        </h2>
        {sub ? <p className="mt-2.5 text-[15px] leading-relaxed text-ink2">{sub}</p> : null}
      </div>
      {acao}
    </div>
  );
}

export function LinkArrow({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        'group inline-flex items-center gap-2 text-[14px] font-medium text-ink transition-colors hover:text-brand',
        className,
      )}
    >
      {children}
      <ArrowRight size={16} strokeWidth={1.7} className="transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}
