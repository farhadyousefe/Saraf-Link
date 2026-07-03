import express from 'express';
import Debug from 'debug';
import { transaction, validateTransaction } from '../models/transaction.js';

const dbDebug = Debug('app:db');
dbDebug.color = 2;
const httpDebug = Debug('app:express');
httpDebug.color = 3;

const router = express.Router();

router.post('/', async (req, res) => {
  httpDebug('A post request is made');
  const { error, value } = validateTransaction(req.body);

  if (error) {
    httpDebug(`Joi Validation Error: ${error.details[0].message}`);
    return res
      .status(400)
      .send(`Joi Validation Error: ${error.details[0].message}`);
  }
  try {
    const newTransaction = new transaction(value);
    await newTransaction.save();
    return res.status(201).json(newTransaction);
  } catch (error) {
    httpDebug(`Error in server: ${error.message}`);
    return res.status(500).send(`Error in server`);
  }
});

export default router;
