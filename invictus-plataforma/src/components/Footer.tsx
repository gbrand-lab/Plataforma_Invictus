import Link from 'next/link';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { CONFIG, whatsappUrl } from '@/lib/config';
import { ATALHOS } from '@/lib/urlFiltros';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { Logo } from './Logo';

const COLUNAS = [
  {
    titulo: 'Imóveis',
    itens: [
      { label: 'Menu', href: ATALHOS.menu },
      { label: 'Comprar', href: ATALHOS.comprar },
      { label: 'Repasse de chave', href: ATALHOS.repasse },
      { label: 'Alugar', href: ATALHOS.alugar },
      { label: 'Na Chave', href: ATALHOS.naChave },
    ],
  },
  {
    titulo: 'Invictus',
    itens: [
      { label: 'Sobre nós', href: '/#sobre' },
      { label: 'Corretores parceiros', href: '/#rede' },
      { label: 'Anuncie seu imóvel', href: '/anunciar' },
    ],
  },
];

export function Footer() {
  const contatos = [
    { label: CONFIG.whatsappLabel, href: whatsappUrl('Olá! Gostaria de falar com a Invictus.'), Icone: WhatsAppIcon },
    { label: CONFIG.instagram, href: CONFIG.instagramUrl, Icone: Instagram },
    { label: CONFIG.telefone, href: `tel:${CONFIG.telefone.replace(/\D/g, '')}`, Icone: Phone },
    { label: CONFIG.email, href: `mailto:${CONFIG.email}`, Icone: Mail },
  ];

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-7">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Logo textClassName="text-[22px]" />
            <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-ink2">
              Conectando pessoas às melhores oportunidades imobiliárias.
            </p>
            <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-muted">
              <MapPin size={15} strokeWidth={1.6} className="mt-0.5 shrink-0" />
              {CONFIG.endereco}
            </p>
            <p className="mt-2 text-[13px] text-muted">{CONFIG.creci}</p>
          </div>

          {COLUNAS.map((col) => (
            <div key={col.titulo}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{col.titulo}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.itens.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-[14px] text-ink2 transition-colors hover:text-brand">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Atendimento</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {contatos.map(({ label, href, Icone }, i) => (
                <li key={`${label}-${i}`}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[14px] text-ink2 transition-colors hover:text-brand"
                  >
                    <Icone size={15} className="text-muted" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted">© 2026 Imobiliária Invictus. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/politica-de-privacidade" className="text-[13px] text-muted transition-colors hover:text-ink">
              Política de Privacidade
            </Link>
            <Link href="/termos-de-uso" className="text-[13px] text-muted transition-colors hover:text-ink">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
