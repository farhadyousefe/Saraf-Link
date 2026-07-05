import express from 'express';
import Debug from 'debug';
import { Transaction, validateTransaction } from '../models/transaction.js';
import auth from '../middleware/auth.js';

const dbDebug = Debug('app:db');
dbDebug.color = 2;
const httpDebug = Debug('app:express');
httpDebug.color = 3;

const router = express.Router();

router.post('/', auth, async (req, res) => {
  httpDebug('A post request is made');
  const { error, value } = validateTransaction(req.body);

  if (error) {
    httpDebug(`Joi Validation Error: ${error.details[0].message}`);
    return res
      .status(400)
      .send(`Joi Validation Error: ${error.details[0].message}`);
  }
  const newTransaction = new Transaction(value);
  await newTransaction.save();
  return res.status(201).json(newTransaction);
});

export default router;
