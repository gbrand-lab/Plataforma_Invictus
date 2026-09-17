'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock, Home, Images, MapPin, Upload, X } from 'lucide-react';
import { BAIRROS, CARACTERISTICAS, CATEGORIAS, CIDADES } from '@/lib/data';
import { CONFIG } from '@/lib/config';
import { cx, money, somenteDigitos } from '@/lib/format';
import type { CadastroImovel, Categoria, Finalidade } from '@/lib/types';
import { Btn, Campo, inputCls, selectCls, selectStyle, Specs, Tag } from './ui';

const ETAPAS = ['Corretor', 'Imóvel', 'Características', 'Localização', 'Mídia', 'Revisão'] as const;

const VAZIO: CadastroImovel = {
  nome: '',
  creci: '',
  telefone: '',
  whatsapp: '',
  email: '',
  finalidade: 'venda',
  categoria: 'apartamento',
  titulo: '',
  descricao: '',
  preco: '',
  condominio: '',
  iptu: '',
  quartos: '',
  suites: '',
  banheiros: '',
  vagas: '',
  area: '',
  cidade: 'São Luís',
  bairro: '',
  endereco: '',
  caracteristicas: [],
  fotos: [],
  principal: 0,
  video: '',
};

type Erros = Partial<Record<keyof CadastroImovel, string>>;

function Passos({ atual, onIr }: { atual: number; onIr: (i: number) => void }) {
  return (
    <ol className="flex flex-wrap gap-x-1 gap-y-2">
      {ETAPAS.map((etapa, i) => {
        const feito = i < atual;
        const ativo = i === atual;
        return (
          <li key={etapa} className="flex items-center gap-1">
            <button
              type="button"
              disabled={i > atual}
              onClick={() => onIr(i)}
              className={cx(
                'inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium transition-colors disabled:cursor-default',
                ativo ? 'bg-ink text-white' : feito ? 'text-brand hover:bg-wash' : 'text-muted',
              )}
            >
              <span
                className={cx(
                  'grid h-[18px] w-[18px] place-items-center rounded-full text-[10.5px] font-bold',
                  ativo ? 'bg-white/20 text-white' : feito ? 'bg-brand text-white' : 'bg-line text-ink2',
                )}
              >
                {feito ? <Check size={11} strokeWidth={3} /> : i + 1}
              </span>
              <span className="hidden sm:inline">{etapa}</span>
            </button>
            {i < ETAPAS.length - 1 ? <span className="h-px w-3 bg-line sm:w-5" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Cadastro da Rede Invictus em 6 etapas.
 *
 * PARA LIGAR NO BACKEND: substitua o corpo de `enviar()` por um POST para
 * /api/imoveis com status 'pending'. A validação por etapa já roda antes.
 */
export function PropertySubmission() {
  const [passo, setPasso] = useState(0);
  const [dados, setDados] = useState<CadastroImovel>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [enviado, setEnviado] = useState(false);
  const [protocolo, setProtocolo] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<CadastroImovel>) => setDados((d) => ({ ...d, ...patch }));

  const validar = (etapa: number): boolean => {
    const e: Erros = {};

    if (etapa === 0) {
      if (!dados.nome.trim()) e.nome = 'Informe o nome completo';
      if (!dados.creci.trim()) e.creci = 'O CRECI é obrigatório para anunciar';
      if (!somenteDigitos(dados.whatsapp)) e.whatsapp = 'Informe um WhatsApp para contato';
      if (dados.email && !/^\S+@\S+\.\S+$/.test(dados.email)) e.email = 'E-mail inválido';
    }
    if (etapa === 1) {
      if (!dados.titulo.trim()) e.titulo = 'Dê um título ao anúncio';
      if (dados.descricao.trim().length < 40) e.descricao = 'Escreva ao menos 40 caracteres descrevendo o imóvel';
      if (!dados.preco) e.preco = 'Informe o valor';
    }
    if (etapa === 2 && !dados.area) e.area = 'Informe a área em m²';
    if (etapa === 3) {
      if (!dados.bairro) e.bairro = 'Selecione o bairro';
      if (!dados.endereco.trim()) e.endereco = 'Informe o endereço (não será exibido publicamente)';
    }
    if (etapa === 4 && dados.fotos.length === 0) e.fotos = 'Envie ao menos uma foto do imóvel';

    setErros(e);
    return Object.keys(e).length === 0;
  };

  const avancar = () => {
    if (validar(passo)) setPasso((p) => Math.min(p + 1, ETAPAS.length - 1));
  };

  const adicionarFotos = (lista: FileList | null) => {
    if (!lista) return;
    const novas = Array.from(lista)
      .slice(0, 12 - dados.fotos.length)
      .map((f) => ({ nome: f.name, url: URL.createObjectURL(f) }));
    set({ fotos: [...dados.fotos, ...novas] });
    setErros((p) => ({ ...p, fotos: undefined }));
  };

  const enviar = () => {
    if (!validar(4)) {
      setPasso(4);
      return;
    }
    // TODO: POST /api/imoveis { ...dados, status: 'pending' }
    setProtocolo(String(Math.floor(Math.random() * 9000) + 1000));
    setEnviado(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const preview = {
    quartos: Number(dados.quartos || 0),
    banheiros: Number(dados.banheiros || 0),
    vagas: Number(dados.vagas || 0),
    area: Number(dados.area || 0),
  };

  if (enviado) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-16 sm:px-7 sm:py-24">
        <div className="rounded-2xl border border-line bg-white p-8 text-center sm:p-12">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-wash text-brandDeep">
            <Clock size={26} strokeWidth={1.6} />
          </span>
          <h1 className="mt-5 text-[26px] font-semibold tracking-[-0.02em] text-ink">Imóvel enviado para análise</h1>
          <p className="mx-auto mt-3 max-w-[48ch] text-[15px] leading-relaxed text-ink2">
            Recebemos o anúncio <strong className="font-semibold text-ink">{dados.titulo}</strong>. A equipe Invictus
            confere as informações e as fotos antes da publicação no portal — normalmente em até 1 dia útil.
          </p>

          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl border border-line bg-ground px-4 py-2.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
            <span className="text-[13.5px] font-medium text-ink">Status: aguardando aprovação da Invictus</span>
          </div>

          <p className="mt-6 text-[13.5px] text-muted">
            Acompanhamento pelo WhatsApp {CONFIG.whatsappLabel} · Protocolo REDE-{protocolo}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Btn
              variant="outline"
              onClick={() => {
                setDados(VAZIO);
                setPasso(0);
                setEnviado(false);
              }}
            >
              Cadastrar outro imóvel
            </Btn>
            <Link href="/" className="inline-flex">
              <Btn>Voltar ao portal</Btn>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-8 sm:px-7 sm:py-12">
      <nav aria-label="Você está aqui" className="mb-5 flex items-center gap-1.5 text-[12.5px] text-muted">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-ink">
          <Home size={13} strokeWidth={1.7} /> Início
        </Link>
        <ChevronRight size={13} strokeWidth={1.7} />
        <span className="text-ink2">Anuncie seu imóvel</span>
      </nav>

      <header className="max-w-[58ch]">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Rede Invictus</p>
        <h1 className="text-balance text-[28px] font-semibold leading-[1.12] tracking-[-0.025em] text-ink sm:text-[34px]">
          Cadastre seu imóvel na vitrine da Invictus
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink2">
          Leva cerca de cinco minutos. Nossa equipe confere os dados antes da publicação — nenhum anúncio vai ao ar
          automaticamente.
        </p>
      </header>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line bg-ground px-5 py-4">
          <Passos atual={passo} onIr={setPasso} />
        </div>

        <div className="p-5 sm:p-7">
          {passo === 0 ? (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <h2 className="col-span-full text-[18px] font-semibold text-ink">Seus dados de corretor</h2>
              <Campo label="Nome completo" erro={erros.nome} htmlFor="f-nome">
                <input
                  id="f-nome"
                  value={dados.nome}
                  onChange={(e) => set({ nome: e.target.value })}
                  placeholder="Ex.: Ana Paula Ferreira"
                  className={inputCls}
                />
              </Campo>
              <Campo label="CRECI" erro={erros.creci} htmlFor="f-creci">
                <input
                  id="f-creci"
                  value={dados.creci}
                  onChange={(e) => set({ creci: e.target.value })}
                  placeholder="CRECI/MA 00.000-F"
                  className={inputCls}
                />
              </Campo>
              <Campo label="Telefone" htmlFor="f-tel">
                <input
                  id="f-tel"
                  value={dados.telefone}
                  onChange={(e) => set({ telefone: e.target.value })}
                  inputMode="tel"
                  placeholder="(98) 3000-0000"
                  className={inputCls}
                />
              </Campo>
              <Campo label="WhatsApp" erro={erros.whatsapp} htmlFor="f-zap">
                <input
                  id="f-zap"
                  value={dados.whatsapp}
                  onChange={(e) => set({ whatsapp: e.target.value })}
                  inputMode="tel"
                  placeholder="(98) 99999-0000"
                  className={inputCls}
                />
              </Campo>
              <Campo label="E-mail" erro={erros.email} htmlFor="f-email" className="sm:col-span-2">
                <input
                  id="f-email"
                  type="email"
                  value={dados.email}
                  onChange={(e) => set({ email: e.target.value })}
                  placeholder="voce@email.com"
                  className={inputCls}
                />
              </Campo>
            </section>
          ) : null}

          {passo === 1 ? (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <h2 className="col-span-full text-[18px] font-semibold text-ink">Sobre o imóvel</h2>
              <Campo label="Finalidade" htmlFor="f-fin">
                <select
                  id="f-fin"
                  value={dados.finalidade}
                  onChange={(e) => set({ finalidade: e.target.value as Finalidade })}
                  style={selectStyle}
                  className={selectCls}
                >
                  <option value="venda">Comprar (venda)</option>
                  <option value="aluguel">Alugar (locação)</option>
                </select>
              </Campo>
              <Campo label="Categoria" htmlFor="f-cat">
                <select
                  id="f-cat"
                  value={dados.categoria}
                  onChange={(e) => set({ categoria: e.target.value as Categoria })}
                  style={selectStyle}
                  className={selectCls}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Título do anúncio" erro={erros.titulo} htmlFor="f-titulo" className="sm:col-span-2">
                <input
                  id="f-titulo"
                  value={dados.titulo}
                  onChange={(e) => set({ titulo: e.target.value })}
                  placeholder="Ex.: Apartamento com 3 quartos no Calhau"
                  className={inputCls}
                />
              </Campo>
              <Campo label="Descrição" erro={erros.descricao} htmlFor="f-desc" className="sm:col-span-2">
                <textarea
                  id="f-desc"
                  rows={5}
                  value={dados.descricao}
                  onChange={(e) => set({ descricao: e.target.value })}
                  placeholder="Conte o que torna o imóvel interessante: planta, acabamento, lazer do condomínio, proximidades."
                  className={cx(inputCls, 'h-auto resize-y py-3 leading-relaxed')}
                />
              </Campo>
              <Campo
                label={dados.finalidade === 'venda' ? 'Preço de venda (R$)' : 'Aluguel mensal (R$)'}
                erro={erros.preco}
                htmlFor="f-preco"
              >
                <input
                  id="f-preco"
                  inputMode="numeric"
                  value={dados.preco}
                  onChange={(e) => set({ preco: somenteDigitos(e.target.value) })}
                  placeholder="850000"
                  className={cx(inputCls, 'tabular')}
                />
              </Campo>
              <Campo label="Condomínio (R$/mês)" htmlFor="f-cond">
                <input
                  id="f-cond"
                  inputMode="numeric"
                  value={dados.condominio}
                  onChange={(e) => set({ condominio: somenteDigitos(e.target.value) })}
                  placeholder="0"
                  className={cx(inputCls, 'tabular')}
                />
              </Campo>
              <Campo label="IPTU (R$/mês)" htmlFor="f-iptu">
                <input
                  id="f-iptu"
                  inputMode="numeric"
                  value={dados.iptu}
                  onChange={(e) => set({ iptu: somenteDigitos(e.target.value) })}
                  placeholder="0"
                  className={cx(inputCls, 'tabular')}
                />
              </Campo>
            </section>
          ) : null}

          {passo === 2 ? (
            <section className="space-y-6">
              <h2 className="text-[18px] font-semibold text-ink">Características</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {(
                  [
                    ['quartos', 'Quartos'],
                    ['suites', 'Suítes'],
                    ['banheiros', 'Banheiros'],
                    ['vagas', 'Vagas'],
                    ['area', 'Área (m²)'],
                  ] as [keyof CadastroImovel, string][]
                ).map(([chave, label]) => (
                  <Campo key={chave} label={label} erro={erros[chave]} htmlFor={`f-${chave}`}>
                    <input
                      id={`f-${chave}`}
                      inputMode="numeric"
                      value={String(dados[chave])}
                      onChange={(e) => set({ [chave]: somenteDigitos(e.target.value) } as Partial<CadastroImovel>)}
                      placeholder="0"
                      className={cx(inputCls, 'tabular')}
                    />
                  </Campo>
                ))}
              </div>

              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">Diferenciais</p>
                <div className="flex flex-wrap gap-2">
                  {CARACTERISTICAS.map((c) => {
                    const ativo = dados.caracteristicas.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() =>
                          set({
                            caracteristicas: ativo
                              ? dados.caracteristicas.filter((x) => x !== c)
                              : [...dados.caracteristicas, c],
                          })
                        }
                        className={cx(
                          'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13.5px] transition-colors',
                          ativo
                            ? 'border-brand bg-wash font-medium text-brandDeep'
                            : 'border-line bg-white text-ink2 hover:border-ink/30',
                        )}
                      >
                        {ativo ? <Check size={13} strokeWidth={2} /> : null}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {passo === 3 ? (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <h2 className="col-span-full text-[18px] font-semibold text-ink">Localização</h2>
              <Campo label="Cidade" htmlFor="f-cidade">
                <select
                  id="f-cidade"
                  value={dados.cidade}
                  onChange={(e) => set({ cidade: e.target.value })}
                  style={selectStyle}
                  className={selectCls}
                >
                  {CIDADES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Bairro" erro={erros.bairro} htmlFor="f-bairro">
                <select
                  id="f-bairro"
                  value={dados.bairro}
                  onChange={(e) => set({ bairro: e.target.value })}
                  style={selectStyle}
                  className={selectCls}
                >
                  <option value="">Selecione</option>
                  {BAIRROS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Endereço" erro={erros.endereco} htmlFor="f-end" className="sm:col-span-2">
                <input
                  id="f-end"
                  value={dados.endereco}
                  onChange={(e) => set({ endereco: e.target.value })}
                  placeholder="Rua, número e complemento"
                  className={inputCls}
                />
              </Campo>
              <p className="col-span-full flex items-start gap-2 rounded-xl border border-line bg-ground p-3.5 text-[13px] leading-relaxed text-ink2">
                <MapPin size={15} strokeWidth={1.6} className="mt-0.5 shrink-0 text-brand" />
                O endereço completo fica visível apenas para a equipe Invictus. No portal, o imóvel aparece com
                localização aproximada até a aprovação do proprietário.
              </p>
            </section>
          ) : null}

          {passo === 4 ? (
            <section className="space-y-5">
              <h2 className="text-[18px] font-semibold text-ink">Fotos e vídeos</h2>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  adicionarFotos(e.dataTransfer.files);
                }}
                className="rounded-2xl border-2 border-dashed border-line bg-ground p-8 text-center"
              >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-brand">
                  <Upload size={20} strokeWidth={1.7} />
                </span>
                <p className="mt-3 text-[14.5px] font-medium text-ink">
                  Arraste as fotos aqui ou selecione no computador
                </p>
                <p className="mt-1 text-[13px] text-muted">JPG, PNG ou WebP · até 12 imagens · primeira foto é a capa</p>
                <input
                  ref={fileRef}
                  id="f-fotos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    adicionarFotos(e.target.files);
                    e.target.value = '';
                  }}
                />
                <Btn variant="outline" className="mt-4" onClick={() => fileRef.current?.click()}>
                  Selecionar fotos
                </Btn>
                {erros.fotos ? <p className="mt-3 text-[12.5px] font-medium text-brandDeep">{erros.fotos}</p> : null}
              </div>

              {dados.fotos.length > 0 ? (
                <div>
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">
                    {dados.fotos.length} {dados.fotos.length === 1 ? 'foto enviada' : 'fotos enviadas'} — clique para
                    definir a imagem principal
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {dados.fotos.map((f, i) => (
                      <div
                        key={i}
                        className={cx(
                          'group relative aspect-[4/3] overflow-hidden rounded-xl border-2 bg-ground',
                          dados.principal === i ? 'border-brand' : 'border-transparent',
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.url} alt={f.nome} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => set({ principal: i })}
                          className="absolute inset-0"
                          aria-label={`Definir ${f.nome} como principal`}
                        />
                        {dados.principal === i ? (
                          <span className="absolute bottom-2 left-2">
                            <Tag tone="orange">Principal</Tag>
                          </span>
                        ) : null}
                        <button
                          type="button"
                          aria-label={`Remover ${f.nome}`}
                          onClick={() => set({ fotos: dados.fotos.filter((_, k) => k !== i), principal: 0 })}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X size={14} strokeWidth={1.8} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <Campo label="Link de vídeo (opcional)" htmlFor="f-video">
                <input
                  id="f-video"
                  value={dados.video}
                  onChange={(e) => set({ video: e.target.value })}
                  placeholder="YouTube, Vimeo ou Drive"
                  className={inputCls}
                />
              </Campo>
            </section>
          ) : null}

          {passo === 5 ? (
            <section className="space-y-6">
              <h2 className="text-[18px] font-semibold text-ink">Revise antes de enviar</h2>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
                <div className="overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="relative aspect-[4/3] bg-ground">
                    {dados.fotos[dados.principal] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dados.fotos[dados.principal].url}
                        alt="Imagem principal do anúncio"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-muted">
                        <Images size={28} strokeWidth={1.5} />
                      </span>
                    )}
                    <span className="absolute left-3 top-3">
                      <Tag tone="dark">{dados.finalidade === 'venda' ? 'Venda' : 'Aluguel'}</Tag>
                    </span>
                  </div>

                  <div className="space-y-2 p-4">
                    <h3 className="text-[16px] font-semibold text-ink">{dados.titulo || 'Título do anúncio'}</h3>
                    <p className="text-[13px] text-muted">
                      {dados.bairro || 'Bairro'} • {dados.cidade}/MA
                    </p>
                    <p className="tabular text-[20px] font-semibold text-ink">
                      {money(Number(dados.preco || 0))}
                      {dados.finalidade === 'aluguel' ? (
                        <span className="text-[13px] font-normal text-muted">/mês</span>
                      ) : null}
                    </p>
                    <div className="border-t border-line pt-3">
                      <Specs imovel={preview} />
                    </div>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
                  {(
                    [
                      ['Corretor', dados.nome || '—'],
                      ['CRECI', dados.creci || '—'],
                      ['WhatsApp', dados.whatsapp || '—'],
                      ['E-mail', dados.email || '—'],
                      ['Categoria', CATEGORIAS.find((c) => c.id === dados.categoria)?.label ?? '—'],
                      ['Endereço', dados.endereco || '—'],
                      ['Condomínio', dados.condominio ? money(Number(dados.condominio)) : 'Não há'],
                      ['IPTU', dados.iptu ? money(Number(dados.iptu)) : 'Isento'],
                      ['Fotos', String(dados.fotos.length)],
                      ['Vídeo', dados.video ? 'Enviado' : 'Não enviado'],
                    ] as [string, string][]
                  ).map(([rotulo, valor]) => (
                    <div key={rotulo}>
                      <dt className="text-[11.5px] uppercase tracking-[0.08em] text-muted">{rotulo}</dt>
                      <dd className="mt-0.5 break-words font-medium text-ink">{valor}</dd>
                    </div>
                  ))}

                  {dados.caracteristicas.length > 0 ? (
                    <div className="col-span-2">
                      <dt className="text-[11.5px] uppercase tracking-[0.08em] text-muted">Diferenciais</dt>
                      <dd className="mt-1.5 flex flex-wrap gap-1.5">
                        {dados.caracteristicas.map((c) => (
                          <Tag key={c} tone="outline">
                            {c}
                          </Tag>
                        ))}
                      </dd>
                    </div>
                  ) : null}

                  {dados.descricao ? (
                    <div className="col-span-2">
                      <dt className="text-[11.5px] uppercase tracking-[0.08em] text-muted">Descrição</dt>
                      <dd className="mt-1 max-w-[64ch] text-[14px] leading-relaxed text-ink2">{dados.descricao}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <p className="flex items-start gap-2 rounded-xl border border-line bg-ground p-4 text-[13px] leading-relaxed text-ink2">
                <Clock size={15} strokeWidth={1.6} className="mt-0.5 shrink-0 text-brand" />
                Ao enviar, o anúncio entra com status{' '}
                <strong className="font-semibold text-ink">aguardando aprovação da Invictus</strong>. Ele só aparece no
                portal depois da conferência da equipe.
              </p>
            </section>
          ) : null}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line bg-ground px-5 py-4">
          <Btn variant="ghost" onClick={() => setPasso((p) => Math.max(p - 1, 0))} className={cx(passo === 0 && 'invisible')}>
            <ArrowLeft size={16} strokeWidth={1.7} /> Voltar
          </Btn>

          <p className="hidden text-[12.5px] text-muted sm:block">
            Etapa {passo + 1} de {ETAPAS.length} · {ETAPAS[passo]}
          </p>

          {passo < ETAPAS.length - 1 ? (
            <Btn onClick={avancar}>
              Continuar <ArrowRight size={16} strokeWidth={1.7} />
            </Btn>
          ) : (
            <Btn onClick={enviar}>
              Enviar imóvel para análise <Check size={16} strokeWidth={2} />
            </Btn>
          )}
        </footer>
      </div>
    </div>
  );
}
