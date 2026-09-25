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

// HEIC/HEIF cobre foto tirada direto do iPhone (formato padrão da Apple) — o backend converte.
const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

interface RespostaUpload {
  urls?: string[];
  erros?: { arquivo: string; motivo: string }[];
  detail?: unknown;
}

/**
 * Vai direto do navegador pro backend (não passa pelo proxy do Next.js — a Vercel
 * limita bem o tamanho do corpo das suas próprias functions, o que rejeitava foto
 * de celular antes mesmo de chegar no backend). Pega um token válido pra sessão
 * e manda o lote num único POST direto ao backend.
 */
async function enviarLote(formData: FormData): Promise<RespostaUpload> {
  const tokenResp = await fetch('/api/uploads/token');
  const tokenDados = await tokenResp.json().catch(() => ({}));
  if (!tokenResp.ok || !tokenDados.token) {
    throw new Error('Sua sessão expirou. Atualize a página e faça login de novo.');
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) throw new Error('Upload de foto não configurado (NEXT_PUBLIC_BACKEND_URL ausente).');

  const resposta = await fetch(`${backendUrl}/uploads/imagens`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenDados.token}` },
    body: formData,
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(typeof dados.detail === 'string' ? dados.detail : 'Não foi possível enviar.');
  return dados;
}

/** Upload de fotos por arraste ou seleção — envia pro backend e guarda as URLs retornadas. */
export function ImageUploader({ value, onChange, className = '' }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function enviarArquivos(lista: FileList | File[]) {
    // Alguns celulares (principalmente Android com HEIC) não preenchem o `type` do arquivo —
    // nesse caso deixa passar pro backend decidir, em vez de descartar silenciosamente.
    const imagens = Array.from(lista).filter((f) => !f.type || TIPOS_IMAGEM.includes(f.type));

    if (imagens.length === 0) {
      setErro('Envie imagens em JPG, PNG, WebP ou HEIC.');
      return;
    }

    setErro('');
    setEnviando(true);
    try {
      const formData = new FormData();
      imagens.forEach((arquivo) => formData.append('arquivos', arquivo));
      const dados = await enviarLote(formData);
      onChange([...value, ...(dados.urls ?? [])]);

      if (dados.erros?.length) {
        setErro(
          dados.erros.length === imagens.length
            ? 'Nenhuma foto pôde ser enviada. Confira o formato e o tamanho dos arquivos.'
            : `${dados.erros.length} foto(s) não enviada(s): ${dados.erros.map((e) => e.arquivo).join(', ')}.`,
        );
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível enviar. Confira sua conexão e tente de novo.');
    } finally {
      setEnviando(false);
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
          {enviando ? 'Enviando fotos...' : 'Arraste as fotos aqui ou clique para selecionar'}
        </p>
        <p className="text-[12px] text-muted">JPG, PNG, WebP ou HEIC (iPhone) · selecione várias de uma vez</p>
        <input
          ref={inputRef}
          type="file"
          accept={[...TIPOS_IMAGEM, 'image/*'].join(',')}
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
