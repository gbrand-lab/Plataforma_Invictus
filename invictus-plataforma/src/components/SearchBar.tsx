'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, MapPin, Search, X } from 'lucide-react';
import { BAIRROS, CATEGORIAS } from '@/lib/data';
import { cx } from '@/lib/format';
import type { Categoria, Finalidade } from '@/lib/types';
import { Btn } from './ui';

interface Faixa {
  label: string;
  min: number | '';
  max: number | '';
}

export const FAIXAS: Record<Finalidade, Faixa[]> = {
  venda: [
    { label: 'Qualquer valor', min: '', max: '' },
    { label: 'Até R$ 300 mil', min: '', max: 300000 },
    { label: 'R$ 300 mil a R$ 600 mil', min: 300000, max: 600000 },
    { label: 'R$ 600 mil a R$ 1 milhão', min: 600000, max: 1000000 },
    { label: 'R$ 1 mi a R$ 2 mi', min: 1000000, max: 2000000 },
    { label: 'Acima de R$ 2 milhões', min: 2000000, max: '' },
  ],
  aluguel: [
    { label: 'Qualquer valor', min: '', max: '' },
    { label: 'Até R$ 2.000', min: '', max: 2000 },
    { label: 'R$ 2.000 a R$ 4.000', min: 2000, max: 4000 },
    { label: 'R$ 4.000 a R$ 7.000', min: 4000, max: 7000 },
    { label: 'Acima de R$ 7.000', min: 7000, max: '' },
  ],
  repasse: [
    { label: 'Qualquer valor', min: '', max: '' },
    { label: 'Até R$ 300 mil', min: '', max: 300000 },
    { label: 'R$ 300 mil a R$ 600 mil', min: 300000, max: 600000 },
    { label: 'R$ 600 mil a R$ 1 milhão', min: 600000, max: 1000000 },
    { label: 'Acima de R$ 1 milhão', min: 1000000, max: '' },
  ],
};

/**
 * Busca principal do hero.
 * Desktop: barra horizontal de quatro campos. Mobile: gatilho único que abre
 * um sheet vertical — o campo a campo do desktop não cabe em 390px.
 */
export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [finalidade, setFinalidade] = useState<Finalidade>('venda');
  const [categoria, setCategoria] = useState<Categoria | ''>('');
  const [faixa, setFaixa] = useState(0);
  const [sheetAberto, setSheetAberto] = useState(false);

  const faixas = FAIXAS[finalidade];

  const buscar = (e?: React.FormEvent) => {
    e?.preventDefault();
    const f = faixas[Math.min(faixa, faixas.length - 1)];
    const sp = new URLSearchParams();
    sp.set('finalidade', finalidade);
    if (q.trim()) sp.set('q', q.trim());
    if (categoria) sp.set('categoria', categoria);
    if (f.min !== '') sp.set('precoMin', String(f.min));
    if (f.max !== '') sp.set('precoMax', String(f.max));
    setSheetAberto(false);
    router.push(`/imoveis?${sp.toString()}`);
  };

  const campos = (empilhado: boolean) => (
    <>
      <div
        className={cx(
          'flex flex-col justify-center gap-1 px-4 py-3',
          !empilhado && 'flex-[1.6] border-b border-line lg:border-b-0 lg:border-r',
        )}
      >
        <label htmlFor="sb-loc" className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
          Localização
        </label>
        <div className="flex items-center gap-2">
          <MapPin size={16} strokeWidth={1.7} className="shrink-0 text-brand" />
          <input
            id="sb-loc"
            list="sb-bairros"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cidade, bairro ou condomínio"
            className="w-full bg-transparent text-[14.5px] text-ink placeholder:text-muted/85 focus:outline-none"
          />
          <datalist id="sb-bairros">
            {BAIRROS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
      </div>

      <div
        className={cx(
          'flex flex-col justify-center gap-1 px-4 py-3',
          !empilhado && 'flex-1 border-b border-line lg:border-b-0 lg:border-r',
        )}
      >
        <label htmlFor="sb-fin" className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
          Finalidade
        </label>
        <select
          id="sb-fin"
          value={finalidade}
          onChange={(e) => {
            setFinalidade(e.target.value as Finalidade);
            setFaixa(0);
          }}
          className="cursor-pointer appearance-none bg-transparent text-[14.5px] text-ink focus:outline-none"
        >
          <option value="venda">Comprar</option>
          <option value="aluguel">Alugar</option>
        </select>
      </div>

      <div
        className={cx(
          'flex flex-col justify-center gap-1 px-4 py-3',
          !empilhado && 'flex-1 border-b border-line lg:border-b-0 lg:border-r',
        )}
      >
        <label htmlFor="sb-tipo" className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
          Tipo
        </label>
        <select
          id="sb-tipo"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as Categoria | '')}
          className="cursor-pointer appearance-none bg-transparent text-[14.5px] text-ink focus:outline-none"
        >
          <option value="">Todos os tipos</option>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className={cx('flex flex-col justify-center gap-1 px-4 py-3', !empilhado && 'flex-[1.2]')}>
        <label htmlFor="sb-faixa" className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
          Faixa de preço
        </label>
        <select
          id="sb-faixa"
          value={faixa}
          onChange={(e) => setFaixa(Number(e.target.value))}
          className="cursor-pointer appearance-none bg-transparent text-[14.5px] text-ink focus:outline-none"
        >
          {faixas.map((f, i) => (
            <option key={f.label} value={i}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  return (
    <>
      <form onSubmit={buscar} className="hidden rounded-2xl border border-line bg-white p-1.5 shadow-float lg:flex">
        <div className="flex flex-1 items-stretch">{campos(false)}</div>
        <Btn type="submit" size="lg" className="my-0.5 mr-0.5 shrink-0 px-7">
          Buscar imóveis <ArrowRight size={17} strokeWidth={1.7} />
        </Btn>
      </form>

      <button
        type="button"
        onClick={() => setSheetAberto(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left shadow-float lg:hidden"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white">
          <Search size={18} strokeWidth={1.8} />
        </span>
        <span className="min-w-0">
          <span className="block text-[14.5px] font-semibold text-ink">Onde você quer morar?</span>
          <span className="block truncate text-[12.5px] text-muted">Bairro, tipo de imóvel e faixa de preço</span>
        </span>
      </button>

      {sheetAberto ? (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Buscar imóveis">
          <div className="absolute inset-0 bg-ink/45" onClick={() => setSheetAberto(false)} />
          <form onSubmit={buscar} className="sheet-in absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 pb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-ink">Buscar imóveis</h2>
              <button
                type="button"
                onClick={() => setSheetAberto(false)}
                aria-label="Fechar"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-ground"
              >
                <X size={18} strokeWidth={1.7} />
              </button>
            </div>
            <div className="divide-y divide-line rounded-xl border border-line">{campos(true)}</div>
            <Btn type="submit" size="lg" className="mt-4 w-full">
              Buscar imóveis <ArrowRight size={17} strokeWidth={1.7} />
            </Btn>
          </form>
        </div>
      ) : null}
    </>
  );
}
