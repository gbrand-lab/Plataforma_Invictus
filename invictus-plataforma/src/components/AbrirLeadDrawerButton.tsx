'use client';

import { BellRing } from 'lucide-react';
import { EVENTO_ABRIR } from './LeadDrawer';

/** Botão isolado (client) só para disparar o drawer de captura de lead sob demanda. */
export function AbrirLeadDrawerButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR))}
      className={className}
    >
      <BellRing size={15} strokeWidth={1.6} />
      Quero receber notícias
    </button>
  );
}
