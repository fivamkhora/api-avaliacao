# 📚 API Avaliação Escolar

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?logo=jest&logoColor=white)

Microserviço responsável pelo gerenciamento de avaliações escolares do projeto **Khora**, desenvolvido com **Node.js**, **Express.js**, **Prisma ORM** e **PostgreSQL**.

A API permite criar avaliações, cadastrar questões, registrar respostas dos alunos, controlar submissões, realizar correção automática e manual e calcular automaticamente a nota final das avaliações.

---

# 📑 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Regras de Negócio](#-regras-de-negócio)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Executando o Projeto](#-executando-o-projeto)
- [Documentação Swagger](#-documentação-swagger)
- [Endpoints](#-endpoints)
- [Testes](#-testes)
- [Docker](#-docker)
- [Roadmap](#-roadmap)

---

# 🚀 Sobre o Projeto

Este microserviço faz parte do projeto **Khora**, uma plataforma voltada ao gerenciamento de avaliações escolares.

Sua responsabilidade é controlar todo o ciclo de uma avaliação, desde sua criação até a correção das respostas dos alunos.

Entre suas funcionalidades estão:

- Cadastro de avaliações;
- Cadastro de questões;
- Controle das submissões dos alunos;
- Correção automática de questões objetivas;
- Correção manual de questões discursivas;
- Cálculo automático da nota final.

---

# 🛠 Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| Node.js | Ambiente de execução |
| Express.js | Framework para API REST |
| Prisma ORM | ORM para acesso ao banco |
| PostgreSQL | Banco de dados |
| Swagger/OpenAPI | Documentação da API |
| Jest | Testes automatizados |
| Supertest | Testes de integração |
| Docker | Containerização |

---

# 🏗 Arquitetura

```text
Professor
     │
     ▼
Cria Avaliação
     │
     ▼
Adiciona Questões
     │
     ▼
Aluno inicia Submissão
     │
     ▼
Aluno responde Questões
     │
     ▼
Correção Automática
     │
     ▼
Correção Manual (ESSAY)
     │
     ▼
Nota Final da Avaliação
```

---

# 📦 Funcionalidades

## ✅ Health Check

Permite verificar se a API está disponível.

Endpoint:

```
GET /healthcheck
```

---

## ✅ Exams

Gerenciamento das avaliações.

### Funcionalidades

- Criar avaliação
- Listar avaliações
- Buscar avaliação por ID
- Atualizar avaliação
- Excluir avaliação

### Status disponíveis

- DRAFT
- PUBLISHED
- CLOSED

---

## ✅ Questions

Gerenciamento das questões das avaliações.

### Tipos suportados

- MULTIPLE_CHOICE
- TRUE_FALSE
- ESSAY

### Funcionalidades

- Criar questão
- Listar questões
- Buscar questão por ID
- Atualizar questão
- Excluir questão

---

## ✅ Submissions

Gerenciamento das submissões realizadas pelos alunos.

### Funcionalidades

- Criar submissão
- Buscar submissões
- Atualizar submissão
- Excluir submissão

### Fluxo de Estados

```text
NOT_STARTED
      │
      ▼
IN_PROGRESS
      │
      ▼
SUBMITTED
      │
      ▼
CORRECTED
```

A API valida todas as transições de estado para impedir alterações inválidas.

---

## ✅ Answers

Gerenciamento das respostas enviadas pelos alunos.

### Funcionalidades

- Criar resposta
- Buscar respostas
- Atualizar resposta
- Excluir resposta

---

# 🤖 Correção Automática

As questões abaixo são corrigidas automaticamente:

- MULTIPLE_CHOICE
- TRUE_FALSE

Ao responder uma questão objetiva, a API:

- verifica a resposta enviada;
- calcula automaticamente a pontuação;
- define o campo `isCorrect`;
- gera feedback automático;
- recalcula a nota total da submissão.

---

# ✍ Correção Manual

Questões do tipo **ESSAY** permitem correção manual.

Durante a correção podem ser informados:

- score
- feedback
- isCorrect

Após a correção, o sistema recalcula automaticamente a nota final da submissão.

---

# 🔒 Regras de Negócio

## Submissions

- Fluxo de estados controlado.
- Não permite transições inválidas.
- Não permite retornar para estados anteriores.
- Submissões finalizadas possuem restrições de alteração.

## Answers

- Questões objetivas são corrigidas automaticamente.
- Apenas questões do tipo ESSAY permitem correção manual.
- Não permite nota negativa.
- Não permite nota acima da pontuação da questão.
- Não permite editar a resposta e realizar correção manual na mesma requisição.
- Atualiza automaticamente a nota da submissão após a correção.

---

# 📂 Estrutura do Projeto

```text
src/
├── config/
├── controllers/
├── middlewares/
├── repositories/
├── routes/
├── services/
├── swagger/
├── utils/
├── app.js
└── server.js

tests/
docker/
```

---

# ⚙ Instalação

## Pré-requisitos

- Node.js 22+
- npm
- PostgreSQL
- Docker (opcional)

Instale as dependências:

```bash
npm install
```

---

# 🔑 Variáveis de Ambiente

Crie um arquivo `.env`.

Exemplo:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/api_avaliacao
PORT=3000
```

Caso existam outras variáveis no projeto (JWT, Prisma etc.), configure conforme necessário.

---

# ▶ Executando o Projeto

Modo desenvolvimento

```bash
npm run dev
```

Modo produção

```bash
npm start
```

---

# 📖 Documentação Swagger

Após iniciar a aplicação:

```
http://localhost:3000/docs
```

Health Check

```
GET /healthcheck
```

---

# 📌 Endpoints

## Exams

| Método | Endpoint | Descrição |
|---------|----------|-----------|
| GET | /exams | Lista todas as avaliações |
| POST | /exams | Cria uma nova avaliação |
| GET | /exams/upcoming?classroomId={classroomId} | Lista as próximas avaliações publicadas de uma turma |
| GET | /exams/{id} | Busca uma avaliação pelo ID |
| PUT | /exams/{id} | Atualiza parcialmente uma avaliação |
| DELETE | /exams/{id} | Remove uma avaliação |

### Exemplo

```http
GET /exams/upcoming?classroomId=turma-01
```

Esse endpoint retorna apenas avaliações:

- com status `PUBLISHED`;
- pertencentes à turma informada;
- cuja data `availableAt` ainda não foi alcançada.
---

## Questions

| Método | Endpoint |
|---------|----------|
| GET | /questions |
| POST | /questions |
| GET | /questions/{id} |
| PUT | /questions/{id} |
| DELETE | /questions/{id} |

---

## Submissions

| Método | Endpoint |
|---------|----------|
| GET | /submissions |
| POST | /submissions |
| GET | /submissions/{id} |
| PUT | /submissions/{id} |
| DELETE | /submissions/{id} |

---

## Answers

| Método | Endpoint |
|---------|----------|
| GET | /answers |
| POST | /answers |
| GET | /answers/{id} |
| PUT | /answers/{id} |
| DELETE | /answers/{id} |

---

# 🧪 Testes

Executar todos os testes:

```bash
npm test
```

Para validar o frontend publicado na Vercel:

```bash
FRONTEND_URL=https://seu-front.vercel.app npm test
```

Caso a variável `FRONTEND_URL` não exista, esse teste será ignorado.

---

# 🐳 Docker

Build da imagem

```bash
npm run docker:build
```

Executar o container

```bash
npm run docker:run
```

Após iniciar:

```
http://localhost:3000/healthcheck
```

```
http://localhost:3000/docs
```

---

# 📈 Roadmap

Possíveis evoluções futuras:

- Autenticação JWT
- Controle de permissões (RBAC)
- Histórico de correções
- Dashboard de desempenho
- Relatórios estatísticos
- Cobertura de testes ampliada
- Pipeline CI/CD

---

# Referencia da API

Todas as rotas usam JSON. Criacoes retornam `201`; consultas e atualizacoes
retornam `200`. Erros de validacao retornam `400`, registros inexistentes
retornam `404` e conflitos de regra de negocio retornam `409`. Os erros usam o
campo `error`, exceto as rotas de `/answers`, que usam `message`.

Em ambientes com proxy reverso e SSL offloading, a API confia no primeiro
proxy. A interface Swagger usa o mesmo host e protocolo da pagina aberta;
assim, ao acessar `https://api.exemplo.com/docs`, os comandos gerados usam
`https://api.exemplo.com` em vez de `http://localhost:3000`.

| Metodo | Rota | Finalidade | Filtros de consulta |
|--------|-------|---------|---------------|
| GET | `/healthcheck` | Disponibilidade do servico | - |
| GET | `/docs` | Interface Swagger | - |
| POST | `/exams` | Cria uma avaliacao | - |
| POST | `/exams/import/api-ia/:assessmentId` | Importa avaliacao e questoes da API-IA | - |
| GET | `/exams/import/api-ia` | Lista avaliacoes importadas da API-IA | `classroomId`, `teacherId`, `status` |
| GET | `/exams` | Lista avaliacoes | `classroomId`, `teacherId`, `status` |
| GET | `/exams/upcoming` | Avaliacoes publicadas futuras | `classroomId` obrigatorio |
| GET, PUT, DELETE | `/exams/:id` | Consulta, atualiza ou remove uma avaliacao | - |
| POST | `/questions` | Cria uma questao | - |
| GET | `/questions` | Lista questoes | `examId`, `type` |
| GET, PUT, DELETE | `/questions/:id` | Consulta, atualiza ou remove uma questao | - |
| POST | `/submissions` | Cria uma submissao | - |
| GET | `/submissions` | Lista submissoes | `examId`, `studentId`, `status` |
| GET, PUT, DELETE | `/submissions/:id` | Consulta, atualiza ou remove uma submissao | - |
| POST | `/answers` | Cria uma resposta | - |
| GET | `/answers` | Lista respostas | `submissionId`, `questionId` |
| GET, PUT, DELETE | `/answers/:id` | Consulta, atualiza ou remove uma resposta | - |

## Avaliacoes

`POST /exams` exige `title`, `description`, `classroomId`, `teacherId`,
`availableAt` e `deadlineAt`. As datas devem ser validas e `deadlineAt` deve
ser posterior a `availableAt`. `PUT /exams/:id` aceita atualizacao parcial,
incluindo `status` (`DRAFT`, `PUBLISHED`, `CLOSED` ou `CORRECTED`) e `timeLimit`.

```json
{
  "title": "Avaliacao de Matematica",
  "description": "Conteudo do primeiro semestre",
  "classroomId": "classroom-01",
  "teacherId": "teacher-01",
  "availableAt": "2026-08-01T13:00:00.000Z",
  "deadlineAt": "2026-08-01T14:30:00.000Z",
  "timeLimit": 90
}
```

Para importar uma avaliacao gerada pela API-IA, envie `classroomId` e
`teacherId`. A URL da API-IA pode ser configurada com
`API_IA_ASSESSMENTS_URL`; sem essa variavel, a API usa o endpoint publico da
API-IA. A importacao cria ou atualiza o exame e suas questoes pelo
`assessmentId`, incluindo alternativas, gabarito e rubrica.

Antes de publicar esta versao, aplique a migration que adiciona os campos de
importacao:

```bash
npm run prisma:migrate:deploy
```

A imagem Docker executa esse comando antes de iniciar a API.

Para listar somente as avaliacoes que foram importadas:

```http
GET /exams/import/api-ia?classroomId=turma-01
```

```http
POST /exams/import/api-ia/767a2807-f5d8-4e97-aca3-273920ac3d75
Content-Type: application/json

{
  "classroomId": "turma-01",
  "teacherId": "professor-01"
}
```

## Questoes

`POST /questions` exige `examId`, `statement` e `position`. Os tipos validos
sao `MULTIPLE_CHOICE`, `TRUE_FALSE` e `ESSAY`. Questoes objetivas exigem ao
menos duas alternativas com `key` e `text`, e um `correctAnswer` correspondente
a uma dessas chaves. A combinacao de `examId` e `position` e unica.

```json
{
  "examId": "exam-uuid",
  "statement": "Quanto e 2 + 2?",
  "type": "MULTIPLE_CHOICE",
  "options": [
    { "key": "A", "text": "3" },
    { "key": "B", "text": "4" }
  ],
  "correctAnswer": "B",
  "points": 1,
  "position": 1
}
```

Para `ESSAY`, omita `options`; `correctAnswer` e opcional. `points` deve ser
maior que zero.

## Submissoes

`POST /submissions` exige `examId` e `studentId` e cria o registro com status
`NOT_STARTED`. Um aluno pode ter apenas uma submissao por avaliacao.
`PUT /submissions/:id` aceita `examId`, `studentId`, `status`, `startedAt`,
`submittedAt` e `score`.

| Status atual | Proximos status permitidos |
|----------------|-----------------------|
| `NOT_STARTED` | `NOT_STARTED`, `IN_PROGRESS`, `SUBMITTED` |
| `IN_PROGRESS` | `IN_PROGRESS`, `SUBMITTED` |
| `SUBMITTED` | `SUBMITTED`, `IN_PROGRESS`, `CORRECTED` |
| `CORRECTED` | `CORRECTED` |

Ao entrar em `IN_PROGRESS` ou `SUBMITTED`, o servico preenche datas ausentes e
recalcula a nota a partir das respostas existentes. Uma submissao so pode ser
marcada como `CORRECTED` depois de enviada.

## Respostas e correcao

`POST /answers` exige `submissionId` e `questionId`. Questoes `ESSAY` exigem
`content`; questoes objetivas exigem `selectedOption`. A avaliacao deve estar
publicada, dentro da janela de disponibilidade, e a submissao nao pode estar
finalizada.

```json
{
  "submissionId": "submission-uuid",
  "questionId": "question-uuid",
  "selectedOption": "B"
}
```

Respostas objetivas sao corrigidas automaticamente e recalculam a nota da
submissao. Para `ESSAY`, `PUT /answers/:id` aceita `score`, `feedback` e
`isCorrect` somente depois que a submissao estiver `SUBMITTED` ou `CORRECTED`.
A nota manual deve estar entre zero e a pontuacao da questao. Nao e permitido
editar `content` e corrigir manualmente na mesma requisicao.

---

# 👥 Projeto

Este microserviço integra o projeto acadêmico **Khora**, desenvolvido na **FIAP**, sendo responsável pelo gerenciamento do processo de avaliações escolares.
