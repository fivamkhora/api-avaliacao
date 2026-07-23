const request = require('supertest');

const mockState = {
  exams: [],
  questions: [],
  submissions: [],
  answers: [],
  nextSubmissionId: 1,
  nextAnswerId: 1,
};

const applySelect = (record, select) => {
  if (!record || !select) {
    return record;
  }

  return Object.entries(select).reduce((result, [field, value]) => {
    if (value === true) {
      result[field] = record[field];
    }

    return result;
  }, {});
};

const hydrateSubmission = (submission, args = {}) => {
  if (!submission) {
    return null;
  }

  const hydrated = {
    ...submission,
  };

  if (args.include?.exam) {
    hydrated.exam = mockState.exams.find(
      (exam) => exam.id === submission.examId,
    );
  }

  if (args.include?.answers) {
    hydrated.answers = mockState.answers.filter(
      (answer) => answer.submissionId === submission.id,
    );
  }

  if (args.select?.answers) {
    const answerSelect = args.select.answers.select;
    hydrated.answers = mockState.answers
      .filter(
        (answer) => answer.submissionId === submission.id,
      )
      .map((answer) => applySelect(answer, answerSelect));
  }

  return args.select
    ? applySelect(hydrated, {
      ...args.select,
      answers: false,
    }) && {
      ...applySelect(hydrated, {
        ...args.select,
        answers: false,
      }),
      ...(args.select.answers && {
        answers: hydrated.answers,
      }),
    }
    : hydrated;
};

const mockPrisma = {
  exam: {
    findUnique: jest.fn(async ({ where, select }) => {
      const exam = mockState.exams.find(
        (item) => item.id === where.id,
      );

      return applySelect(exam || null, select);
    }),
  },

  question: {
    findMany: jest.fn(async ({ where, orderBy } = {}) => {
      let questions = [...mockState.questions];

      if (where?.id?.in) {
        questions = questions.filter((question) =>
          where.id.in.includes(question.id));
      }

      if (where?.examId) {
        questions = questions.filter(
          (question) => question.examId === where.examId,
        );
      }

      if (orderBy?.position === 'asc') {
        questions.sort(
          (first, second) => first.position - second.position,
        );
      }

      return questions;
    }),

    count: jest.fn(async ({ where }) => {
      return mockState.questions.filter(
        (question) => question.examId === where.examId,
      ).length;
    }),
  },

  examSubmission: {
    findUnique: jest.fn(async (args) => {
      let submission;

      if (args.where.id) {
        submission = mockState.submissions.find(
          (item) => item.id === args.where.id,
        );
      }

      if (args.where.examId_studentId) {
        const key = args.where.examId_studentId;
        submission = mockState.submissions.find(
          (item) =>
            item.examId === key.examId &&
            item.studentId === key.studentId,
        );
      }

      return hydrateSubmission(submission, args);
    }),

    create: jest.fn(async (args) => {
      const now = new Date();
      const submission = {
        id: `submission-${mockState.nextSubmissionId++}`,
        ...args.data,
        submittedAt: null,
        score: null,
        createdAt: now,
        updatedAt: now,
      };

      mockState.submissions.push(submission);

      return hydrateSubmission(submission, args);
    }),

    update: jest.fn(async (args) => {
      const index = mockState.submissions.findIndex(
        (submission) => submission.id === args.where.id,
      );

      mockState.submissions[index] = {
        ...mockState.submissions[index],
        ...args.data,
        updatedAt: new Date(),
      };

      return hydrateSubmission(
        mockState.submissions[index],
        args,
      );
    }),

    updateMany: jest.fn(async ({ where }) => {
      const submission = mockState.submissions.find(
        (item) =>
          item.id === where.id &&
          item.status === where.status,
      );

      return {
        count: submission ? 1 : 0,
      };
    }),

    findMany: jest.fn(async (args) => {
      let submissions = mockState.submissions.filter(
        (submission) =>
          !args.where.examId ||
          submission.examId === args.where.examId,
      );

      if (args.orderBy?.createdAt === 'desc') {
        submissions = submissions.sort(
          (first, second) =>
            second.createdAt.getTime() -
            first.createdAt.getTime(),
        );
      }

      return submissions.map((submission) =>
        applySelect(submission, args.select));
    }),
  },

  answer: {
    upsert: jest.fn(async ({ where, create, update }) => {
      const key = where.submissionId_questionId;
      const existingIndex = mockState.answers.findIndex(
        (answer) =>
          answer.submissionId === key.submissionId &&
          answer.questionId === key.questionId,
      );

      if (existingIndex >= 0) {
        mockState.answers[existingIndex] = {
          ...mockState.answers[existingIndex],
          ...update,
          updatedAt: new Date(),
        };

        return mockState.answers[existingIndex];
      }

      const now = new Date();
      const answer = {
        id: `answer-${mockState.nextAnswerId++}`,
        ...create,
        createdAt: now,
        updatedAt: now,
      };

      mockState.answers.push(answer);
      return answer;
    }),

    aggregate: jest.fn(async ({ where }) => {
      const score = mockState.answers
        .filter(
          (answer) =>
            answer.submissionId === where.submissionId &&
            answer.score !== null &&
            answer.score !== undefined,
        )
        .reduce(
          (total, answer) => total + Number(answer.score),
          0,
        );

      return {
        _sum: {
          score,
        },
      };
    }),
  },
};

mockPrisma.$transaction = jest.fn(async (callback) => {
  return callback(mockPrisma);
});

jest.mock('../src/config/prisma', () => mockPrisma);

const app = require('../src/app');

const examId = 'exam-1';
const studentId = 'student-1';

const startSubmission = () => {
  return request(app)
    .post('/submissions')
    .send({
      examId,
      studentId,
    });
};

const submitAnswers = (submissionId) => {
  return request(app)
    .post(`/submissions/${submissionId}/submit`)
    .send({
      answers: [
        {
          questionId: 'question-1',
          answer: ' a ',
        },
        {
          questionId: 'question-2',
          answer: ' false ',
        },
      ],
    });
};

beforeEach(() => {
  jest.clearAllMocks();

  const now = Date.now();

  mockState.exams = [
    {
      id: examId,
      title: 'Avaliacao',
      status: 'PUBLISHED',
      availableAt: new Date(now - 60_000),
      deadlineAt: new Date(now + 60_000),
    },
  ];

  mockState.questions = [
    {
      id: 'question-1',
      examId,
      statement: 'Questao 1',
      type: 'MULTIPLE_CHOICE',
      options: [
        { key: 'A', text: 'Alternativa A' },
        { key: 'B', text: 'Alternativa B' },
      ],
      correctAnswer: 'A',
      points: 6,
      position: 1,
    },
    {
      id: 'question-2',
      examId,
      statement: 'Questao 2',
      type: 'TRUE_FALSE',
      options: [
        { key: 'TRUE', text: 'Verdadeiro' },
        { key: 'FALSE', text: 'Falso' },
      ],
      correctAnswer: 'TRUE',
      points: 4,
      position: 2,
    },
    {
      id: 'question-3',
      examId,
      statement: 'Questao 3',
      type: 'MULTIPLE_CHOICE',
      options: [
        { key: 'A', text: 'Alternativa A' },
        { key: 'B', text: 'Alternativa B' },
      ],
      correctAnswer: 'B',
      points: 2,
      position: 3,
    },
  ];

  mockState.submissions = [];
  mockState.answers = [];
  mockState.nextSubmissionId = 1;
  mockState.nextAnswerId = 1;
});

describe('Fluxo de submissao da avaliacao', () => {
  it('inicia uma avaliacao com status IN_PROGRESS', async () => {
    const response = await startSubmission();

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      examId,
      studentId,
      status: 'IN_PROGRESS',
      submittedAt: null,
      score: null,
    });
    expect(response.body.startedAt).toEqual(expect.any(String));
  });

  it('impede tentativa duplicada retornando a submissao em andamento', async () => {
    const firstResponse = await startSubmission();
    const secondResponse = await startSubmission();

    expect(secondResponse.status).toBe(201);
    expect(secondResponse.body.id).toBe(firstResponse.body.id);
    expect(secondResponse.body.status).toBe('IN_PROGRESS');
    expect(mockState.submissions).toHaveLength(1);
  });

  it('envia e salva todas as respostas', async () => {
    const startResponse = await startSubmission();
    const response = await submitAnswers(startResponse.body.id);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('CORRECTED');
    expect(response.body.answers).toHaveLength(3);
    expect(mockState.answers).toHaveLength(3);
  });

  it('impede o reenvio da prova', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const startResponse = await startSubmission();

    await submitAnswers(startResponse.body.id);

    const response = await submitAnswers(startResponse.body.id);

    consoleError.mockRestore();

    expect(response.status).toBe(409);
    expect(response.body.error).toBe(
      'Esta submissao ja foi enviada.',
    );
  });

  it('calcula nota, acertos, erros e respostas em branco', async () => {
    const startResponse = await startSubmission();
    const response = await submitAnswers(startResponse.body.id);

    expect(response.body.score).toBe(6);
    expect(response.body.automaticCorrection).toEqual({
      correct: 1,
      incorrect: 1,
      blank: 1,
    });
  });

  it('consulta o resultado sem retornar o gabarito', async () => {
    const startResponse = await startSubmission();

    await submitAnswers(startResponse.body.id);

    const response = await request(app).get(
      `/submissions/${startResponse.body.id}/result`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      submission: startResponse.body.id,
      examId,
      studentId,
      totalQuestions: 3,
      answeredQuestions: 2,
      correctAnswers: 1,
      wrongAnswers: 1,
      blankAnswers: 1,
      finalGrade: 6,
      status: 'CORRECTED',
    });
    expect(response.body).not.toHaveProperty('correctAnswer');
    expect(response.body).not.toHaveProperty('answers');
  });

  it('lista as submissoes da avaliacao', async () => {
    const firstSubmission = await startSubmission();

    await submitAnswers(firstSubmission.body.id);

    const response = await request(app).get(
      `/exams/${examId}/submissions`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      total: 1,
      submissions: [
        {
          id: firstSubmission.body.id,
          studentId,
          score: 6,
          status: 'CORRECTED',
          submittedAt: expect.any(String),
        },
      ],
    });
  });
});
