'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Handshake, ShieldCheck, Sparkles, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Depoimento } from '@/lib/types';
import { iniciais } from '@/lib/format';
import { scene } from '@/lib/scenes';
import { Foto, Reveal } from './ui';

const PILARES: { Icone: LucideIcon; titulo: string; texto: string }[] = [
  {
    Icone: Sparkles,
    titulo: 'Curadoria de imóveis',
    texto: 'Selecionamos oportunidades para diferentes perfis e objetivos.',
  },
  {
    Icone: Handshake,
    titulo: 'Atendimento próximo',
    texto: 'Você não precisa descobrir tudo sozinho. Nosso time acompanha sua jornada.',
  },
  {
    Icone: ShieldCheck,
    titulo: 'Negociação segura',
    texto: 'Mais transparência e suporte durante o processo de compra, venda ou locação.',
  },
];

/**
 * Bloco de confiança da home: imagem + prova social sobreposta + três pilares.
 * O depoimento fica sobre a foto porque é o elemento que sustenta a promessa.
 */
export function Testimonials({ depoimentos }: { depoimentos: Depoimento[] }) {
  const [indice, setIndice] = useState(0);
  const d = depoimentos[indice];

  const navegar = (passo: number) =>
    setIndice((atual) => (atual + passo + depoimentos.length) % depoimentos.length);

  const temDepoimento = depoimentos.length > 0;

  return (
    <section id="sobre" className="border-y border-line bg-white">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-7 sm:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ground">
                <Foto
                  src={scene('interior', 307)}
                  alt="Sala de estar de imóvel do portfólio Invictus"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
              </div>

              {temDepoimento && (
                <div className="relative mx-4 -mt-16 rounded-2xl border border-line bg-white p-5 shadow-float sm:absolute sm:bottom-5 sm:right-[-28px] sm:m-0 sm:max-w-[330px]">
                  <div className="flex items-center gap-2">
                    <span className="flex gap-0.5 text-brand" aria-label="Nota 5 de 5">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star key={k} size={13} fill="currentColor" strokeWidth={0} />
                      ))}
                    </span>
                    <span className="text-[12px] font-medium text-muted">5,0 · 120+ famílias atendidas</span>
                  </div>

                  <blockquote className="mt-3 text-[14.5px] leading-relaxed text-ink">“{d.texto}”</blockquote>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-wash text-[12px] font-semibold text-brandDeep">
                        {iniciais(d.nome)}
                      </span>
                      <div>
                        <p className="text-[13.5px] font-semibold leading-tight text-ink">{d.nome}</p>
                        <p className="text-[12px] leading-tight text-muted">{d.contexto}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => navegar(-1)}
                        aria-label="Depoimento anterior"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink2 transition-colors hover:border-ink/30 hover:text-ink"
                      >
                        <ChevronLeft size={15} strokeWidth={1.7} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navegar(1)}
                        aria-label="Próximo depoimento"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink2 transition-colors hover:border-ink/30 hover:text-ink"
                      >
                        <ChevronRight size={15} strokeWidth={1.7} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="lg:pl-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Sobre a Invictus</p>
              <h2 className="text-balance font-display text-[30px] font-[440] leading-[1.1] tracking-[-0.015em] text-ink sm:text-[38px]">
                Por que escolher a Invictus?
              </h2>

              <ul className="mt-8 flex flex-col gap-7">
                {PILARES.map((p) => (
                  <li key={p.titulo} className="flex gap-4">
                    <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-wash text-brandDeep">
                      <p.Icone size={19} strokeWidth={1.6} />
                    </span>
                    <div>
                      <h3 className="text-[16.5px] font-semibold text-ink">{p.titulo}</h3>
                      <p className="mt-1 max-w-[46ch] text-[14.5px] leading-relaxed text-ink2">{p.texto}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
