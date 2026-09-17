import type { Metadata } from 'next';
import { FavoritosView } from './FavoritosView';
import { publicados } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Imóveis salvos',
  description: 'Sua seleção de imóveis salvos no portal Invictus.',
  robots: { index: false, follow: true },
};

export default async function FavoritosPage() {
  const imoveis = await publicados();
  return <FavoritosView imoveis={imoveis} />;
}
