import Link from 'next/link';
import { btnClass } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-5 py-24 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Erro 404</p>
      <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.02em] text-ink">Imóvel não encontrado</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink2">
        O anúncio pode ter sido vendido, alugado ou removido do portal. Veja o que está disponível agora.
      </p>
      <Link href="/imoveis" className={btnClass('primary', 'md', 'mt-6')}>
        Ver imóveis disponíveis
      </Link>
    </div>
  );
}
