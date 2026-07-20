const questionService = require('../services/question.service');

const createQuestion = async (req, res) => {
  try {
    const question = await questionService.createQuestion(req.body);

    return res.status(201).json(question);
  } catch (error) {
    console.error('Erro ao criar questao:', error);

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
};

const listQuestions = async (req, res) => {
  try {
    const questions = await questionService.listQuestions(req.query);

    return res.status(200).json(questions);
  } catch (error) {
    console.error('Erro ao listar questoes:', error);

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await questionService.getQuestionById(req.params.id);

    return res.status(200).json(question);
  } catch (error) {
    console.error('Erro ao buscar questao:', error);

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await questionService.updateQuestion(
      req.params.id,
      req.body,
    );

    return res.status(200).json(question);
  } catch (error) {
    console.error('Erro ao atualizar questao:', error);

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const result = await questionService.deleteQuestion(req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao excluir questao:', error);

    return res.status(error.statusCode || 500).json({
      error: error.message || 'Erro interno do servidor.',
    });
  }
};

module.exports = {
  createQuestion,
  listQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};