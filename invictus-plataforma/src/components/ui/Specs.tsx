import { BedDouble, Bath, Car, Ruler } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cx, num, plural } from '@/lib/format';

export interface SpecsData {
  quartos: number;
  banheiros: number;
  vagas: number;
  area: number;
}

/** Linha de características curtas usada no card e no bloco de resumo. */
export function Specs({
  imovel,
  size = 'sm',
  className = '',
}: {
  imovel: SpecsData;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const itens: [LucideIcon, string][] = [];
  if (imovel.quartos) itens.push([BedDouble, plural(imovel.quartos, 'quarto', 'quartos')]);
  if (imovel.banheiros) itens.push([Bath, plural(imovel.banheiros, 'banheiro', 'banheiros')]);
  if (imovel.vagas) itens.push([Car, plural(imovel.vagas, 'vaga', 'vagas')]);
  itens.push([Ruler, `${num(imovel.area)} m²`]);

  return (
    <ul
      className={cx(
        'flex flex-wrap items-center gap-x-4 gap-y-1.5 text-ink2',
        size === 'sm' ? 'text-[13px]' : 'text-[14px]',
        className,
      )}
    >
      {itens.map(([Icone, label]) => (
        <li key={label} className="inline-flex items-center gap-1.5">
          <Icone size={size === 'sm' ? 15 : 17} strokeWidth={1.6} className="text-muted" />
          <span className="tabular">{label}</span>
        </li>
      ))}
    </ul>
  );
}
