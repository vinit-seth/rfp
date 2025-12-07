const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
    email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    // optional validator: only validate if present
    validate: {
      validator: function(v) {
        if (!v) return true; // allow empty / undefined
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  contactPerson: String,
  phone: String,
  meta: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vendor', VendorSchema);