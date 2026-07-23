const prisma = require('../config/prisma');
const {
  normalizeOption,
  calculateAutomaticGrade,
  summarizeAutomaticCorrection,
} = require('./grading.service');

const SUBMISSION_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
  'CORRECTED',
];

const ALLOWED_STATUS_TRANSITIONS = {
  NOT_STARTED: [
    'NOT_STARTED',
    'IN_PROGRESS',
    'SUBMITTED',
  ],
  IN_PROGRESS: [
    'IN_PROGRESS',
    'SUBMITTED',
  ],
  SUBMITTED: [
    'SUBMITTED',
    'IN_PROGRESS',
    'CORRECTED',
  ],
  CORRECTED: [
    'CORRECTED',
  ],
};

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const validateSubmissionStatus = (status) => {
  if (!SUBMISSION_STATUSES.includes(status)) {
    throw createServiceError(
      'O status deve ser NOT_STARTED, IN_PROGRESS, SUBMITTED ou CORRECTED.',
    );
  }
};

const validateStatusTransition = (
  currentStatus,
  newStatus,
) => {
  const allowedTransitions =
    ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    throw createServiceError(
      `Nao e permitido alterar o status de ${currentStatus} para ${newStatus}.`,
      409,
    );
  }
};

const validateScore = (score) => {
  if (score === null) {
    return null;
  }

  const parsedScore = Number(score);

  if (!Number.isFinite(parsedScore) || parsedScore < 0) {
    throw createServiceError(
      'A nota deve ser um numero maior ou igual a zero.',
    );
  }

  return parsedScore;
};

const parseDate = (value, fieldName) => {
  if (value === null) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw createServiceError(
      `A data informada em ${fieldName} e invalida.`,
    );
  }

  return parsedDate;
};

const calculateAnswersScore = (answers = []) => {
  return answers.reduce((total, answer) => {
    if (answer.score === null || answer.score === undefined) {
      return total;
    }

    return total + Number(answer.score);
  }, 0);
};

const prepareSubmittedAnswer = (question, answer) => {
  if (question.type === 'ESSAY') {
    return {
      content:
        typeof answer === 'string'
          ? answer.trim() || null
          : null,
      selectedOption: null,
      isCorrect: null,
      score: null,
      feedback: null,
      result: null,
    };
  }

  const normalizedAnswer = normalizeOption(answer);

  if (
    normalizedAnswer &&
    question.type === 'MULTIPLE_CHOICE'
  ) {
    const options = Array.isArray(question.options)
      ? question.options
      : [];

    const optionExists = options.some((option) => {
      return (
        option &&
        typeof option.key === 'string' &&
        normalizeOption(option.key) === normalizedAnswer
      );
    });

    if (!optionExists) {
      throw createServiceError(
        `A alternativa informada para a questao ${question.id} nao existe.`,
      );
    }
  }

  if (
    normalizedAnswer &&
    question.type === 'TRUE_FALSE' &&
    !['TRUE', 'FALSE'].includes(normalizedAnswer)
  ) {
    throw createServiceError(
      `A resposta da questao ${question.id} deve ser TRUE ou FALSE.`,
    );
  }

  const automaticGrade = calculateAutomaticGrade(
    question,
    normalizedAnswer,
  );

  return {
    content: null,
    selectedOption: normalizedAnswer,
    ...automaticGrade,
  };
};

const findExamOrFail = async (examId) => {
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
  });

  if (!exam) {
    throw createServiceError(
      'Avaliacao nao encontrada.',
      404,
    );
  }

  return exam;
};

const validateExamAvailability = (exam) => {
  if (exam.status !== 'PUBLISHED') {
    throw createServiceError(
      'A avaliacao nao esta publicada.',
      403,
    );
  }

  const currentDate = new Date();

  if (
    exam.availableAt &&
    currentDate < new Date(exam.availableAt)
  ) {
    throw createServiceError(
      'A avaliacao ainda nao esta disponivel.',
      403,
    );
  }

  if (
    exam.deadlineAt &&
    currentDate > new Date(exam.deadlineAt)
  ) {
    throw createServiceError(
      'O prazo para iniciar a avaliacao foi encerrado.',
      403,
    );
  }
};

const getSubmissionById = async (id) => {
  const submission =
    await prisma.examSubmission.findUnique({
      where: {
        id,
      },
      include: {
        exam: true,
        answers: true,
      },
    });

  if (!submission) {
    throw createServiceError(
      'Submissao nao encontrada.',
      404,
    );
  }

  return submission;
};

const getSubmissionResult = async (submissionId) => {
  if (
    !submissionId ||
    typeof submissionId !== 'string' ||
    !submissionId.trim()
  ) {
    throw createServiceError(
      'O submissionId deve ser informado corretamente.',
    );
  }

  const submission =
    await prisma.examSubmission.findUnique({
      where: {
        id: submissionId.trim(),
      },
      select: {
        id: true,
        examId: true,
        studentId: true,
        score: true,
        status: true,
        answers: {
          select: {
            content: true,
            selectedOption: true,
            isCorrect: true,
          },
        },
      },
    });

  if (!submission) {
    throw createServiceError(
      'Submissao nao encontrada.',
      404,
    );
  }

  const totalQuestions = await prisma.question.count({
    where: {
      examId: submission.examId,
    },
  });

  const answerIsFilled = (answer) => {
    return (
      (
        typeof answer.content === 'string' &&
        Boolean(answer.content.trim())
      ) ||
      (
        typeof answer.selectedOption === 'string' &&
        Boolean(answer.selectedOption.trim())
      )
    );
  };

  const answeredQuestions = submission.answers.filter(
    answerIsFilled,
  ).length;

  const correctAnswers = submission.answers.filter(
    (answer) => (
      answerIsFilled(answer) &&
      answer.isCorrect === true
    ),
  ).length;

  const wrongAnswers = submission.answers.filter(
    (answer) => (
      answerIsFilled(answer) &&
      answer.isCorrect === false
    ),
  ).length;

  return {
    submission: submission.id,
    examId: submission.examId,
    studentId: submission.studentId,
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    wrongAnswers,
    blankAnswers: Math.max(
      totalQuestions - answeredQuestions,
      0,
    ),
    finalGrade:
      submission.score === null
        ? null
        : Number(submission.score),
    status: submission.status,
  };
};

const verifyExistingSubmission = async (
  examId,
  studentId,
  ignoredSubmissionId = null,
) => {
  const existingSubmission =
    await prisma.examSubmission.findFirst({
      where: {
        examId,
        studentId,
        ...(ignoredSubmissionId && {
          NOT: {
            id: ignoredSubmissionId,
          },
        }),
      },
    });

  if (existingSubmission) {
    throw createServiceError(
      'Este aluno ja possui uma submissao para esta avaliacao.',
      409,
    );
  }
};

const createSubmission = async (submissionData) => {
  const { examId, studentId } = submissionData;

  if (!examId || !studentId) {
    throw createServiceError(
      'examId e studentId sao obrigatorios.',
    );
  }

  if (
    typeof examId !== 'string' ||
    !examId.trim() ||
    typeof studentId !== 'string' ||
    !studentId.trim()
  ) {
    throw createServiceError(
      'examId e studentId devem ser informados corretamente.',
    );
  }

  const normalizedExamId = examId.trim();
  const normalizedStudentId = studentId.trim();

  const exam = await findExamOrFail(normalizedExamId);

  validateExamAvailability(exam);

  const existingSubmission =
    await prisma.examSubmission.findUnique({
      where: {
        examId_studentId: {
          examId: normalizedExamId,
          studentId: normalizedStudentId,
        },
      },
      include: {
        exam: true,
        answers: true,
      },
    });

  if (existingSubmission) {
    if (existingSubmission.status === 'IN_PROGRESS') {
      return existingSubmission;
    }

    if (existingSubmission.status === 'NOT_STARTED') {
      return prisma.examSubmission.update({
        where: {
          id: existingSubmission.id,
        },
        data: {
          status: 'IN_PROGRESS',
          startedAt: existingSubmission.startedAt || new Date(),
        },
        include: {
          exam: true,
          answers: true,
        },
      });
    }

    throw createServiceError(
      'Este aluno ja finalizou uma submissao para esta avaliacao.',
      409,
    );
  }

  try {
    return await prisma.examSubmission.create({
      data: {
        examId: normalizedExamId,
        studentId: normalizedStudentId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
      include: {
        exam: true,
        answers: true,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const concurrentSubmission =
        await prisma.examSubmission.findUnique({
          where: {
            examId_studentId: {
              examId: normalizedExamId,
              studentId: normalizedStudentId,
            },
          },
          include: {
            exam: true,
            answers: true,
          },
        });

      if (
        concurrentSubmission &&
        concurrentSubmission.status === 'IN_PROGRESS'
      ) {
        return concurrentSubmission;
      }

      throw createServiceError(
        'Este aluno ja possui uma submissao finalizada para esta avaliacao.',
        409,
      );
    }

    throw error;
  }
};

const submitSubmission = async (
  submissionId,
  submissionData,
) => {
  if (
    !submissionId ||
    typeof submissionId !== 'string' ||
    !submissionId.trim()
  ) {
    throw createServiceError(
      'O submissionId deve ser informado corretamente.',
    );
  }

  const { answers } = submissionData;

  if (!Array.isArray(answers)) {
    throw createServiceError(
      'O campo answers deve ser uma lista.',
    );
  }

  const questionIds = answers.map((submittedAnswer) => {
    if (
      !submittedAnswer ||
      typeof submittedAnswer !== 'object' ||
      typeof submittedAnswer.questionId !== 'string' ||
      !submittedAnswer.questionId.trim()
    ) {
      throw createServiceError(
        'Todas as respostas devem possuir um questionId valido.',
      );
    }

    return submittedAnswer.questionId.trim();
  });

  if (new Set(questionIds).size !== questionIds.length) {
    throw createServiceError(
      'Nao e permitido enviar respostas duplicadas para a mesma questao.',
    );
  }

  return prisma.$transaction(async (transaction) => {
    const submission =
      await transaction.examSubmission.findUnique({
        where: {
          id: submissionId.trim(),
        },
        include: {
          exam: true,
        },
      });

    if (!submission) {
      throw createServiceError(
        'Submissao nao encontrada.',
        404,
      );
    }

    if (submission.status !== 'IN_PROGRESS') {
      if (
        submission.status === 'SUBMITTED' ||
        submission.status === 'CORRECTED'
      ) {
        throw createServiceError(
          'Esta submissao ja foi enviada.',
          409,
        );
      }

      throw createServiceError(
        'A submissao precisa estar em andamento para ser enviada.',
        409,
      );
    }

    const claimedSubmission =
      await transaction.examSubmission.updateMany({
        where: {
          id: submission.id,
          status: 'IN_PROGRESS',
        },
        data: {
          status: 'IN_PROGRESS',
        },
      });

    if (claimedSubmission.count !== 1) {
      throw createServiceError(
        'Esta submissao ja foi enviada.',
        409,
      );
    }

    validateExamAvailability(submission.exam);

    const submittedQuestions =
      await transaction.question.findMany({
        where: {
          id: {
            in: questionIds,
          },
        },
      });

    if (submittedQuestions.length !== questionIds.length) {
      throw createServiceError(
        'Uma ou mais questoes nao foram encontradas.',
        404,
      );
    }

    const invalidQuestion = submittedQuestions.find(
      (question) => question.examId !== submission.examId,
    );

    if (invalidQuestion) {
      throw createServiceError(
        `A questao ${invalidQuestion.id} nao pertence a avaliacao desta submissao.`,
      );
    }

    const questions = await transaction.question.findMany({
      where: {
        examId: submission.examId,
      },
      orderBy: {
        position: 'asc',
      },
    });

    if (questions.length === 0) {
      throw createServiceError(
        'A avaliacao nao possui questoes para corrigir.',
      );
    }

    const submittedAnswersByQuestionId = new Map(
      answers.map((submittedAnswer) => [
        submittedAnswer.questionId.trim(),
        submittedAnswer.answer,
      ]),
    );

    const preparedAnswers = questions.map(
      (question) => {
        const preparedData = prepareSubmittedAnswer(
          question,
          submittedAnswersByQuestionId.get(question.id),
        );

        const { result, ...answerData } = preparedData;

        return {
          question,
          result,
          data: answerData,
        };
      },
    );

    for (const preparedAnswer of preparedAnswers) {
      await transaction.answer.upsert({
        where: {
          submissionId_questionId: {
            submissionId: submission.id,
            questionId: preparedAnswer.question.id,
          },
        },
        create: {
          submissionId: submission.id,
          questionId: preparedAnswer.question.id,
          ...preparedAnswer.data,
        },
        update: preparedAnswer.data,
      });
    }

    const scoreResult = await transaction.answer.aggregate({
      where: {
        submissionId: submission.id,
        score: {
          not: null,
        },
      },
      _sum: {
        score: true,
      },
    });

    const automaticCorrection =
      summarizeAutomaticCorrection(preparedAnswers);

    const hasEssayQuestions = questions.some(
      (question) => question.type === 'ESSAY',
    );

    const updatedSubmission =
      await transaction.examSubmission.update({
      where: {
        id: submission.id,
      },
      data: {
        status: hasEssayQuestions
          ? 'SUBMITTED'
          : 'CORRECTED',
        submittedAt: new Date(),
        score: scoreResult._sum.score ?? 0,
      },
      include: {
        exam: true,
        answers: true,
      },
    });

    return {
      ...updatedSubmission,
      automaticCorrection,
    };
  });
};

const listSubmissions = async ({
  examId,
  studentId,
  status,
} = {}) => {
  if (status) {
    validateSubmissionStatus(status);
  }

  return prisma.examSubmission.findMany({
    where: {
      ...(examId && { examId }),
      ...(studentId && { studentId }),
      ...(status && { status }),
    },
    include: {
      exam: true,
      answers: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const updateSubmission = async (
  id,
  submissionData,
) => {
  const existingSubmission =
    await getSubmissionById(id);

  const data = {};

  const finalExamId =
    submissionData.examId !== undefined
      ? submissionData.examId
      : existingSubmission.examId;

  const finalStudentId =
    submissionData.studentId !== undefined
      ? submissionData.studentId
      : existingSubmission.studentId;

  if (
    typeof finalExamId !== 'string' ||
    !finalExamId.trim()
  ) {
    throw createServiceError(
      'O examId deve ser informado corretamente.',
    );
  }

  if (
    typeof finalStudentId !== 'string' ||
    !finalStudentId.trim()
  ) {
    throw createServiceError(
      'O studentId deve ser informado corretamente.',
    );
  }

  const normalizedExamId = finalExamId.trim();
  const normalizedStudentId =
    finalStudentId.trim();

  if (submissionData.examId !== undefined) {
    await findExamOrFail(normalizedExamId);
    data.examId = normalizedExamId;
  }

  if (submissionData.studentId !== undefined) {
    data.studentId = normalizedStudentId;
  }

  if (
    submissionData.examId !== undefined ||
    submissionData.studentId !== undefined
  ) {
    await verifyExistingSubmission(
      normalizedExamId,
      normalizedStudentId,
      id,
    );
  }

  if (submissionData.startedAt !== undefined) {
    data.startedAt = parseDate(
      submissionData.startedAt,
      'startedAt',
    );
  }

  if (submissionData.submittedAt !== undefined) {
    data.submittedAt = parseDate(
      submissionData.submittedAt,
      'submittedAt',
    );
  }

  if (submissionData.score !== undefined) {
    data.score = validateScore(
      submissionData.score,
    );
  }

  const requestedStatus =
    submissionData.status !== undefined
      ? submissionData.status
      : existingSubmission.status;

  validateSubmissionStatus(requestedStatus);

  if (submissionData.status !== undefined) {
    validateStatusTransition(
      existingSubmission.status,
      requestedStatus,
    );

    data.status = requestedStatus;
  }

  if (requestedStatus === 'NOT_STARTED') {
    data.startedAt = null;
    data.submittedAt = null;
    data.score = null;
  }

  if (requestedStatus === 'IN_PROGRESS') {
    data.startedAt =
      data.startedAt !== undefined
        ? data.startedAt
        : existingSubmission.startedAt || new Date();

    data.submittedAt = null;

    data.score = calculateAnswersScore(
      existingSubmission.answers,
    );
  }

  if (requestedStatus === 'SUBMITTED') {
    data.startedAt =
      data.startedAt !== undefined
        ? data.startedAt
        : existingSubmission.startedAt || new Date();

    const isEnteringSubmittedStatus =
      existingSubmission.status !== 'SUBMITTED';

    data.submittedAt =
      data.submittedAt !== undefined
        ? data.submittedAt
        : isEnteringSubmittedStatus
          ? new Date()
          : existingSubmission.submittedAt ||
            new Date();

    data.score = calculateAnswersScore(
      existingSubmission.answers,
    );
  }

  if (requestedStatus === 'CORRECTED') {
    const effectiveSubmittedAt =
      data.submittedAt !== undefined
        ? data.submittedAt
        : existingSubmission.submittedAt;

    if (!effectiveSubmittedAt) {
      throw createServiceError(
        'A submissao precisa ser enviada antes de ser corrigida.',
      );
    }

    data.startedAt =
      data.startedAt !== undefined
        ? data.startedAt
        : existingSubmission.startedAt;

    data.submittedAt = effectiveSubmittedAt;
  }

  const finalStartedAt =
    data.startedAt !== undefined
      ? data.startedAt
      : existingSubmission.startedAt;

  const finalSubmittedAt =
    data.submittedAt !== undefined
      ? data.submittedAt
      : existingSubmission.submittedAt;

  if (
    finalStartedAt &&
    finalSubmittedAt &&
    finalSubmittedAt < finalStartedAt
  ) {
    throw createServiceError(
      'A data de envio nao pode ser anterior a data de inicio.',
    );
  }

  try {
    return await prisma.examSubmission.update({
      where: {
        id,
      },
      data,
      include: {
        exam: true,
        answers: true,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw createServiceError(
        'Este aluno ja possui uma submissao para esta avaliacao.',
        409,
      );
    }

    throw error;
  }
};

const deleteSubmission = async (id) => {
  await getSubmissionById(id);

  await prisma.examSubmission.delete({
    where: {
      id,
    },
  });

  return {
    message: 'Submissao excluida com sucesso.',
  };
};

module.exports = {
  createSubmission,
  submitSubmission,
  listSubmissions,
  getSubmissionById,
  getSubmissionResult,
  updateSubmission,
  deleteSubmission,
};
