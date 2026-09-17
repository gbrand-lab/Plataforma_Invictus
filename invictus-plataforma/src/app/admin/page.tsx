import { BACKEND_URL, getTokenFromCookies } from '@/lib/serverAuth';
import type { ImovelAdmin } from './adminTypes';
import { ImoveisTable } from './ImoveisTable';

async function buscarImoveis(): Promise<ImovelAdmin[]> {
  const token = getTokenFromCookies();
  const resposta = await fetch(`${BACKEND_URL}/imoveis/admin/todos`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!resposta.ok) return [];
  return resposta.json();
}

export default async function AdminDashboard() {
  const imoveis = await buscarImoveis();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[24px] font-[440] tracking-[-0.015em] text-ink">Imóveis</h1>
          <p className="mt-1 text-[13.5px] text-muted">{imoveis.length} imóvel(is) cadastrado(s).</p>
        </div>
      </div>

      <div className="mt-6">
        <ImoveisTable imoveis={imoveis} baseHref="/admin" mostrarCorretor />
      </div>
    </div>
  );
}
