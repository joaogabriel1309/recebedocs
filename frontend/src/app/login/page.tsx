import Logo from '@/components/ui/logo';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-linear-to-b from-blue-50 via-zinc-50 to-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo tamanho="grande" />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Entrar na sua conta
          </h1>

          <p className="mt-1 text-sm text-zinc-600">
            Entre para acessar seus documentos.
          </p>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
