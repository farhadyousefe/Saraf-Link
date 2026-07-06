import mongoose from 'mongoose';
import Joi from 'joi';

const accountSchema = new mongoose.Schema(
  {
    branchName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    currency: {
      type: String,
      required: true,
      enum: ['USD', 'AFN', 'INR'],
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Account = mongoose.model('Account', accountSchema);

function validateAccount(account) {
  const schema = Joi.object({
    branchName: Joi.string().required().min(3).max(30),
    currency: Joi.string().valid('USD', 'AFN', 'INR').required(),
    currentBalance: Joi.number().default(0),
    lastUpdatedBy: Joi.string(),
  });
  return schema.validate(account);
}

export { Account, validateAccount };
