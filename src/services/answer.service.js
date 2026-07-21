const prisma = require('../config/prisma');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const includeRelations = {
  submission: {
    include: {
      exam: true,
    },
  },
  question: true,
};

const normalizeOption = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  return value.trim().toUpperCase();
};

const validateRequiredFields = (submissionId, questionId) => {
  if (!submissionId || typeof submissionId !== 'string') {
    throw createError('O campo submissionId é obrigatório.', 400);
  }

  if (!questionId || typeof questionId !== 'string') {
    throw createError('O campo questionId é obrigatório.', 400);
  }
};

const validateAnswerContent = (question, content, selectedOption) => {
  if (question.type === 'ESSAY') {
    if (!content || typeof content !== 'string' || !content.trim()) {
      throw createError(
        'O campo content é obrigatório para questões dissertativas.',
        400,
      );
    }

    return;
  }

  if (
    !selectedOption ||
    typeof selectedOption !== 'string' ||
    !selectedOption.trim()
  ) {
    throw createError(
      'O campo selectedOption é obrigatório para questões objetivas.',
      400,
    );
  }

  const normalizedSelectedOption = normalizeOption(selectedOption);

  if (question.type === 'MULTIPLE_CHOICE') {
    const options = Array.isArray(question.options)
      ? question.options
      : [];

    const optionExists = options.some((option) => {
      if (!option || typeof option.key !== 'string') {
        return false;
      }

      return normalizeOption(option.key) === normalizedSelectedOption;
    });

    if (!optionExists) {
      throw createError(
        'A alternativa selecionada não existe nesta questão.',
        400,
      );
    }
  }

  if (
    question.type === 'TRUE_FALSE' &&
    !['TRUE', 'FALSE'].includes(normalizedSelectedOption)
  ) {
    throw createError(
      'Para questões de verdadeiro ou falso, use TRUE ou FALSE.',
      400,
    );
  }
};

const validateSubmissionCanBeAnswered = (submission) => {
  if (!submission.exam) {
    throw createError(
      'A avaliação vinculada à submissão não foi encontrada.',
      404,
    );
  }

  if (
    submission.status === 'SUBMITTED' ||
    submission.status === 'CORRECTED'
  ) {
    throw createError(
      'Esta submissão já foi finalizada e não pode ser alterada.',
      409,
    );
  }

  if (submission.exam.status !== 'PUBLISHED') {
    throw createError(
      'A prova não está publicada e não pode ser respondida.',
      403,
    );
  }

  const currentDate = new Date();

  if (
    submission.exam.availableAt &&
    currentDate < new Date(submission.exam.availableAt)
  ) {
    throw createError(
      'Esta prova ainda não está disponível.',
      403,
    );
  }

  if (
    submission.exam.deadlineAt &&
    currentDate > new Date(submission.exam.deadlineAt)
  ) {
    throw createError(
      'O prazo para responder esta prova foi encerrado.',
      403,
    );
  }
};

const calculateAutomaticGrade = (question, selectedOption) => {
  if (question.type === 'ESSAY') {
    return {
      isCorrect: null,
      score: null,
      feedback: null,
    };
  }

  const normalizedCorrectAnswer = normalizeOption(
    question.correctAnswer,
  );

  const normalizedSelectedOption = normalizeOption(
    selectedOption,
  );

  /*
   * Caso a questão objetiva não possua gabarito,
   * ela permanece sem correção automática.
   */
  if (!normalizedCorrectAnswer) {
    return {
      isCorrect: null,
      score: null,
      feedback: null,
    };
  }

  const isCorrect =
    normalizedSelectedOption === normalizedCorrectAnswer;

  return {
    isCorrect,
    score: isCorrect ? question.points : 0,
    feedback: isCorrect
      ? 'Resposta correta.'
      : 'Resposta incorreta.',
  };
};

const recalculateSubmissionScore = async (
  databaseClient,
  submissionId,
) => {
  const result = await databaseClient.answer.aggregate({
    where: {
      submissionId,
      score: {
        not: null,
      },
    },
    _sum: {
      score: true,
    },
  });

  const totalScore = result._sum.score ?? 0;

  await databaseClient.examSubmission.update({
    where: {
      id: submissionId,
    },
    data: {
      score: totalScore,
    },
  });

  return totalScore;
};

const findSubmissionOrFail = async (
  submissionId,
  databaseClient = prisma,
) => {
  const submission =
    await databaseClient.examSubmission.findUnique({
      where: {
        id: submissionId,
      },
      include: {
        exam: true,
      },
    });

  if (!submission) {
    throw createError('Submissão não encontrada.', 404);
  }

  return submission;
};

const findQuestionOrFail = async (
  questionId,
  databaseClient = prisma,
) => {
  const question = await databaseClient.question.findUnique({
    where: {
      id: questionId,
    },
  });

  if (!question) {
    throw createError('Questão não encontrada.', 404);
  }

  return question;
};

const createAnswer = async (data) => {
  const {
    submissionId,
    questionId,
    content,
    selectedOption,
  } = data;

  validateRequiredFields(submissionId, questionId);

  return prisma.$transaction(async (transaction) => {
    const submission = await findSubmissionOrFail(
      submissionId,
      transaction,
    );

    const question = await findQuestionOrFail(
      questionId,
      transaction,
    );

    validateSubmissionCanBeAnswered(submission);

    if (submission.examId !== question.examId) {
      throw createError(
        'A questão não pertence à avaliação desta submissão.',
        400,
      );
    }

    const existingAnswer =
      await transaction.answer.findUnique({
        where: {
          submissionId_questionId: {
            submissionId,
            questionId,
          },
        },
      });

    if (existingAnswer) {
      throw createError(
        'Já existe uma resposta para esta questão nesta submissão.',
        409,
      );
    }

    validateAnswerContent(
      question,
      content,
      selectedOption,
    );

    const normalizedSelectedOption =
      question.type === 'ESSAY'
        ? null
        : normalizeOption(selectedOption);

    const automaticGrade = calculateAutomaticGrade(
      question,
      normalizedSelectedOption,
    );

    const createdAnswer = await transaction.answer.create({
      data: {
        submissionId,
        questionId,
        content:
          question.type === 'ESSAY'
            ? content.trim()
            : null,
        selectedOption: normalizedSelectedOption,
        isCorrect: automaticGrade.isCorrect,
        score: automaticGrade.score,
        feedback: automaticGrade.feedback,
      },
    });

    await recalculateSubmissionScore(
      transaction,
      submissionId,
    );

    return transaction.answer.findUnique({
      where: {
        id: createdAnswer.id,
      },
      include: includeRelations,
    });
  });
};

const getAnswers = async (filters = {}) => {
  const where = {};

  if (filters.submissionId) {
    where.submissionId = filters.submissionId;
  }

  if (filters.questionId) {
    where.questionId = filters.questionId;
  }

  return prisma.answer.findMany({
    where,
    include: includeRelations,
    orderBy: {
      createdAt: 'asc',
    },
  });
};

const getAnswerById = async (id) => {
  const answer = await prisma.answer.findUnique({
    where: {
      id,
    },
    include: includeRelations,
  });

  if (!answer) {
    throw createError('Resposta não encontrada.', 404);
  }

  return answer;
};

const updateAnswer = async (id, data) => {
  return prisma.$transaction(async (transaction) => {
    const existingAnswer =
      await transaction.answer.findUnique({
        where: {
          id,
        },
        include: {
          question: true,
          submission: {
            include: {
              exam: true,
            },
          },
        },
      });

    if (!existingAnswer) {
      throw createError('Resposta não encontrada.', 404);
    }

    validateSubmissionCanBeAnswered(
      existingAnswer.submission,
    );

    if (
      existingAnswer.submission.examId !==
      existingAnswer.question.examId
    ) {
      throw createError(
        'A questão não pertence à avaliação desta submissão.',
        400,
      );
    }

    const updateData = {};

    if (existingAnswer.question.type === 'ESSAY') {
      if (data.content !== undefined) {
        if (
          typeof data.content !== 'string' ||
          !data.content.trim()
        ) {
          throw createError(
            'O campo content não pode estar vazio.',
            400,
          );
        }

        updateData.content = data.content.trim();
        updateData.selectedOption = null;
        updateData.isCorrect = null;
        updateData.score = null;
        updateData.feedback = null;
      }

      if (data.selectedOption !== undefined) {
        throw createError(
          'Questões dissertativas não utilizam selectedOption.',
          400,
        );
      }
    } else {
      if (data.selectedOption !== undefined) {
        validateAnswerContent(
          existingAnswer.question,
          null,
          data.selectedOption,
        );

        const normalizedSelectedOption = normalizeOption(
          data.selectedOption,
        );

        const automaticGrade = calculateAutomaticGrade(
          existingAnswer.question,
          normalizedSelectedOption,
        );

        updateData.selectedOption =
          normalizedSelectedOption;

        updateData.content = null;
        updateData.isCorrect =
          automaticGrade.isCorrect;

        updateData.score = automaticGrade.score;
        updateData.feedback =
          automaticGrade.feedback;
      }

      if (data.content !== undefined) {
        throw createError(
          'Questões objetivas não utilizam content.',
          400,
        );
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw createError(
        'Nenhum campo válido foi informado para atualização.',
        400,
      );
    }

    await transaction.answer.update({
      where: {
        id,
      },
      data: updateData,
    });

    await recalculateSubmissionScore(
      transaction,
      existingAnswer.submissionId,
    );

    return transaction.answer.findUnique({
      where: {
        id,
      },
      include: includeRelations,
    });
  });
};

const deleteAnswer = async (id) => {
  return prisma.$transaction(async (transaction) => {
    const answer = await transaction.answer.findUnique({
      where: {
        id,
      },
      include: {
        submission: {
          include: {
            exam: true,
          },
        },
      },
    });

    if (!answer) {
      throw createError('Resposta não encontrada.', 404);
    }

    validateSubmissionCanBeAnswered(answer.submission);

    await transaction.answer.delete({
      where: {
        id,
      },
    });

    await recalculateSubmissionScore(
      transaction,
      answer.submissionId,
    );

    return {
      message: 'Resposta removida com sucesso.',
    };
  });
};

module.exports = {
  createAnswer,
  getAnswers,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
};