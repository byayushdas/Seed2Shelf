import mongoose, { Schema } from 'mongoose';
import User, { IUser } from './User';

export interface IProcessor extends IUser {
  facilityLocation: string;
  processingTypes: string[];
}

const ProcessorSchema = new Schema<IProcessor>({
  facilityLocation: { type: String, default: '' },
  processingTypes: { type: [String], default: [] }
});

const Processor = User.discriminators?.processor || User.discriminator<IProcessor>('processor', ProcessorSchema);

export default Processor;
