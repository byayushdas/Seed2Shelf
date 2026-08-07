import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShipment extends Document {
  shipmentId: string;
  orderId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';
  origin: string;
  destination: string;
  dispatchDate?: Date;
  deliveryDate?: Date;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>({
  shipmentId: { type: String, required: true, unique: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'],
    default: 'PENDING' 
  },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  dispatchDate: { type: Date },
  deliveryDate: { type: Date },
  trackingNumber: { type: String }
}, { timestamps: true });

const Shipment: Model<IShipment> = mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema);

export default Shipment;
