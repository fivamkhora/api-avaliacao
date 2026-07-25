const prisma = require('../config/prisma');

const DEFAULT_ASSESSMENTS_URL =
  'https://api-ia-khora.onrender.com/api/v1/assessments';

const QUESTION_TYPE_BY_API_IA_TYPE = {
  multipla_escolha: 'MULTIPLE_CHOICE',
  verdadeiro_falso: 'TRUE_FALSE',
  dissertativa: 'ESSAY',
};

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const getAssessmentsUrl = () =>
  process.env.API_IA_ASSESSMENTS_URL || DEFAULT_ASSESSMENTS_URL;

const normalizeRequiredString = (value, fieldName) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw createServiceError(`${fieldName} deve ser informado.`, 400);
  }

  return value.trim();
};

const mapQuestionType = (type) => {
  const questionType = QUESTION_TYPE_BY_API_IA_TYPE[type];

  if (!questionType) {
    throw createServiceError(
      `Tipo de questao da API-IA nao suportado: ${type}.`,
      422,
    );
  }

  return questionType;
};

const buildDescription = (originalRequest = {}) => {
  const parts = [
    originalRequest.subject && `Disciplina: ${originalRequest.subject}`,
    originalRequest.gradeLevel && `Serie: ${originalRequest.gradeLevel}`,
    originalRequest.classroomMaterial,
    originalRequest.teacherInstructions,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join('\n\n') : null;
};

const mapApiIaAssessment = (assessment) => {
  const version = assessment?.currentVersion;
  const generatedAssessment = version?.assessment;

  if (!generatedAssessment?.title || !Array.isArray(generatedAssessment.questions)) {
    throw createServiceError(
      'A resposta da API-IA nao possui uma avaliacao valida.',
      422,
    );
  }

  const answerKeyByNumber = new Map(
    (generatedAssessment.answerKey || []).map((answerKey) => [
      answerKey.number,
      answerKey,
    ]),
  );

  const questions = generatedAssessment.questions.map((question) => {
    if (!Number.isInteger(question.number) || question.number <= 0) {
      throw createServiceError(
        'A API-IA retornou uma questao sem numero valido.',
        422,
      );
    }

    if (typeof question.statement !== 'string' || !question.statement.trim()) {
      throw createServiceError(
        'A API-IA retornou uma questao sem enunciado valido.',
        422,
      );
    }

    const questionType = mapQuestionType(question.type);
    const answerKey = answerKeyByNumber.get(question.number);
    const options = Array.isArray(question.alternatives)
      ? question.alternatives.map((alternative) => ({
        key: String(alternative.label).trim(),
        text: String(alternative.text).trim(),
      }))
      : undefined;
    const points = Number(question.points);

    if (!Number.isFinite(points) || points <= 0) {
      throw createServiceError(
        'A API-IA retornou uma pontuacao de questao invalida.',
        422,
      );
    }

    if (
      questionType !== 'ESSAY' &&
      (!options || options.length < 2 || !answerKey?.answer?.trim())
    ) {
      throw createServiceError(
        'A API-IA retornou uma questao objetiva sem alternativas ou gabarito.',
        422,
      );
    }

    return {
      statement: question.statement.trim(),
      type: questionType,
      options: questionType === 'ESSAY' ? undefined : options,
      correctAnswer: answerKey?.answer?.trim() || null,
      rubric: answerKey?.rubric?.trim() || null,
      points,
      position: question.number,
    };
  });

  const positions = new Set(questions.map((question) => question.position));
  if (positions.size !== questions.length) {
    throw createServiceError(
      'A API-IA retornou numeros de questao duplicados.',
      422,
    );
  }

  return {
    title: generatedAssessment.title.trim(),
    description: buildDescription(assessment.originalRequest),
    aiVersion: version.version || null,
    questions,
  };
};

const fetchAssessment = async (assessmentId, fetchImplementation = fetch) => {
  const url = new URL(getAssessmentsUrl());
  url.searchParams.set('assessmentId', assessmentId);

  let response;
  try {
    response = await fetchImplementation(url, {
      headers: {
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    throw createServiceError(
      `Nao foi possivel consultar a API-IA: ${error.message}`,
      502,
    );
  }

  if (!response.ok) {
    throw createServiceError(
      `A API-IA retornou o status ${response.status}.`,
      502,
    );
  }

  const payload = await response.json();
  const assessment = payload?.data?.find((item) => item.id === assessmentId);

  if (!assessment) {
    throw createServiceError('Avaliacao nao encontrada na API-IA.', 404);
  }

  return assessment;
};

const importApiIaAssessment = async (
  assessmentId,
  importData = {},
  dependencies = {},
) => {
  const normalizedAssessmentId = normalizeRequiredString(
    assessmentId,
    'assessmentId',
  );
  const classroomId = normalizeRequiredString(
    importData.classroomId,
    'classroomId',
  );
  const teacherId = normalizeRequiredString(importData.teacherId, 'teacherId');
  const assessment = await fetchAssessment(
    normalizedAssessmentId,
    dependencies.fetchImplementation,
  );
  const mappedAssessment = mapApiIaAssessment(assessment);
  const databaseClient = dependencies.prismaClient || prisma;

  return databaseClient.$transaction(async (transaction) => {
    const existingExam = await transaction.exam.findUnique({
      where: {
        externalAssessmentId: normalizedAssessmentId,
      },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (existingExam?._count.submissions > 0) {
      throw createServiceError(
        'A avaliacao importada possui submissoes e nao pode ser sobrescrita.',
        409,
      );
    }

    const data = {
      title: mappedAssessment.title,
      description: mappedAssessment.description,
      classroomId,
      teacherId,
      externalAssessmentId: normalizedAssessmentId,
      aiVersion: mappedAssessment.aiVersion,
      questions: {
        create: mappedAssessment.questions,
      },
    };

    const exam = existingExam
      ? await transaction.exam.update({
        where: { id: existingExam.id },
        data: {
          ...data,
          questions: {
            deleteMany: {},
            create: mappedAssessment.questions,
          },
        },
        include: { questions: { orderBy: { position: 'asc' } } },
      })
      : await transaction.exam.create({
        data,
        include: { questions: { orderBy: { position: 'asc' } } },
      });

    return {
      created: !existingExam,
      exam,
    };
  });
};

module.exports = {
  importApiIaAssessment,
  mapApiIaAssessment,
};
