import type { Categoria, Depoimento, Filtro, Imovel, Ordenacao } from './types';

/**
 * CATÁLOGO
 * --------
 * Os dados de imóveis vêm da API FastAPI (ver src/lib/serverAuth.ts para a
 * URL do backend). Este módulo mantém o mesmo contrato (`Imovel` em ./types)
 * usado por todos os componentes — a busca real acontece nas funções abaixo.
 */

export const CATEGORIAS: { id: Categoria; label: string }[] = [
  { id: 'apartamento', label: 'Apartamento' },
  { id: 'casa_solta', label: 'Casa solta' },
  { id: 'casa_condominio', label: 'Casa em condomínio' },
  { id: 'terreno', label: 'Terreno' },
  { id: 'comercial', label: 'Comercial' },
];

export const CIDADES: string[] = ['São Luís', 'São José de Ribamar', 'Paço do Lumiar'];

export const BAIRROS: string[] = [
  'Jardim Renascença',
  'Renascença II',
  'Ponta d’Areia',
  'Calhau',
  'Olho d’Água',
  'Cohama',
  'Cohafuma',
  'Araçagy',
  'Turu',
  'São Francisco',
];

export const CARACTERISTICAS: string[] = [
  'Varanda gourmet', 'Área gourmet', 'Piscina', 'Elevador', 'Academia',
  'Condomínio fechado', 'Portaria 24h', 'Salão de festas', 'Churrasqueira',
  'Pet friendly', 'Playground', 'Gerador', 'Vaga coberta', 'Quadra poliesportiva',
  'Espaço coworking', 'Vista mar', 'Closet', 'Cozinha planejada',
];

/** Aguardando conteúdo real — depoimentos de clientes virão de uma tabela própria. */
export const DEPOIMENTOS: Depoimento[] = [];

/* ------------------------------------------------------------------ */

export const ORDENACOES: { id: Ordenacao; label: string }[] = [
  { id: 'recentes', label: 'Mais recentes' },
  { id: 'menor', label: 'Menor preço' },
  { id: 'maior', label: 'Maior preço' },
  { id: 'area', label: 'Maior área' },
];

export const FILTRO_VAZIO: Filtro = {
  finalidade: '',
  cidade: '',
  bairro: '',
  categoria: '',
  quartos: 0,
  banheiros: 0,
  vagas: 0,
  precoMin: '',
  precoMax: '',
  areaMin: '',
  naChave: false,
  q: '',
  ordem: 'recentes',
};

export function filtrar(lista: Imovel[], f: Filtro): Imovel[] {
  const min = f.precoMin === '' ? 0 : Number(f.precoMin);
  const max = f.precoMax === '' ? Infinity : Number(f.precoMax);
  const areaMin = f.areaMin === '' ? 0 : Number(f.areaMin);
  const termo = (f.q || '').trim().toLowerCase();

  const out = lista.filter((i: Imovel) => {
    if (i.status !== 'published') return false;
    if (f.finalidade && i.finalidade !== f.finalidade) return false;
    if (f.cidade && i.cidade !== f.cidade) return false;
    if (f.bairro && i.bairro !== f.bairro) return false;
    if (f.categoria && i.categoria !== f.categoria) return false;
    if (f.naChave && !i.naChave) return false;
    if (f.quartos && i.quartos < f.quartos) return false;
    if (f.banheiros && i.banheiros < f.banheiros) return false;
    if (f.vagas && i.vagas < f.vagas) return false;
    if (i.preco < min || i.preco > max) return false;
    if (i.area < areaMin) return false;
    if (termo) {
      const blob = `${i.titulo} ${i.subtitulo} ${i.bairro} ${i.cidade} ${i.categoria} ${i.ref}`.toLowerCase();
      if (!blob.includes(termo)) return false;
    }
    return true;
  });

  const ordenadores: Record<Ordenacao, (a: Imovel, b: Imovel) => number> = {
    recentes: (a, b) => b.publicadoEm.localeCompare(a.publicadoEm),
    menor: (a, b) => a.preco - b.preco,
    maior: (a, b) => b.preco - a.preco,
    area: (a, b) => b.area - a.area,
  };

  return [...out].sort(ordenadores[f.ordem] ?? ordenadores.recentes);
}

export function semelhantes(imovel: Imovel, lista: Imovel[], n = 3): Imovel[] {
  return lista
    .filter((i) => i.id !== imovel.id && i.status === 'published')
    .map((i) => {
      let s = 0;
      if (i.bairro === imovel.bairro) s += 5;
      if (i.cidade === imovel.cidade) s += 2;
      if (i.categoria === imovel.categoria) s += 4;
      if (i.finalidade === imovel.finalidade) s += 4;
      if (Math.abs(i.quartos - imovel.quartos) <= 1) s += 2;
      const dif = Math.abs(i.preco - imovel.preco) / Math.max(imovel.preco, 1);
      if (dif < 0.35) s += 3;
      else if (dif < 0.7) s += 1;
      return { i, s };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.i);
}

/* ------------------------------------------------------------------
   INTEGRAÇÃO COM A API
------------------------------------------------------------------ */

const BACKEND_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8000';

/** A API devolve os campos em snake_case; o front usa camelCase (ver ./types). */
function mapImovel(raw: any): Imovel {
  return {
    id: raw.id,
    ref: raw.ref,
    slug: raw.slug,
    titulo: raw.titulo,
    subtitulo: raw.subtitulo ?? '',
    descricao: raw.descricao,
    finalidade: raw.finalidade,
    categoria: raw.categoria,
    preco: raw.preco,
    condominio: raw.condominio,
    iptu: raw.iptu,
    cidade: raw.cidade,
    bairro: raw.bairro,
    endereco: raw.endereco,
    lat: raw.lat ?? 0,
    lng: raw.lng ?? 0,
    quartos: raw.quartos,
    suites: raw.suites,
    banheiros: raw.banheiros,
    vagas: raw.vagas,
    area: raw.area ?? 0,
    areaConstruida: raw.area_construida ?? 0,
    areaTotal: raw.area_total ?? 0,
    caracteristicas: raw.caracteristicas ?? [],
    imagens: raw.imagens ?? [],
    videos: raw.videos ?? [],
    corretor: raw.corretor,
    creci: raw.creci ?? '',
    telefone: raw.telefone ?? '',
    whatsapp: raw.whatsapp ?? '',
    publicadoEm: raw.publicado_em,
    status: raw.status,
    destaque: raw.destaque,
    naChave: raw.na_chave,
    novo: raw.novo,
    visualizacoes: raw.visualizacoes,
  };
}

async function buscarPublicados(): Promise<Imovel[]> {
  try {
    const resposta = await fetch(`${BACKEND_URL}/imoveis`, { cache: 'no-store' });
    if (!resposta.ok) return [];
    const dados = await resposta.json();
    return dados.map(mapImovel);
  } catch {
    return [];
  }
}

/** Todos os imóveis publicados — base para a listagem e para os filtros no cliente. */
export async function publicados(): Promise<Imovel[]> {
  return buscarPublicados();
}

export async function destaques(n = 6): Promise<Imovel[]> {
  const lista = await buscarPublicados();
  return lista.filter((i) => i.destaque).slice(0, n);
}

export async function recentes(n = 4): Promise<Imovel[]> {
  const lista = await buscarPublicados();
  return [...lista].sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm)).slice(0, n);
}

/** Busca um imóvel publicado pelo slug — usado pela rota /imovel/[slug]. */
export async function getImovel(slug: string): Promise<Imovel | undefined> {
  try {
    const resposta = await fetch(`${BACKEND_URL}/imoveis/${slug}`, { cache: 'no-store' });
    if (!resposta.ok) return undefined;
    return mapImovel(await resposta.json());
  } catch {
    return undefined;
  }
}

/** Slugs publicados — usado pelo sitemap. */
export async function slugsPublicados(): Promise<string[]> {
  const lista = await buscarPublicados();
  return lista.map((i) => i.slug);
}
