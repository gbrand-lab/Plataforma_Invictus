import type { Metadata } from 'next';
import { CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como a Imobiliária Invictus trata os dados pessoais de quem usa a plataforma.',
  alternates: { canonical: '/politica-de-privacidade' },
};

/**
 * Conteúdo-base para o jurídico revisar antes de publicar.
 * A estrutura segue a LGPD (Lei 13.709/2018).
 */
export default function PoliticaPage() {
  return (
    <article className="mx-auto max-w-[760px] px-5 py-14 sm:px-7 sm:py-20">
      <h1 className="text-[30px] font-semibold tracking-[-0.025em] text-ink">Política de Privacidade</h1>
      <p className="mt-2 text-[13.5px] text-muted">Última atualização: setembro de 2026</p>

      <div className="mt-8 space-y-7 text-[15px] leading-[1.75] text-ink2">
        <section>
          <h2 className="text-[18px] font-semibold text-ink">Quais dados coletamos</h2>
          <p className="mt-2">
            Coletamos apenas o que você informa voluntariamente ao entrar em contato: nome, telefone/WhatsApp e e-mail.
            Corretores parceiros que cadastram imóveis informam também CRECI e dados do imóvel anunciado.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ink">Para que usamos</h2>
          <p className="mt-2">
            Para responder ao seu contato, apresentar imóveis compatíveis com o que você procura e conduzir a negociação.
            Não vendemos nem cedemos seus dados a terceiros sem relação com o atendimento.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ink">Dados guardados no seu navegador</h2>
          <p className="mt-2">
            A lista de imóveis salvos fica apenas no seu dispositivo, no armazenamento local do navegador. Ela não é
            enviada para os nossos servidores e some ao limpar os dados do site.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ink">Seus direitos</h2>
          <p className="mt-2">
            Conforme a LGPD, você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo
            e-mail {CONFIG.email} ou pelo WhatsApp {CONFIG.whatsappLabel}.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ink">Contato do responsável</h2>
          <p className="mt-2">
            {CONFIG.nome} — {CONFIG.endereco} · {CONFIG.creci}
          </p>
        </section>
      </div>
    </article>
  );
}
