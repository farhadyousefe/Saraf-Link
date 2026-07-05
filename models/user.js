import mongoose from 'mongoose';
import Joi from 'joi';

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

const user = mongoose.model('User', userSchema);

function validateUser(userData) {
  const schema = Joi.object({
    name: Joi.string().required().min(5).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(72),
    role: Joi.string().valid('agent', 'admin'),
  });

  return schema.validate(userData);
}

export { user, validateUser };
