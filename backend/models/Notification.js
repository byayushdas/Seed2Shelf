const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['ORDER_REQUEST', 'ORDER_UPDATE', 'PAYMENT', 'DELIVERY', 'SYSTEM'],
    default: 'SYSTEM'
  },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // optional url to direct the user
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
