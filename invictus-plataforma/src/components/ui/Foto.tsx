import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { cx } from '@/lib/format';

interface FotoProps {
  src?: string;
  alt: string;
  className?: string;
  /** Marca a imagem como LCP (primeira dobra). */
  priority?: boolean;
  sizes?: string;
}

/**
 * Ponte entre as imagens demonstrativas (data URI SVG) e a fotografia real.
 *
 * - sem `src` (imóvel ainda sem fotos cadastradas) → placeholder neutro;
 * - `data:` → <img> simples, porque o otimizador do Next não processa data URI;
 * - qualquer outro caminho/URL → next/image com fill, lazy loading e AVIF/WebP.
 *
 * O elemento pai precisa ser `relative` (todos os usos na plataforma já são).
 */
export function Foto({ src, alt, className, priority = false, sizes = '(max-width: 1024px) 100vw, 400px' }: FotoProps) {
  if (!src) {
    return (
      <div className={cx('flex h-full w-full items-center justify-center bg-wash text-muted', className)}>
        <ImageOff size={28} strokeWidth={1.5} />
      </div>
    );
  }

  if (src.startsWith('data:')) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cx('h-full w-full object-cover', className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cx('object-cover', className)}
    />
  );
}
