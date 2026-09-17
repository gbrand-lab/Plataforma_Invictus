import { BACKEND_URL, getTokenFromCookies } from '@/lib/serverAuth';
import { ConfiguracaoToggle } from './ConfiguracaoToggle';

async function buscarConfig(): Promise<{ requer_aprovacao_imovel: boolean }> {
  const token = getTokenFromCookies();
  const resposta = await fetch(`${BACKEND_URL}/config`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!resposta.ok) return { requer_aprovacao_imovel: false };
  return resposta.json();
}

export default async function ConfiguracoesPage() {
  const config = await buscarConfig();

  return (
    <div>
      <h1 className="font-display text-[24px] font-[440] tracking-[-0.015em] text-ink">Configurações</h1>
      <p className="mt-1 text-[13.5px] text-muted">Regras gerais da plataforma.</p>

      <div className="mt-6">
        <ConfiguracaoToggle inicial={config.requer_aprovacao_imovel} />
      </div>
    </div>
  );
}
