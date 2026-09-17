'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Campo, inputCls } from '@/components/ui';

export default function CorretorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resposta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        setErro(dados.detail ?? 'E-mail ou senha inválidos.');
        return;
      }

      router.push('/corretor');
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-5">
      <div className="w-full max-w-[380px] rounded-2xl border border-line bg-white p-7 shadow-float">
        <h1 className="font-display text-[24px] font-[440] tracking-[-0.015em] text-ink">Área do corretor</h1>
        <p className="mt-1 text-[13.5px] text-muted">Entre com sua conta para gerenciar seus imóveis.</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
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

          <Campo label="Senha" htmlFor="senha">
            <input
              id="senha"
              type="password"
              required
              autoComplete="current-password"
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
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-5 text-center text-[13.5px] text-ink2">
          Ainda não tem conta?{' '}
          <Link href="/corretor/cadastro" className="font-semibold text-brand hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
