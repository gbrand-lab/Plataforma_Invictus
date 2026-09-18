'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { cx } from '@/lib/format';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  className?: string;
}

const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp'];
const TIPO_PDF = 'application/pdf';

async function enviarLote(url: string, formData: FormData): Promise<{ urls?: string[]; detail?: unknown }> {
  const resposta = await fetch(url, { method: 'POST', body: formData });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(typeof dados.detail === 'string' ? dados.detail : 'Não foi possível enviar.');
  return dados;
}

/**
 * Upload de fotos por arraste ou seleção — envia pro backend e guarda as URLs retornadas.
 * Também aceita PDF (book do imóvel): o backend converte cada página numa imagem.
 */
export function ImageUploader({ value, onChange, className = '' }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState('');
  const [erro, setErro] = useState('');

  async function enviarArquivos(lista: FileList | File[]) {
    const todos = Array.from(lista);
    const imagens = todos.filter((f) => TIPOS_IMAGEM.includes(f.type));
    const pdfs = todos.filter((f) => f.type === TIPO_PDF);

    if (imagens.length === 0 && pdfs.length === 0) {
      setErro('Envie imagens (JPG, PNG, WebP) ou um PDF.');
      return;
    }

    setErro('');
    setEnviando(true);
    try {
      const novasUrls: string[] = [];

      if (imagens.length > 0) {
        setProgresso('Enviando fotos...');
        const formData = new FormData();
        imagens.forEach((arquivo) => formData.append('arquivos', arquivo));
        const dados = await enviarLote('/api/uploads', formData);
        novasUrls.push(...(dados.urls ?? []));
      }

      for (const pdf of pdfs) {
        setProgresso(`Convertendo páginas de "${pdf.name}"...`);
        const formData = new FormData();
        formData.append('arquivo', pdf);
        const dados = await enviarLote('/api/uploads/pdf', formData);
        novasUrls.push(...(dados.urls ?? []));
      }

      onChange([...value, ...novasUrls]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível enviar. Confira sua conexão e tente de novo.');
    } finally {
      setEnviando(false);
      setProgresso('');
    }
  }

  function remover(url: string) {
    onChange(value.filter((u) => u !== url));
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
          if (e.dataTransfer.files.length) enviarArquivos(e.dataTransfer.files);
        }}
        className={cx(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          arrastando ? 'border-brand bg-wash' : 'border-line bg-ground hover:border-ink/25',
        )}
      >
        {enviando ? (
          <Loader2 size={22} strokeWidth={1.8} className="animate-spin text-brand" />
        ) : (
          <ImagePlus size={22} strokeWidth={1.6} className="text-muted" />
        )}
        <p className="text-[13.5px] font-medium text-ink">
          {enviando ? progresso || 'Enviando...' : 'Arraste as fotos ou um PDF aqui, ou clique para selecionar'}
        </p>
        <p className="text-[12px] text-muted">JPG, PNG, WebP (até 8 MB) ou PDF (cada página vira uma foto)</p>
        <input
          ref={inputRef}
          type="file"
          accept={[...TIPOS_IMAGEM, TIPO_PDF].join(',')}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) enviarArquivos(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {erro ? <p className="mt-2 text-[12.5px] font-medium text-brandDeep">{erro}</p> : null}

      {value.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
          {value.map((url, i) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-ground">
              <Image src={url} alt={`Foto ${i + 1}`} fill sizes="140px" className="object-cover" />
              {i === 0 ? (
                <span className="absolute left-1 top-1 rounded bg-ink/80 px-1.5 py-0.5 text-[9.5px] font-semibold text-white">
                  Capa
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => remover(url)}
                aria-label="Remover foto"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={13} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
