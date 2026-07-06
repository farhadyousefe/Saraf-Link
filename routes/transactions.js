import express from 'express';
import Debug from 'debug';
import { Transaction, validateTransaction } from '../models/Transaction.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import { Account } from '../models/Account.js';
import mongoose from 'mongoose';

const dbDebug = Debug('app:db');
dbDebug.color = 2;
const httpDebug = Debug('app:express');
httpDebug.color = 3;

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
  httpDebug('A post transaction request is made');
  const { error, value } = validateTransaction(req.body);

  if (error) {
    httpDebug(`Joi Validation Error: ${error.details[0].message}`);
    return res
      .status(400)
      .send(`Joi Validation Error: ${error.details[0].message}`);
  }

  // Declare session in outer scope so catch block can access it
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Fetch account within the transaction session to prevent race conditions
    const account = await Account.findOne({
      branchName: value.branchName,
      currency: value.currency,
    }).session(session);

    if (!account || account.currentBalance < value.amount) {
      dbDebug('Transaction rejected: Insufficient branch liquidity.');
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .send('Transaction rejected: Insufficient branch liquidity.');
    }

    // 2. Update balance and save passing the session
    account.currentBalance -= value.amount;
    await account.save({ session });
    dbDebug('Account Balance is updated');

    // 3. Create transaction passing the session
    const newTransaction = new Transaction(value);
    await newTransaction.save({ session });

    // 4. Commit and clean up
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(newTransaction);
  } catch (error) {
    // Abort transaction safely if it was started
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    dbDebug(`Transaction aborted due to error: ${error.message}`);
    next(error); // Forward to Express global error handler instead of throwing
  }
});

router.get('/', auth, async (req, res, next) => {
  httpDebug('a transaction history request is made');
  const limit = parseInt(req.query.limit) || 10;
  try {
    const history = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json(history);
  } catch (error) {
    next(error);
  }
});

router.get('/admin-audit', [auth, admin], async (req, res) => {
  res
    .status(200)
    .send('Welcome to the high-security admin financial audit portal.');
});

export default router;
