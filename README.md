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

# 👥 Projeto

Este microserviço integra o projeto acadêmico **Khora**, desenvolvido na **FIAP**, sendo responsável pelo gerenciamento do processo de avaliações escolares.