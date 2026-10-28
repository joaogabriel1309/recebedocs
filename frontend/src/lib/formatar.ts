const numero = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});

// Datas exibidas no horário de Brasília, independente do fuso do servidor.
const dataHora = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} ${bytes === 1 ? 'byte' : 'bytes'}`;
  }

  if (bytes < 1024 * 1024) {
    return `${numero.format(bytes / 1024)} KB`;
  }

  return `${numero.format(bytes / (1024 * 1024))} MB`;
}

export function formatarData(iso: string): string {
  const data = new Date(iso);

  return Number.isNaN(data.getTime()) ? '' : dataHora.format(data);
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) {
    return '?';
  }

  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';

  return `${primeira}${ultima}`.toUpperCase();
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] || nome;
}
