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
        responses: {
          200: {
            description: 'Lista de avaliações.',
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
          },
          400: {
            description: 'Dados inválidos.',
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
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],

        responses: {
          200: {
            description: 'Avaliação encontrada.',
          },
          404: {
            description: 'Avaliação não encontrada.',
          },
        },
      },

      put: {
        tags: ['Exams'],
        summary: 'Atualiza uma avaliação',

        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
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
          },
          404: {
            description: 'Avaliação não encontrada.',
          },
        },
      },

      delete: {
        tags: ['Exams'],
        summary: 'Remove uma avaliação',

        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],

        responses: {
          200: {
            description: 'Avaliação removida.',
          },
          404: {
            description: 'Avaliação não encontrada.',
          },
        },
      },
    },
  },

  components: {
    schemas: {
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
          },

          deadlineAt: {
            type: 'string',
            format: 'date-time',
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
            type: 'string',
            enum: [
              'DRAFT',
              'PUBLISHED',
              'CLOSED',
              'CORRECTED',
            ],
          },

          timeLimit: {
            type: 'integer',
          },
        },
      },
    },
  },
};