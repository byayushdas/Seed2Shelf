import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICrop extends Document {
  farmerId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  harvestDate: Date;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  blockchainTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema = new Schema<ICrop>({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  pricePerUnit: { type: Number, required: true },
  harvestDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'RESERVED', 'SOLD'],
    default: 'AVAILABLE' 
  },
  blockchainTxHash: { type: String }
}, { timestamps: true });

const Crop: Model<ICrop> = mongoose.models.Crop || mongoose.model<ICrop>('Crop', CropSchema);

export default Crop;
