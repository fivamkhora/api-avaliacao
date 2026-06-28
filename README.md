# api-avaliacao

Prototipo de microservico para avaliacao escolar usando Node.js, Express, Swagger, Jest e Supertest.

## Requisitos

- Node.js 22+
- npm
- Docker, opcional para executar como imagem

## Instalar dependencias

```bash
npm install
```

## Executar localmente

```bash
npm run dev
```

Ou:

```bash
npm start
```

Endpoints iniciais:

- `GET /healthcheck`: status operacional do servico
- `GET /docs`: documentacao Swagger

## Testes

```bash
npm test
```

Para validar o frontend Next.js publicado na Vercel, informe a URL pelo ambiente:

```bash
FRONTEND_URL=https://seu-front.vercel.app npm test
```

No GitHub Actions, configure a variable `FRONTEND_URL` com a URL do frontend. Se a variavel nao existir, esse teste sera ignorado.

## Docker

Build da imagem:

```bash
npm run docker:build
```

O Dockerfile fica em `docker/Dockerfile` e usa a imagem base `node:22-alpine`.

Executar o container:

```bash
npm run docker:run
```

Depois acesse:

- `http://localhost:3000/healthcheck`
- `http://localhost:3000/docs`
