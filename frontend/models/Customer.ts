import mongoose, { Schema } from 'mongoose';
import User, { IUser } from './User';

export interface ICustomer extends IUser {
  // Add any customer specific fields here if needed.
  // We'll leave it empty for now as requested.
}

const CustomerSchema = new Schema<ICustomer>({
});

const Customer = User.discriminators?.customer || User.discriminator<ICustomer>('customer', CustomerSchema);

export default Customer;
