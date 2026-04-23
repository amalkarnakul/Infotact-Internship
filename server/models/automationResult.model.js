const mongoose = require('mongoose');

const automationResultSchema = new mongoose.Schema({
  automation: { type: mongoose.Schema.Types.ObjectId, ref: 'Automation', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  output: { type: String },
  error: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AutomationResult', automationResultSchema);
