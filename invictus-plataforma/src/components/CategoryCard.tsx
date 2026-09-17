import Link from 'next/link';
import { ArrowRight, Building2, Home, KeyRound, Repeat } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { scene, type SceneName } from '@/lib/scenes';
import { ATALHOS } from '@/lib/urlFiltros';
import { Foto, Reveal, SectionHead } from './ui';

interface Categoria {
  id: string;
  titulo: string;
  texto: string;
  cta: string;
  href: string;
  cena: SceneName;
  seed: number;
  Icone: LucideIcon;
}

const CATEGORIAS: Categoria[] = [
  {
    id: 'comprar',
    titulo: 'Comprar',
    texto: 'Imóveis disponíveis para venda.',
    cta: 'Ver imóveis',
    href: ATALHOS.comprar,
    cena: 'facade',
    seed: 205,
    Icone: Building2,
  },
  {
    id: 'alugar',
    titulo: 'Alugar',
    texto: 'Encontre seu próximo imóvel.',
    cta: 'Ver imóveis',
    href: ATALHOS.alugar,
    cena: 'tower',
    seed: 211,
    Icone: Home,
  },
  {
    id: 'repasse',
    titulo: 'Repasse de chave',
    texto: 'Assuma o financiamento e entre com as chaves na mão.',
    cta: 'Ver repasses',
    href: ATALHOS.repasse,
    cena: 'interior',
    seed: 217,
    Icone: Repeat,
  },
  {
    id: 'na-chave',
    titulo: 'Na Chave',
    texto: 'Imóveis prontos para morar.',
    cta: 'Ver oportunidades',
    href: ATALHOS.naChave,
    cena: 'house',
    seed: 223,
    Icone: KeyRound,
  },
];

/** Atalhos editoriais da home — entrada rápida por momento de vida. */
export function CategoryCards() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-7 sm:py-20">
      <Reveal>
        <SectionHead titulo="O que você procura?" sub="Encontre oportunidades de acordo com o seu momento." />
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIAS.map((c, i) => (
          <Reveal key={c.id} delay={i * 60}>
            <Link
              href={c.href}
              className="group relative block h-full overflow-hidden rounded-2xl bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
            >
              <div className="relative h-[300px] w-full sm:h-[360px]">
                <Foto
                  src={scene(c.cena, c.seed)}
                  alt={c.titulo}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                  className="opacity-95 transition-transform duration-[550ms] ease-invictus group-hover:scale-[1.05]"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/85 to-transparent" />
              <div className="absolute inset-0 rounded-2xl border border-white/10 transition-colors duration-300 group-hover:border-brand/70" />

              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="mb-3 inline-grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white backdrop-blur-sm">
                  <c.Icone size={18} strokeWidth={1.6} />
                </span>
                <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-white">{c.titulo}</h3>
                <p className="mt-1 max-w-[26ch] text-[13.5px] leading-snug text-white/70">{c.texto}</p>
                <span className="mt-3.5 inline-flex items-center gap-2 text-[13.5px] font-medium text-white">
                  {c.cta}
                  <ArrowRight
                    size={16}
                    strokeWidth={1.7}
                    className="text-brand transition-transform duration-200 group-hover:translate-x-1.5"
                  />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
