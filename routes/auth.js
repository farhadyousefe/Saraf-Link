import _ from 'lodash'; // package to pick properties from an object
import bcrypt from 'bcrypt';
import express from 'express';
import Debug from 'debug';
import { user, validateUser } from '../models/user.js';
import { valid } from 'joi';
import Joi from 'joi';

const dbDebug = Debug('app:db');
const httpDebug = Debug('app:http');
const appDebug = Debug('app:startup');

const router = express.Router();

// register new user
router.post('/', async (req, res) => {
  httpDebug('new user registration request is made');
  const { error, value } = validateUser(req.body);
  if (error) {
    httpDebug(`Joi Valication Error: ${error.details[0].message}`);
    return res
      .status(400)
      .send(`Joi Valication Error: ${error.details[0].message}`);
  }
  const dublicateUser = await user.findOne({ email: value.email });
  if (dublicateUser) {
    dbDebug('User is register in db');
    return res.status(400).send('User is already registered');
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(value.password, salt);
  value.password = hashPassword;
  appDebug('Password is encrypted');

  const newUser = new user(value);
  await newUser.save();

  delete newUser.password;

  dbDebug('new user is created in db');
  return res.status(201).send(_.pick(newUser, ['_id', 'name', 'email']));
});

// log in the user
router.post('/login', async (req, res) => {
  const { error, value } = validateLogin(req.body);
  if (error) {
    httpDebug(`Joi Valication Error: ${error.details[0].message}`);
    return res
      .status(400)
      .send(`Joi Valication Error: ${error.details[0].message}`);
  }
  const validUser = await user.findOne({ email: value.email });
  if (!validUser) {
    dbDebug('User email Id is not registered');
    return res.status(404).send('Invalid email or password.');
  }
  const validPassword = await bcrypt.compare(
    value.password,
    validUser.password
  );
  if (!validPassword) {
    dbDebug('Entered Password is wrong');
    return res.status(404).send('Invalid email or password.');
  }
});

function validateLogin(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(70),
  });
  return schema.validate(user);
}

export default router;
