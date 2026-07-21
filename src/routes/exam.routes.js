const express = require('express');

const {
  createExam,
  listExams,
  listUpcomingExams,
  getExamById,
  updateExam,
  deleteExam,
} = require('../controllers/exam.controller');

const router = express.Router();

router.post('/', createExam);

router.get('/', listExams);

// IMPORTANTE: deve vir antes de "/:id"
router.get('/upcoming', listUpcomingExams);

router.get('/:id', getExamById);

router.put('/:id', updateExam);

router.delete('/:id', deleteExam);

module.exports = router;