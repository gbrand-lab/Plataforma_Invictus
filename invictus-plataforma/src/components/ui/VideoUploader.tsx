'use client';

import { useRef, useState } from 'react';
import { Film, Loader2, Play, X } from 'lucide-react';
import { cx } from '@/lib/format';
import type { Video } from '@/lib/types';

interface VideoUploaderProps {
  value: Video | null;
  onChange: (video: Video | null) => void;
  className?: string;
}

const TIPOS_ACEITOS = ['video/mp4', 'video/webm', 'video/quicktime'];

/** Lê a duração do vídeo no próprio navegador (metadata do <video>) — sem custo de processamento no backend. */
function lerDuracao(arquivo: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const total = Math.round(video.duration);
      const min = Math.floor(total / 60);
      const seg = String(total % 60).padStart(2, '0');
      URL.revokeObjectURL(video.src);
      resolve(`${min}:${seg}`);
    };
    video.onerror = () => resolve('');
    video.src = URL.createObjectURL(arquivo);
  });
}

/** Upload de um vídeo (tour/drone do imóvel) por arraste ou seleção — mostra até 1 vídeo. */
export function VideoUploader({ value, onChange, className = '' }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function enviarArquivo(arquivo: File) {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setErro('Envie um vídeo em MP4, WebM ou MOV.');
      return;
    }

    setErro('');
    setEnviando(true);
    try {
      const duracao = await lerDuracao(arquivo);

      const formData = new FormData();
      formData.append('arquivo', arquivo);
      const resposta = await fetch('/api/uploads/video', { method: 'POST', body: formData });
      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setErro(typeof dados.detail === 'string' ? dados.detail : 'Não foi possível enviar o vídeo.');
        return;
      }

      onChange({ titulo: value?.titulo || 'Tour em vídeo', duracao, url: dados.url });
    } catch {
      setErro('Não foi possível enviar o vídeo. Confira sua conexão e tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  if (value) {
    return (
      <div className={className}>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-ground p-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-wash text-brandDeep">
            <Play size={18} strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <input
              value={value.titulo}
              onChange={(e) => onChange({ ...value, titulo: e.target.value })}
              placeholder="Título do vídeo"
              className="w-full bg-transparent text-[13.5px] font-medium text-ink outline-none placeholder:text-muted"
            />
            <p className="tabular mt-0.5 text-[12px] text-muted">Duração: {value.duracao || '—'}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remover vídeo"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink2 transition-colors hover:bg-white hover:text-brandDeep"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
        {erro ? <p className="mt-2 text-[12.5px] font-medium text-brandDeep">{erro}</p> : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          const arquivo = e.dataTransfer.files?.[0];
          if (arquivo) enviarArquivo(arquivo);
        }}
        className={cx(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          arrastando ? 'border-brand bg-wash' : 'border-line bg-ground hover:border-ink/25',
        )}
      >
        {enviando ? (
          <Loader2 size={22} strokeWidth={1.8} className="animate-spin text-brand" />
        ) : (
          <Film size={22} strokeWidth={1.6} className="text-muted" />
        )}
        <p className="text-[13.5px] font-medium text-ink">
          {enviando ? 'Enviando vídeo...' : 'Arraste um vídeo aqui ou clique para selecionar'}
        </p>
        <p className="text-[12px] text-muted">MP4, WebM ou MOV · até 200 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={TIPOS_ACEITOS.join(',')}
          className="hidden"
          onChange={(e) => {
            const arquivo = e.target.files?.[0];
            if (arquivo) enviarArquivo(arquivo);
            e.target.value = '';
          }}
        />
      </div>
      {erro ? <p className="mt-2 text-[12.5px] font-medium text-brandDeep">{erro}</p> : null}
    </div>
  );
}
