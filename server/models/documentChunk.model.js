const mongoose = require('mongoose');

const documentChunkSchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  embedding: { type: [Number] },
  chunkIndex: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('DocumentChunk', documentChunkSchema);
