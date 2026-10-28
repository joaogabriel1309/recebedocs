'use client';

import { useActionState, useState } from 'react';
import { entrar } from '@/app/actions/auth';
import { estilos } from '@/components/ui/estilos';
import {
  IconeAlerta,
  IconeOlho,
  IconeOlhoFechado,
} from '@/components/ui/icones';

export default function LoginForm() {
  const [estado, acao, pendente] = useActionState(entrar, {
    erro: '',
  });
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <form action={acao} className="mt-6 space-y-5">
      <div>
        <label htmlFor="email" className={estilos.rotulo}>
          E-mail
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="voce@exemplo.com"
          maxLength={254}
          required
          aria-invalid={Boolean(estado.erro)}
          aria-describedby={estado.erro ? 'erro-login' : undefined}
          className={estilos.campo}
        />
      </div>

      <div>
        <label htmlFor="senha" className={estilos.rotulo}>
          Senha
        </label>

        <div className="relative">
          <input
            id="senha"
            name="senha"
            type={senhaVisivel ? 'text' : 'password'}
            autoComplete="current-password"
            maxLength={128}
            required
            aria-invalid={Boolean(estado.erro)}
            aria-describedby={estado.erro ? 'erro-login' : undefined}
            className={`${estilos.campo} pr-11`}
          />

          <button
            type="button"
            onClick={() => setSenhaVisivel((visivel) => !visivel)}
            aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={senhaVisivel}
            aria-controls="senha"
            className={`absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-zinc-500 hover:text-zinc-800 ${estilos.foco}`}
          >
            {senhaVisivel ? <IconeOlhoFechado /> : <IconeOlho />}
          </button>
        </div>
      </div>

      {estado.erro && (
        <p
          id="erro-login"
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
        >
          <IconeAlerta className="mt-px size-4 shrink-0" />
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className={`${estilos.botaoPrimario} w-full`}
      >
        {pendente ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
