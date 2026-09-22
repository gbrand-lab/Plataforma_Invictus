'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, MapPin, MapPinned, Search } from 'lucide-react';
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

/** Centro aproximado de cada cidade atendida — usado como último recurso, quando nem o bairro é conhecido. */
const CENTRO_CIDADE: Record<string, [number, number]> = {
  'São Luís': [-2.5307, -44.3068],
  'São José de Ribamar': [-2.5606, -44.0533],
  'Paço do Lumiar': [-2.5083, -44.1075],
};

/** Centro aproximado de cada bairro atendido (BAIRROS em @/lib/data) — ponto de partida pro pino, que o admin ajusta depois. */
const CENTRO_BAIRRO: Record<string, [number, number]> = {
  'Jardim Renascença': [-2.5217, -44.2909],
  'Renascença II': [-2.5185, -44.2831],
  'Ponta d’Areia': [-2.4939, -44.2938],
  Calhau: [-2.487, -44.2751],
  'Olho d’Água': [-2.4757, -44.2588],
  Cohama: [-2.5443, -44.2588],
  Cohafuma: [-2.5548, -44.2438],
  Araçagy: [-2.5622, -44.2179],
  Turu: [-2.5487, -44.227],
  'São Francisco': [-2.5089, -44.2732],
};

interface LocationPickerProps {
  enderecoSugerido: string;
  cidade: string;
  bairro: string;
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
export function LocationPicker({ enderecoSugerido, cidade, bairro, lat, lng, onSelecionar }: LocationPickerProps) {
  const [query, setQuery] = useState(enderecoSugerido);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');
  const [escolhido, setEscolhido] = useState<string | null>(null);
  /** Posição do pino ainda não confirmada — só vira a localização de verdade do imóvel ao clicar "Ok". */
  const [pendente, setPendente] = useState<{ lat: number; lng: number } | null>(null);

  /** Ao trocar o bairro (não no carregamento inicial), leva o pino direto pra lá — ponto de partida pro admin ajustar. */
  const bairroAnterior = useRef(bairro);
  useEffect(() => {
    if (bairro === bairroAnterior.current) return;
    bairroAnterior.current = bairro;

    const centro = CENTRO_BAIRRO[bairro];
    if (!centro) return;

    setEscolhido(null);
    setErro('');
    setResultados([]);
    setPendente(null);
    onSelecionar(String(centro[0]), String(centro[1]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bairro]);

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
    setPendente(null);
    onSelecionar(r.lat, r.lon);
  }

  /** A busca no OSM/Nominatim tem cobertura fraca em São Luís/MA — quando não acha nada, abre o mapa
   *  centralizado na cidade escolhida pra marcar o pino manualmente, em vez de deixar sem opção. */
  function abrirMapaManual() {
    const centro = CENTRO_BAIRRO[bairro] ?? CENTRO_CIDADE[cidade] ?? CENTRO_CIDADE['São Luís'];
    setEscolhido(null);
    setErro('');
    setResultados([]);
    setPendente(null);
    onSelecionar(String(centro[0]), String(centro[1]));
  }

  /** Confirma a posição do pino arrastado — só aí a localização do imóvel muda de verdade. */
  function confirmarPino() {
    if (!pendente) return;
    onSelecionar(String(pendente.lat), String(pendente.lng));
    setPendente(null);
  }

  const temCoordenadas = Boolean(lat && lng);
  const latAtual = pendente ? pendente.lat : Number(lat);
  const lngAtual = pendente ? pendente.lng : Number(lng);

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
              lat={latAtual}
              lng={lngAtual}
              onMover={(novoLat, novoLng) => {
                setEscolhido(null);
                setPendente({ lat: novoLat, lng: novoLng });
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[12px] text-muted">
              {pendente
                ? 'Pino movido — clique em "Ok" pra confirmar a nova localização.'
                : (escolhido ?? 'Arraste o pino ou clique no mapa para ajustar.')}
              {' — '}
              {latAtual.toFixed(6)}, {lngAtual.toFixed(6)}
            </p>
            {pendente ? (
              <button
                type="button"
                onClick={confirmarPino}
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Check size={14} strokeWidth={2.2} />
                Ok
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
