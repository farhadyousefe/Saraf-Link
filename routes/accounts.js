import express from 'express';
import { Account, validateAccount } from '../models/Account.js';
import auth from '../middleware/auth.js';
import Debug from 'debug';
import Joi from 'joi';

const dbDebug = Debug('app:db');
dbDebug.color = 2;
const httpDebug = Debug('app:express');
httpDebug.color = 3;

const router = express.Router();

// creation of a new account
router.post('/', auth, async (req, res, next) => {
  httpDebug('A post request for account creation is made');
  const { error, value } = validateAccount(req.body);
  if (error) {
    httpDebug(`Joi Validation Error: ${error.details[0].message}`);
    return res
      .status(400)
      .send(`Joi Validation Error: ${error.details[0].message}`);
  }
  try {
    value.lastUpdatedBy = req.user._id;
    const newAccount = new Account(value);

    await newAccount.save();
    dbDebug('new account was made');
    res.status(201).send(newAccount);
  } catch (error) {
    next(error);
  }
});

// deposit request
router.post('/deposit', auth, async (req, res, next) => {
  httpDebug('A deposit request is made');
  //Joi Validation
  const { error, value } = validateDeposit(req.body);
  if (error) {
    httpDebug(`Joi Validation Error: ${error.details[0].message}`);
    return res
      .status(400)
      .send(`Joi Validation Error: ${error.details[0].message}`);
  }

  try {
    const accountToDeposit = await Account.findOne({
      branchName: value.branchName,
      currency: value.currency,
    });
    if (!accountToDeposit) {
      dbDebug('Account is not registered in db');
      return res.status(404).send('Target Branch Vault not found');
    }
    accountToDeposit.currentBalance += value.amount;
    accountToDeposit.lastUpdatedBy = req.user._id;
    await accountToDeposit.save();
    dbDebug(`${value.amount} is deposited successfully`);
    return res.status(200).json(accountToDeposit);
  } catch (error) {
    next(error);
  }
});

//deposit validation using joi
function validateDeposit(deposit) {
  const schema = Joi.object({
    branchName: Joi.string().min(3).required(),
    currency: Joi.string().valid('USD', 'AFN', 'INR').required(),
    amount: Joi.number().min(1).required(),
  });

  return schema.validate(deposit);
}

export default router;
