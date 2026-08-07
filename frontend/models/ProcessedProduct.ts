import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProcessedProduct extends Document {
  processorId: mongoose.Types.ObjectId;
  sourceCropIds: mongoose.Types.ObjectId[];
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  blockchainTxHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessedProductSchema = new Schema<IProcessedProduct>({
  processorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sourceCropIds: [{ type: Schema.Types.ObjectId, ref: 'Crop' }],
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  pricePerUnit: { type: Number, required: true },
  status: { type: String, enum: ['AVAILABLE', 'RESERVED', 'SOLD'], default: 'AVAILABLE' },
  blockchainTxHash: { type: String, default: '' },
}, { timestamps: true });

const ProcessedProduct: Model<IProcessedProduct> = mongoose.models.ProcessedProduct || mongoose.model<IProcessedProduct>('ProcessedProduct', ProcessedProductSchema);

export default ProcessedProduct;
