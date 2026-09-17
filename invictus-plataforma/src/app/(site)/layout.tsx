import { FavoritosProvider } from '@/lib/favoritos-context';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <FavoritosProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </FavoritosProvider>
  );
}
