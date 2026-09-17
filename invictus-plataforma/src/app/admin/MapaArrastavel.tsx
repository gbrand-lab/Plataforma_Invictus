'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

/** Pino em SVG inline — evita o problema clássico do Leaflet com os ícones padrão quebrados pelo bundler. */
const PINO = L.divIcon({
  className: '',
  html: `<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 42C15 42 28 25.5 28 15C28 7 22 1 15 1C8 1 2 7 2 15C2 25.5 15 42 15 42Z" fill="#ED6A1F" stroke="#fff" stroke-width="1.5"/>
    <circle cx="15" cy="15" r="5.5" fill="#fff"/>
  </svg>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});

/** Recentraliza o mapa quando o lat/lng muda por fora (ex: novo resultado de busca escolhido). */
function Recentralizar({ centro }: { centro: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(centro, map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centro[0], centro[1]]);
  return null;
}

function ClickParaMover({ onMover }: { onMover: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMover(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapaArrastavelProps {
  lat: number;
  lng: number;
  onMover: (lat: number, lng: number) => void;
}

/**
 * Mapa interativo (Leaflet + tiles do OpenStreetMap, gratuito, sem API key)
 * para ajustar a localização exata arrastando o pino ou clicando no mapa.
 */
export function MapaArrastavel({ lat, lng, onMover }: MapaArrastavelProps) {
  const centro = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);

  return (
    <MapContainer center={centro} zoom={16} scrollWheelZoom className="h-[280px] w-full rounded-xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={centro}
        icon={PINO}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const pos = e.target.getLatLng();
            onMover(pos.lat, pos.lng);
          },
        }}
      />
      <ClickParaMover onMover={onMover} />
      <Recentralizar centro={centro} />
    </MapContainer>
  );
}
