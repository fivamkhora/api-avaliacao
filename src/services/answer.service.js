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

  if (question.type === 'MULTIPLE_CHOICE') {
    const options = Array.isArray(question.options)
      ? question.options
      : [];

    const optionExists = options.some(
      (option) => option.key === selectedOption,
    );

    if (!optionExists) {
      throw createError(
        'A alternativa selecionada não existe nesta questão.',
        400,
      );
    }
  }

  if (
    question.type === 'TRUE_FALSE' &&
    !['TRUE', 'FALSE'].includes(selectedOption.toUpperCase())
  ) {
    throw createError(
      'Para questões de verdadeiro ou falso, use TRUE ou FALSE.',
      400,
    );
  }
};

const findSubmissionOrFail = async (submissionId) => {
  const submission = await prisma.examSubmission.findUnique({
    where: {
      id: submissionId,
    },
  });

  if (!submission) {
    throw createError('Submissão não encontrada.', 404);
  }

  return submission;
};

const findQuestionOrFail = async (questionId) => {
  const question = await prisma.question.findUnique({
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

  const submission = await findSubmissionOrFail(submissionId);
  const question = await findQuestionOrFail(questionId);

  if (submission.examId !== question.examId) {
    throw createError(
      'A questão não pertence à avaliação desta submissão.',
      400,
    );
  }

  const existingAnswer = await prisma.answer.findUnique({
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

  return prisma.answer.create({
    data: {
      submissionId,
      questionId,
      content:
        question.type === 'ESSAY'
          ? content.trim()
          : null,
      selectedOption:
        question.type === 'ESSAY'
          ? null
          : selectedOption.trim().toUpperCase(),
    },
    include: includeRelations,
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
  const existingAnswer = await prisma.answer.findUnique({
    where: {
      id,
    },
    include: {
      question: true,
    },
  });

  if (!existingAnswer) {
    throw createError('Resposta não encontrada.', 404);
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

      updateData.selectedOption =
        data.selectedOption.trim().toUpperCase();

      updateData.content = null;
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

  return prisma.answer.update({
    where: {
      id,
    },
    data: updateData,
    include: includeRelations,
  });
};

const deleteAnswer = async (id) => {
  const answer = await prisma.answer.findUnique({
    where: {
      id,
    },
  });

  if (!answer) {
    throw createError('Resposta não encontrada.', 404);
  }

  await prisma.answer.delete({
    where: {
      id,
    },
  });

  return {
    message: 'Resposta removida com sucesso.',
  };
};

module.exports = {
  createAnswer,
  getAnswers,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
};