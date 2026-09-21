'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Loader2, MapPin, MapPinned, Search } from 'lucide-react';
import { inputCls } from '@/components/ui';
import { cx } from '@/lib/format';

/** Leaflet acessa `window` no import — precisa ser client-only, sem SSR. */
const MapaArrastavel = dynamic(() => import('./MapaArrastavel').then((m) => m.MapaArrastavel), {
  ssr: false,
  loading: () => <div className="h-[280px] w-full animate-pulse rounded-xl bg-wash" />,
});

interface Resultado {
  display_name: string;
  lat: string;
  lon: string;
}

/** Centro aproximado de cada cidade atendida — usado pra abrir o mapa quando a busca por endereço não acha nada. */
const CENTRO_CIDADE: Record<string, [number, number]> = {
  'São Luís': [-2.5307, -44.3068],
  'São José de Ribamar': [-2.5606, -44.0533],
  'Paço do Lumiar': [-2.5083, -44.1075],
};

interface LocationPickerProps {
  enderecoSugerido: string;
  cidade: string;
  lat: string;
  lng: string;
  onSelecionar: (lat: string, lng: string) => void;
}

/**
 * Busca endereço via Nominatim (OpenStreetMap, gratuito) e deixa o admin
 * confirmar visualmente num preview do Google Maps antes de salvar.
 * O Google Maps entra só como visualização — a busca em si é OSM.
 *
 * A busca é restrita à cidade selecionada no formulário (parâmetros
 * estruturados `street`/`city`/`state`), então o campo de texto aqui é só
 * a rua — não precisa repetir cidade/estado.
 */
export function LocationPicker({ enderecoSugerido, cidade, lat, lng, onSelecionar }: LocationPickerProps) {
  const [query, setQuery] = useState(enderecoSugerido);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');
  const [escolhido, setEscolhido] = useState<string | null>(null);

  async function buscar() {
    if (!query.trim()) return;
    setBuscando(true);
    setErro('');
    setResultados([]);
    try {
      const params = new URLSearchParams({
        format: 'json',
        addressdetails: '0',
        limit: '5',
        countrycodes: 'br',
        street: query,
        city: cidade,
        state: 'Maranhão',
        country: 'Brasil',
      });
      const resposta = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { Accept: 'application/json' },
      });
      if (!resposta.ok) throw new Error();
      const dados: Resultado[] = await resposta.json();
      if (dados.length === 0) setErro(`Nenhum endereço encontrado em ${cidade}. Tente só o nome da rua, sem número.`);
      setResultados(dados);
    } catch {
      setErro('Não foi possível buscar o endereço agora. Tente novamente.');
    } finally {
      setBuscando(false);
    }
  }

  function escolher(r: Resultado) {
    setEscolhido(r.display_name);
    setResultados([]);
    onSelecionar(r.lat, r.lon);
  }

  /** A busca no OSM/Nominatim tem cobertura fraca em São Luís/MA — quando não acha nada, abre o mapa
   *  centralizado na cidade escolhida pra marcar o pino manualmente, em vez de deixar sem opção. */
  function abrirMapaManual() {
    const centro = CENTRO_CIDADE[cidade] ?? CENTRO_CIDADE['São Luís'];
    setEscolhido(null);
    setErro('');
    setResultados([]);
    onSelecionar(String(centro[0]), String(centro[1]));
  }

  const temCoordenadas = Boolean(lat && lng);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          className={inputCls}
          placeholder="Nome da rua"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), buscar())}
        />
        <button
          type="button"
          onClick={buscar}
          disabled={buscando || !cidade}
          className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-ink px-4 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {buscando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Buscar
        </button>
      </div>
      <p className="-mt-1 text-[12px] text-muted">Busca restrita a {cidade || 'nenhuma cidade selecionada'}/MA.</p>

      {erro && <p className="text-[12.5px] font-medium text-brandDeep">{erro}</p>}

      {!temCoordenadas && (
        <button
          type="button"
          onClick={abrirMapaManual}
          disabled={!cidade}
          className="flex items-center gap-1.5 self-start text-[12.5px] font-medium text-brand transition-colors hover:text-brandDeep disabled:opacity-60"
        >
          <MapPinned size={14} strokeWidth={1.8} />
          Não achou o endereço? Abrir mapa e marcar manualmente
        </button>
      )}

      {resultados.length > 0 && (
        <ul className="overflow-hidden rounded-xl border border-line">
          {resultados.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => escolher(r)}
                className={cx(
                  'flex w-full items-start gap-2 px-3 py-2.5 text-left text-[13px] text-ink2 transition-colors hover:bg-wash',
                  i > 0 && 'border-t border-line',
                )}
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-brand" strokeWidth={1.8} />
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {temCoordenadas && (
        <div>
          <div className="overflow-hidden rounded-xl border border-line">
            <MapaArrastavel
              lat={Number(lat)}
              lng={Number(lng)}
              onMover={(novoLat, novoLng) => {
                setEscolhido(null);
                onSelecionar(String(novoLat), String(novoLng));
              }}
            />
          </div>
          <p className="mt-1.5 text-[12px] text-muted">
            {escolhido ?? 'Arraste o pino ou clique no mapa para ajustar.'} — {lat}, {lng}
          </p>
        </div>
      )}
    </div>
  );
}
