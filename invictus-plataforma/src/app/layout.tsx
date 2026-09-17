import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { CONFIG } from '@/lib/config';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { LeadDrawer } from '@/components/LeadDrawer';
import './globals.css';

/**
 * Fontes auto-hospedadas: zero request a terceiros (melhor LCP e sem
 * dependência do Google Fonts para conformidade com a LGPD).
 */
const archivo = localFont({
  src: [
    { path: '../fonts/archivo-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/archivo-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/archivo-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/archivo-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-archivo',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const fraunces = localFont({
  src: [
    { path: '../fonts/fraunces-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/fraunces-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-fraunces',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL(CONFIG.siteUrl),
  title: {
    default: 'Invictus — Imóveis à venda e para alugar em São Luís/MA',
    template: '%s | Imobiliária Invictus',
  },
  description:
    'Portal da Imobiliária Invictus: apartamentos, casas e imóveis comerciais para comprar, alugar ou repasse de chave em São Luís, São José de Ribamar e Paço do Lumiar.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: CONFIG.nome,
    title: 'Invictus — Imóveis à venda e para alugar em São Luís/MA',
    description: 'Encontre imóveis para comprar, alugar ou investir de forma simples e segura.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        {children}
        <FloatingWhatsApp />
        <LeadDrawer />
      </body>
    </html>
  );
}
