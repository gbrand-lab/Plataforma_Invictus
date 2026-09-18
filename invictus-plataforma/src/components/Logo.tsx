import Image from 'next/image';
import { cx } from '@/lib/format';

/**
 * Marca da Invictus — usada no header/rodapé do site e nas áreas
 * internas (/admin, /corretor). Ponto único: trocar a arte aqui
 * (public/logo-invictus.png) atualiza em toda a plataforma.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/logo-invictus.png"
      alt="Imobiliária Invictus"
      width={1014}
      height={303}
      priority
      className={cx('h-9 w-auto shrink-0', className)}
    />
  );
}
