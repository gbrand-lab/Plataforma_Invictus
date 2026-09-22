'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cx } from '@/lib/format';

interface ImageLightboxProps {
  imagens: string[];
  indice: number;
  titulo: string;
  onFechar: () => void;
  onIr: (passo: number) => void;
}

/** Bem baixo de propósito — é só pra diferenciar de um toque/clique parado, não pra exigir um "puxão". */
const LIMIAR_ARRASTE = 24;

/** Visualizador de fotos em tela cheia — usado na página do imóvel e em qualquer lista que precise mostrar fotos sem navegar até lá. */
export function ImageLightbox({ imagens, indice, titulo, onFechar, onIr }: ImageLightboxProps) {
  const inicioX = useRef<number | null>(null);

  const aoPressionar = (e: React.PointerEvent) => {
    inicioX.current = e.clientX;
  };
  const aoSoltar = (e: React.PointerEvent) => {
    if (inicioX.current == null || imagens.length < 2) return;
    const delta = e.clientX - inicioX.current;
    inicioX.current = null;
    if (Math.abs(delta) < LIMIAR_ARRASTE) return;
    onIr(delta < 0 ? 1 : -1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
      if (e.key === 'ArrowRight') onIr(1);
      if (e.key === 'ArrowLeft') onIr(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onFechar, onIr]);

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex flex-col bg-ink/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos — ${titulo}`}
    >
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p className="truncate pr-4 text-[13.5px] text-white/70">{titulo}</p>
        <div className="flex shrink-0 items-center gap-3">
          <p className="tabular text-[13.5px] text-white/70">
            {indice + 1} / {imagens.length}
          </p>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar galeria"
            className="grid h-10 w-10 place-items-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={20} strokeWidth={1.7} />
          </button>
        </div>
      </header>

      <div
        className="relative flex flex-1 cursor-grab touch-pan-y items-center justify-center overflow-hidden px-3 pb-3 active:cursor-grabbing sm:px-16"
        onPointerDown={aoPressionar}
        onPointerUp={aoSoltar}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagens[indice]}
          alt={`${titulo} — foto ${indice + 1}`}
          draggable={false}
          className="select-none rounded-xl object-contain"
          style={{ maxHeight: '80vh', maxWidth: '90vw', width: 'auto', height: 'auto' }}
        />
        {imagens.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => onIr(-1)}
              aria-label="Foto anterior"
              className="absolute left-2 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-5"
            >
              <ChevronLeft size={20} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              onClick={() => onIr(1)}
              aria-label="Próxima foto"
              className="absolute right-2 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-5"
            >
              <ChevronRight size={20} strokeWidth={1.7} />
            </button>
          </>
        ) : null}
      </div>

      {imagens.length > 1 ? (
        <div className="hidden gap-2 overflow-x-auto px-6 pb-6 sm:flex">
          {imagens.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onIr(i - indice)}
              aria-label={`Ver foto ${i + 1}`}
              className={cx(
                'h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity',
                i === indice ? 'border-brand' : 'border-transparent opacity-55 hover:opacity-90',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
