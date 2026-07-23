module.exports = {
  openapi: '3.0.3',

  info: {
    title: 'API Avaliação Escolar',
    version: '0.1.0',
    description: 'Protótipo de microserviço para avaliação escolar.',
  },

  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Ambiente Local',
    },
  ],

  tags: [
    {
      name: 'Health',
      description: 'Status operacional da API',
    },
    {
      name: 'Exams',
      description: 'Gerenciamento de avaliações',
    },
    {
      name: 'Questions',
      description: 'Gerenciamento de questões das avaliações',
    },
    {
      name: 'Submissions',
      description: 'Gerenciamento das submissões das avaliações',
    },
    {
      name: 'Answers',
      description: 'Gerenciamento das respostas dos alunos',
    },

  ],
  paths: {
    '/healthcheck': {
      get: {
        tags: ['Health'],
        summary: 'Verifica se a API está ativa',
        operationId: 'getHealthcheck',

        responses: {
          200: {
            description: 'Serviço ativo.',
          },
        },
      },
    },

    '/exams': {
      get: {
        tags: ['Exams'],
        summary: 'Lista todas as avaliações',

        parameters: [
          {
            name: 'classroomId',
            in: 'query',
            required: false,
            description: 'Filtra as avaliações pelo ID da turma.',
            schema: {
              type: 'string',
            },
          },
          {
            name: 'teacherId',
            in: 'query',
            required: false,
            description: 'Filtra as avaliações pelo ID do professor.',
            schema: {
              type: 'string',
            },
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            description: 'Filtra as avaliações pelo status.',
            schema: {
              type: 'string',
              enum: [
                'DRAFT',
                'PUBLISHED',
                'CLOSED',
                'CORRECTED',
              ],
            },
          },
        ],

        responses: {
          200: {
            description: 'Lista de avaliações.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Exam',
                  },
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },

      post: {
        tags: ['Exams'],
        summary: 'Cria uma nova avaliação',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateExam',
              },
            },
          },
        },

        responses: {
          201: {
            description: 'Avaliação criada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Exam',
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },
    },

   '/exams/upcoming': {
      get: {
        tags: ['Exams'],
        summary: 'Lista as próximas avaliações',
        description:
          'Retorna as avaliações publicadas que ainda não iniciaram para uma turma específica.',

        parameters: [
          {
            name: 'classroomId',
            in: 'query',
            required: true,
            description: 'ID da turma.',
            schema: {
              type: 'string',
            },
          },
        ],

        responses: {
          200: {
            description: 'Próximas avaliações encontradas com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example:
                        'Proximas avaliacoes encontradas com sucesso.',
                    },
                    total: {
                      type: 'integer',
                      example: 2,
                    },
                    exams: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Exam',
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'O classroomId deve ser informado.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },
    },

    '/exams/{id}': {
      get: {
        tags: ['Exams'],
        summary: 'Busca uma avaliação pelo ID',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        responses: {
          200: {
            description: 'Avaliação encontrada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Exam',
                },
              },
            },
          },
          404: {
            description: 'Avaliação não encontrada.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },

      put: {
        tags: ['Exams'],
        summary: 'Atualiza parcialmente uma avaliação',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateExam',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'Avaliação atualizada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Exam',
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos.',
          },
          404: {
            description: 'Avaliação não encontrada.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },

      delete: {
        tags: ['Exams'],
        summary: 'Remove uma avaliação',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        responses: {
          200: {
            description: 'Avaliação removida.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessMessage',
                },
              },
            },
          },
          404: {
            description: 'Avaliação não encontrada.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },
    },

    '/exams/{id}/submissions': {
      get: {
        tags: ['Exams', 'Submissions'],
        summary: 'Lista as submissoes de uma avaliacao',
        description:
          'Retorna somente as submissoes vinculadas a avaliacao, sem calcular media, ranking ou estatisticas.',
        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],
        responses: {
          200: {
            description: 'Submissoes encontradas com sucesso.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ExamSubmissionsResponse',
                },
                example: {
                  total: 2,
                  submissions: [
                    {
                      id: '27238202-edc5-4866-8970-a01997cf0364',
                      studentId: 'student-001',
                      score: 8.5,
                      status: 'CORRECTED',
                      submittedAt: '2026-07-23T14:30:00.000Z',
                    },
                    {
                      id: '3da43d93-da82-4a3a-a9dd-188201d46e81',
                      studentId: 'student-002',
                      score: null,
                      status: 'IN_PROGRESS',
                      submittedAt: null,
                    },
                  ],
                },
              },
            },
          },
          404: {
            description: 'Avaliacao nao encontrada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  error: 'Avaliacao nao encontrada.',
                },
              },
            },
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    '/questions': {
      get: {
        tags: ['Questions'],
        summary: 'Lista todas as questões',

        parameters: [
          {
            name: 'examId',
            in: 'query',
            required: false,
            description: 'Filtra as questões pelo ID da avaliação.',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'type',
            in: 'query',
            required: false,
            description: 'Filtra as questões pelo tipo.',
            schema: {
              type: 'string',
              enum: [
                'MULTIPLE_CHOICE',
                'TRUE_FALSE',
                'ESSAY',
              ],
            },
          },
        ],

        responses: {
          200: {
            description: 'Lista de questões.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Question',
                  },
                },
              },
            },
          },
          400: {
            description: 'Filtro inválido.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },

      post: {
        tags: ['Questions'],
        summary: 'Cria uma nova questão',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateQuestion',
              },
            },
          },
        },

        responses: {
          201: {
            description: 'Questão criada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Question',
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos.',
          },
          404: {
            description: 'Avaliação não encontrada.',
          },
          409: {
            description:
              'Já existe uma questão nessa posição para a avaliação.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },
    },

    '/questions/{id}': {
      get: {
        tags: ['Questions'],
        summary: 'Busca uma questão pelo ID',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        responses: {
          200: {
            description: 'Questão encontrada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Question',
                },
              },
            },
          },
          404: {
            description: 'Questão não encontrada.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },

      put: {
        tags: ['Questions'],
        summary: 'Atualiza parcialmente uma questão',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateQuestion',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'Questão atualizada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Question',
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos.',
          },
          404: {
            description: 'Questão ou avaliação não encontrada.',
          },
          409: {
            description:
              'Já existe uma questão nessa posição para a avaliação.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },

      delete: {
        tags: ['Questions'],
        summary: 'Remove uma questão',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        responses: {
          200: {
            description: 'Questão removida.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessMessage',
                },
              },
            },
          },
          404: {
            description: 'Questão não encontrada.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },
    },
    '/submissions': {
      get: {
        tags: ['Submissions'],
        summary: 'Lista todas as submissões',

        parameters: [
          {
            name: 'examId',
            in: 'query',
            required: false,
            description: 'Filtra as submissões pelo ID da avaliação.',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'studentId',
            in: 'query',
            required: false,
            description: 'Filtra as submissões pelo ID do aluno.',
            schema: {
              type: 'string',
            },
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            description: 'Filtra as submissões pelo status.',
            schema: {
              $ref: '#/components/schemas/SubmissionStatus',
            },
          },
        ],

        responses: {
          200: {
            description: 'Lista de submissões.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Submission',
                  },
                },
              },
            },
          },
          400: {
            description: 'Filtro inválido.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },

      post: {
        tags: ['Submissions'],
        summary: 'Cria uma nova submissão',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateSubmission',
              },
              example: {
                examId: 'f83b696f-125d-421b-bc6f-3f9c553b3bcc',
                studentId: 'student-001',
              },
            },
          },
        },

        responses: {
          201: {
            description: 'Submissão criada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Submission',
                },
                example: {
                  id: '27238202-edc5-4866-8970-a01997cf0364',
                  examId: 'f83b696f-125d-421b-bc6f-3f9c553b3bcc',
                  studentId: 'student-001',
                  status: 'IN_PROGRESS',
                  score: null,
                  startedAt: '2026-07-23T14:00:00.000Z',
                  submittedAt: null,
                  createdAt: '2026-07-23T14:00:00.000Z',
                  updatedAt: '2026-07-23T14:00:00.000Z',
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  error: 'examId e studentId sao obrigatorios.',
                },
              },
            },
          },
          403: {
            description:
              'Avaliação não publicada, indisponível ou com prazo encerrado.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  error: 'A avaliacao ainda nao esta disponivel.',
                },
              },
            },
          },
          404: {
            description: 'Avaliação não encontrada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  error: 'Avaliacao nao encontrada.',
                },
              },
            },
          },
          409: {
            description:
              'O aluno já possui uma submissão para esta avaliação.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  error:
                    'Este aluno ja finalizou uma submissao para esta avaliacao.',
                },
              },
            },
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    '/submissions/{id}/submit': {
      post: {
        tags: ['Submissions'],
        summary: 'Envia uma avaliacao para correcao',
        description:
          'Valida e salva todas as respostas em uma transacao, executa a correcao automatica e impede reenvios.',
        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SubmitSubmissionRequest',
              },
              examples: {
                objectiveAnswers: {
                  summary: 'Respostas objetivas',
                  value: {
                    answers: [
                      {
                        questionId:
                          '94601518-e544-466e-a8a5-f3fc22412cb2',
                        answer: 'A',
                      },
                      {
                        questionId:
                          '4727aaf5-dfc3-481f-a234-e344f9381108',
                        answer: 'TRUE',
                      },
                    ],
                  },
                },
                withBlankAnswer: {
                  summary: 'Resposta em branco',
                  value: {
                    answers: [
                      {
                        questionId:
                          '94601518-e544-466e-a8a5-f3fc22412cb2',
                        answer: '',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description:
              'Submission enviada e correcao automatica executada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SubmitSubmissionResponse',
                },
                example: {
                  id: '27238202-edc5-4866-8970-a01997cf0364',
                  examId: 'f83b696f-125d-421b-bc6f-3f9c553b3bcc',
                  studentId: 'student-001',
                  status: 'CORRECTED',
                  score: 8,
                  startedAt: '2026-07-23T14:00:00.000Z',
                  submittedAt: '2026-07-23T14:30:00.000Z',
                  automaticCorrection: {
                    correct: 8,
                    incorrect: 1,
                    blank: 1,
                  },
                },
              },
            },
          },
          400: {
            description:
              'Payload invalido, questao duplicada ou questao de outra avaliacao.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                examples: {
                  invalidPayload: {
                    value: {
                      error: 'O campo answers deve ser uma lista.',
                    },
                  },
                  duplicatedQuestion: {
                    value: {
                      error:
                        'Nao e permitido enviar respostas duplicadas para a mesma questao.',
                    },
                  },
                  foreignQuestion: {
                    value: {
                      error:
                        'A questao informada nao pertence a avaliacao desta submissao.',
                    },
                  },
                },
              },
            },
          },
          403: {
            description:
              'Avaliacao indisponivel ou com prazo encerrado.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  error:
                    'O prazo para iniciar a avaliacao foi encerrado.',
                },
              },
            },
          },
          404: {
            description: 'Submission ou questao nao encontrada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  error: 'Submissao nao encontrada.',
                },
              },
            },
          },
          409: {
            description:
              'Submission ja enviada ou fora do estado IN_PROGRESS.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  error: 'Esta submissao ja foi enviada.',
                },
              },
            },
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    '/submissions/{id}/result': {
      get: {
        tags: ['Submissions'],
        summary: 'Consulta o resultado de uma Submission',
        description:
          'Retorna os totais e a nota final sem expor questoes, respostas ou gabaritos.',
        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],
        responses: {
          200: {
            description: 'Resultado encontrado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SubmissionResult',
                },
                example: {
                  submission:
                    '27238202-edc5-4866-8970-a01997cf0364',
                  examId:
                    'f83b696f-125d-421b-bc6f-3f9c553b3bcc',
                  studentId: 'student-001',
                  totalQuestions: 10,
                  answeredQuestions: 9,
                  correctAnswers: 8,
                  wrongAnswers: 1,
                  blankAnswers: 1,
                  finalGrade: 8,
                  status: 'CORRECTED',
                },
              },
            },
          },
          400: {
            description: 'Identificador invalido.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  error:
                    'O submissionId deve ser informado corretamente.',
                },
              },
            },
          },
          404: {
            description: 'Submission nao encontrada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  error: 'Submissao nao encontrada.',
                },
              },
            },
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    '/submissions/{id}': {
      get: {
        tags: ['Submissions'],
        summary: 'Busca uma submissão pelo ID',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        responses: {
          200: {
            description: 'Submissão encontrada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Submission',
                },
              },
            },
          },
          404: {
            description: 'Submissão não encontrada.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },

      put: {
        tags: ['Submissions'],
        summary: 'Atualiza parcialmente uma submissão',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateSubmission',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'Submissão atualizada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Submission',
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos.',
          },
          404: {
            description: 'Submissão ou avaliação não encontrada.',
          },
          409: {
            description:
              'O aluno já possui uma submissão para esta avaliação.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },

      delete: {
        tags: ['Submissions'],
        summary: 'Remove uma submissão',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        responses: {
          200: {
            description: 'Submissão removida.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessMessage',
                },
              },
            },
          },
          404: {
            description: 'Submissão não encontrada.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },
    },
    '/answers': {
      get: {
        tags: ['Answers'],
        summary: 'Lista todas as respostas',

        parameters: [
          {
            name: 'submissionId',
            in: 'query',
            required: false,
            description: 'Filtra as respostas pela submissão.',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'questionId',
            in: 'query',
            required: false,
            description: 'Filtra as respostas pela questão.',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],

        responses: {
          200: {
            description: 'Lista de respostas.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Answer',
                  },
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },

      post: {
        tags: ['Answers'],
        summary: 'Cria uma nova resposta',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateAnswer',
              },
            },
          },
        },

        responses: {
          201: {
            description: 'Resposta criada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Answer',
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos.',
          },
          404: {
            description: 'Submissão ou questão não encontrada.',
          },
          409: {
            description: 'Já existe uma resposta para esta questão.',
          },
          500: {
            description: 'Erro interno do servidor.',
          },
        },
      },
    },

    '/answers/{id}': {
      get: {
        tags: ['Answers'],
        summary: 'Busca uma resposta pelo ID',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        responses: {
          200: {
            description: 'Resposta encontrada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Answer',
                },
              },
            },
          },
          404: {
            description: 'Resposta não encontrada.',
          },
        },
      },

      put: {
        tags: ['Answers'],
        summary: 'Atualiza uma resposta',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateAnswer',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'Resposta atualizada.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Answer',
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos.',
          },
          404: {
            description: 'Resposta não encontrada.',
          },
        },
      },

      delete: {
        tags: ['Answers'],
        summary: 'Remove uma resposta',

        parameters: [
          {
            $ref: '#/components/parameters/IdPathParameter',
          },
        ],

        responses: {
          200: {
            description: 'Resposta removida.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessMessage',
                },
              },
            },
          },
          404: {
            description: 'Resposta não encontrada.',
          },
        },
      },
    },
  },

  components: {
    responses: {
      InternalServerError: {
        description: 'Erro interno do servidor.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              error: 'Erro interno do servidor.',
            },
          },
        },
      },
    },

    parameters: {
      IdPathParameter: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Identificador do registro.',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    },

    schemas: {
      ExamStatus: {
        type: 'string',
        enum: [
          'DRAFT',
          'PUBLISHED',
          'CLOSED',
          'CORRECTED',
        ],
      },

      QuestionType: {
        type: 'string',
        enum: [
          'MULTIPLE_CHOICE',
          'TRUE_FALSE',
          'ESSAY',
        ],
      },

      Exam: {
        type: 'object',

        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
            nullable: true,
          },
          classroomId: {
            type: 'string',
          },
          teacherId: {
            type: 'string',
          },
          status: {
            $ref: '#/components/schemas/ExamStatus',
          },
          availableAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          deadlineAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          timeLimit: {
            type: 'integer',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },

      CreateExam: {
        type: 'object',

        required: [
          'title',
          'description',
          'classroomId',
          'teacherId',
          'availableAt',
          'deadlineAt',
        ],

        properties: {
          title: {
            type: 'string',
            example: 'Avaliação de Matemática',
          },
          description: {
            type: 'string',
            example: 'Prova do primeiro bimestre',
          },
          classroomId: {
            type: 'string',
            example: 'turma-123',
          },
          teacherId: {
            type: 'string',
            example: 'professor-456',
          },
          availableAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-07-20T08:00:00.000Z',
          },
          deadlineAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-07-25T23:59:59.000Z',
          },
          timeLimit: {
            type: 'integer',
            example: 90,
          },
        },
      },

      UpdateExam: {
        type: 'object',

        properties: {
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          classroomId: {
            type: 'string',
          },
          teacherId: {
            type: 'string',
          },
          availableAt: {
            type: 'string',
            format: 'date-time',
          },
          deadlineAt: {
            type: 'string',
            format: 'date-time',
          },
          status: {
            $ref: '#/components/schemas/ExamStatus',
          },
          timeLimit: {
            type: 'integer',
          },
        },
      },

      QuestionOption: {
        type: 'object',

        required: [
          'key',
          'text',
        ],

        properties: {
          key: {
            type: 'string',
            example: 'A',
          },
          text: {
            type: 'string',
            example: '4',
          },
        },
      },

      Question: {
        type: 'object',

        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          examId: {
            type: 'string',
            format: 'uuid',
          },
          statement: {
            type: 'string',
          },
          type: {
            $ref: '#/components/schemas/QuestionType',
          },
          options: {
            type: 'array',
            nullable: true,
            items: {
              $ref: '#/components/schemas/QuestionOption',
            },
          },
          correctAnswer: {
            type: 'string',
            nullable: true,
          },
          points: {
            type: 'string',
            example: '1.00',
            description:
              'Valor Decimal retornado pelo Prisma como string.',
          },
          position: {
            type: 'integer',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },

      CreateQuestion: {
        type: 'object',

        required: [
          'examId',
          'statement',
          'position',
        ],

        properties: {
          examId: {
            type: 'string',
            format: 'uuid',
            example: 'f83b696f-125d-421b-bc6f-3f9c553b3bcc',
          },
          statement: {
            type: 'string',
            example: 'Quanto é 2 + 2?',
          },
          type: {
            $ref: '#/components/schemas/QuestionType',
            default: 'MULTIPLE_CHOICE',
          },
          options: {
            type: 'array',
            nullable: true,
            items: {
              $ref: '#/components/schemas/QuestionOption',
            },
            example: [
              {
                key: 'A',
                text: '2',
              },
              {
                key: 'B',
                text: '3',
              },
              {
                key: 'C',
                text: '4',
              },
              {
                key: 'D',
                text: '5',
              },
            ],
          },
          correctAnswer: {
            type: 'string',
            nullable: true,
            example: 'C',
          },
          points: {
            type: 'number',
            format: 'double',
            minimum: 0.01,
            default: 1,
            example: 1,
          },
          position: {
            type: 'integer',
            minimum: 1,
            example: 1,
          },
        },
      },

      UpdateQuestion: {
        type: 'object',

        properties: {
          examId: {
            type: 'string',
            format: 'uuid',
          },
          statement: {
            type: 'string',
            example: 'Quanto é 3 + 3?',
          },
          type: {
            $ref: '#/components/schemas/QuestionType',
          },
          options: {
            type: 'array',
            nullable: true,
            items: {
              $ref: '#/components/schemas/QuestionOption',
            },
          },
          correctAnswer: {
            type: 'string',
            nullable: true,
            example: 'D',
          },
          points: {
            type: 'number',
            format: 'double',
            minimum: 0.01,
          },
          position: {
            type: 'integer',
            minimum: 1,
          },
        },
      },

      SubmissionStatus: {
        type: 'string',
        enum: [
          'NOT_STARTED',
          'IN_PROGRESS',
          'SUBMITTED',
          'CORRECTED',
        ],
      },

      Submission: {
        type: 'object',

        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          examId: {
            type: 'string',
            format: 'uuid',
          },
          studentId: {
            type: 'string',
          },
          status: {
            $ref: '#/components/schemas/SubmissionStatus',
          },
          score: {
            type: 'number',
            nullable: true,
          },
          startedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          submittedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },

      CreateSubmission: {
        type: 'object',

        required: [
          'examId',
          'studentId',
        ],

        properties: {
          examId: {
            type: 'string',
            format: 'uuid',
            example: 'f83b696f-125d-421b-bc6f-3f9c553b3bcc',
          },
          studentId: {
            type: 'string',
            example: 'student-001',
          },
        },
      },

      UpdateSubmission: {
        type: 'object',

        properties: {
          status: {
            $ref: '#/components/schemas/SubmissionStatus',
          },
          score: {
            type: 'number',
            nullable: true,
            example: 9.5,
          },
        },
      },

      Answer: {
        type: 'object',

        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          submissionId: {
            type: 'string',
            format: 'uuid',
          },
          questionId: {
            type: 'string',
            format: 'uuid',
          },
          content: {
            type: 'string',
            nullable: true,
            example: 'A Revolução Industrial teve início na Inglaterra.',
          },
          selectedOption: {
            type: 'string',
            nullable: true,
            example: 'C',
          },
          isCorrect: {
            type: 'boolean',
            nullable: true,
          },
          score: {
            type: 'number',
            nullable: true,
            example: 1,
          },
          feedback: {
            type: 'string',
            nullable: true,
            example: 'Resposta correta.',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },

      CreateAnswer: {
        type: 'object',

        required: [
          'submissionId',
          'questionId',
        ],

        properties: {
          submissionId: {
            type: 'string',
            format: 'uuid',
            example: '27238202-edc5-4866-8970-a01997cf0364',
          },
          questionId: {
            type: 'string',
            format: 'uuid',
            example: 'f83b696f-125d-421b-bc6f-3f9c553b3bcc',
          },
          content: {
            type: 'string',
            nullable: true,
            example: 'Minha resposta dissertativa.',
          },
          selectedOption: {
            type: 'string',
            nullable: true,
            example: 'A',
          },
        },
      },

      UpdateAnswer: {
        type: 'object',

        properties: {
          content: {
            type: 'string',
            nullable: true,
            example: 'Resposta atualizada.',
          },
          selectedOption: {
            type: 'string',
            nullable: true,
            example: 'B',
          },
        },
      },

      SubmitSubmissionAnswer: {
        type: 'object',
        required: [
          'questionId',
          'answer',
        ],
        properties: {
          questionId: {
            type: 'string',
            format: 'uuid',
            example: '94601518-e544-466e-a8a5-f3fc22412cb2',
          },
          answer: {
            type: 'string',
            description:
              'Alternativa da questao objetiva ou texto da questao dissertativa. Pode ser vazio.',
            example: 'A',
          },
        },
      },

      SubmitSubmissionRequest: {
        type: 'object',
        required: [
          'answers',
        ],
        properties: {
          answers: {
            type: 'array',
            description:
              'Respostas enviadas. Questoes omitidas sao registradas como respostas em branco.',
            items: {
              $ref: '#/components/schemas/SubmitSubmissionAnswer',
            },
          },
        },
      },

      AutomaticCorrection: {
        type: 'object',
        required: [
          'correct',
          'incorrect',
          'blank',
        ],
        properties: {
          correct: {
            type: 'integer',
            minimum: 0,
            example: 8,
          },
          incorrect: {
            type: 'integer',
            minimum: 0,
            example: 1,
          },
          blank: {
            type: 'integer',
            minimum: 0,
            example: 1,
          },
        },
      },

      SubmitSubmissionResponse: {
        allOf: [
          {
            $ref: '#/components/schemas/Submission',
          },
          {
            type: 'object',
            properties: {
              automaticCorrection: {
                $ref: '#/components/schemas/AutomaticCorrection',
              },
              answers: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Answer',
                },
              },
            },
          },
        ],
      },

      SubmissionResult: {
        type: 'object',
        required: [
          'submission',
          'examId',
          'studentId',
          'totalQuestions',
          'answeredQuestions',
          'correctAnswers',
          'wrongAnswers',
          'blankAnswers',
          'finalGrade',
          'status',
        ],
        properties: {
          submission: {
            type: 'string',
            format: 'uuid',
          },
          examId: {
            type: 'string',
            format: 'uuid',
          },
          studentId: {
            type: 'string',
          },
          totalQuestions: {
            type: 'integer',
            minimum: 0,
          },
          answeredQuestions: {
            type: 'integer',
            minimum: 0,
          },
          correctAnswers: {
            type: 'integer',
            minimum: 0,
          },
          wrongAnswers: {
            type: 'integer',
            minimum: 0,
          },
          blankAnswers: {
            type: 'integer',
            minimum: 0,
          },
          finalGrade: {
            type: 'number',
            nullable: true,
          },
          status: {
            $ref: '#/components/schemas/SubmissionStatus',
          },
        },
      },

      ExamSubmissionListItem: {
        type: 'object',
        required: [
          'id',
          'studentId',
          'score',
          'status',
          'submittedAt',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          studentId: {
            type: 'string',
          },
          score: {
            type: 'number',
            nullable: true,
          },
          status: {
            $ref: '#/components/schemas/SubmissionStatus',
          },
          submittedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },

      ExamSubmissionsResponse: {
        type: 'object',
        required: [
          'total',
          'submissions',
        ],
        properties: {
          total: {
            type: 'integer',
            minimum: 0,
          },
          submissions: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ExamSubmissionListItem',
            },
          },
        },
      },

      ErrorResponse: {
        type: 'object',
        required: [
          'error',
        ],
        properties: {
          error: {
            type: 'string',
            example: 'Dados invalidos.',
          },
        },
      },

      SuccessMessage: {
        type: 'object',

        properties: {
          message: {
            type: 'string',
            example: 'Operação realizada com sucesso.',
          },
        },
      },
    },
  },
};
