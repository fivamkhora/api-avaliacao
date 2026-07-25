jest.mock('../src/config/prisma', () => ({}));

const {
  importApiIaAssessment,
  mapApiIaAssessment,
} = require('../src/services/api-ia-assessment-import.service');

const apiIaAssessment = {
  id: '767a2807-f5d8-4e97-aca3-273920ac3d75',
  originalRequest: {
    subject: 'Geografia',
    gradeLevel: '7 ano',
    classroomMaterial: 'Territorio brasileiro.',
  },
  currentVersion: {
    version: 1,
    assessment: {
      title: 'Avaliacao de Geografia',
      answerKey: [
        {
          number: 1,
          answer: 'B',
          rubric: 'A alternativa B esta correta.',
        },
      ],
      questions: [
        {
          type: 'multipla_escolha',
          number: 1,
          points: 2,
          statement: 'Qual alternativa esta correta?',
          alternatives: [
            { label: 'A', text: 'Alternativa A' },
            { label: 'B', text: 'Alternativa B' },
          ],
        },
      ],
    },
  },
};

describe('mapApiIaAssessment', () => {
  it('converte a avaliacao da API-IA para a estrutura de exame e questoes', () => {
    const mappedAssessment = mapApiIaAssessment(apiIaAssessment);

    expect(mappedAssessment).toMatchObject({
      title: 'Avaliacao de Geografia',
      aiVersion: 1,
      questions: [
        {
          type: 'MULTIPLE_CHOICE',
          correctAnswer: 'B',
          rubric: 'A alternativa B esta correta.',
          points: 2,
          position: 1,
          options: [
            { key: 'A', text: 'Alternativa A' },
            { key: 'B', text: 'Alternativa B' },
          ],
        },
      ],
    });
  });

  it('consulta a API-IA e cria o exame com as questoes em uma transacao', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: [apiIaAssessment],
      }),
    });
    const mockCreate = jest.fn().mockResolvedValue({
      id: 'exam-uuid',
      title: 'Avaliacao de Geografia',
      questions: [{ id: 'question-uuid', position: 1 }],
    });
    const mockTransaction = {
      exam: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: mockCreate,
      },
    };
    const mockPrisma = {
      $transaction: jest.fn((callback) => callback(mockTransaction)),
    };

    const result = await importApiIaAssessment(
      apiIaAssessment.id,
      {
        classroomId: 'turma-01',
        teacherId: 'professor-01',
      },
      {
        fetchImplementation: mockFetch,
        prismaClient: mockPrisma,
      },
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining(`assessmentId=${apiIaAssessment.id}`),
      }),
      expect.objectContaining({
        headers: { accept: 'application/json' },
      }),
    );
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        externalAssessmentId: apiIaAssessment.id,
        classroomId: 'turma-01',
        teacherId: 'professor-01',
      }),
    }));
    expect(result).toMatchObject({
      created: true,
      exam: {
        id: 'exam-uuid',
      },
    });
  });
});
