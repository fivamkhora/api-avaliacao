const prisma = require('../config/prisma');

const SUBMISSION_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
  'CORRECTED',
];

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

const getSubmissionById = async (id) => {
  const submission = await prisma.examSubmission.findUnique({
    where: {
      id,
    },
    include: {
      exam: true,
      answers: true,
    },
  });

  if (!submission) {
    throw createServiceError('Submissao nao encontrada.', 404);
  }

  return submission;
};

const verifyExistingSubmission = async (
  examId,
  studentId,
  ignoredSubmissionId = null,
) => {
  const existingSubmission = await prisma.examSubmission.findFirst({
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

  await findExamOrFail(normalizedExamId);

  await verifyExistingSubmission(
    normalizedExamId,
    normalizedStudentId,
  );

  try {
    return await prisma.examSubmission.create({
      data: {
        examId: normalizedExamId,
        studentId: normalizedStudentId,
        status: 'NOT_STARTED',
      },
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

const updateSubmission = async (id, submissionData) => {
  const existingSubmission = await getSubmissionById(id);

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
  const normalizedStudentId = finalStudentId.trim();

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

  if (submissionData.status !== undefined) {
    validateSubmissionStatus(submissionData.status);

    data.status = submissionData.status;

    if (
      submissionData.status === 'IN_PROGRESS' &&
      !existingSubmission.startedAt
    ) {
      data.startedAt = new Date();
    }

    if (
      submissionData.status === 'SUBMITTED' &&
      !existingSubmission.submittedAt
    ) {
      data.submittedAt = new Date();

      if (!existingSubmission.startedAt) {
        data.startedAt = new Date();
      }
    }

    if (submissionData.status === 'CORRECTED') {
      if (!existingSubmission.submittedAt) {
        throw createServiceError(
          'A submissao precisa ser enviada antes de ser corrigida.',
        );
      }
    }
  }

  if (submissionData.startedAt !== undefined) {
    if (submissionData.startedAt === null) {
      data.startedAt = null;
    } else {
      const parsedStartedAt = new Date(
        submissionData.startedAt,
      );

      if (Number.isNaN(parsedStartedAt.getTime())) {
        throw createServiceError(
          'A data de inicio informada e invalida.',
        );
      }

      data.startedAt = parsedStartedAt;
    }
  }

  if (submissionData.submittedAt !== undefined) {
    if (submissionData.submittedAt === null) {
      data.submittedAt = null;
    } else {
      const parsedSubmittedAt = new Date(
        submissionData.submittedAt,
      );

      if (Number.isNaN(parsedSubmittedAt.getTime())) {
        throw createServiceError(
          'A data de envio informada e invalida.',
        );
      }

      data.submittedAt = parsedSubmittedAt;
    }
  }

  if (submissionData.score !== undefined) {
    data.score = validateScore(submissionData.score);
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
  listSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
};