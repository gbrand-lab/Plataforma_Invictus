'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { money } from '@/lib/format';
import { STATUS_LABEL, type ImovelAdmin } from './adminTypes';
import { Tag } from '@/components/ui';

interface ImoveisTableProps {
  imoveis: ImovelAdmin[];
  /** Prefixo das rotas de novo/editar — `/admin` ou `/corretor`. */
  baseHref?: string;
  /** Mostra a coluna "Cadastrado por" — só faz sentido na visão do admin (todos os imóveis). */
  mostrarCorretor?: boolean;
}

export function ImoveisTable({ imoveis, baseHref = '/admin', mostrarCorretor = false }: ImoveisTableProps) {
  const router = useRouter();
  const [carregandoId, setCarregandoId] = useState<string | null>(null);

  async function excluir(id: string, titulo: string) {
    if (!confirm(`Excluir "${titulo}"? Essa ação não pode ser desfeita.`)) return;
    setCarregandoId(id);
    try {
      await fetch(`/api/admin/imoveis/${id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setCarregandoId(null);
    }
  }

  if (imoveis.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
        <p className="text-[14px] text-muted">Nenhum imóvel cadastrado ainda.</p>
        <Link
          href={`${baseHref}/imoveis/novo`}
          className="mt-3 inline-block text-[13.5px] font-semibold text-brand hover:underline"
        >
          Cadastrar o primeiro imóvel
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white">
      {/* Mobile: cards empilhados — uma tabela larga não cabe na tela do celular */}
      <div className="divide-y divide-line sm:hidden">
        {imoveis.map((imovel) => (
          <div key={imovel.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{imovel.titulo}</p>
                <p className="text-[12px] text-muted">{imovel.ref}</p>
              </div>
              <Tag tone={imovel.status === 'published' ? 'dark' : 'wash'}>{STATUS_LABEL[imovel.status]}</Tag>
            </div>
            <p className="mt-2 text-[13px] text-ink2">
              {imovel.bairro} · {imovel.cidade}
            </p>
            <p className="mt-0.5 text-[13.5px] font-medium text-ink">{money(imovel.preco)}</p>
            {mostrarCorretor ? (
              <p className="mt-0.5 text-[12px] text-muted">Cadastrado por {imovel.criado_por_nome ?? '—'}</p>
            ) : null}
            <div className="mt-3 flex gap-4 border-t border-line pt-3">
              <Link
                href={`${baseHref}/imoveis/${imovel.id}/editar`}
                className="text-[13px] font-medium text-ink2 hover:text-ink"
              >
                Editar
              </Link>
              <button
                type="button"
                disabled={carregandoId === imovel.id}
                onClick={() => excluir(imovel.id, imovel.titulo)}
                className="text-[13px] font-medium text-brandDeep hover:underline disabled:opacity-50"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/tablet: tabela */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line bg-wash/40 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              <th className="px-4 py-3">Imóvel</th>
              <th className="px-4 py-3">Cidade/Bairro</th>
              <th className="px-4 py-3">Preço</th>
              {mostrarCorretor ? <th className="px-4 py-3">Cadastrado por</th> : null}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {imoveis.map((imovel) => (
              <tr key={imovel.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{imovel.titulo}</p>
                  <p className="text-[12px] text-muted">{imovel.ref}</p>
                </td>
                <td className="px-4 py-3 text-ink2">
                  {imovel.bairro} · {imovel.cidade}
                </td>
                <td className="px-4 py-3 text-ink2">{money(imovel.preco)}</td>
                {mostrarCorretor ? (
                  <td className="px-4 py-3 text-ink2">{imovel.criado_por_nome ?? '—'}</td>
                ) : null}
                <td className="px-4 py-3">
                  <Tag tone={imovel.status === 'published' ? 'dark' : 'wash'}>{STATUS_LABEL[imovel.status]}</Tag>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`${baseHref}/imoveis/${imovel.id}/editar`}
                      className="text-[13px] font-medium text-ink2 hover:text-ink"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      disabled={carregandoId === imovel.id}
                      onClick={() => excluir(imovel.id, imovel.titulo)}
                      className="text-[13px] font-medium text-brandDeep hover:underline disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
