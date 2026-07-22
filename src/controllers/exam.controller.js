const prisma = require('../config/prisma');

const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      classroomId,
      teacherId,
      availableAt,
      deadlineAt,
      timeLimit,
    } = req.body;

    if (
      !title ||
      !description ||
      !classroomId ||
      !teacherId ||
      !availableAt ||
      !deadlineAt
    ) {
      return res.status(400).json({
        error: 'Todos os campos obrigatorios devem ser informados.',
      });
    }

    const parsedAvailableAt = new Date(availableAt);
    const parsedDeadlineAt = new Date(deadlineAt);

    if (
      Number.isNaN(parsedAvailableAt.getTime()) ||
      Number.isNaN(parsedDeadlineAt.getTime())
    ) {
      return res.status(400).json({
        error: 'As datas informadas sao invalidas.',
      });
    }

    if (parsedDeadlineAt <= parsedAvailableAt) {
      return res.status(400).json({
        error: 'A data limite deve ser posterior a data de disponibilidade.',
      });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        classroomId,
        teacherId,
        availableAt: parsedAvailableAt,
        deadlineAt: parsedDeadlineAt,
        timeLimit: timeLimit ?? null,
      },
    });

    return res.status(201).json(exam);
  } catch (error) {
    console.error('Erro ao criar avaliacao:', error);

    return res.status(500).json({
      error: 'Erro interno do servidor.',
    });
  }
};

const listExams = async (req, res) => {
  try {
    const { classroomId, teacherId, status } = req.query;

    const exams = await prisma.exam.findMany({
      where: {
        ...(classroomId && { classroomId }),
        ...(teacherId && { teacherId }),
        ...(status && { status }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(exams);
  } catch (error) {
    console.error('Erro ao listar avaliacoes:', error);

    return res.status(500).json({
      error: 'Erro interno do servidor.',
    });
  }
};

const listUpcomingExams = async (req, res) => {
  try {
    const { classroomId } = req.query;

    if (!classroomId) {
      return res.status(400).json({
        error: 'O classroomId deve ser informado.',
      });
    }

    const currentDate = new Date();

    const exams = await prisma.exam.findMany({
      where: {
        classroomId,
        status: 'PUBLISHED',
        availableAt: {
          gte: currentDate,
        },
      },
      orderBy: {
        availableAt: 'asc',
      },
    });

    const upcomingExams = exams.map((exam) => {
      const formattedAvailableAt = exam.availableAt.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        ...exam,
        message: `A avaliacao "${exam.title}" estara disponivel em ${formattedAvailableAt}.`,
      };
    });

    return res.status(200).json({
      message:
        upcomingExams.length > 0
          ? 'Proximas avaliacoes encontradas com sucesso.'
          : 'Nenhuma avaliacao futura foi encontrada para esta turma.',
      total: upcomingExams.length,
      exams: upcomingExams,
    });
  } catch (error) {
    console.error('Erro ao listar proximas avaliacoes:', error);

    return res.status(500).json({
      error: 'Erro interno do servidor.',
    });
  }
};

const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      return res.status(404).json({
        error: 'Avaliacao nao encontrada.',
      });
    }

    return res.status(200).json(exam);
  } catch (error) {
    console.error('Erro ao buscar avaliacao:', error);

    return res.status(500).json({
      error: 'Erro interno do servidor.',
    });
  }
};

const updateExam = async (req, res) => {
  try {
    const { id } = req.params;

    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return res.status(404).json({
        error: 'Avaliacao nao encontrada.',
      });
    }

    const data = {};

    if (req.body.title !== undefined) {
      data.title = req.body.title;
    }

    if (req.body.description !== undefined) {
      data.description = req.body.description;
    }

    if (req.body.classroomId !== undefined) {
      data.classroomId = req.body.classroomId;
    }

    if (req.body.teacherId !== undefined) {
      data.teacherId = req.body.teacherId;
    }

    if (req.body.availableAt !== undefined) {
      const parsedAvailableAt = new Date(req.body.availableAt);

      if (Number.isNaN(parsedAvailableAt.getTime())) {
        return res.status(400).json({
          error: 'A data de disponibilidade informada e invalida.',
        });
      }

      data.availableAt = parsedAvailableAt;
    }

    if (req.body.deadlineAt !== undefined) {
      const parsedDeadlineAt = new Date(req.body.deadlineAt);

      if (Number.isNaN(parsedDeadlineAt.getTime())) {
        return res.status(400).json({
          error: 'A data limite informada e invalida.',
        });
      }

      data.deadlineAt = parsedDeadlineAt;
    }

    if (req.body.status !== undefined) {
      data.status = req.body.status;
    }

    if (req.body.timeLimit !== undefined) {
      data.timeLimit = req.body.timeLimit;
    }

    const finalAvailableAt = data.availableAt ?? existingExam.availableAt;
    const finalDeadlineAt = data.deadlineAt ?? existingExam.deadlineAt;

    if (finalDeadlineAt <= finalAvailableAt) {
      return res.status(400).json({
        error: 'A data limite deve ser posterior a data de disponibilidade.',
      });
    }

    const exam = await prisma.exam.update({
      where: { id },
      data,
    });

    return res.status(200).json(exam);
  } catch (error) {
    console.error('Erro ao atualizar avaliacao:', error);

    return res.status(500).json({
      error: 'Erro interno do servidor.',
    });
  }
};

const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return res.status(404).json({
        error: 'Avaliacao nao encontrada.',
      });
    }

    await prisma.exam.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'Avaliacao excluida com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao excluir avaliacao:', error);

    return res.status(500).json({
      error: 'Erro interno do servidor.',
    });
  }
};

module.exports = {
  createExam,
  listExams,
  listUpcomingExams,
  getExamById,
  updateExam,
  deleteExam,
};