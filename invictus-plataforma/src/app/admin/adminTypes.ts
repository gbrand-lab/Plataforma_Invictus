import type { Categoria, Finalidade, StatusImovel, Video } from '@/lib/types';

/**
 * Shape retornado pela API FastAPI (snake_case) — usado só dentro do /admin.
 * As páginas públicas continuam usando `Imovel` (camelCase) de @/lib/types;
 * na Fase 6 (integração), o mapeamento entre os dois contratos acontece em src/lib/data.ts.
 */
export interface ImovelAdmin {
  id: string;
  ref: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  descricao: string;
  finalidade: Finalidade;
  categoria: Categoria;
  preco: number;
  condominio: number;
  iptu: number;
  cidade: string;
  bairro: string;
  endereco: string;
  lat: number | null;
  lng: number | null;
  localizacao_aproximada: boolean;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  area: number;
  caracteristicas: string[];
  imagens: string[];
  videos: Video[];
  corretor: string;
  creci: string | null;
  telefone: string | null;
  whatsapp: string | null;
  publicado_em: string;
  status: StatusImovel;
  destaque: boolean;
  na_chave: boolean;
  novo: boolean;
  visualizacoes: number;
  criado_por_id: string | null;
  criado_por_nome: string | null;
}

export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  role: string;
  criado_em: string;
  total_imoveis: number;
}

export const STATUS_LABEL: Record<StatusImovel, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  published: 'Publicado',
  sold: 'Vendido',
  rented: 'Alugado',
  inactive: 'Inativo',
};
