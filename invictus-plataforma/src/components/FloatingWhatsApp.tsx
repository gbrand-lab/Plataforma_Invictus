'use client';

import { usePathname } from 'next/navigation';
import { whatsappUrl } from '@/lib/config';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

const OCULTAR_EM = ['/parceiros', '/admin', '/corretor'];

/**
 * Botão flutuante de WhatsApp, fixo por cima da tela, no site público —
 * exceto /parceiros (vitrine sem contato) e as áreas internas /admin e /corretor.
 */
export function FloatingWhatsApp() {
  const pathname = usePathname();
  if (OCULTAR_EM.some((prefixo) => pathname.startsWith(prefixo))) return null;

  return (
    <a
      href={whatsappUrl('Olá! Gostaria de falar com a Invictus.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      // bottom-24 no mobile para não cobrir a barra fixa de contato da página de imóvel (lg:hidden lá)
      className="fixed bottom-24 right-5 z-[70] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2 lg:bottom-5"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
