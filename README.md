# RecebeDocs

Projeto de estudo para receber e organizar documentos em PDF.

## Tecnologias

- Back-end: NestJS e TypeScript
- Front-end: Next.js e TypeScript

## Estrutura

- `backend/`: API e armazenamento dos documentos.
- `frontend/`: interface para envio e consulta.

## Como executar

É necessário ter Node.js, npm e Docker instalados, além de um bucket
Cloudflare R2 (ou outro serviço compatível com S3).

### Back-end

Na raiz do projeto:

```powershell
cd backend
copy .env.example .env   # preencha os valores
npm install
docker compose up -d     # PostgreSQL local
npx prisma migrate deploy --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
npm run start:dev
```

A API estará disponível em http://localhost:3000.

### Front-end

Em outro terminal, começando na raiz do projeto:

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev -- --port 3001
```

A interface estará disponível em http://localhost:3001.

## Funcionalidades previstas

- Enviar documentos em PDF.
- Listar os documentos recebidos.
- Abrir e baixar documentos.
- Buscar documentos por título.