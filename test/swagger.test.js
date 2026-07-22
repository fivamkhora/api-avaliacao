const swaggerDocument = require('../src/swagger');

describe('OpenAPI', () => {
  it('usa o mesmo host da documentacao para executar as requisicoes', () => {
    expect(swaggerDocument.servers).toEqual([
      expect.objectContaining({ url: '/' }),
    ]);
  });
});
