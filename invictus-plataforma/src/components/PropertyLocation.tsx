'use client';

import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import type { Imovel } from '@/lib/types';

interface Bloco {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Mapa esquemático em SVG — fallback para imóveis sem coordenadas cadastradas
 * no admin (campos Latitude/Longitude), e para o modo "localização aproximada".
 */
function MapaEsquematico({ imovel, aproximado }: { imovel: Imovel; aproximado: boolean }) {
  const blocos = useMemo<Bloco[]>(() => {
    const saida: Bloco[] = [];
    // imovel.id é um UUID (string) — deriva uma seed numérica dele para o padrão pseudo-aleatório.
    let s = Array.from(imovel.id).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 2147483647, 7) || 1;
    const r = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 6; x++) {
        saida.push({
          x: 24 + x * 128 + r() * 10,
          y: 24 + y * 106 + r() * 8,
          w: 88 + r() * 26,
          h: 66 + r() * 20,
        });
      }
    }
    return saida;
  }, [imovel.id]);

  return (
    <svg
      viewBox="0 0 800 460"
      className="h-[280px] w-full sm:h-[340px]"
      role="img"
      aria-label={`Mapa de ${imovel.bairro}, ${imovel.cidade}`}
    >
      <rect width="800" height="460" fill="#EFEDE8" />
      <rect x="0" y="360" width="800" height="100" fill="#CFE0E6" />
      {blocos.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx="4"
          fill={i % 5 === 0 ? '#DFDCD4' : '#E4E1DA'}
          stroke="#D6D2C9"
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect key={`h${i}`} x="0" y={106 + i * 106} width="800" height="14" fill="#F7F5F1" />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={`v${i}`} x={112 + i * 128} width="14" height="460" fill="#F7F5F1" />
      ))}
      <path d="M0 352 h800" stroke="#E8C9A6" strokeWidth="10" />

      {aproximado ? (
        <>
          <circle cx="400" cy="215" r="108" fill="#ED6A1F" opacity="0.12" />
          <circle cx="400" cy="215" r="108" fill="none" stroke="#ED6A1F" strokeWidth="2.5" strokeDasharray="7 6" />
          <circle cx="400" cy="215" r="7" fill="#ED6A1F" />
        </>
      ) : (
        <>
          <path d="M400 240 c-16-22-26-34-26-48a26 26 0 0 1 52 0c0 14-10 26-26 48Z" fill="#ED6A1F" />
          <circle cx="400" cy="192" r="9" fill="#FFF" />
        </>
      )}
    </svg>
  );
}

/**
 * Embed real do Google Maps (iframe público, sem API key) a partir de lat/lng
 * cadastrados no admin. Em modo aproximado, centraliza no ponto mas com zoom
 * menor — não usamos aqui um pino exato, só a região.
 */
function MapaGoogle({ lat, lng, aproximado }: { lat: number; lng: number; aproximado: boolean }) {
  const zoom = aproximado ? 14 : 16;
  const src = aproximado
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
    : `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed&markers=${lat},${lng}`;

  return (
    <iframe
      title="Localização do imóvel"
      src={src}
      className="h-[280px] w-full border-0 sm:h-[340px]"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

export function PropertyLocation({ imovel }: { imovel: Imovel }) {
  const [aproximado, setAproximado] = useState(imovel.localizacaoAproximada);

  const temCoordenadas = Boolean(imovel.lat && imovel.lng);

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.015em] text-ink">Onde fica</h2>
          <p className="mt-1.5 text-[14px] text-ink2">
            {imovel.bairro} · {imovel.cidade}/MA
          </p>
        </div>
        <label htmlFor="mapa-aprox" className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-ink2">
          <input
            id="mapa-aprox"
            type="checkbox"
            checked={aproximado}
            onChange={(e) => setAproximado(e.target.checked)}
            className="h-4 w-4 accent-[#ED6A1F]"
          />
          Mostrar localização aproximada
        </label>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-[#EFEDE8]">
        {temCoordenadas ? (
          <MapaGoogle lat={imovel.lat} lng={imovel.lng} aproximado={aproximado} />
        ) : (
          <MapaEsquematico imovel={imovel} aproximado={aproximado} />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/85 to-transparent px-4 pb-3 pt-10">
          <p className="text-[12.5px] font-medium text-ink2">
            {aproximado
              ? 'Localização aproximada — o endereço exato é informado no atendimento.'
              : `${imovel.endereco} — ${imovel.bairro}`}
          </p>
        </div>
      </div>

      <p className="mt-2.5 flex items-start gap-2 text-[12.5px] leading-relaxed text-muted">
        <Info size={14} strokeWidth={1.6} className="mt-px shrink-0" />
        Por segurança e por acordo com o proprietário, alguns imóveis exibem apenas o raio aproximado. O endereço
        completo é enviado no atendimento.
      </p>
    </section>
  );
}
