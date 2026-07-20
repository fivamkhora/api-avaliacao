const prisma = require('../config/prisma');

const QUESTION_TYPES = [
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'ESSAY',
];

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const validateQuestionType = (type) => {
  if (!QUESTION_TYPES.includes(type)) {
    throw createServiceError(
      'O tipo da questao deve ser MULTIPLE_CHOICE, TRUE_FALSE ou ESSAY.',
    );
  }
};

const validatePosition = (position) => {
  if (!Number.isInteger(position) || position <= 0) {
    throw createServiceError(
      'A posicao da questao deve ser um numero inteiro maior que zero.',
    );
  }
};

const validatePoints = (points) => {
  const parsedPoints = Number(points);

  if (!Number.isFinite(parsedPoints) || parsedPoints <= 0) {
    throw createServiceError(
      'A pontuacao da questao deve ser maior que zero.',
    );
  }

  return parsedPoints;
};

const validateOptions = (type, options, correctAnswer) => {
  if (type === 'ESSAY') {
    return;
  }

  if (!Array.isArray(options) || options.length < 2) {
    throw createServiceError(
      'Questoes objetivas devem possuir pelo menos duas alternativas.',
    );
  }

  const optionKeys = [];

  for (const option of options) {
    if (
      !option ||
      typeof option !== 'object' ||
      typeof option.key !== 'string' ||
      !option.key.trim() ||
      typeof option.text !== 'string' ||
      !option.text.trim()
    ) {
      throw createServiceError(
        'Cada alternativa deve possuir key e text validos.',
      );
    }

    optionKeys.push(option.key.trim());
  }

  const uniqueOptionKeys = new Set(optionKeys);

  if (uniqueOptionKeys.size !== optionKeys.length) {
    throw createServiceError(
      'As chaves das alternativas nao podem ser repetidas.',
    );
  }

  if (
    typeof correctAnswer !== 'string' ||
    !correctAnswer.trim()
  ) {
    throw createServiceError(
      'A resposta correta deve ser informada para questoes objetivas.',
    );
  }

  if (!uniqueOptionKeys.has(correctAnswer.trim())) {
    throw createServiceError(
      'A resposta correta deve corresponder a uma das alternativas.',
    );
  }
};

const findExamOrFail = async (examId) => {
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
  });

  if (!exam) {
    throw createServiceError('Avaliacao nao encontrada.', 404);
  }

  return exam;
};

const verifyAvailablePosition = async (
  examId,
  position,
  ignoredQuestionId = null,
) => {
  const question = await prisma.question.findFirst({
    where: {
      examId,
      position,
      ...(ignoredQuestionId && {
        NOT: {
          id: ignoredQuestionId,
        },
      }),
    },
  });

  if (question) {
    throw createServiceError(
      'Ja existe uma questao nessa posicao para a avaliacao.',
      409,
    );
  }
};

const createQuestion = async (questionData) => {
  const {
    examId,
    statement,
    type = 'MULTIPLE_CHOICE',
    options,
    correctAnswer,
    points = 1,
    position,
  } = questionData;

  if (!examId || !statement || position === undefined) {
    throw createServiceError(
      'examId, statement e position sao obrigatorios.',
    );
  }

  if (typeof statement !== 'string' || !statement.trim()) {
    throw createServiceError(
      'O enunciado da questao deve ser informado.',
    );
  }

  validateQuestionType(type);
  validatePosition(position);

  const parsedPoints = validatePoints(points);

  validateOptions(type, options, correctAnswer);

  await findExamOrFail(examId);
  await verifyAvailablePosition(examId, position);

  return prisma.question.create({
    data: {
      examId,
      statement: statement.trim(),
      type,
      options: type === 'ESSAY' ? undefined : options,
      correctAnswer:
        type === 'ESSAY'
          ? correctAnswer?.trim() || null
          : correctAnswer.trim(),
      points: parsedPoints,
      position,
    },
  });
};

const listQuestions = async ({ examId, type } = {}) => {
  if (type) {
    validateQuestionType(type);
  }

  return prisma.question.findMany({
    where: {
      ...(examId && { examId }),
      ...(type && { type }),
    },
    orderBy: [
      {
        examId: 'asc',
      },
      {
        position: 'asc',
      },
    ],
  });
};

const getQuestionById = async (id) => {
  const question = await prisma.question.findUnique({
    where: {
      id,
    },
  });

  if (!question) {
    throw createServiceError('Questao nao encontrada.', 404);
  }

  return question;
};

const updateQuestion = async (id, questionData) => {
  const existingQuestion = await getQuestionById(id);

  const finalExamId =
    questionData.examId ?? existingQuestion.examId;

  const finalStatement =
    questionData.statement ?? existingQuestion.statement;

  const finalType =
    questionData.type ?? existingQuestion.type;

  const finalOptions =
    questionData.options !== undefined
      ? questionData.options
      : existingQuestion.options;

  const finalCorrectAnswer =
    questionData.correctAnswer !== undefined
      ? questionData.correctAnswer
      : existingQuestion.correctAnswer;

  const finalPoints =
    questionData.points !== undefined
      ? questionData.points
      : existingQuestion.points;

  const finalPosition =
    questionData.position !== undefined
      ? questionData.position
      : existingQuestion.position;

  if (
    typeof finalStatement !== 'string' ||
    !finalStatement.trim()
  ) {
    throw createServiceError(
      'O enunciado da questao deve ser informado.',
    );
  }

  validateQuestionType(finalType);
  validatePosition(finalPosition);

  const parsedPoints = validatePoints(finalPoints);

  validateOptions(
    finalType,
    finalOptions,
    finalCorrectAnswer,
  );

  await findExamOrFail(finalExamId);

  await verifyAvailablePosition(
    finalExamId,
    finalPosition,
    id,
  );

  return prisma.question.update({
    where: {
      id,
    },
    data: {
      ...(questionData.examId !== undefined && {
        examId: finalExamId,
      }),

      ...(questionData.statement !== undefined && {
        statement: finalStatement.trim(),
      }),

      ...(questionData.type !== undefined && {
        type: finalType,
      }),

      ...(
        questionData.options !== undefined ||
        questionData.type !== undefined
      ) && {
        options:
          finalType === 'ESSAY'
            ? undefined
            : finalOptions,
      },

      ...(
        questionData.correctAnswer !== undefined ||
        questionData.type !== undefined
      ) && {
        correctAnswer:
          finalType === 'ESSAY'
            ? finalCorrectAnswer?.trim() || null
            : finalCorrectAnswer.trim(),
      },

      ...(questionData.points !== undefined && {
        points: parsedPoints,
      }),

      ...(questionData.position !== undefined && {
        position: finalPosition,
      }),
    },
  });
};

const deleteQuestion = async (id) => {
  await getQuestionById(id);

  await prisma.question.delete({
    where: {
      id,
    },
  });

  return {
    message: 'Questao excluida com sucesso.',
  };
};

module.exports = {
  createQuestion,
  listQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};