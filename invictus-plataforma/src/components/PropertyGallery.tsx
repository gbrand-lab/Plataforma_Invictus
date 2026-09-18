'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, Play, X } from 'lucide-react';
import type { Imovel } from '@/lib/types';
import { cx } from '@/lib/format';
import { Foto } from './ui';

function VideoLightbox({ video, titulo, onFechar }: { video: NonNullable<Imovel['videos'][number]>; titulo: string; onFechar: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-[95] flex flex-col bg-ink/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Vídeo — ${titulo}`}
    >
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p className="truncate pr-4 text-[13.5px] text-white/70">{video.titulo}</p>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar vídeo"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} strokeWidth={1.7} />
        </button>
      </header>

      <div className="flex flex-1 items-center justify-center px-3 pb-3 sm:px-16">
        {video.url ? (
          <video src={video.url} controls autoPlay className="max-h-full max-w-full rounded-xl" />
        ) : (
          <p className="text-white/70">Vídeo indisponível.</p>
        )}
      </div>
    </div>
  );
}

function Lightbox({
  imagens,
  indice,
  titulo,
  onFechar,
  onIr,
}: {
  imagens: string[];
  indice: number;
  titulo: string;
  onFechar: () => void;
  onIr: (passo: number) => void;
}) {
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

  return (
    <div
      className="fixed inset-0 z-[95] flex flex-col bg-ink/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos — ${titulo}`}
    >
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
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
      </header>

      <div className="relative flex flex-1 items-center justify-center px-3 pb-3 sm:px-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagens[indice]}
          alt={`${titulo} — foto ${indice + 1}`}
          className="max-h-full max-w-full rounded-xl object-contain"
        />
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
      </div>

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
    </div>
  );
}

/**
 * Galeria do imóvel.
 * Desktop: foto principal ~70% + três miniaturas, a última com a contagem.
 * Mobile: carrossel com swipe nativo (scroll-snap), sem biblioteca.
 */
export function PropertyGallery({ imovel }: { imovel: Imovel }) {
  const [aberta, setAberta] = useState(-1);
  const [videoAberto, setVideoAberto] = useState(false);
  const imgs = imovel.imagens;
  const video = imovel.videos[0];

  return (
    <>
      <div className="relative lg:hidden">
        <div className="scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1">
          {imgs.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAberta(i)}
              className="relative aspect-[4/3] w-[86%] shrink-0 snap-center overflow-hidden rounded-2xl bg-ground"
            >
              <Foto src={src} alt={`${imovel.titulo} — foto ${i + 1}`} priority={i === 0} sizes="86vw" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAberta(0)}
          className="absolute bottom-4 right-8 inline-flex items-center gap-1.5 rounded-lg bg-ink/85 px-2.5 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm"
        >
          <Images size={14} strokeWidth={1.7} /> {imgs.length} fotos
        </button>
      </div>

      <div className="hidden gap-2 lg:grid lg:grid-cols-[1fr_320px]">
        <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-ground">
          <button
            type="button"
            onClick={() => setAberta(0)}
            aria-label={`Ver fotos — ${imovel.titulo}`}
            className="absolute inset-0"
          >
            <Foto
              src={imgs[0]}
              alt={`${imovel.titulo} — foto principal`}
              priority
              sizes="(max-width: 1024px) 100vw, 880px"
              className="transition-transform duration-500 ease-invictus group-hover:scale-[1.02]"
            />
          </button>
          {video ? (
            <button
              type="button"
              onClick={() => setVideoAberto(true)}
              className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] font-medium text-ink shadow-float transition-colors hover:bg-ground"
            >
              <Play size={15} strokeWidth={1.7} className="text-brand" /> Assistir vídeo
              <span className="tabular text-[12px] font-normal text-muted">{video.duracao}</span>
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          {imgs.slice(1, 4).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAberta(i + 1)}
              className="group relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-ground"
            >
              <Foto
                src={src}
                alt={`${imovel.titulo} — foto ${i + 2}`}
                sizes="320px"
                className="transition-transform duration-500 ease-invictus group-hover:scale-[1.04]"
              />
              {i === 2 ? (
                <span className="absolute inset-0 grid place-items-center bg-ink/55 text-[15px] font-semibold text-white backdrop-blur-[2px] transition-colors group-hover:bg-ink/65">
                  +{imgs.length - 3} fotos
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {aberta >= 0 ? (
        <Lightbox
          imagens={imgs}
          indice={aberta}
          titulo={imovel.titulo}
          onFechar={() => setAberta(-1)}
          onIr={(passo) => setAberta((atual) => (atual + passo + imgs.length) % imgs.length)}
        />
      ) : null}

      {videoAberto && video ? (
        <VideoLightbox video={video} titulo={imovel.titulo} onFechar={() => setVideoAberto(false)} />
      ) : null}
    </>
  );
}
