const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./swagger');
const examRoutes = require('./routes/exam.routes');
const questionRoutes = require('./routes/question.routes');
const submissionRoutes = require('./routes/submission.routes');
const answerRoutes = require('./routes/answer.routes');

const app = express();

// The TLS connection terminates at the reverse proxy in hosted environments.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api-avaliacao',
    timestamp: new Date().toISOString(),
  });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/exams', examRoutes);
app.use('/questions', questionRoutes);
app.use('/submissions', submissionRoutes);
app.use('/answers', answerRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Rota nao encontrada.',
  });
});

module.exports = app;
