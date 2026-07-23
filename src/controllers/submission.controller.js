const submissionService = require('../services/submission.service');

const createSubmission = async (req, res) => {
  try {
    const submission = await submissionService.createSubmission(req.body);

    return res.status(201).json(submission);
  } catch (error) {
    console.error('Erro ao criar submissao:', error);

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
};

const submitSubmission = async (req, res) => {
  try {
    const submission =
      await submissionService.submitSubmission(
        req.params.submissionId,
        req.body,
      );

    return res.status(200).json(submission);
  } catch (error) {
    console.error('Erro ao enviar submissao:', error);

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
};

const listSubmissions = async (req, res) => {
  try {
    const submissions = await submissionService.listSubmissions(req.query);

    return res.status(200).json(submissions);
  } catch (error) {
    console.error('Erro ao listar submissoes:', error);

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submission = await submissionService.getSubmissionById(
      req.params.id,
    );

    return res.status(200).json(submission);
  } catch (error) {
    console.error('Erro ao buscar submissao:', error);

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
};

const getSubmissionResult = async (req, res) => {
  try {
    const result =
      await submissionService.getSubmissionResult(
        req.params.submissionId,
      );

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      'Erro ao buscar resultado da submissao:',
      error,
    );

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
};

const updateSubmission = async (req, res) => {
  try {
    const submission = await submissionService.updateSubmission(
      req.params.id,
      req.body,
    );

    return res.status(200).json(submission);
  } catch (error) {
    console.error('Erro ao atualizar submissao:', error);

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const result = await submissionService.deleteSubmission(
      req.params.id,
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao excluir submissao:', error);

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
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
