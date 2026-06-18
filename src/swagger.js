module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'API Avaliacao Escolar',
    version: '0.1.0',
    description: 'Prototipo de microservico para avaliacao escolar.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Ambiente local',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Status operacional do servico.',
    },
  ],
  paths: {
    '/healthcheck': {
      get: {
        tags: ['Health'],
        summary: 'Verifica se o servico esta ativo',
        operationId: 'getHealthcheck',
        responses: {
          200: {
            description: 'Servico ativo.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status', 'service', 'timestamp'],
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                    service: {
                      type: 'string',
                      example: 'api-avaliacao',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
