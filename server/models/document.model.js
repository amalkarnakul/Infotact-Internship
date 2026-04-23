const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String },
  size: { type: Number },
  text: { type: String },
  status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
