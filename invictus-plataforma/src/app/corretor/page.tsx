import { BACKEND_URL, getTokenFromCookies } from '@/lib/serverAuth';
import type { ImovelAdmin } from '../admin/adminTypes';
import { ImoveisTable } from '../admin/ImoveisTable';

async function buscarMeusImoveis(): Promise<ImovelAdmin[]> {
  const token = getTokenFromCookies();
  const resposta = await fetch(`${BACKEND_URL}/imoveis/admin/meus`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!resposta.ok) return [];
  return resposta.json();
}

export default async function CorretorDashboard() {
  const imoveis = await buscarMeusImoveis();

  return (
    <div>
      <h1 className="font-display text-[24px] font-[440] tracking-[-0.015em] text-ink">Meus imóveis</h1>
      <p className="mt-1 text-[13.5px] text-muted">{imoveis.length} imóvel(is) cadastrado(s) por você.</p>

      <div className="mt-6">
        <ImoveisTable imoveis={imoveis} baseHref="/corretor" />
      </div>
    </div>
  );
}
