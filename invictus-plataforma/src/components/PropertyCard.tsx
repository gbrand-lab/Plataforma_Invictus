'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, MapPin } from 'lucide-react';
import type { Imovel } from '@/lib/types';
import { cx, finalidadeTag, money } from '@/lib/format';
import { useFavoritosCtx } from '@/lib/favoritos-context';
import { Foto, Specs, Tag } from './ui';

/** Bem baixo de propósito — é só pra diferenciar de um toque/clique parado, não pra exigir um "puxão". */
const LIMIAR_ARRASTE = 24;

interface PropertyCardProps {
  imovel: Imovel;
  /** Primeiras imagens da página recebem carregamento prioritário (LCP). */
  priority?: boolean;
  className?: string;
  /** Base do link do card — `/parceiros/imovel` na vitrine de parceiros, sem contato. */
  hrefBase?: string;
}

export function PropertyCard({ imovel, priority = false, className = '', hrefBase = '/imovel' }: PropertyCardProps) {
  const { isFavorito, alternar } = useFavoritosCtx();
  const [pulsar, setPulsar] = useState(false);
  const [indice, setIndice] = useState(0);
  const favorito = isFavorito(imovel.id);
  const temVariasFotos = imovel.imagens.length > 1;
  const toqueX = useRef<number | null>(null);
  const arrastou = useRef(false);

  const favoritar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    alternar(imovel.id);
    if (!favorito) {
      setPulsar(true);
      setTimeout(() => setPulsar(false), 420);
    }
  };

  /** Passa a foto sem navegar pra página do imóvel — pra andar (não abrir) usa preventDefault + stopPropagation. */
  const passarFoto = (e: React.MouseEvent, passo: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIndice((atual) => (atual + passo + imovel.imagens.length) % imovel.imagens.length);
  };

  /** Arrastar (mouse ou dedo) também troca a foto — sensibilidade baixa de propósito, não precisa de esforço. */
  const aoPressionar = (e: React.PointerEvent) => {
    toqueX.current = e.clientX;
  };
  const aoSoltar = (e: React.PointerEvent) => {
    if (toqueX.current == null || !temVariasFotos) return;
    const delta = e.clientX - toqueX.current;
    toqueX.current = null;
    if (Math.abs(delta) < LIMIAR_ARRASTE) return;
    arrastou.current = true;
    setIndice((atual) => (atual + (delta < 0 ? 1 : -1) + imovel.imagens.length) % imovel.imagens.length);
  };

  /** Depois de um arraste (mouse), o navegador ainda dispara um clique no link — barra só esse. */
  const aoClicarCard = (e: React.MouseEvent) => {
    if (arrastou.current) {
      e.preventDefault();
      arrastou.current = false;
    }
  };

  return (
    <Link
      href={`${hrefBase}/${imovel.slug}`}
      onClick={aoClicarCard}
      className={cx(
        'group flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-left transition-all duration-300 ease-invictus hover:-translate-y-[3px] hover:border-ink/15 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        className,
      )}
    >
      <div
        className="relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden bg-ground"
        onPointerDown={aoPressionar}
        onPointerUp={aoSoltar}
      >
        <Foto
          src={imovel.imagens[indice]}
          alt={`${imovel.titulo} — ${imovel.bairro}, ${imovel.cidade} — foto ${indice + 1}`}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="transition-transform duration-[450ms] ease-invictus group-hover:scale-[1.035]"
        />

        {temVariasFotos ? (
          <>
            <button
              type="button"
              onClick={(e) => passarFoto(e, -1)}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-ink/40 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-ink/65"
            >
              <ChevronLeft size={17} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={(e) => passarFoto(e, 1)}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-ink/40 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-ink/65"
            >
              <ChevronRight size={17} strokeWidth={2} />
            </button>

            <div className="absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1">
              {imovel.imagens.map((_, i) => (
                <span
                  key={i}
                  className={cx(
                    'h-1.5 rounded-full bg-white shadow-[0_0_2px_rgba(0,0,0,.5)] transition-all duration-200',
                    i === indice ? 'w-4 opacity-100' : 'w-1.5 opacity-60',
                  )}
                />
              ))}
            </div>
          </>
        ) : null}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Tag tone="dark">{finalidadeTag(imovel.finalidade)}</Tag>
          {imovel.naChave ? <Tag tone="orange">Na chave</Tag> : null}
          {imovel.novo && !imovel.naChave ? <Tag tone="light">Novo</Tag> : null}
          {imovel.destaque && !imovel.novo && !imovel.naChave ? <Tag tone="light">Destaque</Tag> : null}
        </div>

        <button
          type="button"
          onClick={favoritar}
          aria-label={favorito ? 'Remover dos favoritos' : 'Salvar imóvel'}
          aria-pressed={favorito}
          className={cx(
            'absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink backdrop-blur-sm transition-all duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
            pulsar && 'fav-pulse',
          )}
        >
          <Heart
            size={17}
            strokeWidth={1.6}
            className={favorito ? 'text-brand' : 'text-ink2'}
            fill={favorito ? '#ED6A1F' : 'none'}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-[18px]">
        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-semibold leading-snug text-ink">{imovel.titulo}</h3>
          <p className="inline-flex items-center gap-1.5 text-[13px] text-muted">
            <MapPin size={14} strokeWidth={1.6} />
            {imovel.bairro} • {imovel.cidade}/MA
          </p>
        </div>

        <p className="flex items-baseline gap-1.5">
          <span className="tabular text-[20px] font-semibold tracking-[-0.015em] text-ink">{money(imovel.preco)}</span>
          {imovel.finalidade === 'aluguel' ? <span className="text-[13px] text-muted">/mês</span> : null}
        </p>

        <div className="mt-auto border-t border-line pt-3">
          <Specs imovel={imovel} />
        </div>
      </div>
    </Link>
  );
}
