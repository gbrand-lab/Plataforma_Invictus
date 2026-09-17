import type { Finalidade } from './types';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat('pt-BR');

export const money = (v: number): string => brl.format(v || 0);
export const num = (v: number): string => decimal.format(v || 0);

/** 2026-09-10 -> 10/09/2026 */
export const dataBR = (iso: string): string => iso.split('-').reverse().join('/');

/** Concatena classes ignorando valores falsos. */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

export const plural = (n: number, singular: string, plural_: string): string =>
  `${n} ${n === 1 ? singular : plural_}`;

export const iniciais = (nome: string): string =>
  nome
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

export const somenteDigitos = (v: string): string => v.replace(/\D/g, '');

/** Rótulo curto de tag — "Venda" / "Aluguel" / "Repasse". */
export const finalidadeTag = (f: Finalidade): string =>
  ({ venda: 'Venda', aluguel: 'Aluguel', repasse: 'Repasse' })[f];
