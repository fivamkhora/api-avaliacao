const normalizeOption = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value
    .replace(/\s+/g, '')
    .toUpperCase();

  return normalizedValue || null;
};

const calculateAutomaticGrade = (question, answer) => {
  if (question.type === 'ESSAY') {
    return {
      isCorrect: null,
      score: null,
      feedback: null,
      result: null,
    };
  }

  const normalizedAnswer = normalizeOption(answer);

  if (!normalizedAnswer) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Resposta em branco.',
      result: 'blank',
    };
  }

  const normalizedCorrectAnswer = normalizeOption(
    question.correctAnswer,
  );

  if (!normalizedCorrectAnswer) {
    return {
      isCorrect: null,
      score: null,
      feedback: null,
      result: null,
    };
  }

  const isCorrect =
    normalizedAnswer === normalizedCorrectAnswer;

  return {
    isCorrect,
    score: isCorrect ? question.points : 0,
    feedback: isCorrect
      ? 'Resposta correta.'
      : 'Resposta incorreta.',
    result: isCorrect ? 'correct' : 'incorrect',
  };
};

const summarizeAutomaticCorrection = (grades) => {
  return grades.reduce(
    (summary, grade) => {
      if (grade.result === 'correct') {
        summary.correct += 1;
      }

      if (grade.result === 'incorrect') {
        summary.incorrect += 1;
      }

      if (grade.result === 'blank') {
        summary.blank += 1;
      }

      return summary;
    },
    {
      correct: 0,
      incorrect: 0,
      blank: 0,
    },
  );
};

module.exports = {
  normalizeOption,
  calculateAutomaticGrade,
  summarizeAutomaticCorrection,
};
