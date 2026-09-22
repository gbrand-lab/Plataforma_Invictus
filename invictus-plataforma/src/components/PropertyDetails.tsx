'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { CATEGORIAS } from '@/lib/data';
import { cx, dataBR, isCasa, money, num, plural } from '@/lib/format';
import type { Imovel } from '@/lib/types';

const LIMITE_RESUMO = 260;

/** Resumo numérico + descrição + ficha técnica do imóvel. */
export function PropertyDetails({ imovel }: { imovel: Imovel }) {
  const [aberta, setAberta] = useState(false);
  const longa = imovel.descricao.length > LIMITE_RESUMO;
  const categoria = CATEGORIAS.find((c) => c.id === imovel.categoria)?.label ?? 'Imóvel';
  const casa = isCasa(imovel.categoria);

  const resumo: [string, string][] = [];
  if (imovel.quartos) resumo.push([String(imovel.quartos), plural(imovel.quartos, 'quarto', 'quartos').split(' ')[1]]);
  if (imovel.suites) resumo.push([String(imovel.suites), imovel.suites > 1 ? 'suítes' : 'suíte']);
  if (imovel.banheiros) resumo.push([String(imovel.banheiros), imovel.banheiros > 1 ? 'banheiros' : 'banheiro']);
  if (imovel.vagas) resumo.push([String(imovel.vagas), imovel.vagas > 1 ? 'vagas' : 'vaga']);
  if (imovel.area) resumo.push([num(imovel.area), 'm² de área']);

  const ficha: [string, string][] = [
    ['Tipo', categoria],
    [
      'Finalidade',
      imovel.finalidade === 'venda' ? 'Venda' : imovel.finalidade === 'aluguel' ? 'Locação' : 'Repasse de chave',
    ],
    ['Condomínio', imovel.condominio ? `${money(imovel.condominio)}/mês` : 'Não há'],
    ['IPTU', imovel.iptu ? `${money(imovel.iptu)}/mês` : 'Isento'],
    ...(casa
      ? ([
          ...(imovel.areaConstruida ? [['Área construída', `${num(imovel.areaConstruida)} m²`] as [string, string]] : []),
          ...(imovel.areaTotal ? [['Área do terreno', `${num(imovel.areaTotal)} m²`] as [string, string]] : []),
        ] as [string, string][])
      : imovel.area
        ? ([['Área privativa', `${num(imovel.area)} m²`]] as [string, string][])
        : []),
    ['Publicado em', dataBR(imovel.publicadoEm)],
  ];

  return (
    <>
      <section className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border border-line bg-white p-5">
        {resumo.map(([valor, label]) => (
          <div key={label}>
            <p className="tabular text-[22px] font-semibold leading-none tracking-[-0.02em] text-ink">{valor}</p>
            <p className="mt-1 text-[12.5px] text-muted">{label}</p>
          </div>
        ))}
        <p className="ml-auto hidden items-center gap-1.5 text-[12px] text-muted sm:inline-flex">
          <Eye size={14} strokeWidth={1.6} /> <span className="tabular">{num(imovel.visualizacoes)}</span> visualizações
        </p>
      </section>

      <section className="mt-9">
        <h2 className="text-[20px] font-semibold tracking-[-0.015em] text-ink">Sobre este imóvel</h2>
        <p className={cx('mt-3 max-w-[68ch] text-[15px] leading-[1.72] text-ink2', !aberta && longa && 'line-clamp-4')}>
          {imovel.descricao}
        </p>
        {longa ? (
          <button
            type="button"
            onClick={() => setAberta((v) => !v)}
            className="mt-2.5 text-[14px] font-medium text-brand transition-colors hover:text-brandDeep"
          >
            {aberta ? 'Mostrar menos' : 'Ver descrição completa'}
          </button>
        ) : null}

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3.5 border-t border-line pt-5 text-[14px] sm:grid-cols-3">
          {ficha.map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt className="text-[12px] uppercase tracking-[0.08em] text-muted">{rotulo}</dt>
              <dd className="tabular mt-0.5 font-medium text-ink">{valor}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
