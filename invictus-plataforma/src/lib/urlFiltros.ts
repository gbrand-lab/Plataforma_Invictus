import { FILTRO_VAZIO } from './data';
import type { Categoria, Filtro, Finalidade, Ordenacao } from './types';

const ORDENS: Ordenacao[] = ['recentes', 'menor', 'maior', 'area'];

const numero = (v: string | null): number | '' => {
  if (!v) return '';
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : '';
};

/**
 * Filtro <-> querystring.
 * Manter o estado da busca na URL deixa a listagem compartilhável e indexável
 * (/imoveis?finalidade=venda&bairro=Calhau), além de sobreviver ao refresh.
 */
export function filtroFromSearchParams(sp: URLSearchParams): Filtro {
  const finalidade = sp.get('finalidade');
  const categoria = sp.get('categoria');
  const ordem = sp.get('ordem') as Ordenacao | null;
  const naChave = sp.get('naChave') === '1';
  // Na chave é pra quem quer entrar logo — sem ordenação escolhida na URL, mostra do mais barato pro mais caro.
  const ordemPadrao = naChave ? 'menor' : 'recentes';

  return {
    ...FILTRO_VAZIO,
    finalidade:
      finalidade === 'venda' || finalidade === 'aluguel' || finalidade === 'repasse' ? (finalidade as Finalidade) : '',
    cidade: sp.get('cidade') ?? '',
    bairro: sp.get('bairro') ?? '',
    categoria: (categoria as Categoria) ?? '',
    quartos: Number(sp.get('quartos') ?? 0) || 0,
    banheiros: Number(sp.get('banheiros') ?? 0) || 0,
    vagas: Number(sp.get('vagas') ?? 0) || 0,
    precoMin: numero(sp.get('precoMin')),
    precoMax: numero(sp.get('precoMax')),
    areaMin: numero(sp.get('areaMin')),
    naChave,
    q: sp.get('q') ?? '',
    ordem: ordem && ORDENS.includes(ordem) ? ordem : ordemPadrao,
  };
}

export function searchParamsFromFiltro(f: Filtro): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.finalidade) sp.set('finalidade', f.finalidade);
  if (f.cidade) sp.set('cidade', f.cidade);
  if (f.bairro) sp.set('bairro', f.bairro);
  if (f.categoria) sp.set('categoria', f.categoria);
  if (f.quartos) sp.set('quartos', String(f.quartos));
  if (f.banheiros) sp.set('banheiros', String(f.banheiros));
  if (f.vagas) sp.set('vagas', String(f.vagas));
  if (f.precoMin !== '') sp.set('precoMin', String(f.precoMin));
  if (f.precoMax !== '') sp.set('precoMax', String(f.precoMax));
  if (f.areaMin !== '') sp.set('areaMin', String(f.areaMin));
  if (f.naChave) sp.set('naChave', '1');
  if (f.q) sp.set('q', f.q);
  if (f.ordem !== 'recentes') sp.set('ordem', f.ordem);
  return sp;
}

/** Atalhos usados no header, nos cards de categoria e no rodapé. */
export const ATALHOS = {
  planta: '/imoveis?finalidade=venda',
  pronto: '/imoveis?naChave=1',
  alugar: '/imoveis?finalidade=aluguel',
  repasse: '/imoveis?finalidade=repasse',
  todos: '/imoveis',
  menu: '/menu',
} as const;
