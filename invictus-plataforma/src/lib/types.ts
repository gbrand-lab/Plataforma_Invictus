/**
 * Contrato de domínio da plataforma.
 * É o mesmo shape que o painel administrativo vai gravar e que a API deve devolver.
 */

export type Finalidade = 'venda' | 'aluguel' | 'repasse';

export type Categoria = 'apartamento' | 'casa_solta' | 'casa_condominio' | 'terreno' | 'comercial';

export type StatusImovel = 'draft' | 'pending' | 'published' | 'sold' | 'rented';

export type Ordenacao = 'recentes' | 'menor' | 'maior' | 'area';

export interface Video {
  titulo: string;
  duracao: string;
  url?: string;
}

export interface Imovel {
  /** UUID público do imóvel — não é mais um número sequencial. */
  id: string;
  ref: string;
  slug: string;
  titulo: string;
  subtitulo: string;
  descricao: string;

  finalidade: Finalidade;
  categoria: Categoria;

  preco: number;
  condominio: number;
  iptu: number;

  cidade: string;
  bairro: string;
  endereco: string;
  lat: number;
  lng: number;

  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  /** Área privativa em m² (apartamento/terreno/comercial). Opcional — 0 quando não informada. */
  area: number;
  /** Só para casa solta/condomínio. Opcional — 0 quando não informada. */
  areaConstruida: number;
  /** Só para casa solta/condomínio. Opcional — 0 quando não informada. */
  areaTotal: number;

  caracteristicas: string[];
  imagens: string[];
  videos: Video[];

  corretor: string;
  creci: string;
  telefone: string;
  /** Somente dígitos, com DDI + DDD. */
  whatsapp: string;

  /** ISO date (YYYY-MM-DD). */
  publicadoEm: string;
  status: StatusImovel;

  destaque: boolean;
  naChave: boolean;
  novo: boolean;
  visualizacoes: number;
}

export interface Filtro {
  finalidade: Finalidade | '';
  cidade: string;
  bairro: string;
  categoria: Categoria | '';
  quartos: number;
  banheiros: number;
  vagas: number;
  precoMin: number | '';
  precoMax: number | '';
  areaMin: number | '';
  naChave: boolean;
  q: string;
  ordem: Ordenacao;
}

export interface Depoimento {
  texto: string;
  nome: string;
  contexto: string;
}

/** Payload do formulário da Rede Invictus (etapas 1 a 6). */
export interface CadastroImovel {
  nome: string;
  creci: string;
  telefone: string;
  whatsapp: string;
  email: string;

  finalidade: Finalidade;
  categoria: Categoria;
  titulo: string;
  descricao: string;
  preco: string;
  condominio: string;
  iptu: string;

  quartos: string;
  suites: string;
  banheiros: string;
  vagas: string;
  area: string;

  cidade: string;
  bairro: string;
  endereco: string;

  caracteristicas: string[];
  fotos: { nome: string; url: string }[];
  principal: number;
  video: string;
}
