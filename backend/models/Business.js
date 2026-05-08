const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
  },
  { timestamps: true }
);

businessSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

businessSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Business', businessSchema);
