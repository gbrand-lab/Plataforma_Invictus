import type { Metadata } from 'next';
import { CorretorNav } from './CorretorNav';

export const metadata: Metadata = {
  title: 'Área do corretor',
  robots: { index: false, follow: false },
};

export default function CorretorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ground">
      <CorretorNav />
      <main className="mx-auto max-w-[1100px] px-5 py-8">{children}</main>
    </div>
  );
}
