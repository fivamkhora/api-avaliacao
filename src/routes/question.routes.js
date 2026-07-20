const express = require('express');

const {
  createQuestion,
  listQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/question.controller');

const router = express.Router();

router.post('/', createQuestion);

router.get('/', listQuestions);

router.get('/:id', getQuestionById);

router.put('/:id', updateQuestion);

router.delete('/:id', deleteQuestion);

module.exports = router;