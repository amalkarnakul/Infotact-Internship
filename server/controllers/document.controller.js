const Document = require('../models/document.model');
const DocumentChunk = require('../models/documentChunk.model');
const { processDocument } = require('../services/documentService');

// Upload document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { originalname, mimetype, size, buffer } = req.file;

    const doc = await Document.create({
      user: req.user._id,
      filename: `${Date.now()}-${originalname}`,
      originalName: originalname,
      mimetype,
      size,
      status: 'processing',
    });

    // Process in background
    processDocument(doc._id, req.user._id, buffer, mimetype)
      .then(async (text) => {
        doc.text = text;
        doc.status = text ? 'ready' : 'failed';
        await doc.save();
      })
      .catch(async () => {
        doc.status = 'failed';
        await doc.save();
      });

    res.status(201).json({ document: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all documents for user
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    await DocumentChunk.deleteMany({ document: doc._id });
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDocument, getDocuments, deleteDocument };
