import mongoose from 'mongoose';

const VipSubscriptionSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  name: { type: String },
  price: { type: Number },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  duration: { type: Number }
}, {
  timestamps: true
})

export const VipSubscription = mongoose.model('VipSubscription', VipSubscriptionSchema);