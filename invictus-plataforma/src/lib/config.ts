/**
 * Ponto único de configuração da Invictus.
 * Trocar o WhatsApp aqui muda todos os CTAs da plataforma.
 */
export const CONFIG = {
  nome: 'Imobiliária Invictus',
  /** Somente dígitos, com DDI + DDD. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? '559885555608',
  whatsappLabel: '(98) 8555-5608',
  telefone: '(98) 8555-5608',
  email: 'contato@invictusimoveis.com.br',
  instagram: '@imobiliariainvictus.oficial',
  instagramUrl: 'https://www.instagram.com/imobiliariainvictus.oficial/',
  endereco: 'Cohama, Mocelin Tower — Sala 213, São Luís/MA',
  creci: 'CRECI J-774',
  /**
   * Corretor responsável exibido nas páginas de imóvel — sempre o Islas,
   * independentemente de qual corretor tenha cadastrado o imóvel (o campo
   * `imovel.corretor` fica só como registro interno de quem publicou).
   */
  corretorResponsavel: 'Islas',
  atendimento: 'Seg a sex, 8h às 18h · Sáb, 8h às 12h',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://invictusimoveis.com.br',
} as const;

export function whatsappUrl(mensagem: string): string {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export function mensagemImovel(titulo: string, ref: string): string {
  return `Olá! Vi o imóvel ${titulo} (ref. ${ref}) no site da Invictus e gostaria de receber mais informações.`;
}
