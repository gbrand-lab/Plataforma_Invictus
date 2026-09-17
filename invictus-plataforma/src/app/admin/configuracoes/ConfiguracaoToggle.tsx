'use client';

import { useState } from 'react';
import { cx } from '@/lib/format';

export function ConfiguracaoToggle({ inicial }: { inicial: boolean }) {
  const [ativo, setAtivo] = useState(inicial);
  const [salvando, setSalvando] = useState(false);

  async function alternar() {
    const novoValor = !ativo;
    setAtivo(novoValor);
    setSalvando(true);
    try {
      await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requer_aprovacao_imovel: novoValor }),
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-white p-5">
      <div>
        <h2 className="text-[14px] font-semibold text-ink">Exigir aprovação de imóveis de corretores</h2>
        <p className="mt-1 max-w-[52ch] text-[13px] text-ink2">
          Quando ligado, imóveis cadastrados por corretores (não-admin) entram como <strong>pendentes</strong> e só
          aparecem no site depois que você aprovar em{' '}
          <span className="font-medium text-ink">Imóveis</span>. Quando desligado, eles já publicam direto.
        </p>
      </div>

      <button
        type="button"
        onClick={alternar}
        disabled={salvando}
        aria-pressed={ativo}
        className={cx(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60',
          ativo ? 'bg-brand' : 'bg-line',
        )}
      >
        <span
          className={cx(
            'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform',
            ativo ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}
