const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // You can add additional email validation if needed
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'], // Adjust roles as needed
    default: 'admin', // Default role if not specified
  },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
