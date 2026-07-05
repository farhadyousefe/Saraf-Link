import express from 'express';
import { Account, validateAccount } from '../models/Account.js';
import auth from '../middleware/auth.js';
import Debug from 'debug';

const dbDebug = Debug('app:db');
dbDebug.color = 2;
const httpDebug = Debug('app:express');
httpDebug.color = 3;

const router = express.Router();

router.post('/', auth, async (req, res) => {
  httpDebug('A post request for account creation is made');
  const { error, value } = validateAccount(req.body);
  if (error) {
    httpDebug(`Joi Validation Error: ${error.details[0].message}`);
    return res
      .status(400)
      .send(`Joi Validation Error: ${error.details[0].message}`);
  }
  value.lastUpdatedBy = req.user._id;
  const newAccount = new Account(value);

  await newAccount.save();
  dbDebug('new account was made');
  res.status(201).send(newAccount);
});

export default router;
