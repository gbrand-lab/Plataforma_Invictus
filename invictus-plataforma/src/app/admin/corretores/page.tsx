import { BACKEND_URL, getTokenFromCookies } from '@/lib/serverAuth';
import { dataBR } from '@/lib/format';
import type { UsuarioAdmin } from '../adminTypes';
import { Tag } from '@/components/ui';

async function buscarUsuarios(): Promise<UsuarioAdmin[]> {
  const token = getTokenFromCookies();
  const resposta = await fetch(`${BACKEND_URL}/usuarios`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!resposta.ok) return [];
  return resposta.json();
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  corretor: 'Corretor',
};

export default async function CorretoresPage() {
  const usuarios = await buscarUsuarios();

  return (
    <div>
      <h1 className="font-display text-[24px] font-[440] tracking-[-0.015em] text-ink">Corretores</h1>
      <p className="mt-1 text-[13.5px] text-muted">
        {usuarios.length} usuário(s) cadastrado(s) na plataforma.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line bg-wash/40 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Imóveis cadastrados</th>
              <th className="px-4 py-3">Desde</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{u.nome}</td>
                <td className="px-4 py-3 text-ink2">
                  <p>{u.email}</p>
                  {u.telefone ? <p className="text-[12px] text-muted">{u.telefone}</p> : null}
                </td>
                <td className="px-4 py-3">
                  <Tag tone={u.role === 'admin' ? 'dark' : 'wash'}>{ROLE_LABEL[u.role] ?? u.role}</Tag>
                </td>
                <td className="px-4 py-3 text-ink2">{u.total_imoveis}</td>
                <td className="px-4 py-3 text-muted">{dataBR(u.criado_em.slice(0, 10))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
