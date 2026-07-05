import mongoose from 'mongoose';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import Debug from 'debug';
const dbDebug = Debug('app:db');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'agent'],
    default: 'agent',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});
userSchema.methods.generateAuthToken = function () {
  const privateKey = process.env.JWT_PRIVATE_KEY;

  const token = jwt.sign({ _id: this._id, role: this.role }, privateKey);
  if (token) {
    dbDebug('Token was generated and used');
  }
  return token;
};

/**
 * @typedef {mongoose.Document & {
 *   name: string,
 *   email: string,
 *   generateAuthToken: () => string
 * }} UserInstance
 */

const User = mongoose.model('user', userSchema);

function validateUser(userData) {
  const schema = Joi.object({
    name: Joi.string().required().min(5).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(72),
    role: Joi.string().valid('agent', 'admin'),
  });

  return schema.validate(userData);
}

export { User, validateUser };
