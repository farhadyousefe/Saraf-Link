import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import Debug from 'debug';
import TransactionRouter from './routes/transaction.js';
import errorHandler from './middleware/error.js';

const dbDebug = Debug('app:db');
dbDebug.color = 2;
const httpDebug = Debug('app:express');
httpDebug.color = 3;

const app = express();
const PORT = process.env.PORT || 3000;
const database = process.env.DATABASE_URL;

mongoose
  .connect(database)
  .then(() => dbDebug('Database connected successfully'))
  .catch((err) => {
    dbDebug(`error in connection: ${err.message}`);
    process.exit(1);
  });

app.use(express.json());
app.use('/api/transactions', TransactionRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  httpDebug(`Listening on PORT: ${PORT}`);
});
