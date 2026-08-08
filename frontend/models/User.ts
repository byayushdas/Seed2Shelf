import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: string;
  walletAddress?: string;
  profilePhoto?: string;
  farmerId?: string;
  processorId?: string;
  adminId?: string;
  distributorId?: string;
  retailerId?: string;
  mobileNumber?: string;
  dob?: string;
  gender?: string;
  permanentAddress?: string;
  state?: string;
  district?: string;
  village?: string;
  pinCode?: string;
  farmName?: string;
  farmLocation?: string;
  landArea?: number;
  mainCrops?: string;
  farmingType?: string;
  regDate?: Date;
  aadhaarNumber?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
  kycStatus?: string;
  verificationDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for oauth
  role: { type: String, required: true },
  walletAddress: { type: String, unique: true, sparse: true },
  profilePhoto: { type: String },
  farmerId: { type: String, unique: true, sparse: true },
  processorId: { type: String, unique: true, sparse: true },
  adminId: { type: String, unique: true, sparse: true },
  distributorId: { type: String, unique: true, sparse: true },
  retailerId: { type: String, unique: true, sparse: true },
  mobileNumber: { type: String },
  dob: { type: String },
  gender: { type: String },
  permanentAddress: { type: String },
  state: { type: String },
  district: { type: String },
  village: { type: String },
  pinCode: { type: String },
  farmName: { type: String },
  farmLocation: { type: String },
  landArea: { type: Number },
  mainCrops: { type: String },
  farmingType: { type: String },
  regDate: { type: Date },
  aadhaarNumber: { type: String },
  aadhaarFront: { type: String },
  aadhaarBack: { type: String },
  kycStatus: { type: String, default: "Pending Verification" },
  verificationDate: { type: Date },
  rejectionReason: { type: String },
}, { timestamps: true });

// Prevent mongoose from compiling the model multiple times in next.js
export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
