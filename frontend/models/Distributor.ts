import mongoose, { Schema } from 'mongoose';
import User, { IUser } from './User';

export interface IDistributor extends IUser {
  warehouseLocation: string;
  licenseNumber: string;
}

const DistributorSchema = new Schema<IDistributor>({
  warehouseLocation: { type: String, default: '' },
  licenseNumber: { type: String, default: '' }
});

const Distributor = User.discriminators?.distributor || User.discriminator<IDistributor>('distributor', DistributorSchema);

export default Distributor;
