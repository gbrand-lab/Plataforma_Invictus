import type { Metadata } from 'next';
import { PropertySubmission } from '@/components/PropertySubmission';

export const metadata: Metadata = {
  title: 'Anuncie seu imóvel — Rede Invictus',
  description:
    'Corretores parceiros: cadastre imóveis na vitrine da Invictus, amplie a divulgação e alcance novos compradores.',
  alternates: { canonical: '/anunciar' },
};

export default function AnunciarPage() {
  return <PropertySubmission />;
}
