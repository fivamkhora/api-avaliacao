const request = require('supertest');

const mockFindMany = jest.fn();

jest.mock('../src/config/prisma', () => ({
  exam: {
    findMany: mockFindMany,
  },
}));

const app = require('../src/app');

describe('GET /exams/import/api-ia', () => {
  beforeEach(() => {
    mockFindMany.mockReset();
  });

  it('lista somente as avaliacoes importadas da API-IA', async () => {
    mockFindMany.mockResolvedValue([]);

    const response = await request(app)
      .get('/exams/import/api-ia?classroomId=turma-01');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        classroomId: 'turma-01',
        externalAssessmentId: { not: null },
      }),
    }));
  });
});
