import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { btnClass, type BtnSize, type BtnVariant } from './ui';
import { whatsappUrl } from '@/lib/config';

interface WhatsAppCTAProps {
  /** Texto já pronto da mensagem — use mensagemImovel() para páginas de imóvel. */
  mensagem: string;
  label?: string;
  size?: BtnSize;
  variant?: BtnVariant;
  className?: string;
  /** Gancho para disparar evento de conversão (GA4/Meta Pixel). */
  onClick?: () => void;
}

/**
 * Único ponto de saída para o WhatsApp.
 * Centralizar aqui facilita medir conversão: basta plugar o onClick.
 */
export function WhatsAppCTA({
  mensagem,
  label = 'Falar com um corretor',
  size = 'md',
  variant = 'primary',
  className = '',
  onClick,
}: WhatsAppCTAProps) {
  return (
    <a
      href={whatsappUrl(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={btnClass(variant, size, className)}
      data-evento="whatsapp"
    >
      <WhatsAppIcon size={size === 'lg' ? 18 : 16} />
      {label}
    </a>
  );
}
