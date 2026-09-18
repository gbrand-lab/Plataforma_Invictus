'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Campo, inputCls } from '@/components/ui';
import { Logo } from '@/components/Logo';

export default function CorretorCadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resposta = await fetch('/api/auth/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone, senha }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        setErro(dados.detail ?? 'Não foi possível criar sua conta.');
        return;
      }

      router.push('/corretor');
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-5 py-10">
      <div className="w-full max-w-[420px] rounded-2xl border border-line bg-white p-7 shadow-float">
        <Logo className="mb-4" />
        <h1 className="font-display text-[24px] font-[440] tracking-[-0.015em] text-ink">
          Cadastre-se como corretor
        </h1>
        <p className="mt-1 text-[13.5px] text-muted">
          Crie sua conta para anunciar imóveis na vitrine da Invictus.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Campo label="Nome completo" htmlFor="nome">
            <input
              id="nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputCls}
            />
          </Campo>

          <Campo label="E-mail" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </Campo>

          <Campo label="Telefone / WhatsApp" htmlFor="telefone">
            <input
              id="telefone"
              required
              inputMode="tel"
              placeholder="(98) 99999-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className={inputCls}
            />
          </Campo>

          <Campo label="Senha" htmlFor="senha" hint="Mínimo de 10 caracteres.">
            <input
              id="senha"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={inputCls}
            />
          </Campo>

          {erro && <p className="text-[13px] font-medium text-brandDeep">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="mt-1 h-11 rounded-xl bg-ink text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {carregando ? 'Criando conta...' : 'Criar minha conta'}
          </button>
        </form>

        <p className="mt-5 text-center text-[13.5px] text-ink2">
          Já tem conta?{' '}
          <Link href="/corretor/login" className="font-semibold text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
