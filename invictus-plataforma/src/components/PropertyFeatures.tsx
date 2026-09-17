import { Check } from 'lucide-react';

/** Diferenciais do imóvel e do condomínio. */
export function PropertyFeatures({ caracteristicas }: { caracteristicas: string[] }) {
  if (caracteristicas.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-[20px] font-semibold tracking-[-0.015em] text-ink">Características do imóvel</h2>
      <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {caracteristicas.map((c) => (
          <li key={c} className="flex items-center gap-2.5 text-[14.5px] text-ink2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-wash text-brandDeep">
              <Check size={13} strokeWidth={2} />
            </span>
            {c}
          </li>
        ))}
      </ul>
    </section>
  );
}
