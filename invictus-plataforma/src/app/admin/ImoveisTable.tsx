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
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
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
  );
}
