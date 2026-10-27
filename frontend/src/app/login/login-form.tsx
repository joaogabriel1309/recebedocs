'use client';

import { useActionState } from 'react';
import { entrar } from '@/app/actions/auth';

export default function LoginForm() {
  const [estado, acao, pendente] = useActionState(entrar, {
    erro: '',
  });

  return (
    <form
      action={acao}
      className="w-full max-w-md space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium"
        >
          E-mail
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          maxLength={254}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="senha"
          className="mb-2 block text-sm font-medium"
        >
          Senha
        </label>

        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          maxLength={128}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      {estado.erro && (
        <p role="alert" className="text-sm text-red-700">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="w-full rounded-lg bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {pendente ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}