import mongoose, {Schema} from "mongoose"
import bcrypt from 'bcryptjs';

const AccountSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String},
  email: { type: String, required: true, unique: true },
  phone: { type: String, unique: true },
  password: { type: String, required: true },
  gender: {
    type: String,
    enum: ['Nam', 'Nữ', 'Không tiện tiết lộ']
  },
  avatar: {
    url: String,
    public_id: String
  },
  bgImg: {
    url: String,
    public_id: String
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'VIP reader', 'staff', 'reader'],
    default: 'reader'
  },
  achivement: {
    type: String,
    default: 'New Member'
  },
  about: { type: [String], default: [] },
  exp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  rank: { type: String, default: 'Bronze'},
  lastcheckin: {type: Date, default: () => Date.now() - 24 * 60 * 60 * 1000},
  streak: { type: Number, default: 0 },
}, {
  timestamps: true
})

AccountSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

AccountSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Account = mongoose.model('Account', AccountSchema);