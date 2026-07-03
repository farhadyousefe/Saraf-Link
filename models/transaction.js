import Joi from 'joi';
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    senderName: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    amount: {
      type: Number,
      min: 1,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ['USD', 'AFN', 'INR'],
    },
    status: {
      type: String,
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const transaction = mongoose.model('Transaction', transactionSchema);

function validateTransaction(userData) {
  const schema = Joi.object({
    senderName: Joi.string().trim().min(5).required(),
    amount: Joi.number().min(1).required(),
    currency: Joi.string().required().valid('USD', 'INR', 'AFN'),
    status: Joi.string().valid('pending', 'completed', 'failed'),
  });
  return schema.validate(userData);
}

export { transaction, validateTransaction };
