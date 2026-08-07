import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  orderId?: mongoose.Types.ObjectId;
  payerId: mongoose.Types.ObjectId;
  payeeId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  type: 'PAYMENT' | 'REFUND' | 'TRANSFER' | 'WITHDRAWAL';
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  transactionId: { type: String, required: true, unique: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  payerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  payeeId: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING' 
  },
  type: {
    type: String,
    enum: ['PAYMENT', 'REFUND', 'TRANSFER', 'WITHDRAWAL'],
    required: true
  }
}, { timestamps: true });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
