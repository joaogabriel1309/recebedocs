// Classes compartilhadas para manter botões, cartões e campos consistentes.

const foco =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

const baseBotao = `inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${foco}`;

export const estilos = {
  foco,
  botaoPrimario: `${baseBotao} bg-blue-700 px-4 py-2.5 text-white shadow-sm hover:bg-blue-800 disabled:hover:bg-blue-700`,
  botaoSecundario: `${baseBotao} border border-zinc-300 bg-white px-3 py-2 text-zinc-800 shadow-xs hover:bg-zinc-50 hover:text-zinc-950`,
  botaoSucesso: `${baseBotao} bg-green-700 px-3 py-2 text-white shadow-sm hover:bg-green-800 disabled:hover:bg-green-700`,
  cartao: 'rounded-2xl border border-zinc-200 bg-white shadow-sm',
  campo:
    'block w-full rounded-lg border border-zinc-400 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-xs transition-colors placeholder:text-zinc-500 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-600/20 aria-[invalid=true]:border-red-600 aria-[invalid=true]:focus:ring-red-600/20 sm:text-sm',
  rotulo: 'mb-1.5 block text-sm font-medium text-zinc-800',
};
