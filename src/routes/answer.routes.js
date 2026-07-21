const express = require('express');
const answerController = require('../controllers/answer.controller');

const router = express.Router();

router.get('/', answerController.getAnswers);

router.post('/', answerController.createAnswer);

router.get('/:id', answerController.getAnswerById);

router.put('/:id', answerController.updateAnswer);

router.delete('/:id', answerController.deleteAnswer);

module.exports = router;