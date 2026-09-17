import { BrokerNetwork } from '@/components/BrokerNetwork';
import { CategoryCards } from '@/components/CategoryCard';
import { FeaturedProperties, RecentProperties } from '@/components/FeaturedProperties';
import { HeroSearch } from '@/components/HeroSearch';
import { Testimonials } from '@/components/Testimonials';
import { DEPOIMENTOS, destaques, publicados, recentes } from '@/lib/data';

/**
 * Home — Experiência A.
 * Componente de servidor: os dados chegam prontos, só as partes interativas
 * (busca, favoritos, slider) são client components.
 */
export default async function HomePage() {
  const [publicadosLista, destaquesLista, recentesLista] = await Promise.all([
    publicados(),
    destaques(6),
    recentes(4),
  ]);

  return (
    <>
      <HeroSearch total={publicadosLista.length} />
      <CategoryCards />
      <FeaturedProperties imoveis={destaquesLista} />
      <RecentProperties imoveis={recentesLista} />
      <Testimonials depoimentos={DEPOIMENTOS} />
      <BrokerNetwork />
    </>
  );
}
