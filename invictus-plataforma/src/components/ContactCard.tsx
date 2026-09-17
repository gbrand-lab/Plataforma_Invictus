'use client';

import { useState } from 'react';
import { CalendarDays, ShieldCheck } from 'lucide-react';
import { CONFIG, mensagemImovel } from '@/lib/config';
import { cx, dataBR, iniciais, money } from '@/lib/format';
import type { Imovel } from '@/lib/types';
import { WhatsAppCTA } from './WhatsAppCTA';
import { inputCls, selectCls, selectStyle } from './ui';

type Periodo = 'manhã' | 'tarde' | 'início da noite';

/**
 * Card de conversão — é o objetivo da página.
 * Nome e telefone são opcionais de propósito: exigir formulário antes do
 * WhatsApp derruba conversão. O que for preenchido entra na mensagem.
 */
export function ContactCard({ imovel, className = '' }: { imovel: Imovel; className?: string }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [agendando, setAgendando] = useState(false);
  const [data, setData] = useState('');
  const [periodo, setPeriodo] = useState<Periodo>('manhã');

  const assinatura = nome ? ` Meu nome é ${nome}${telefone ? `, telefone ${telefone}` : ''}.` : '';
  const msgInteresse = mensagemImovel(imovel.titulo, imovel.ref) + assinatura;
  const msgVisita =
    `Olá! Vi o imóvel ${imovel.titulo} (ref. ${imovel.ref}) no site da Invictus e gostaria de agendar uma visita` +
    `${data ? ` no dia ${dataBR(data)}` : ''}, no período da ${periodo}.${assinatura}`;

  return (
    <div className={cx('rounded-2xl border border-line bg-white p-5 shadow-float', className)}>
      <div className="flex items-baseline gap-2">
        <span className="tabular text-[26px] font-semibold tracking-[-0.02em] text-ink">{money(imovel.preco)}</span>
        {imovel.finalidade === 'aluguel' ? <span className="text-[13.5px] text-muted">/mês</span> : null}
      </div>

      {imovel.condominio > 0 || imovel.iptu > 0 ? (
        <p className="tabular mt-1 text-[12.5px] text-muted">
          {imovel.condominio > 0 ? <>Condomínio {money(imovel.condominio)}</> : null}
          {imovel.condominio > 0 && imovel.iptu > 0 ? ' · ' : null}
          {imovel.iptu > 0 ? <>IPTU {money(imovel.iptu)}/mês</> : null}
        </p>
      ) : null}

      <hr className="my-4 border-line" />

      <h2 className="text-[16.5px] font-semibold text-ink">Gostou deste imóvel?</h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink2">
        Fale com um especialista da Invictus e receba mais informações.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2.5">
        <input
          id="cc-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome (opcional)"
          className={inputCls}
        />
        <input
          id="cc-tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          inputMode="tel"
          placeholder="Telefone (opcional)"
          className={inputCls}
        />
      </div>

      <WhatsAppCTA
        mensagem={msgInteresse}
        label="Tenho interesse neste imóvel"
        size="lg"
        className="mt-3 w-full"
      />

      <button
        type="button"
        onClick={() => setAgendando((v) => !v)}
        aria-expanded={agendando}
        className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line text-[14px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-ground"
      >
        <CalendarDays size={16} strokeWidth={1.6} /> Agendar uma visita
      </button>

      {agendando ? (
        <div className="mt-3 space-y-2.5 rounded-xl border border-line bg-ground p-3.5">
          <label htmlFor="cc-data" className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Melhor dia</span>
            <input
              id="cc-data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className={inputCls}
            />
          </label>

          <label htmlFor="cc-periodo" className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Período</span>
            <select
              id="cc-periodo"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as Periodo)}
              style={selectStyle}
              className={selectCls}
            >
              <option value="manhã">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="início da noite">Início da noite</option>
            </select>
          </label>

          <WhatsAppCTA mensagem={msgVisita} label="Confirmar no WhatsApp" variant="dark" className="w-full" />
        </div>
      ) : null}

      <div className="mt-4 flex items-start gap-3 border-t border-line pt-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-wash text-[13px] font-semibold text-brandDeep">
          {iniciais(CONFIG.corretorResponsavel)}
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-ink">{CONFIG.corretorResponsavel}</p>
          <p className="text-[12px] text-muted">{CONFIG.creci} · Rede Invictus</p>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted">
        <ShieldCheck size={13} strokeWidth={1.6} /> Atendimento {CONFIG.atendimento.toLowerCase()}
      </p>
    </div>
  );
}
