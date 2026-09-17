import type { Metadata } from 'next';
import { CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Regras de uso da plataforma da Imobiliária Invictus e do cadastro de imóveis por corretores parceiros.',
  alternates: { canonical: '/termos-de-uso' },
};

/** Conteúdo-base para o jurídico revisar antes de publicar. */
export default function TermosPage() {
  return (
    <article className="mx-auto max-w-[760px] px-5 py-14 sm:px-7 sm:py-20">
      <h1 className="text-[30px] font-semibold tracking-[-0.025em] text-ink">Termos de Uso</h1>
      <p className="mt-2 text-[13.5px] text-muted">Última atualização: setembro de 2026</p>

      <div className="mt-8 space-y-7 text-[15px] leading-[1.75] text-ink2">
        <section>
          <h2 className="text-[18px] font-semibold text-ink">Sobre a plataforma</h2>
          <p className="mt-2">
            Esta plataforma é operada pela {CONFIG.nome} ({CONFIG.creci}) para divulgação de imóveis à venda e para
            locação em São Luís e região metropolitana.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ink">Informações dos anúncios</h2>
          <p className="mt-2">
            Valores, medidas, características e disponibilidade são fornecidos pelo proprietário ou pelo corretor
            responsável e podem mudar sem aviso. As informações do anúncio não constituem proposta comercial vinculante:
            a confirmação ocorre no atendimento.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ink">Cadastro por corretores parceiros</h2>
          <p className="mt-2">
            O corretor que cadastra um imóvel declara ter CRECI ativo e autorização do proprietário para divulgá-lo.
            Nenhum anúncio é publicado automaticamente: todos passam por conferência da equipe Invictus, que pode
            recusar ou solicitar ajustes.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ink">Uso do conteúdo</h2>
          <p className="mt-2">
            Fotos, textos e materiais publicados pertencem à Invictus ou aos respectivos titulares. É vedada a
            reprodução ou raspagem automatizada do acervo sem autorização por escrito.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ink">Contato</h2>
          <p className="mt-2">
            Dúvidas sobre estes termos: {CONFIG.email} · {CONFIG.whatsappLabel}
          </p>
        </section>
      </div>
    </article>
  );
}
