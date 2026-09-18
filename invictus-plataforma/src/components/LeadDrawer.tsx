'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BellRing, X } from 'lucide-react';
import { Campo, inputCls } from './ui';
import { cx } from '@/lib/format';

const CHAVE_STORAGE = 'invictus:lead_drawer';
const CHAVE_SESSAO = 'invictus:lead_drawer_sessao';
const ATRASO_MS = 15000;
const OCULTAR_EM = ['/admin', '/corretor'];

/** Disparado pelo botão "Quero receber notícias" do rodapé para abrir o drawer na hora. */
export const EVENTO_ABRIR = 'invictus:abrir-lead-drawer';

interface Estado {
  enviado?: boolean;
  ultimaExibicao?: string;
}

function lerEstado(): Estado {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_STORAGE) ?? '{}');
  } catch {
    return {};
  }
}

function salvarEstado(estado: Estado) {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
  } catch {
    /* modo privado ou storage bloqueado — só não persiste a preferência */
  }
}

/**
 * Drawer de captura de lead — aparece uma vez por sessão, ~15s após a
 * navegação, e só volta a aparecer em outro dia (nunca mais se já enviou).
 * Some nas áreas internas (/admin, /corretor) — no site público, incluindo /parceiros, aparece normal.
 */
export function LeadDrawer() {
  const pathname = usePathname();
  const oculto = OCULTAR_EM.some((p) => pathname.startsWith(p));

  const [aberto, setAberto] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (oculto) return;

    /** Verifica se ainda pode exibir o drawer nesta sessão/dia e, se sim, abre e marca como exibido. */
    const podeExibir = () => {
      if (sessionStorage.getItem(CHAVE_SESSAO)) return false;
      const estado = lerEstado();
      if (estado.enviado) return false;
      if (estado.ultimaExibicao && new Date(estado.ultimaExibicao).toDateString() === new Date().toDateString()) {
        return false;
      }
      return estado;
    };

    const exibir = () => {
      const estado = podeExibir();
      if (!estado) return;
      setAberto(true);
      sessionStorage.setItem(CHAVE_SESSAO, '1');
      salvarEstado({ ...estado, ultimaExibicao: new Date().toISOString() });
    };

    const t = setTimeout(exibir, ATRASO_MS);

    // Exit-intent: mouse sai pelo topo da janela (rumo à aba/barra de endereço) — só existe em desktop.
    const aoSairPeloTopo = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) exibir();
    };
    document.addEventListener('mouseout', aoSairPeloTopo);

    return () => {
      clearTimeout(t);
      document.removeEventListener('mouseout', aoSairPeloTopo);
    };
  }, [oculto]);

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [aberto]);

  // Permite abrir manualmente (ex: botão "Quero receber notícias" no rodapé), sem esperar o gatilho de 15s.
  useEffect(() => {
    const abrirManual = () => setAberto(true);
    window.addEventListener(EVENTO_ABRIR, abrirManual);
    return () => window.removeEventListener(EVENTO_ABRIR, abrirManual);
  }, []);

  if (oculto || !aberto) return null;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const resposta = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, telefone, email }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        setErro(typeof dados.detail === 'string' ? dados.detail : 'Não foi possível enviar. Tente novamente.');
        return;
      }

      setEnviado(true);
      salvarEstado({ enviado: true });
      setTimeout(() => setAberto(false), 2200);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Receber atualizações de imóveis"
    >
      <div className="absolute inset-0 bg-ink/45" onClick={() => setAberto(false)} />
      <aside className="modal-in relative flex max-h-[90vh] w-full max-w-[380px] flex-col overflow-y-auto rounded-2xl bg-white p-6 shadow-float">
        <div className="flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-wash text-brandDeep">
            <BellRing size={20} strokeWidth={1.7} />
          </span>
          <button
            type="button"
            onClick={() => setAberto(false)}
            aria-label="Fechar"
            className="grid h-9 w-9 place-items-center rounded-lg text-ink2 transition-colors hover:bg-ground hover:text-ink"
          >
            <X size={18} strokeWidth={1.7} />
          </button>
        </div>

        {enviado ? (
          <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-[17px] font-semibold text-ink">Prontinho!</p>
            <p className="mt-1.5 text-[13.5px] text-ink2">
              Você vai receber novidades de imóveis assim que publicarmos.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mt-4 text-[19px] font-semibold leading-tight text-ink">
              Quer ficar sempre atualizado sobre os imóveis de São Luís?
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink2">
              Deixe o seu contato e avisaremos assim que surgir novas oportunidades aqui😀.
            </p>

            <form onSubmit={enviar} className="mt-5 flex flex-col gap-3.5">
              <Campo label="Nome" htmlFor="lead-nome">
                <input
                  id="lead-nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputCls}
                />
              </Campo>
              <Campo label="Telefone / WhatsApp" htmlFor="lead-telefone">
                <input
                  id="lead-telefone"
                  required
                  inputMode="tel"
                  placeholder="(98) 99999-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className={inputCls}
                />
              </Campo>
              <Campo label="E-mail" htmlFor="lead-email">
                <input
                  id="lead-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </Campo>

              {erro && <p className="text-[13px] font-medium text-brandDeep">{erro}</p>}

              <button
                type="submit"
                disabled={enviando}
                className={cx(
                  'mt-1 h-11 rounded-xl bg-ink text-[14px] font-semibold text-white transition-opacity hover:opacity-90',
                  enviando && 'opacity-60',
                )}
              >
                {enviando ? 'Enviando...' : 'Quero receber novidades'}
              </button>
            </form>
          </>
        )}
      </aside>
    </div>
  );
}
