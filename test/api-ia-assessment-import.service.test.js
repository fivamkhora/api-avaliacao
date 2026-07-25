jest.mock('../src/config/prisma', () => ({}));

const {
  mapApiIaAssessment,
} = require('../src/services/api-ia-assessment-import.service');

describe('mapApiIaAssessment', () => {
  it('converte a avaliacao da API-IA para a estrutura de exame e questoes', () => {
    const mappedAssessment = mapApiIaAssessment({
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
    });

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
});
