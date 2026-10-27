import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-100 px-4 py-12 text-zinc-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold">RecebeDocs</h1>

        <p className="mt-2 text-zinc-600">
          Entre para acessar seus documentos.
        </p>
      </div>

      <LoginForm />
    </main>
  );
}