import type { ReactNode } from 'react';
import { cx } from '@/lib/format';

export type TagTone = 'dark' | 'light' | 'orange' | 'outline' | 'wash';

const tones: Record<TagTone, string> = {
  dark: 'bg-ink/85 text-white backdrop-blur-sm',
  light: 'bg-white/90 text-ink backdrop-blur-sm',
  orange: 'bg-brand text-white',
  outline: 'border border-line bg-white text-ink2',
  wash: 'bg-wash text-brandDeep',
};

export function Tag({
  children,
  tone = 'dark',
  className = '',
}: {
  children: ReactNode;
  tone?: TagTone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-md px-2 py-[3px] text-[10.5px] font-semibold uppercase tracking-[0.09em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
