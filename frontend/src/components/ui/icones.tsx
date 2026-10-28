import type { SVGProps } from 'react';

type PropsIcone = SVGProps<SVGSVGElement>;

// Ícones decorativos: o significado sempre está no texto ao lado.
function Icone({ children, className = 'size-5', ...props }: PropsIcone) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconeDocumento(props: PropsIcone) {
  return (
    <Icone {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </Icone>
  );
}

export function IconeEnviar(props: PropsIcone) {
  return (
    <Icone {...props}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </Icone>
  );
}

export function IconeCheck(props: PropsIcone) {
  return (
    <Icone {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Icone>
  );
}

export function IconeRelogio(props: PropsIcone) {
  return (
    <Icone {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </Icone>
  );
}

export function IconeAbrir(props: PropsIcone) {
  return (
    <Icone {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </Icone>
  );
}

export function IconeSair(props: PropsIcone) {
  return (
    <Icone {...props}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 16l-4-4 4-4" />
      <path d="M6 12h10" />
    </Icone>
  );
}

export function IconeAlerta(props: PropsIcone) {
  return (
    <Icone {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5" />
      <path d="M12 16.25v.01" />
    </Icone>
  );
}

export function IconeFechar(props: PropsIcone) {
  return (
    <Icone {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icone>
  );
}

export function IconeOlho(props: PropsIcone) {
  return (
    <Icone {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icone>
  );
}

export function IconeOlhoFechado(props: PropsIcone) {
  return (
    <Icone {...props}>
      <path d="M4 4l16 16" />
      <path d="M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.7 3.4M6.5 7.6A16 16 0 0 0 2.5 12s3.5 6 9.5 6a9 9 0 0 0 4.3-1.1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Icone>
  );
}

export function IconeUsuarios(props: PropsIcone) {
  return (
    <Icone {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
    </Icone>
  );
}
