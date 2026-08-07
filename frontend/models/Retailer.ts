import mongoose, { Schema } from 'mongoose';
import User, { IUser } from './User';

export interface IRetailer extends IUser {
  storeName: string;
  storeLocation: string;
}

const RetailerSchema = new Schema<IRetailer>({
  storeName: { type: String, default: '' },
  storeLocation: { type: String, default: '' }
});

const Retailer = User.discriminators?.retailer || User.discriminator<IRetailer>('retailer', RetailerSchema);

export default Retailer;
