import { notFound } from 'next/navigation';
import { BACKEND_URL, getTokenFromCookies } from '@/lib/serverAuth';
import { ImovelForm } from '../../../ImovelForm';
import type { ImovelAdmin } from '../../../adminTypes';

async function buscarImovel(id: string): Promise<ImovelAdmin | null> {
  const token = getTokenFromCookies();
  const resposta = await fetch(`${BACKEND_URL}/imoveis/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!resposta.ok) return null;
  return resposta.json();
}

export default async function EditarImovelPage({ params }: { params: { id: string } }) {
  const imovel = await buscarImovel(params.id);
  if (!imovel) notFound();

  return (
    <div>
      <h1 className="font-display text-[24px] font-[440] tracking-[-0.015em] text-ink">Editar imóvel</h1>
      <p className="mt-1 text-[13.5px] text-muted">
        {imovel.ref} · {imovel.titulo}
      </p>

      <div className="mt-6">
        <ImovelForm imovel={imovel} />
      </div>
    </div>
  );
}
