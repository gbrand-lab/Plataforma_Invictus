import { BACKEND_URL, getTokenFromCookies } from '@/lib/serverAuth';
import { dataBR } from '@/lib/format';

interface LeadAdmin {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  criado_em: string;
}

async function buscarLeads(): Promise<LeadAdmin[]> {
  const token = getTokenFromCookies();
  const resposta = await fetch(`${BACKEND_URL}/leads`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!resposta.ok) return [];
  return resposta.json();
}

export default async function LeadsPage() {
  const leads = await buscarLeads();

  return (
    <div>
      <h1 className="font-display text-[24px] font-[440] tracking-[-0.015em] text-ink">Leads</h1>
      <p className="mt-1 text-[13.5px] text-muted">
        {leads.length} pessoa(s) pediram para ser avisadas de novos imóveis.
      </p>

      <div className="mt-6">
        {leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <p className="text-[14px] text-muted">Nenhum lead capturado ainda.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-white">
            {/* Mobile: cards empilhados */}
            <div className="divide-y divide-line sm:hidden">
              {leads.map((lead) => (
                <div key={lead.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-ink">{lead.nome}</p>
                    <p className="shrink-0 text-[12px] text-muted">{dataBR(lead.criado_em.slice(0, 10))}</p>
                  </div>
                  <a
                    href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                    className="mt-1.5 block text-[13px] text-ink2 hover:text-brand"
                  >
                    {lead.telefone}
                  </a>
                  <p className="text-[13px] text-ink2">{lead.email}</p>
                </div>
              ))}
            </div>

            {/* Desktop/tablet: tabela */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-wash/40 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Telefone</th>
                    <th className="px-4 py-3">E-mail</th>
                    <th className="px-4 py-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-medium text-ink">{lead.nome}</td>
                      <td className="px-4 py-3 text-ink2">
                        <a href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`} className="hover:text-brand">
                          {lead.telefone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-ink2">{lead.email}</td>
                      <td className="px-4 py-3 text-muted">{dataBR(lead.criado_em.slice(0, 10))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
