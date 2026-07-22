const answerService = require('../services/answer.service');

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    message: error.message || 'Erro interno do servidor.',
  });
};

const createAnswer = async (req, res) => {
  try {
    const answer = await answerService.createAnswer(req.body);

    return res.status(201).json(answer);
  } catch (error) {
    return handleError(res, error);
  }
};

const getAnswers = async (req, res) => {
  try {
    const answers = await answerService.getAnswers(req.query);

    return res.status(200).json(answers);
  } catch (error) {
    return handleError(res, error);
  }
};

const getAnswerById = async (req, res) => {
  try {
    const answer = await answerService.getAnswerById(req.params.id);

    return res.status(200).json(answer);
  } catch (error) {
    return handleError(res, error);
  }
};

const updateAnswer = async (req, res) => {
  try {
    const answer = await answerService.updateAnswer(
      req.params.id,
      req.body,
    );

    return res.status(200).json(answer);
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteAnswer = async (req, res) => {
  try {
    const result = await answerService.deleteAnswer(req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createAnswer,
  getAnswers,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
};