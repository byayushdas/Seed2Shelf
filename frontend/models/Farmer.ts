import mongoose, { Schema } from 'mongoose';
import User, { IUser } from './User';

export interface IFarmer extends IUser {
  farmSize: number;
  farmLocation: string;
  certifications: string[];
}

const FarmerSchema = new Schema<IFarmer>({
  farmSize: { type: Number, default: 0 },
  farmLocation: { type: String, default: '' },
  certifications: { type: [String], default: [] },
});

const Farmer = User.discriminators?.farmer || User.discriminator<IFarmer>('farmer', FarmerSchema);

export default Farmer;
