import Image from 'next/image';
import { cx } from '@/lib/format';

/**
 * Marca da Invictus — usada no header/rodapé do site e nas áreas
 * internas (/admin, /corretor). Ponto único: trocar a arte aqui
 * (public/logo-invictus.png) atualiza em toda a plataforma.
 */
export function Logo({ className = '', textClassName = '' }: { className?: string; textClassName?: string }) {
  return (
    <span className={cx('flex shrink-0 items-center gap-2.5', className)}>
      <span
        className={cx(
          'font-display text-[21px] font-[560] leading-none tracking-[0.14em] text-ink',
          textClassName,
        )}
      >
        INVICTUS
      </span>
      <Image src="/logo-invictus.png" alt="Imobiliária" width={990} height={279} priority className="h-6 w-auto" />
    </span>
  );
}
