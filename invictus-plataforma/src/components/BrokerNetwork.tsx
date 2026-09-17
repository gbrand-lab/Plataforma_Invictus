import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { btnClass, Reveal } from './ui';

const BENEFICIOS = [
  'Mais exposição para seus imóveis',
  'Novos potenciais compradores',
  'Centralização das oportunidades',
  'Parceria com a rede Invictus',
];

/**
 * Rede Invictus — captação de corretores parceiros.
 * Único bloco escuro da home: é onde o contraste vira argumento.
 */
export function BrokerNetwork() {
  return (
    <section id="rede" className="bg-ink">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-7 sm:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Reveal>
            <div>
              <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                <span className="h-px w-7 bg-brand" /> Rede Invictus
              </p>
              <h2 className="text-balance font-display text-[30px] font-[440] leading-[1.1] tracking-[-0.015em] text-white sm:text-[40px]">
                Você é corretor? Coloque seus imóveis na vitrine da Invictus.
              </h2>
              <p className="mt-5 max-w-[52ch] text-[15.5px] leading-relaxed text-white/70">
                Amplie a divulgação dos seus imóveis e faça parte de uma rede criada para gerar novas oportunidades de
                negócio.
              </p>
              <Link href="/anunciar" className={btnClass('primary', 'lg', 'mt-8')}>
                Quero anunciar um imóvel <ArrowRight size={17} strokeWidth={1.7} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex items-start gap-3 bg-ink p-5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                    <Check size={14} strokeWidth={2} />
                  </span>
                  <span className="text-[14.5px] leading-snug text-white/90">{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 px-1 text-[12.5px] text-white/45">
              Cada anúncio passa por conferência da equipe Invictus antes de ficar visível no portal.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
