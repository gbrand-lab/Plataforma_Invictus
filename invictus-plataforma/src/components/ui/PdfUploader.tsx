'use client';

import { useRef, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { cx } from '@/lib/format';

interface PdfUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  className?: string;
}

/** Upload do book/catálogo em PDF — o backend converte cada página numa foto e soma na lista de imagens do imóvel. */
export function PdfUploader({ value, onChange, className = '' }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function enviarArquivo(arquivo: File) {
    if (arquivo.type !== 'application/pdf') {
      setErro('Envie um arquivo PDF.');
      return;
    }

    setErro('');
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      const resposta = await fetch('/api/uploads/pdf', { method: 'POST', body: formData });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(typeof dados.detail === 'string' ? dados.detail : 'Não foi possível enviar.');
      onChange([...value, ...(dados.urls ?? [])]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível enviar. Confira sua conexão e tente de novo.');
    } finally {
      setEnviando(false);
    }
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
          <FileText size={22} strokeWidth={1.6} className="text-muted" />
        )}
        <p className="text-[13.5px] font-medium text-ink">
          {enviando ? 'Convertendo páginas...' : 'Arraste um PDF aqui ou clique para selecionar'}
        </p>
        <p className="text-[12px] text-muted">Book/catálogo em PDF — cada página vira uma foto</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
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
