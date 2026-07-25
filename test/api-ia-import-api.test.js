const request = require('supertest');

const mockImportApiIaAssessment = jest.fn();

jest.mock('../src/config/prisma', () => ({}));
jest.mock('../src/services/api-ia-assessment-import.service', () => ({
  importApiIaAssessment: mockImportApiIaAssessment,
}));

const app = require('../src/app');

describe('POST /exams/import/api-ia/:assessmentId', () => {
  beforeEach(() => {
    mockImportApiIaAssessment.mockReset();
  });

  it('importa uma avaliacao usando o servico da API-IA', async () => {
    mockImportApiIaAssessment.mockResolvedValue({
      created: true,
      exam: {
        id: 'exam-uuid',
        title: 'Avaliacao de Geografia',
        questions: [],
      },
    });

    const response = await request(app)
      .post('/exams/import/api-ia/767a2807-f5d8-4e97-aca3-273920ac3d75')
      .send({
        classroomId: 'turma-01',
        teacherId: 'professor-01',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: 'exam-uuid',
      title: 'Avaliacao de Geografia',
    });
    expect(mockImportApiIaAssessment).toHaveBeenCalledWith(
      '767a2807-f5d8-4e97-aca3-273920ac3d75',
      {
        classroomId: 'turma-01',
        teacherId: 'professor-01',
      },
    );
  });
});
