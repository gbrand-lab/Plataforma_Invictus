import { ImovelForm } from '../../ImovelForm';

export default function NovoImovelPage() {
  return (
    <div>
      <h1 className="font-display text-[24px] font-[440] tracking-[-0.015em] text-ink">Novo imóvel</h1>
      <p className="mt-1 text-[13.5px] text-muted">Preencha os dados abaixo para cadastrar um imóvel.</p>

      <div className="mt-6">
        <ImovelForm />
      </div>
    </div>
  );
}
