import mongoose, { Schema } from 'mongoose';
import User, { IUser } from './User';

export interface IAdmin extends IUser {
  permissions: string[];
}

const AdminSchema = new Schema<IAdmin>({
  permissions: { type: [String], default: [] },
});

// Create discriminator on the base User model
const Admin = User.discriminators?.admin || User.discriminator<IAdmin>('admin', AdminSchema);

export default Admin;
