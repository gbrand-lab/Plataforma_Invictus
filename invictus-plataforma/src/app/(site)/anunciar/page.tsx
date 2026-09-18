import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Briefcase } from 'lucide-react';
import { CONFIG, whatsappUrl } from '@/lib/config';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

export const metadata: Metadata = {
  title: 'Anuncie seu imóvel — Invictus',
  description: 'Você é corretor ou quer anunciar seu imóvel diretamente com a Invictus? Escolha uma opção.',
  alternates: { canonical: '/anunciar' },
};

const OPCOES = [
  {
    titulo: 'Sou corretor',
    texto: 'Crie sua conta e cadastre seus imóveis na vitrine da Invictus.',
    href: '/corretor/cadastro',
    Icone: Briefcase,
    externo: false,
  },
  {
    titulo: `Quero falar com ${CONFIG.corretorResponsavel}`,
    texto: 'Fale direto com a Invictus pelo WhatsApp para anunciar o seu imóvel.',
    href: whatsappUrl('Olá! Quero anunciar meu imóvel com a Invictus.'),
    Icone: WhatsAppIcon,
    externo: true,
  },
];

/** Ponto de entrada de "Anuncie seu imóvel": direciona corretor para o cadastro, ou contato direto para o WhatsApp. */
export default function AnunciarPage() {
  return (
    <div className="mx-auto max-w-[640px] px-5 py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Invictus</p>
        <h1 className="mt-2 text-balance font-display text-[28px] font-[440] leading-[1.1] tracking-[-0.015em] text-ink sm:text-[34px]">
          Anuncie seu imóvel
        </h1>
        <p className="mt-2 text-[14.5px] text-ink2">Como você quer anunciar?</p>
      </div>

      <div className="flex flex-col gap-3">
        {OPCOES.map((o) => (
          <Link
            key={o.titulo}
            href={o.href}
            target={o.externo ? '_blank' : undefined}
            rel={o.externo ? 'noopener noreferrer' : undefined}
            className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-all duration-200 ease-invictus hover:border-ink/15 hover:shadow-lift"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-wash text-brandDeep">
              <o.Icone size={22} strokeWidth={1.6} />
            </span>
            <span className="flex-1">
              <span className="block text-[17px] font-semibold tracking-[-0.01em] text-ink">{o.titulo}</span>
              <span className="mt-0.5 block text-[13.5px] text-ink2">{o.texto}</span>
            </span>
            <ArrowRight
              size={18}
              strokeWidth={1.7}
              className="shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
