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
  },

  components: {
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