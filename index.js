import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import Debug from 'debug';
import TransactionRouter from './routes/transaction.js';
import errorHandler from './middleware/error.js';
import authRouter from './routes/auth.js';

const dbDebug = Debug('app:db');
dbDebug.color = 2;
const httpDebug = Debug('app:express');
httpDebug.color = 3;

const app = express();
const PORT = process.env.PORT || 3000;
const database = process.env.DATABASE_URL;
const privateKey = process.env.JWT_PRIVATE_KEY;
if (!privateKey) {
  httpDebug('FATAL ERROR: JWT_PRIVATE_KEY is not defined in the environment.');
  process.exit(1);
}

mongoose
  .connect(database)
  .then(() => dbDebug('Database connected successfully'))
  .catch((err) => {
    dbDebug(`error in connection: ${err.message}`);
    process.exit(1);
  });

app.use(express.json());
app.use('/api/v1/transactions', TransactionRouter);
app.use('/api/v1/auth', authRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  httpDebug(`Listening on PORT: ${PORT}`);
});
