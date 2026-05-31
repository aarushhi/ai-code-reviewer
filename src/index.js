require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./db');
const webhookRouter = require('./routes/webhook');
const reviewsRouter = require('./routes/reviews');

const app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AI Code Reviewer is alive! 🚀' });
});

app.use('/webhook', webhookRouter);
app.use('/reviews', reviewsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});