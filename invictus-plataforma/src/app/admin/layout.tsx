import type { Metadata } from 'next';
import { AdminNav } from './AdminNav';

export const metadata: Metadata = {
  title: 'Painel Invictus',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ground">
      <AdminNav />
      <main className="mx-auto max-w-[1100px] px-5 py-8">{children}</main>
    </div>
  );
}
