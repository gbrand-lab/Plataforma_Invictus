'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BAIRROS, CARACTERISTICAS, CATEGORIAS, CIDADES } from '@/lib/data';
import { Campo, ImageUploader, PdfUploader, VideoUploader, inputCls, selectCls, selectStyle } from '@/components/ui';
import { cx, num, somenteDigitos } from '@/lib/format';
import type { Video } from '@/lib/types';
import type { ImovelAdmin } from './adminTypes';
import { LocationPicker } from './LocationPicker';

type FormState = {
  titulo: string;
  descricao: string;
  finalidade: 'venda' | 'aluguel' | 'repasse';
  categoria: string;
  preco: string;
  condominio: string;
  iptu: string;
  cidade: string;
  bairro: string;
  endereco: string;
  lat: string;
  lng: string;
  localizacao_aproximada: boolean;
  quartos: string;
  suites: string;
  banheiros: string;
  vagas: string;
  area: string;
  caracteristicas: string[];
  imagens: string[];
  video: Video | null;
  creci: string;
  telefone: string;
  whatsapp: string;
  status: string;
  destaque: boolean;
  na_chave: boolean;
  novo: boolean;
};

function paraFormState(imovel?: ImovelAdmin): FormState {
  return {
    titulo: imovel?.titulo ?? '',
    descricao: imovel?.descricao ?? '',
    finalidade: imovel?.finalidade ?? 'venda',
    categoria: imovel?.categoria ?? 'apartamento',
    preco: imovel ? String(imovel.preco) : '',
    condominio: imovel ? String(imovel.condominio) : '0',
    iptu: imovel ? String(imovel.iptu) : '0',
    cidade: imovel?.cidade ?? CIDADES[0],
    bairro: imovel?.bairro ?? '',
    endereco: imovel?.endereco ?? '',
    lat: imovel?.lat != null ? String(imovel.lat) : '',
    lng: imovel?.lng != null ? String(imovel.lng) : '',
    localizacao_aproximada: imovel?.localizacao_aproximada ?? true,
    quartos: imovel ? String(imovel.quartos) : '0',
    suites: imovel ? String(imovel.suites) : '0',
    banheiros: imovel ? String(imovel.banheiros) : '0',
    vagas: imovel ? String(imovel.vagas) : '0',
    area: imovel ? String(imovel.area) : '',
    caracteristicas: imovel?.caracteristicas ?? [],
    imagens: imovel?.imagens ?? [],
    video: imovel?.videos?.[0] ?? null,
    creci: imovel?.creci ?? '',
    telefone: imovel?.telefone ?? '',
    whatsapp: imovel?.whatsapp ?? '',
    status: imovel?.status ?? 'draft',
    destaque: imovel?.destaque ?? false,
    na_chave: imovel?.na_chave ?? false,
    novo: imovel?.novo ?? true,
  };
}

interface ImovelFormProps {
  imovel?: ImovelAdmin;
  /** Corretores não escolhem o status — segue a regra de aprovação configurada pelo admin. */
  mostrarStatus?: boolean;
  aoSalvar?: string;
}

export function ImovelForm({ imovel, mostrarStatus = true, aoSalvar = '/admin' }: ImovelFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => paraFormState(imovel));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const editando = Boolean(imovel);

  function campo<K extends keyof FormState>(key: K, valor: FormState[K]) {
    setForm((atual) => ({ ...atual, [key]: valor }));
  }

  function alternarCaracteristica(nome: string) {
    setForm((atual) => ({
      ...atual,
      caracteristicas: atual.caracteristicas.includes(nome)
        ? atual.caracteristicas.filter((c) => c !== nome)
        : [...atual.caracteristicas, nome],
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (form.imagens.length < 3) {
      setErro('Envie pelo menos 3 fotos do imóvel.');
      return;
    }

    setSalvando(true);

    const payload = {
      titulo: form.titulo,
      descricao: form.descricao,
      finalidade: form.finalidade,
      categoria: form.categoria,
      preco: Number(form.preco) || 0,
      condominio: Number(form.condominio) || 0,
      iptu: Number(form.iptu) || 0,
      cidade: form.cidade,
      bairro: form.bairro,
      endereco: form.endereco,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      localizacao_aproximada: form.localizacao_aproximada,
      quartos: Number(form.quartos) || 0,
      suites: Number(form.suites) || 0,
      banheiros: Number(form.banheiros) || 0,
      vagas: Number(form.vagas) || 0,
      area: Number(form.area) || 0,
      caracteristicas: form.caracteristicas,
      imagens: form.imagens,
      videos: form.video ? [form.video] : [],
      creci: form.creci || null,
      telefone: form.telefone || null,
      whatsapp: form.whatsapp || null,
      status: form.status,
      destaque: form.destaque,
      na_chave: form.na_chave,
      novo: form.novo,
    };

    try {
      const url = editando ? `/api/admin/imoveis/${imovel!.id}` : '/api/admin/imoveis';
      const method = editando ? 'PATCH' : 'POST';

      const resposta = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        setErro(dados.detail ? JSON.stringify(dados.detail) : 'Não foi possível salvar o imóvel.');
        return;
      }

      router.push(aoSalvar);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[14px] font-semibold text-ink">Informações principais</h2>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Campo label="Nome do imóvel">
            <input
              required
              className={inputCls}
              value={form.titulo}
              onChange={(e) => campo('titulo', e.target.value)}
            />
          </Campo>
          <Campo label="Descrição">
            <textarea
              required
              rows={4}
              className={cx(inputCls, 'h-auto py-2.5')}
              value={form.descricao}
              onChange={(e) => campo('descricao', e.target.value)}
            />
          </Campo>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[14px] font-semibold text-ink">Classificação e preço</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Campo label="Finalidade">
            <select
              className={selectCls}
              style={selectStyle}
              value={form.finalidade}
              onChange={(e) => campo('finalidade', e.target.value as FormState['finalidade'])}
            >
              <option value="venda">Comprar (venda)</option>
              <option value="aluguel">Alugar (locação)</option>
              <option value="repasse">Repasse de chave</option>
            </select>
          </Campo>
          <Campo label="Categoria">
            <select
              required
              className={selectCls}
              style={selectStyle}
              value={form.categoria}
              onChange={(e) => campo('categoria', e.target.value)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Campo>
          {mostrarStatus ? (
            <Campo label="Status">
              <select
                className={selectCls}
                style={selectStyle}
                value={form.status}
                onChange={(e) => campo('status', e.target.value)}
              >
                <option value="draft">Rascunho</option>
                <option value="pending">Pendente</option>
                <option value="published">Publicado</option>
                <option value="sold">Vendido</option>
                <option value="rented">Alugado</option>
                <option value="inactive">Inativo</option>
              </select>
            </Campo>
          ) : null}
          <Campo label="Preço (R$)">
            <input
              required
              type="text"
              inputMode="numeric"
              className={inputCls}
              value={form.preco ? num(Number(form.preco)) : ''}
              onChange={(e) => campo('preco', somenteDigitos(e.target.value))}
            />
          </Campo>
          <Campo label="Condomínio (R$)">
            <input
              type="text"
              inputMode="numeric"
              className={inputCls}
              value={form.condominio ? num(Number(form.condominio)) : ''}
              onChange={(e) => campo('condominio', somenteDigitos(e.target.value))}
            />
          </Campo>
          <Campo label="IPTU (R$)">
            <input
              type="text"
              inputMode="numeric"
              className={inputCls}
              value={form.iptu ? num(Number(form.iptu)) : ''}
              onChange={(e) => campo('iptu', somenteDigitos(e.target.value))}
            />
          </Campo>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[14px] font-semibold text-ink">Localização</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Campo label="Cidade">
            <select
              className={selectCls}
              style={selectStyle}
              value={form.cidade}
              onChange={(e) => campo('cidade', e.target.value)}
            >
              {CIDADES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Bairro">
            <input
              required
              list="bairros"
              className={inputCls}
              value={form.bairro}
              onChange={(e) => campo('bairro', e.target.value)}
            />
            <datalist id="bairros">
              {BAIRROS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </Campo>
          <Campo label="Endereço">
            <input
              required
              className={inputCls}
              value={form.endereco}
              onChange={(e) => campo('endereco', e.target.value)}
            />
          </Campo>
        </div>

        <div className="mt-4">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">
            Localização no mapa
          </span>
          <LocationPicker
            enderecoSugerido={form.endereco}
            cidade={form.cidade}
            lat={form.lat}
            lng={form.lng}
            onSelecionar={(lat, lng) => setForm((atual) => ({ ...atual, lat, lng }))}
          />
          <label className="mt-3 flex items-center gap-2 text-[13.5px] text-ink2">
            <input
              type="checkbox"
              checked={form.localizacao_aproximada}
              onChange={(e) => campo('localizacao_aproximada', e.target.checked)}
            />
            Mostrar só localização aproximada no site (raio, sem pino exato)
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[14px] font-semibold text-ink">Características físicas</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Campo label="Quartos">
            <input
              required
              type="number"
              min={0}
              className={inputCls}
              value={form.quartos}
              onChange={(e) => campo('quartos', e.target.value)}
            />
          </Campo>
          <Campo label="Suítes">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.suites}
              onChange={(e) => campo('suites', e.target.value)}
            />
          </Campo>
          <Campo label="Banheiros">
            <input
              required
              type="number"
              min={0}
              className={inputCls}
              value={form.banheiros}
              onChange={(e) => campo('banheiros', e.target.value)}
            />
          </Campo>
          <Campo label="Vagas">
            <input
              required
              type="number"
              min={0}
              className={inputCls}
              value={form.vagas}
              onChange={(e) => campo('vagas', e.target.value)}
            />
          </Campo>
          <Campo label="Área (m²)">
            <input
              required
              type="number"
              min={0}
              className={inputCls}
              value={form.area}
              onChange={(e) => campo('area', e.target.value)}
            />
          </Campo>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CARACTERISTICAS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => alternarCaracteristica(c)}
              className={cx(
                'rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                form.caracteristicas.includes(c)
                  ? 'border-ink bg-ink text-white'
                  : 'border-line bg-white text-ink2 hover:border-ink/30',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[14px] font-semibold text-ink">Contato e fotos</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="CRECI">
            <input className={inputCls} value={form.creci} onChange={(e) => campo('creci', e.target.value)} />
          </Campo>
          <Campo label="Telefone">
            <input
              className={inputCls}
              value={form.telefone}
              onChange={(e) => campo('telefone', e.target.value)}
            />
          </Campo>
          <Campo label="WhatsApp (só dígitos, com DDI+DDD)">
            <input
              className={inputCls}
              value={form.whatsapp}
              onChange={(e) => campo('whatsapp', e.target.value)}
            />
          </Campo>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">
              Fotos <span className="normal-case text-muted/80">(mínimo 3)</span>
            </span>
            <ImageUploader value={form.imagens} onChange={(imagens) => campo('imagens', imagens)} />
          </div>

          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">
              PDF (book do imóvel)
            </span>
            <PdfUploader value={form.imagens} onChange={(imagens) => campo('imagens', imagens)} />
            <p className="mt-2 text-[11.5px] text-muted">As páginas convertidas entram na lista de fotos.</p>
          </div>

          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">
              Vídeo
            </span>
            <VideoUploader value={form.video} onChange={(video) => campo('video', video)} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[14px] font-semibold text-ink">Destaques</h2>
        <div className="mt-4 flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-[13.5px] text-ink2">
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(e) => campo('destaque', e.target.checked)}
            />
            Destaque na home
          </label>
          <label className="flex items-center gap-2 text-[13.5px] text-ink2">
            <input
              type="checkbox"
              checked={form.na_chave}
              onChange={(e) => campo('na_chave', e.target.checked)}
            />
            Na chave (pronto p/ morar)
          </label>
          <label className="flex items-center gap-2 text-[13.5px] text-ink2">
            <input type="checkbox" checked={form.novo} onChange={(e) => campo('novo', e.target.checked)} />
            Marcar como novo
          </label>
        </div>
      </section>

      {erro && <p className="text-[13px] font-medium text-brandDeep">{erro}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="h-11 rounded-xl bg-ink px-6 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar imóvel'}
        </button>
      </div>
    </form>
  );
}
