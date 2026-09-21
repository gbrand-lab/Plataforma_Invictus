import { CONFIG } from '@/lib/config';
import { Foto } from './ui';
import { SearchBar } from './SearchBar';

/**
 * Primeira dobra: imagem arquitetônica + tese da marca + busca flutuante.
 * A busca é o elemento mais importante da home, então ela invade a borda
 * inferior da imagem em vez de disputar espaço com o texto.
 */
export function HeroSearch({ total }: { total: number }) {
  return (
    <section className="relative">
      <div className="relative overflow-hidden bg-ink">
        <div className="relative h-[440px] w-full sm:h-[520px] lg:h-[580px]">
          <Foto
            src="/hero.webp"
            alt="Varanda gourmet com vista para o pôr do sol em São Luís"
            priority
            sizes="100vw"
            className="opacity-95"
          />
        </div>

        {/* Escurecimento em camadas: garante leitura do texto sobre qualquer foto */}
        <div className="absolute inset-0 bg-ink/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/30" />

        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-[1240px] flex-col justify-center px-5 sm:px-7">
            <div className="max-w-[640px]">
              <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                <span className="h-px w-7 bg-brand" /> Imobiliária Invictus
              </p>
              <h1 className="text-balance font-display text-[38px] font-[440] leading-[1.05] tracking-[-0.02em] text-white sm:text-[52px] lg:text-[60px]">
                O imóvel certo para o seu próximo capítulo.
              </h1>
              <p className="mt-5 max-w-[46ch] text-[15.5px] leading-relaxed text-white/80 sm:text-[17px]">
                Encontre imóveis para comprar, alugar ou investir em São Luís de forma simples e segura.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-11 max-w-[1240px] px-5 sm:px-7 lg:-mt-[46px]">
        <SearchBar />
        <p className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1 px-1 text-[12.5px] text-muted">
          <span className="tabular">
            <strong className="font-semibold text-ink">{total}</strong> imóveis publicados
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-line sm:block" />
          <span>São Luís, São José de Ribamar e Paço do Lumiar</span>
          <span className="hidden h-1 w-1 rounded-full bg-line sm:block" />
          <span>{CONFIG.creci}</span>
        </p>
      </div>
    </section>
  );
}
