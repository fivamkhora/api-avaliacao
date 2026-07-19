const express = require('express');

const {
  createExam,
  listExams,
  getExamById,
  updateExam,
  deleteExam,
} = require('../controllers/exam.controller');

const router = express.Router();

router.post('/', createExam);
router.get('/', listExams);
router.get('/:id', getExamById);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

module.exports = router;